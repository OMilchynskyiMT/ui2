import type { Validator, ValidatorOptions } from '../types'
const passwordStrengthPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !#$%&*+,.?@^_-]).+$/
const bootloaderPasswordCharacterPattern = /^[\w!"#$%&()*+,./:;<=>?@[\\\]^`{|}~-]+$/

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

export type PasswordComplexityRules = Readonly<{
  creditMode: boolean
  maxPasswordLength: number
  minPasswordLength: number
  charactersNotPermitted: string
}>

export const passwordStrength = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.passwordStrength',
    message: options?.message ?? 'Must contain lowercase, uppercase, numeric, and special characters',
    validate: value => passwordStrengthPattern.test(value),
  }
}

export const bootloaderPasswordCharacters = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.bootloaderPasswordCharacters',
    message: options?.message ?? 'Contains characters that are not allowed in a bootloader password',
    validate: value => bootloaderPasswordCharacterPattern.test(value),
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
