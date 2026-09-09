export type MFilePickerVariant = 'field' | 'area'
export type MFilePickerChangeSource = 'picker' | 'drop' | 'clear' | 'remove'
export type MFileRejectionReason = 'accept' | 'multiple'

export type MFileRejection = {
  file: File
  reason: MFileRejectionReason
}

export const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`

  const units = ['KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length)
  const value = size / 1024 ** exponent
  const formatted = value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '')

  return `${formatted} ${units[exponent - 1]}`
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
): { accepted: File[]; rejected: MFileRejection[] } => {
  const accepted: File[] = []
  const rejected: MFileRejection[] = []

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
