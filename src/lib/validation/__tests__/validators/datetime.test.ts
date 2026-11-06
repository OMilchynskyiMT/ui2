import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import { backoffTimings, date, time } from '../../validators/datetime'
import { getValidatorMessage, shouldValidate } from '../helpers'

type StringCase = Readonly<{
  name: string
  validator: Validator<string>
  code: string
  message: string
  valid: readonly string[]
  invalid: readonly string[]
}>

const cases: readonly StringCase[] = [
  {
    name: 'date',
    validator: date(),
    code: 'format.date',
    message: 'Must be a date in MM/DD/YYYY format',
    valid: ['1/1/2026', '12/31/2026', '2/29/2024', '2/29/2000'],
    invalid: ['2026-01-01', '13/01/2026', '2/29/2026', '2/29/1900', '4/31/2026', '2/30/2024'],
  },
  {
    name: 'time',
    validator: time(),
    code: 'format.time',
    message: 'Must be a 24-hour time in HH:MM:SS format',
    valid: ['0:0:0', '23:59:59'],
    invalid: ['24:00:00', '12:30'],
  },
  {
    name: 'backoffTimings',
    validator: backoffTimings(),
    code: 'format.backoffTimings',
    message: 'Must be a comma-separated list of positive numbers',
    valid: ['1', '1, 2, 2.5'],
    invalid: ['0', '1,-2', '1,nope', 'Infinity', '1e999', '2,-Infinity'],
  },
]

describe.each(cases)('$name', ({ validator, code, message, valid, invalid }) => {
  it('uses stable metadata', () => {
    expect(validator.code).toBe(code)
    expect(getValidatorMessage(validator, valid[0] ?? '')).toBe(message)
  })

  it.each(valid)('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(invalid)('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})
