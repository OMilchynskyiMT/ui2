export const generateHtmlId = (length = 6): string => {
  return Math.random()
    .toString(36)
    .slice(2, length + 2)
}

export type BaseFormControlProperties = {
  id?: string
  label?: string | null
  title?: string
  error?: string | null
  containerStyle?: HTMLElement['style']
}

export type FormComboInputValue = string | number

export type FormComboInputOption =
  | FormComboInputValue
  | {
      value: FormComboInputValue
      title: string
      disabled?: boolean
    }

export type NormalizedFormComboInputOption = {
  value: FormComboInputValue
  title: string
  disabled?: boolean
}

export const normalizeFormComboInputOption = (option: FormComboInputOption): NormalizedFormComboInputOption => {
  if (typeof option === 'object') {
    return option
  }

  return {
    value: option,
    title: String(option),
  }
}
