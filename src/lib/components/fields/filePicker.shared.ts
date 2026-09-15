export type UiFilePickerVariant = 'field' | 'area'
export type UiFilePickerChangeSource = 'picker' | 'drop' | 'clear' | 'remove'
export type UiFileRejectionReason = 'accept' | 'multiple'

export type UiFileRejection = {
  file: File
  reason: UiFileRejectionReason
}

export const getFileKey = (file: File): string => `${file.name}:${file.size}:${file.lastModified}:${file.type}`

export const parseAccept = (accept: string): string[] => {
  return accept
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
}

export const isAcceptableFile = (file: File, acceptTokens: readonly string[]): boolean => {
  if (acceptTokens.length === 0) return true

  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return acceptTokens.some(token => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

export const filterSelectedFiles = (
  files: Iterable<File>,
  acceptTokens: readonly string[],
  isMultiple: boolean
): { accepted: File[]; rejected: UiFileRejection[] } => {
  const accepted: File[] = []
  const rejected: UiFileRejection[] = []

  for (const file of files) {
    if (!isAcceptableFile(file, acceptTokens)) {
      rejected.push({ file, reason: 'accept' })
      continue
    }

    if (!isMultiple && accepted.length > 0) {
      rejected.push({ file, reason: 'multiple' })
      continue
    }

    accepted.push(file)
  }

  return { accepted, rejected }
}
