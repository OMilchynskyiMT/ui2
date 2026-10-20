export type UiStepStatus = 'current' | 'complete' | 'upcoming' | 'skipped' | 'error'

export type UiStep<Value extends string | number = string> = {
  value: Value
  title: string
  description?: string
  optional?: boolean
  disabled?: boolean
  status?: Exclude<UiStepStatus, 'current'>
}

export const getStepStatuses = <Value extends string | number>(
  steps: readonly UiStep<Value>[],
  current: Value
): UiStepStatus[] => {
  const currentIndex = steps.findIndex(step => step.value === current)

  return steps.map((step, index) => {
    if (index === currentIndex) return step.status === 'error' ? 'error' : 'current'
    if (step.status) return step.status
    return currentIndex !== -1 && index < currentIndex ? 'complete' : 'upcoming'
  })
}
