import { describe, expect, it } from 'vitest'

import { propertyName, uplinkPayload } from '../../validators/scada'
import { shouldValidate } from '../helpers'

describe('propertyName', () => {
  const validator = propertyName()

  it('uses stable metadata', () => {
    expect(validator.code).toBe('scada.propertyName')
    expect(validator.message).toBe('Must contain letters, digits, underscores, or hyphens only')
  })

  it.each(['temperature', 'property_1', 'property-1', 'a'.repeat(129)])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(['', 'property name', 'property.name', 'property@name'])('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})

describe('uplinkPayload', () => {
  const validator = uplinkPayload()

  it('accepts legacy hexadecimal and Base64 payload formats', () => {
    expect(validator.code).toBe('scada.uplinkPayload')
    expect(validator.message).toBe('Must contain hexadecimal or Base64 payload data')
    expect(shouldValidate(validator, 'AABBCC')).toBe(true)
    expect(shouldValidate(validator, 'SGVsbG8=')).toBe(true)
    expect(shouldValidate(validator, '')).toBe(false)
    expect(shouldValidate(validator, 'not payload!')).toBe(false)
  })
})
