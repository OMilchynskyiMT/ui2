import { describe, expect, it } from 'vitest'

import {
  CertificateDetailsParseError,
  getCertificateTimeStatus,
  parseOpenSslCertificateReport,
} from '../parseOpenSslCertificateReport'

const report = String.raw`Certificate:
    Data:
        Serial Number:
            01:a2:3f
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN = "Example, Root CA", O = Example Networks, C = US
        Validity
            Not Before: Jan  2 03:04:05 2024 GMT
            Not After : Feb 29 03:04:05 2028 GMT
        Subject: CN = gateway.example.test, O = Example Networks, OU = Dev\, Operations, C = US
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:gateway.example.test, IP Address:192.0.2.10,
                IP Address:2001:db8::1, email:admin@example.test, URI:https://gateway.example.test
            X509v3 Basic Constraints: critical
                CA:FALSE`

describe('OpenSSL certificate report parser', () => {
  it('parses names, dates, key information and extensions', () => {
    const result = parseOpenSslCertificateReport(report)
    expect(result.subject.commonName).toBe('gateway.example.test')
    expect(result.subject.organizationalUnit).toBe('Dev, Operations')
    expect(result.issuer.commonName).toBe('Example, Root CA')
    expect(result.notBefore.toISOString()).toBe('2024-01-02T03:04:05.000Z')
    expect(result.notAfter.toISOString()).toBe('2028-02-29T03:04:05.000Z')
    expect(result.serialNumber).toBe('01:a2:3f')
    expect(result.signatureAlgorithm).toBe('sha256WithRSAEncryption')
    expect(result.publicKeyAlgorithm).toBe('rsaEncryption')
    expect(result.publicKeyBits).toBe(2048)
    expect(result.subjectAlternativeNames).toEqual([
      { type: 'DNS', value: 'gateway.example.test' },
      { type: 'IP', value: '192.0.2.10' },
      { type: 'IP', value: '2001:db8::1' },
      { type: 'Email', value: 'admin@example.test' },
      { type: 'URI', value: 'https://gateway.example.test' },
    ])
    expect(result.selfIssued).toBe(false)
  })

  it('supports self-issued names without claiming self-signed trust', () => {
    const same = report.replace(
      String.raw`CN = gateway.example.test, O = Example Networks, OU = Dev\, Operations, C = US`,
      'CN = "Example, Root CA", O = Example Networks, C = US'
    )
    expect(parseOpenSslCertificateReport(same).selfIssued).toBe(true)
  })

  it('evaluates dates at inclusive and exclusive boundaries', () => {
    const cert = parseOpenSslCertificateReport(report)
    expect(getCertificateTimeStatus(cert, new Date('2024-01-02T03:04:04Z'))).toBe('not-yet-valid')
    expect(getCertificateTimeStatus(cert, cert.notBefore)).toBe('current')
    expect(getCertificateTimeStatus(cert, cert.notAfter)).toBe('expired')
  })

  it('accepts ISO UTC date output and one-line serials', () => {
    const iso = report
      .replace('Jan  2 03:04:05 2024 GMT', '2024-01-02T03:04:05Z')
      .replace('Feb 29 03:04:05 2028 GMT', '2028-02-29T03:04:05Z')
      .replace('Serial Number:\n            01:a2:3f', 'Serial Number: 01:a2:3f')
    expect(parseOpenSslCertificateReport(iso).serialNumber).toBe('01:a2:3f')
  })

  it('rejects malformed, nonsensical, and missing validity dates', () => {
    expect(() =>
      parseOpenSslCertificateReport(report.replace('Feb 29 03:04:05 2028 GMT', 'Feb 29 03:04:05 2027 GMT'))
    ).toThrow(CertificateDetailsParseError)
    expect(() => parseOpenSslCertificateReport(report.replace('Not Before:', 'Missing Before:'))).toThrow(
      CertificateDetailsParseError
    )
    expect(() => parseOpenSslCertificateReport(report.replace('2028 GMT', '2023 GMT'))).toThrow(
      CertificateDetailsParseError
    )
    expect(() => parseOpenSslCertificateReport('-----BEGIN CERTIFICATE-----\nAAA\n-----END CERTIFICATE-----')).toThrow(
      /not a PEM/
    )
    expect(() => parseOpenSslCertificateReport('garbage')).toThrow(CertificateDetailsParseError)
  })

  it('parses multi-valued slash-form distinguished names', () => {
    const input = report.replace(
      String.raw`CN = gateway.example.test, O = Example Networks, OU = Dev\, Operations, C = US`,
      '/CN=gateway.example.test+OU=Operations/O=Example Networks/C=US'
    )
    const parsed = parseOpenSslCertificateReport(input)
    expect(parsed.subject.commonName).toBe('gateway.example.test')
    expect(parsed.subject.organizationalUnit).toBe('Operations')
    expect(parsed.subject.organization).toBe('Example Networks')
  })

  it('accepts SAN-only certificates with an empty subject', () => {
    const input = report.replace(
      String.raw`Subject: CN = gateway.example.test, O = Example Networks, OU = Dev\, Operations, C = US`,
      'Subject:'
    )
    const parsed = parseOpenSslCertificateReport(input)
    expect(parsed.subject.raw).toBe('')
    expect(parsed.subject.commonName).toBeUndefined()
    expect(parsed.subjectAlternativeNames[0]).toEqual({ type: 'DNS', value: 'gateway.example.test' })
    expect(() =>
      parseOpenSslCertificateReport(input.replace('X509v3 Subject Alternative Name:', 'Missing SAN:'))
    ).toThrow(/neither subject nor subject alternative names/)
  })

  it('reads decimal serial numbers with hexadecimal annotations', () => {
    const input = report.replace('01:a2:3f', '12345 (0x3039)')
    expect(parseOpenSslCertificateReport(input).serialNumber).toBe('12345 (0x3039)')
  })

  it('handles escaped name delimiters and unknown attributes', () => {
    const input = report.replace(
      String.raw`CN = gateway.example.test, O = Example Networks, OU = Dev\, Operations, C = US`,
      String.raw`CN = gateway.example.test, O = ACME\, Inc., serialNumber = foo\=bar, C = US`
    )
    const parsed = parseOpenSslCertificateReport(input)
    expect(parsed.subject.organization).toBe('ACME, Inc.')
    expect(parsed.subject.attributes).toContainEqual({ name: 'SERIALNUMBER', value: 'foo=bar' })
  })

  it('decodes escaped UTF-8 attribute bytes', () => {
    const utf8 = report.replace('CN = gateway.example.test', String.raw`CN = J\C3\B6rg`)
    expect(parseOpenSslCertificateReport(utf8).subject.commonName).toBe('Jörg')
  })
})
