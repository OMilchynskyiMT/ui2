export type CertificateAttribute = Readonly<{ name: string; value: string }>

export type CertificateName = Readonly<{
  raw: string
  attributes: readonly CertificateAttribute[]
  commonName?: string
  organization?: string
  organizationalUnit?: string
  locality?: string
  state?: string
  country?: string
}>

export type CertificateAlternativeName = Readonly<{
  type: 'DNS' | 'IP' | 'Email' | 'URI' | 'Other'
  value: string
}>

export type CertificateDetails = Readonly<{
  subject: CertificateName
  issuer: CertificateName
  notBefore: Date
  notAfter: Date
  selfIssued: boolean
  serialNumber?: string
  signatureAlgorithm?: string
  publicKeyAlgorithm?: string
  publicKeyBits?: number
  subjectAlternativeNames: readonly CertificateAlternativeName[]
}>

export type CertificateTimeStatus = 'current' | 'not-yet-valid' | 'expired'

export class CertificateDetailsParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CertificateDetailsParseError'
  }
}

const distinguishedNameAliases: Readonly<Record<string, string>> = {
  CN: 'CN',
  COMMONNAME: 'CN',
  O: 'O',
  ORGANIZATIONNAME: 'O',
  OU: 'OU',
  ORGANIZATIONALUNITNAME: 'OU',
  L: 'L',
  LOCALITYNAME: 'L',
  ST: 'ST',
  STATEORPROVINCENAME: 'ST',
  C: 'C',
  COUNTRYNAME: 'C',
}

const splitUnescaped = (input: string, delimiters: string): string[] => {
  const parts: string[] = []
  let part = ''
  let isEscaped = false
  let isQuoted = false
  for (const character of input) {
    if (isEscaped) {
      part += `\\${character}`
      isEscaped = false
    } else if (character === '\\') {
      isEscaped = true
    } else if (character === '"') {
      isQuoted = !isQuoted
      part += character
    } else if (!isQuoted && delimiters.includes(character)) {
      parts.push(part.trim())
      part = ''
    } else {
      part += character
    }
  }
  if (isEscaped) part += '\\'
  parts.push(part.trim())
  return parts
}

const unescapeName = (value: string): string => {
  const trimmed = value.trim()
  const unquoted = trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed
  // OpenSSL's RFC2253 output may escape UTF-8 as consecutive \xx bytes
  const decoded = unquoted.replaceAll(/(?:\\[\da-fA-F]{2})+/g, encoded => {
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    const bytes = [...encoded.matchAll(/\\([\da-fA-F]{2})/g)].map(match => Number.parseInt(match[1]!, 16))
    return new TextDecoder().decode(Uint8Array.from(bytes))
  })
  return decoded.replaceAll(/\\(.)/g, (_match, literal: string) => literal)
}

const parseName = (value: string): CertificateName => {
  const elements = value.startsWith('/') ? splitUnescaped(value.slice(1), '/+') : splitUnescaped(value, ',+')
  const attributes: CertificateAttribute[] = []
  for (const element of elements) {
    const match = /^\s*([^=]+?)\s*=\s*(.*)$/.exec(element)
    if (!match) throw new CertificateDetailsParseError('Unrecognized subject or issuer name')
    const normalized = match[1]!.replaceAll(' ', '').toUpperCase()
    attributes.push({ name: distinguishedNameAliases[normalized] ?? normalized, value: unescapeName(match[2]!) })
  }
  if (attributes.length === 0) throw new CertificateDetailsParseError('Empty subject or issuer name')
  const first = (name: string): string | undefined => attributes.find(attribute => attribute.name === name)?.value
  return {
    raw: value,
    attributes,
    commonName: first('CN'),
    organization: first('O'),
    organizationalUnit: first('OU'),
    locality: first('L'),
    state: first('ST'),
    country: first('C'),
  }
}

const monthNumbers: Readonly<Record<string, number>> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
}

const parseDate = (input: string): Date => {
  const value = input.trim()
  const openssl = /^(\w{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+(\d{4})\s+(?:GMT|UTC)$/.exec(value)
  const iso = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:Z|\s+(?:GMT|UTC))$/.exec(value)
  if (!openssl && !iso) throw new CertificateDetailsParseError(`Unsupported certificate date: ${value}`)
  const year = Number(openssl ? openssl[6] : iso![1])
  const month = openssl ? monthNumbers[openssl[1]!] : Number(iso![2]) - 1
  if (month === undefined || year < 100 || year > 9999)
    throw new CertificateDetailsParseError(`Invalid certificate date: ${value}`)
  const day = Number(openssl ? openssl[2] : iso![3])
  const hour = Number(openssl ? openssl[3] : iso![4])
  const minute = Number(openssl ? openssl[4] : iso![5])
  const second = Number(openssl ? openssl[5] : iso![6])
  const date = new Date(0)
  date.setUTCFullYear(year, month, day)
  date.setUTCHours(hour, minute, second, 0)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second
  ) {
    throw new CertificateDetailsParseError(`Invalid certificate date: ${value}`)
  }
  return date
}

const getLineValue = (report: string, field: string): string | undefined => {
  const pattern = new RegExp(String.raw`^\s*${field}\s*:\s*(.*?)\s*$`, 'i')
  for (const line of report.split('\n')) {
    const match = pattern.exec(line)
    if (match) return match[1]!.trim()
  }
  return undefined
}

const parseAlternativeNames = (report: string): CertificateAlternativeName[] => {
  const lines = report.split('\n')
  const index = lines.findIndex(line => /^\s*X509v3 Subject Alternative Name:\s*(?:critical)?\s*$/i.test(line))
  if (index === -1) return []
  const indentation = lines[index]!.search(/\S/)
  const values: string[] = []
  const lines2 = lines.slice(index + 1)
  for (const line of lines2) {
    const trimmed = line.trim()
    if (!trimmed || line.search(/\S/) <= indentation || /^X509v3 |^Signature Algorithm:/i.test(trimmed)) break
    values.push(trimmed)
  }
  return splitUnescaped(values.join(' '), ',')
    .filter(Boolean)
    .map(value => {
      const match = /^(DNS|IP Address|email|URI):\s*(.+)$/i.exec(value)
      if (!match) return { type: 'Other', value } as const
      const type = match[1]!.toLowerCase()
      return {
        type: type === 'dns' ? 'DNS' : type === 'ip address' ? 'IP' : type === 'email' ? 'Email' : 'URI',
        value: match[2]!.trim(),
      }
    })
}

const normalizeName = (name: CertificateName): string =>
  JSON.stringify(name.attributes.map(attribute => [attribute.name, attribute.value.trim().toLowerCase()]))

const isSamePrintedName = (subject: CertificateName, issuer: CertificateName): boolean =>
  normalizeName(subject) === normalizeName(issuer)

export const parseOpenSslCertificateReport = (report: string): CertificateDetails => {
  if (report.includes('-----BEGIN CERTIFICATE-----') && !/\bIssuer\s*:/.test(report)) {
    throw new CertificateDetailsParseError('Expected an OpenSSL text report, not a PEM certificate')
  }
  const subjectText = getLineValue(report, 'Subject')
  const issuerText = getLineValue(report, 'Issuer')
  const beforeText = getLineValue(report, 'Not Before')
  const afterText = getLineValue(report, 'Not After')
  if (subjectText === undefined || !issuerText || !beforeText || !afterText) {
    throw new CertificateDetailsParseError('Certificate report is missing subject, issuer, or validity dates')
  }
  const subjectAlternativeNames = parseAlternativeNames(report)
  if (!subjectText && subjectAlternativeNames.length === 0) {
    throw new CertificateDetailsParseError('Certificate has neither subject nor subject alternative names')
  }
  const subject = subjectText ? parseName(subjectText) : { raw: '', attributes: [] }
  const issuer = parseName(issuerText)
  const notBefore = parseDate(beforeText)
  const notAfter = parseDate(afterText)
  if (notBefore >= notAfter) throw new CertificateDetailsParseError('Certificate validity range is invalid')
  const lines = report.split('\n')
  const serialIndex = lines.findIndex(line => /^\s*Serial Number\s*:/i.test(line))
  const serialInline = serialIndex === -1 ? undefined : lines[serialIndex]!.split(/Serial Number\s*:/i, 2)[1]?.trim()
  const serialNext = serialIndex === -1 ? undefined : lines[serialIndex + 1]?.trim()
  const serialNumber =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    serialInline ||
    (serialNext && /^(?:(?:[\da-f]{2}:)*[\da-f]{2,}|\d+\s*\(0x[\da-f]+\))$/i.test(serialNext) ? serialNext : undefined)
  const bits = /\bPublic-Key:\s*\((\d+)\s*bit\)/i.exec(report)?.[1]
  return {
    subject,
    issuer,
    notBefore,
    notAfter,
    selfIssued: isSamePrintedName(subject, issuer),
    serialNumber,
    signatureAlgorithm: getLineValue(report, 'Signature Algorithm'),
    publicKeyAlgorithm: getLineValue(report, 'Public Key Algorithm'),
    publicKeyBits: bits ? Number(bits) : undefined,
    subjectAlternativeNames,
  }
}

export const getCertificateTimeStatus = (
  certificate: Pick<CertificateDetails, 'notBefore' | 'notAfter'>,
  now: Date = new Date()
): CertificateTimeStatus => {
  if (now < certificate.notBefore) return 'not-yet-valid'
  if (now >= certificate.notAfter) return 'expired'
  return 'current'
}
