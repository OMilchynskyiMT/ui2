export const generateHtmlId = (length = 6): string => {
  return Math.random()
    .toString(36)
    .slice(2, length + 2)
}

export interface BaseFormControlProps {
  id?: string
  label?: string | null
  title?: string
  error?: string | null
}
