import { describe, expect, it } from 'vitest'

import { simIccid } from '../../validators/cellular'
import { getValidatorMessage, shouldValidate } from '../helpers'

describe('simIccid', () => {
  const validator = simIccid()

  it('uses stable metadata', () => {
    expect(validator.code).toBe('cellular.simIccid')
    expect(getValidatorMessage(validator, 'ANY')).toBe('Must be ANY or a 19- or 20-digit ICCID beginning with 89')
  })

  it.each(['ANY', '8912345678901234567', '89123456789012345678'])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(['8812345678901234567', '891234567890123456', '891234567890123456789'])('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})
