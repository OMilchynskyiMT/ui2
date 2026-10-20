import { expect, it } from 'vitest'

import { getStepStatuses, type UiStep } from '../steps.shared'

const steps: readonly UiStep[] = [
  { value: 'welcome', title: 'Welcome' },
  { value: 'network', title: 'Network' },
  { value: 'review', title: 'Review' },
]

it('derives completion from ordered steps with a current value', () => {
  expect(getStepStatuses(steps, 'network')).toEqual(['complete', 'current', 'upcoming'])
})

it('keeps all unmarked steps upcoming if the current value is missing', () => {
  expect(getStepStatuses(steps, 'missing')).toEqual(['upcoming', 'upcoming', 'upcoming'])
})

it('honors explicit error, skipped and completion statuses', () => {
  const custom: readonly UiStep[] = [
    { value: 'a', title: 'A', status: 'skipped' },
    { value: 'b', title: 'B', status: 'error' },
    { value: 'c', title: 'C', status: 'complete' },
    { value: 'd', title: 'D', status: 'upcoming' },
  ]
  expect(getStepStatuses(custom, 'b')).toEqual(['skipped', 'error', 'complete', 'upcoming'])
})

it('retains stable value-based identity when steps are added or removed', () => {
  const withOptional: readonly UiStep[] = [steps[0]!, { value: 'cellular', title: 'Cellular' }, ...steps.slice(1)]
  expect(getStepStatuses(withOptional, 'review')).toEqual(['complete', 'complete', 'complete', 'current'])
  expect(getStepStatuses(steps, 'review')).toEqual(['complete', 'complete', 'current'])
})

it('supports numeric step identities', () => {
  const numericSteps: readonly UiStep<number>[] = [
    { value: 20, title: 'Step twenty' },
    { value: 10, title: 'Step ten' },
  ]
  expect(getStepStatuses(numericSteps, 10)[0]).toBe('complete')
  expect(getStepStatuses(numericSteps, 10)[1]).toBe('current')
})

it('does not let a stale completed or skipped flag conceal the active step', () => {
  const marked: readonly UiStep[] = [{ value: 'active', title: 'Active', status: 'complete' }]
  expect(getStepStatuses(marked, 'active')[0]).toBe('current')
})
