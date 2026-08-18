/* eslint-disable unicorn/filename-case */
import { expect, expectTypeOf, it, vi } from 'vitest'

import { optional, Schema, types, withMessages } from '../index'
import type { SchemaShape, ValidationContext, ValidationIssue, Validator } from '../types'

const emptyValues: readonly unknown[] = [undefined, null, '']

const createValidator = <T>(
  code: string,
  message: string,
  isValid: (value: T, context: ValidationContext) => boolean
): Validator<T> => {
  return {
    code,
    message,
    validate: isValid,
  }
}

const assertEqual = (actual: unknown, expected: unknown): void => {
  expect(actual).toEqual(expected)
}

const assertTrue = (hasActual: boolean): void => {
  expect(hasActual).toBe(true)
}

const assertFalse = (hasActual: boolean): void => {
  expect(hasActual).toBe(false)
}

const assertNotCalled = (calls: readonly unknown[][]): void => {
  expect(calls).toHaveLength(0)
}

const requiredIssue = (path: readonly string[]): ValidationIssue => ({
  code: 'required',
  message: 'This field is required',
  path,
})

const typeIssue = (typeName: string, path: readonly string[]): ValidationIssue => ({
  code: 'type',
  message: `Expected ${typeName}`,
  path,
})

it('preserves optional node type', () => {
  const stringNode = types.string()
  const optionalNode = optional(stringNode)

  expectTypeOf(optionalNode.optional).toEqualTypeOf<true>()
})

it('requires optional schema nodes for optional properties', () => {
  type Model = {
    required: string
    optional?: string
  }

  const requiredNode = types.string()
  const optionalStringNode = optional(types.string())

  const shape: SchemaShape<Model> = {
    required: requiredNode,
    optional: optionalStringNode,
  }

  expectTypeOf(shape.required.optional).toEqualTypeOf<false>()
  expectTypeOf(shape.optional.optional).toEqualTypeOf<true>()
})

it('rejects an optional node for a required property', () => {
  type Model = {
    value: string
  }

  const stringNode = types.string()
  const optionalNode = optional(stringNode)

  const shape: SchemaShape<Model> = {
    // @ts-expect-error required property cannot use an optional schema node
    value: optionalNode,
  }

  expectTypeOf(shape).toEqualTypeOf<SchemaShape<Model>>()
})

it('returns an empty result for valid data', () => {
  const name = types.string()
  const age = types.number()
  const root = types.object({ name, age })
  const schema = new Schema(root)

  const result = schema.validate({ name: 'Bogdan Tarahtelkin', age: 3 })

  assertEqual(result, {
    valid: true,
    issues: [],
    errors: {},
  })
})

it('treats undefined, null, and an empty string as missing required values', () => {
  const field = types.string()
  const root = types.object({ value: field })
  const schema = new Schema(root)

  for (const value of emptyValues) {
    const result = schema.validate({ value })
    const issue = requiredIssue(['value'])

    assertFalse(result.valid)
    assertEqual(result.issues, [issue])
    assertEqual(result.errors, { value: ['This field is required'] })
  }
})

it('accepts empty optional values without invoking validators', () => {
  type Model = { value?: string }

  const isValid = vi.fn(() => false)
  const customValidator = createValidator('custom', 'Custom error', isValid)
  const stringNode = types.string(customValidator)
  const field = optional(stringNode)
  const root = types.object<Model>({ value: field })
  const schema = new Schema(root)

  for (const value of emptyValues) {
    const result = schema.validate({ value })
    assertTrue(result.valid)
  }

  assertNotCalled(isValid.mock.calls)
})

it('reports a primitive type error without invoking validators', () => {
  const isValid = vi.fn(() => true)
  const customValidator = createValidator('custom', 'Custom error', isValid)
  const field = types.string(customValidator)
  const root = types.object({ value: field })
  const schema = new Schema(root)

  const result = schema.validate({ value: 42 })
  const issue = typeIssue('string', ['value'])

  assertFalse(result.valid)
  assertEqual(result.issues, [issue])
  assertEqual(result.errors, { value: ['Expected string'] })
  assertNotCalled(isValid.mock.calls)
})

it('aggregates validator failures in declaration order', () => {
  const first = createValidator<string>('first', 'First error', (): boolean => false)
  const second = createValidator<string>('second', 'Second error', (): boolean => false)
  const field = types.string(first, second)
  const root = types.object({ value: field })
  const schema = new Schema(root)

  const result = schema.validate({ value: 'ok' })

  assertEqual(result.issues, [
    { code: 'first', message: 'First error', path: ['value'] },
    { code: 'second', message: 'Second error', path: ['value'] },
  ])
  assertEqual(result.errors, { value: ['First error', 'Second error'] })
})

it('builds nested issue paths and a matching nested error tree', () => {
  const name = types.string()
  const age = types.number()
  const enabled = types.boolean()
  const profile = types.object({ age, enabled })
  const root = types.object({ name, profile })
  const schema = new Schema(root)

  const result = schema.validate({
    name: 123,
    profile: { age: 'old', enabled: null },
  })

  assertEqual(result.issues, [
    typeIssue('string', ['name']),
    typeIssue('number', ['profile', 'age']),
    requiredIssue(['profile', 'enabled']),
  ])

  assertEqual(result.errors, {
    name: ['Expected string'],
    profile: {
      age: ['Expected number'],
      enabled: ['This field is required'],
    },
  })
})

it('stores object-level required and type errors in $errors', () => {
  const name = types.string()
  const profile = types.object({ name })
  const root = types.object({ profile })
  const schema = new Schema(root)

  const missingResult = schema.validate({})
  const wrongTypeResult = schema.validate({ profile: 'wrong' })

  assertEqual(missingResult.errors, {
    profile: { $errors: ['This field is required'] },
  })

  assertEqual(wrongTypeResult.errors, {
    profile: { $errors: ['Expected object'] },
  })
})

it('validates an optional nested object when that object is present', () => {
  type Model = { profile?: { name: string } }

  const name = types.string()
  const profileNode = types.object({ name })
  const profile = optional(profileNode)
  const root = types.object<Model>({ profile })
  const schema = new Schema(root)

  const missingResult = schema.validate({})
  const presentResult = schema.validate({ profile: {} })

  assertTrue(missingResult.valid)
  assertEqual(presentResult.errors, {
    profile: { name: ['This field is required'] },
  })
})

it('ignores properties that are not present in the schema', () => {
  const name = types.string()
  const root = types.object({ name })
  const schema = new Schema(root)

  const result = schema.validate({ name: 'John Doe', extra: 123 })

  assertTrue(result.valid)
  assertEqual(result.errors, {})
})

it('does not invoke an object validator when a child is invalid', () => {
  type Pair = { left: string; right: string }

  const isMatching = vi.fn((value: Pair) => value.left === value.right)
  const matchValidator = createValidator('match', 'Values must match', isMatching)
  const left = types.string()
  const right = types.string()
  const pair = types.object({ left, right }, matchValidator)
  const root = types.object({ pair })
  const schema = new Schema(root)

  schema.validate({ pair: { left: 123, right: 'x' } })

  assertNotCalled(isMatching.mock.calls)
})

it('runs an object validator after valid children and stores its failure in $errors', () => {
  type Pair = { left: string; right: string }

  const isMatching = (value: Pair): boolean => value.left === value.right
  const matchValidator = createValidator('match', 'Values must match', isMatching)
  const left = types.string()
  const right = types.string()
  const pair = types.object({ left, right }, matchValidator)
  const root = types.object({ pair })
  const schema = new Schema(root)

  const result = schema.validate({ pair: { left: 'a', right: 'b' } })

  assertEqual(result.errors, {
    pair: { $errors: ['Values must match'] },
  })
})

it('stores a root object-validator failure in root $errors', () => {
  type Model = { name: string }

  const rootValidator = createValidator<Model>('root', 'Root error', (): boolean => false)
  const name = types.string()
  const root = types.object({ name }, rootValidator)
  const schema = new Schema(root)

  const result = schema.validate({ name: 'John' })

  assertEqual(result.issues, [{ code: 'root', message: 'Root error', path: [] }])
  assertEqual(result.errors, { $errors: ['Root error'] })
})

it('passes root, parent, and path through ValidationContext', () => {
  const contexts: ValidationContext[] = []
  const input = { profile: { name: 'John' } }
  const isContextValid = (_value: string, context: ValidationContext): boolean => {
    contexts.push(context)
    return true
  }
  const contextValidator = createValidator('context', 'Context error', isContextValid)
  const name = types.string(contextValidator)
  const profile = types.object({ name })
  const root = types.object({ profile })
  const schema = new Schema(root)

  schema.validate(input)

  assertEqual(contexts.length, 1)
  assertEqual(contexts[0]?.root, input)
  assertEqual(contexts[0]?.parent, input.profile)
  assertEqual(contexts[0]?.path, ['profile', 'name'])
})

it('uses node-specific required and type messages', () => {
  const baseName = types.string()
  const name = withMessages(baseName, {
    required: 'Name is required',
    type: 'Name must be a string',
  })
  const root = types.object({ name })
  const schema = new Schema(root)

  const missingResult = schema.validate({})
  const wrongTypeResult = schema.validate({ name: 123 })

  assertEqual(missingResult.errors, { name: ['Name is required'] })
  assertEqual(wrongTypeResult.errors, { name: ['Name must be a string'] })
})

it('withMessages merges messages without mutating the source node', () => {
  const stringNode = types.string()
  const base = withMessages(stringNode, { required: 'Required name' })
  const changed = withMessages(base, { type: 'Wrong type' })

  assertEqual(stringNode.messages, {})
  assertEqual(base.messages, { required: 'Required name' })
  assertEqual(changed.messages, { required: 'Required name', type: 'Wrong type' })
})

it('optional returns a new optional node without mutating the source node', () => {
  const base = types.string()
  const changed = optional(base)

  assertFalse(base.optional)
  assertTrue(changed.optional)
  expect(changed).not.toBe(base)
})

it('rejects a non-object root value', () => {
  const name = types.string()
  const root = types.object({ name })
  const schema = new Schema(root)

  const result = schema.validate([])

  assertFalse(result.valid)
  assertEqual(result.errors, { $errors: ['Expected object'] })
})

it('validates literal values and preserves their literal type', () => {
  const field = types.literal('active')

  expectTypeOf(field).toMatchTypeOf<{
    readonly optional: false
    readonly validators: readonly Validator<'active'>[]
  }>()

  const root = types.object({ status: field })
  const schema = new Schema(root)

  const validResult = schema.validate({ status: 'active' })
  const invalidResult = schema.validate({ status: 'disabled' })

  assertTrue(validResult.valid)
  assertEqual(invalidResult.errors, {
    status: ['Expected literal "active"'],
  })
})

it('rejects an empty string literal because an empty string represents a missing value', () => {
  expect(() => types.literal('')).toThrow(TypeError)
})

it('validates array items and uses numeric indices in issue paths', () => {
  const values = types.array(types.string())
  const root = types.object({ values })
  const schema = new Schema(root)

  const result = schema.validate({
    values: ['first', 42, 'third'],
  })

  assertEqual(result.issues, [
    {
      code: 'type',
      message: 'Expected string',
      path: ['values', 1],
    },
  ])

  assertEqual(result.errors, {
    values: {
      1: ['Expected string'],
    },
  })
})

it('validates nested object array items', () => {
  const name = types.string()
  const users = types.array(types.object({ name }))
  const root = types.object({ users })
  const schema = new Schema(root)

  const result = schema.validate({
    users: [{ name: 'John' }, { name: '' }],
  })

  assertEqual(result.errors, {
    users: {
      1: {
        name: ['This field is required'],
      },
    },
  })
})

it('runs an array validator only after all array items are valid', () => {
  const isValid = vi.fn(() => false)
  const customValidator = createValidator<string[]>('array', 'Array error', isValid)
  const values = types.array(types.string(), customValidator)
  const root = types.object({ values })
  const schema = new Schema(root)

  const invalidItemResult = schema.validate({
    values: ['valid', 42],
  })

  assertNotCalled(isValid.mock.calls)
  assertEqual(invalidItemResult.errors, {
    values: {
      1: ['Expected string'],
    },
  })

  const validItemsResult = schema.validate({
    values: ['first', 'second'],
  })

  assertEqual(validItemsResult.errors, {
    values: {
      $errors: ['Array error'],
    },
  })
})

it('validates record entries', () => {
  const labels = types.record(types.string())
  const root = types.object({ labels })
  const schema = new Schema(root)

  const result = schema.validate({
    labels: {
      first: 'One',
      second: 42,
    },
  })

  assertEqual(result.issues, [
    {
      code: 'type',
      message: 'Expected string',
      path: ['labels', 'second'],
    },
  ])

  assertEqual(result.errors, {
    labels: {
      $entries: {
        second: ['Expected string'],
      },
    },
  })
})

it('validates nested object record entries', () => {
  const name = types.string()
  const users = types.record(types.object({ name }))
  const root = types.object({ users })
  const schema = new Schema(root)

  const result = schema.validate({
    users: {
      first: {
        name: 'John',
      },

      second: {
        name: '',
      },
    },
  })

  assertEqual(result.errors, {
    users: {
      $entries: {
        second: {
          name: ['This field is required'],
        },
      },
    },
  })
})

it('runs a record validator after all record entries are valid', () => {
  const isValid = vi.fn(() => false)
  const customValidator = createValidator<Record<string, string>>('record', 'Record error', isValid)

  const values = types.record(types.string(), customValidator)
  const root = types.object({ values })
  const schema = new Schema(root)

  const result = schema.validate({
    values: {
      first: 'one',
      second: 'two',
    },
  })

  assertEqual(isValid.mock.calls.length, 1)
  assertEqual(result.errors, {
    values: {
      $errors: ['Record error'],
    },
  })
})

it('preserves optional array and record schema types', () => {
  type Model = {
    values?: string[]
    labels?: Record<string, string>
  }

  const shape: SchemaShape<Model> = {
    values: optional(types.array(types.string())),
    labels: optional(types.record(types.string())),
  }

  expectTypeOf(shape.values.optional).toEqualTypeOf<true>()
  expectTypeOf(shape.labels.optional).toEqualTypeOf<true>()
})
