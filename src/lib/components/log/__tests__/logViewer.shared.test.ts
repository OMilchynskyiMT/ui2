import { describe, expect, it } from 'vitest'

import { findLogMatches, isNearLogBottom, tailLog } from '../logViewer.shared'

describe('log tail', () => {
  it('keeps only the most recent complete and partial lines', () => {
    expect(tailLog('one\ntwo\nthree', 2)).toEqual({ text: 'two\nthree', truncated: true })
    expect(tailLog('one\ntwo\nthree\n', 2)).toEqual({ text: 'two\nthree\n', truncated: true })
    expect(tailLog('one\ntwo\nthree\n', 3)).toEqual({ text: 'one\ntwo\nthree\n', truncated: false })
  })

  it('supports empty input and unlimited history', () => {
    expect(tailLog('', 5)).toEqual({ text: '', truncated: false })
    expect(tailLog('a\nb\nc', 0)).toEqual({ text: 'a\nb\nc', truncated: false })
    expect(tailLog('a\n', 1)).toEqual({ text: 'a\n', truncated: false })
  })
})

describe('log search', () => {
  it('finds literal, case insensitive matches, iignores regular expressions', () => {
    expect(findLogMatches('Error [id] ERROR [id]', '[id]')).toEqual([
      { start: 6, length: 4 },
      { start: 17, length: 4 },
    ])
    expect(findLogMatches('Error error', 'ERROR')).toEqual([
      { start: 0, length: 5 },
      { start: 6, length: 5 },
    ])
    expect(findLogMatches('abc', '')).toEqual([])
    expect(findLogMatches('a.b a-b', 'a.b')).toEqual([{ start: 0, length: 3 }])
  })
})

describe('follow tail detection', () => {
  it('follows at the bottom with small fractional rounding allowance', () => {
    expect(isNearLogBottom(900, 500, 400)).toBe(true)
    expect(isNearLogBottom(900.4, 498, 400)).toBe(true)
    expect(isNearLogBottom(900, 450, 400)).toBe(false)
  })
})
