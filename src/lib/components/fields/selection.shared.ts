export type SelectionControlVariant = 'checkbox' | 'radio' | 'toggle'

export type SelectionControlProperties = {
  id?: string
  type: 'checkbox' | 'radio'
  variant: SelectionControlVariant
  checked?: boolean
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  indeterminate?: boolean
  label?: string
  hint?: string
  error?: string
  title?: string
  role?: string
  value?: string
}

export type SelectionControlCommonProperties = Omit<
  SelectionControlProperties,
  'type' | 'variant' | 'checked' | 'indeterminate' | 'role' | 'value'
>

export type SelectionControlExpose = {
  focus: (options?: FocusOptions) => void
  blur: () => void
}
