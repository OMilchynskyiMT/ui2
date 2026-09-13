import { describe, expect, it } from 'vitest'

import type { ValidationContext } from '../../types'
import { greaterThanOrEqual, lessThanOrEqual, sameAs, uniqueBy } from '../../validators/relational'
import { getValidatorMessage, shouldValidate } from '../helpers'

const context = (root: unknown): ValidationContext => ({
  root,
  parent: root,
  path: ['confirmation'],
})

describe('sameAs', () => {
  it('compares against a fixed expected value', () => {
    const validator = sameAs('secret')
    expect(validator.code).toBe('relational.sameAs')
    expect(getValidatorMessage(validator, 'secret')).toBe('Must match the expected value')
    expect(shouldValidate(validator, 'secret')).toBe(true)
    expect(shouldValidate(validator, 'different')).toBe(false)
  })

  it('resolves an expected value from validation context', () => {
    const validator = sameAs<string>(validationContext => {
      return (validationContext.root as { password: string }).password
    })

    expect(validator.validate('secret', context({ password: 'secret' }))).toBe(true)
    expect(validator.validate('different', context({ password: 'secret' }))).toBe(false)
  })
})

describe('uniqueBy', () => {
  type Item = Readonly<{ id: number; name: string }>
  const existing: readonly Item[] = [
    { id: 1, name: 'WAN' },
    { id: 2, name: 'LAN' },
  ]

  it('rejects duplicate selected properties', () => {
    const validator = uniqueBy(existing, item => item.name)
    expect(validator.code).toBe('relational.uniqueBy')
    expect(getValidatorMessage(validator, { id: 3, name: 'WAN' })).toBe('Must be unique')
    expect(shouldValidate(validator, { id: 3, name: 'OTHER' })).toBe(true)
    expect(shouldValidate(validator, { id: 3, name: 'WAN' })).toBe(false)
  })

  it('supports case-insensitive comparison and excluding the edited record', () => {
    const validator = uniqueBy(existing, item => item.name, {
      ignoreCase: true,
      exclude: existingItem => existingItem.id === 1,
    })

    expect(shouldValidate(validator, { id: 1, name: 'wan' })).toBe(true)
    expect(shouldValidate(validator, { id: 3, name: 'lan' })).toBe(false)
  })

  it('can resolve the collection from validation context', () => {
    const validator = uniqueBy<Item>(
      validationContext => {
        return (validationContext.root as { items: readonly Item[] }).items
      },
      item => item.name
    )
    const validationContext = context({ items: existing })

    expect(validator.validate({ id: 3, name: 'WAN' }, validationContext)).toBe(false)
    expect(validator.validate({ id: 3, name: 'OTHER' }, validationContext)).toBe(true)
  })
})

describe('numeric relations', () => {
  it('validates a lower bound resolved from context', () => {
    const validator = greaterThanOrEqual(validationContext => (validationContext.root as { start: number }).start)
    const validationContext = context({ start: 10 })

    expect(validator.code).toBe('relational.greaterThanOrEqual')
    expect(getValidatorMessage(validator, 10)).toBe('Must not be lower than the related value')
    expect(validator.validate(10, validationContext)).toBe(true)
    expect(validator.validate(9, validationContext)).toBe(false)
    expect(greaterThanOrEqual(NaN).validate(9, validationContext)).toBe(true)
  })

  it('validates an upper bound resolved from context', () => {
    const validator = lessThanOrEqual(validationContext => (validationContext.root as { limit: number }).limit)
    const validationContext = context({ limit: 20 })

    expect(validator.code).toBe('relational.lessThanOrEqual')
    expect(getValidatorMessage(validator, 20)).toBe('Must not be greater than the related value')
    expect(validator.validate(20, validationContext)).toBe(true)
    expect(validator.validate(21, validationContext)).toBe(false)
    expect(lessThanOrEqual(NaN).validate(21, validationContext)).toBe(true)
  })
})
