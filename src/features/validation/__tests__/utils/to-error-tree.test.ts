import { describe, expect, it } from 'vitest'

import { type ValidationIssue } from '@/features/validation'
import { toErrorTree } from '@/features/validation/utils/to-error-tree'

describe('toErrorTree', () => {
  it('projects nested issues into a nested error tree', () => {
    const issues: ValidationIssue[] = [
      {
        path: ['user', 'email'],
        code: 'string.type',
        message: 'Must be a string',
      },
      {
        path: ['user', 'age'],
        code: 'required',
        message: 'Required',
      },
    ]

    expect(toErrorTree(issues)).toEqual({
      user: {
        email: ['Must be a string'],
        age: ['Required'],
      },
    })
  })

  it('keeps node-level and child-level errors together', () => {
    const issues: ValidationIssue[] = [
      {
        path: ['user'],
        code: 'object.refine',
        message: 'User is invalid',
      },
      {
        path: ['user', 'email'],
        code: 'string.type',
        message: 'Must be a string',
      },
      {
        path: [],
        code: 'form.invalid',
        message: 'Payload is invalid',
      },
    ]

    expect(toErrorTree(issues)).toEqual({
      _errors: ['Payload is invalid'],
      user: {
        _errors: ['User is invalid'],
        email: ['Must be a string'],
      },
    })
  })

  it('keeps child-level and node-level errors together regardless of order', () => {
    const issues = [
      {
        path: ['user', 'email'],
        code: 'string.type',
        message: 'Must be a string',
      },
      {
        path: ['user'],
        code: 'object.invalid',
        message: 'User is invalid',
      },
    ]

    expect(toErrorTree(issues)).toEqual({
      user: {
        _errors: ['User is invalid'],
        email: ['Must be a string'],
      },
    })
  })

  it('supports numeric path segments for arrays', () => {
    const issues: ValidationIssue[] = [
      {
        path: ['items', 1, 'name'],
        code: 'string.type',
        message: 'Must be a string',
      },
    ]

    expect(toErrorTree(issues)).toEqual({
      items: {
        '1': {
          name: ['Must be a string'],
        },
      },
    })
  })
})
