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

export const interactiveSelector = [
  'input',
  'textarea',
  'select',
  'button',
  'a[href]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')
