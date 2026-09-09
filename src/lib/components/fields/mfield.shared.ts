import { computed, type MaybeRefOrGetter, type Slots, toValue } from 'vue'

export type MFieldVariant = 'outlined' | 'filled'
export type MFieldSize = 'small' | 'medium'

export type MFieldProperties = {
  id: string

  focused: boolean
  populated: boolean
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  multiline?: boolean

  variant?: MFieldVariant
  size?: MFieldSize

  label?: string
  title?: string
  prefix?: string
  suffix?: string
  error?: string
  hint?: string
}

export type MFieldExpose = {
  focus: (options?: FocusOptions) => void
  blur: () => void
  select: () => void
}

export const createFieldExpose = (getField: () => MFieldExpose | null | undefined): MFieldExpose => ({
  focus: options => getField()?.focus(options),
  blur: () => getField()?.blur(),
  select: () => getField()?.select(),
})

export const useFieldState = (
  id: string,
  invalid: MaybeRefOrGetter<boolean>,
  error: MaybeRefOrGetter<string>,
  hint: MaybeRefOrGetter<string>,
  slots: Slots
) => {
  const hasError = computed(() => toValue(error).length > 0 || Boolean(slots.error))
  const hasHint = computed(() => toValue(hint).length > 0 || Boolean(slots.hint))
  const isInvalid = computed(() => toValue(invalid) || hasError.value)
  const description = computed(() => {
    const identifiers: string[] = []
    if (hasError.value) identifiers.push(`${id}-error`)
    if (hasHint.value) identifiers.push(`${id}-hint`)

    return identifiers.length > 0 ? identifiers.join(' ') : undefined
  })

  return {
    hasError,
    hasHint,
    isInvalid,
    description,
  }
}

export const interactiveSelector = [
  'input',
  'textarea',
  'select',
  'button',
  'a[href]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')
