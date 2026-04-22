export const generateHtmlId = (length: number = 6): string => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
}

export type BaseFormControlProps = {
  id?: string
  label?: string | null
  title?: string
  error?: string | null
}
