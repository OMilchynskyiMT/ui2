import { describe, expect, it } from 'vitest'

import { isHexColorValid, normalizeHexColor } from '../color.shared'
import { filterSelectedFiles, formatFileSize, isAcceptableFile, parseAccept } from '../filePicker.shared'
import { clampNumber, formatNumber, parseNumberText } from '../number.shared'

const file = (name: string, type: string): File => ({ name, type, size: 100, lastModified: 1 }) as File

describe('color helpers', () => {
  it('validates and normalizes supported hex colors', () => {
    expect(isHexColorValid('#09f')).toBe(true)
    expect(isHexColorValid('#0099ff')).toBe(true)
    expect(isHexColorValid('0099ff')).toBe(false)
    expect(normalizeHexColor('#09f')).toBe('#0099ff')
    expect(normalizeHexColor('invalid', '#ffffff')).toBe('#ffffff')
  })
})

describe('number helpers', () => {
  it('parses complete decimal values without accepting partial input', () => {
    expect(parseNumberText('')).toEqual({ type: 'empty' })
    expect(parseNumberText('-.5')).toEqual({ type: 'number', value: -0.5 })
    expect(parseNumberText('1e3')).toEqual({ type: 'invalid' })
  })

  it('formats and clamps model values', () => {
    expect(formatNumber(null)).toBe('')
    expect(formatNumber(12.5)).toBe('12.5')
    expect(clampNumber(15, 0, 10)).toBe(10)
    expect(clampNumber(-1, 0, 10)).toBe(0)
  })
})

describe('file picker helpers', () => {
  it('parses accept rules and matches extensions and mime groups', () => {
    const accepted = parseAccept('.PDF, image/*')

    expect(accepted).toEqual(['.pdf', 'image/*'])
    expect(isAcceptableFile(file('manual.PDF', 'application/pdf'), accepted)).toBe(true)
    expect(isAcceptableFile(file('photo.webp', 'image/webp'), accepted)).toBe(true)
    expect(isAcceptableFile(file('archive.zip', 'application/zip'), accepted)).toBe(false)
  })

  it('separates rejected files without changing accepted order', () => {
    const first = file('first.txt', 'text/plain')
    const second = file('second.txt', 'text/plain')
    const image = file('image.png', 'image/png')
    const result = filterSelectedFiles([first, image, second], ['text/plain'], false)

    expect(result.accepted).toEqual([first])
    expect(result.rejected).toEqual([
      { file: image, reason: 'accept' },
      { file: second, reason: 'multiple' },
    ])
  })

  it('formats file sizes using binary units', () => {
    expect(formatFileSize(1000)).toBe('1000 B')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })
})
