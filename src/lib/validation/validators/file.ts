import { formatBytes } from '@/lib/format/bytes'

import type { Validator, ValidatorOptions } from '../types'

export const nonEmptyFile = (options?: ValidatorOptions): Validator<File> => {
  return {
    code: 'file.nonEmpty',
    message: options?.message ?? 'File must not be empty',
    validate: value => value.size > 0,
  }
}

export const maxFileSize = (bytes: number, options?: ValidatorOptions): Validator<File> => {
  if (!Number.isSafeInteger(bytes) || bytes < 0) {
    throw new RangeError('bytes must be a non-negative integer')
  }

  return {
    code: 'file.maxSize',
    message: options?.message ?? `File size must not exceed ${formatBytes(bytes)}`,
    validate: value => value.size <= bytes,
  }
}

export const fileExtension = (extension: string, options?: ValidatorOptions): Validator<File> => {
  const trimmed = extension.trim()
  if (trimmed === '.' || trimmed.length === 0) {
    throw new TypeError('extension must contain at least one character')
  }

  const normalized = trimmed.startsWith('.') ? trimmed.toLowerCase() : `.${trimmed.toLowerCase()}`

  return {
    code: 'file.extension',
    message: options?.message ?? `File name must end with ${normalized}`,
    validate: value => value.name.toLowerCase().endsWith(normalized),
  }
}

export const fileMimeType = (types: readonly string[], options?: ValidatorOptions): Validator<File> => {
  if (types.length === 0) {
    throw new TypeError('types must contain at least one MIME type')
  }

  const normalizedTypes = types.map(type => type.trim().toLowerCase())
  if (normalizedTypes.some(type => type.length === 0)) {
    throw new TypeError('MIME types must not be empty')
  }

  const allowed = new Set(normalizedTypes)

  return {
    code: 'file.mimeType',
    message: options?.message ?? `File type must be one of: ${normalizedTypes.join(', ')}`,
    validate: value => allowed.has(value.type.toLowerCase()),
  }
}
