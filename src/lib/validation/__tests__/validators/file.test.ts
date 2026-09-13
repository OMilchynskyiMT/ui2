import { describe, expect, it } from 'vitest'

import { fileExtension, fileMimeType, maxFileSize, nonEmptyFile } from '../../validators/file'
import { getValidatorMessage, shouldValidate } from '../helpers'

const file = (name: string, size: number, type = ''): File => ({ name, size, type }) as File

describe('nonEmptyFile', () => {
  const validator = nonEmptyFile()

  it('uses stable metadata and rejects zero-byte files', () => {
    expect(validator.code).toBe('file.nonEmpty')
    expect(getValidatorMessage(validator, file('config.bin', 4))).toBe('File must not be empty')
    expect(shouldValidate(validator, file('config.bin', 4))).toBe(true)
    expect(shouldValidate(validator, file('config.bin', 0))).toBe(false)
  })
})

describe('maxFileSize', () => {
  const validator = maxFileSize(1024)

  it('uses stable metadata and accepts the configured boundary', () => {
    const atLimit = file('certificate.pem', 1024)
    const tooLarge = file('certificate.pem', 1025)

    expect(validator.code).toBe('file.maxSize')
    expect(getValidatorMessage(validator, atLimit)).toBe('File size must not exceed 1 KiB')
    expect(shouldValidate(validator, atLimit)).toBe(true)
    expect(shouldValidate(validator, tooLarge)).toBe(false)
  })

  it('rejects invalid size configuration', () => {
    expect(() => maxFileSize(-1)).toThrow(RangeError)
    expect(() => maxFileSize(1.5)).toThrow(RangeError)
  })
})

describe('fileExtension', () => {
  const validator = fileExtension('.bin')

  it('uses stable metadata and matches extensions case-insensitively', () => {
    expect(validator.code).toBe('file.extension')
    expect(getValidatorMessage(validator, file('firmware.bin', 1))).toBe('File name must end with .bin')
    expect(shouldValidate(validator, file('firmware.BIN', 1))).toBe(true)
    expect(shouldValidate(fileExtension('bin'), file('firmware.bin', 1))).toBe(true)
    expect(shouldValidate(validator, file('firmware.txt', 1))).toBe(false)
  })

  it('rejects an empty extension configuration', () => {
    expect(() => fileExtension('')).toThrow(TypeError)
    expect(() => fileExtension('.')).toThrow(TypeError)
  })
})

describe('fileMimeType', () => {
  const validator = fileMimeType(['text/csv', 'application/json'])

  it('uses stable metadata and matches MIME types case-insensitively', () => {
    expect(validator.code).toBe('file.mimeType')
    expect(getValidatorMessage(validator, file('sensors.csv', 1, 'text/csv'))).toBe(
      'File type must be one of: text/csv, application/json'
    )
    expect(shouldValidate(validator, file('sensors.csv', 1, 'text/csv'))).toBe(true)
    expect(shouldValidate(validator, file('sensors.json', 1, 'APPLICATION/JSON'))).toBe(true)
    expect(shouldValidate(validator, file('sensors.txt', 1, 'text/plain'))).toBe(false)
  })

  it('rejects empty MIME type configuration', () => {
    expect(() => fileMimeType([])).toThrow(TypeError)
    expect(() => fileMimeType([' '.repeat(3)])).toThrow(TypeError)
  })
})
