import type { Validator, ValidatorOptions } from '../types'

const sshPublicKeyPattern = /(?<method>[a-z0-9-]+) (?<payload>AAAA[a-z0-9+=\-/_]+)( (?<title>.+))?/i
const openVpnFingerprintPattern = /^[\da-f]{2}(?::[\da-f]{2}){31}$/i
const engineIdPattern = /(0x|0X)([\dA-Fa-f]{2}){5,32}$/
const sharedSecretHexPattern = /^(0x|0X)?([\dA-Fa-f]{2}){32,8000}$/
const passwordStrengthPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !#$%&*+,.?@^_-]).+$/
const bootloaderPasswordCharacterPattern = /^[\w!"#$%&()*+,./:;<=>?@[\\\]^`{|}~-]+$/
const pemCertificatePattern = /^-{5}BEGIN.*-{5}[^]*-{5}END.*-{5}$/m
const pemPrivateKeyPattern = /^-{5}BEGIN.*PRIVATE.*KEY.*-{5}[^]*-{5}END.*-{5}$/m

export type PasswordComplexityRules = Readonly<{
  creditMode: boolean
  maxPasswordLength: number
  minPasswordLength: number
  charactersNotPermitted: string
}>

const assertPasswordComplexityRules = (rules: PasswordComplexityRules): void => {
  const { minPasswordLength, maxPasswordLength } = rules
  if (!Number.isSafeInteger(minPasswordLength) || minPasswordLength < 0) {
    throw new RangeError('minPasswordLength must be a non-negative integer')
  }
  if (!Number.isSafeInteger(maxPasswordLength) || maxPasswordLength < 0) {
    throw new RangeError('maxPasswordLength must be a non-negative integer')
  }
  if (minPasswordLength > 0 && maxPasswordLength > 0 && minPasswordLength > maxPasswordLength) {
    throw new RangeError('minPasswordLength must not be greater than maxPasswordLength')
  }
}

const getPasswordComplexityError = (password: string, rules: PasswordComplexityRules): string | undefined => {
  if (
    rules.charactersNotPermitted.length > 0 &&
    [...rules.charactersNotPermitted].some(character => password.includes(character))
  ) {
    return `Password must not include any of the characters: ${rules.charactersNotPermitted}`
  }

  if (rules.creditMode) return undefined

  if (rules.maxPasswordLength > 0 && password.length > rules.maxPasswordLength) {
    return `Password length must not exceed ${rules.maxPasswordLength}`
  }

  if (rules.minPasswordLength > 0 && password.length < rules.minPasswordLength) {
    return `Password length must be at least ${rules.minPasswordLength}`
  }

  return undefined
}

export const sshPublicKey = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.sshPublicKey',
    message: options?.message ?? 'Must match SSH public key format',
    validate: value => sshPublicKeyPattern.test(value),
  }
}

export const openVpnPeerFingerprint = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.openVpnPeerFingerprint',
    message: options?.message ?? 'Must be a valid OpenVPN peer fingerprint',
    validate: value => openVpnFingerprintPattern.test(value),
  }
}

export const engineId = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.engineId',
    message: options?.message ?? 'Must be a hexadecimal engine ID between 5 and 32 octets',
    validate: value => engineIdPattern.test(value),
  }
}

export const passwordStrength = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.passwordStrength',
    message: options?.message ?? 'Must contain lowercase, uppercase, numeric, and special characters',
    validate: value => passwordStrengthPattern.test(value),
  }
}

export const radiusSharedSecret = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.radiusSharedSecret',
    message: options?.message ?? 'Must be a valid RADIUS shared secret',
    validate: value =>
      sharedSecretHexPattern.test(value) ||
      (/[!#$%&*+,.:;-=?@^_~]+/.test(value) &&
        /[a-z]+/.test(value) &&
        /[A-Z]+/.test(value) &&
        /\d+/.test(value) &&
        value.length >= 22 &&
        value.length < 8000),
  }
}

export const bootloaderPasswordCharacters = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.bootloaderPasswordCharacters',
    message: options?.message ?? 'Contains characters that are not allowed in a bootloader password',
    validate: value => bootloaderPasswordCharacterPattern.test(value),
  }
}

export const pemCertificate = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.pemCertificate',
    message: options?.message ?? 'Must contain a PEM certificate',
    validate: value => pemCertificatePattern.test(value),
  }
}

export const pemPrivateKey = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.pemPrivateKey',
    message: options?.message ?? 'Must contain a PEM private key',
    validate: value => pemPrivateKeyPattern.test(value),
  }
}

export const ipsecId = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.ipsecId',
    message: options?.message ?? 'Must not contain double quotes or a space-colon-space sequence',
    validate: value => !value.includes('"') && !value.includes(' : '),
  }
}

export const passwordComplexity = (rules: PasswordComplexityRules, options?: ValidatorOptions): Validator<string> => {
  assertPasswordComplexityRules(rules)

  return {
    code: 'security.passwordComplexity',
    message:
      options?.message ??
      ((value: string): string =>
        getPasswordComplexityError(value, rules) ?? 'Does not satisfy password complexity rules'),
    validate: value => getPasswordComplexityError(value, rules) === undefined,
  }
}
