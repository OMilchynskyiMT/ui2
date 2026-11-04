export type NumberModel = number | null

export type NumberParseResult = { type: 'empty' } | { type: 'invalid' } | { type: 'number'; value: number }

export const formatNumber = (value: NumberModel): string => {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
}

export const parseNumberText = (value: string): NumberParseResult => {
  const text = value.trim()
  if (!text) return { type: 'empty' }

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return { type: 'invalid' }

  const number = Number(text)
  return Number.isFinite(number) ? { type: 'number', value: number } : { type: 'invalid' }
}

// NOTE: NaN carries an invalid numeric draft to the validation schema without losing its text
export const toNumberModel = (parsed: NumberParseResult): NumberModel => {
  if (parsed.type === 'empty') return null
  if (parsed.type === 'invalid') return NaN
  return parsed.value
}

export const clampNumber = (value: number, min?: number, max?: number): number => {
  if (typeof min === 'number' && value < min) return min
  if (typeof max === 'number' && value > max) return max
  return value
}
