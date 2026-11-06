import type { Validator, ValidatorOptions } from '../types'
const x509OtherNamePattern = /^([\d.]+);(\w+):(.*)$/i
const sshPublicKeyPattern = /(?<method>[a-z0-9-]+) (?<payload>AAAA[a-z0-9+=\-/_]+)( (?<title>.+))?/i
const openVpnFingerprintPattern = /^[\da-f]{2}(?::[\da-f]{2}){31}$/i
const sharedSecretHexPattern = /^(0x|0X)?([\dA-Fa-f]{2}){32,8000}$/
const pemCertificatePattern = /^-{5}BEGIN.*-{5}[^]*-{5}END.*-{5}$/m
const pemPrivateKeyPattern = /^-{5}BEGIN.*PRIVATE.*KEY.*-{5}[^]*-{5}END.*-{5}$/m
const keyPattern = /^([\dA-Fa-f]{2}[.:-]?){15}([\dA-Fa-f]{2})$/

export const x509OtherName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.x509OtherName',
    message: options?.message ?? 'Must use <oid>;<asn1-type>:<value> format',
    validate: value => x509OtherNamePattern.test(value),
  }
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

export const key = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.key',
    message: options?.message ?? 'Must be a 16-byte hexadecimal key',
    validate: value => keyPattern.test(value),
  }
}
