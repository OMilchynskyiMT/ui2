export type LogMatch = { start: number; length: number }

export const isNearLogBottom = (scrollHeight: number, scrollTop: number, clientHeight: number): boolean => {
  return scrollHeight - scrollTop - clientHeight <= 3
}

// limit rendering to the latest complete or partial lines without changing the source log
export const tailLog = (text: string, maxLines: number): { text: string; truncated: boolean } => {
  if (text === '' || maxLines <= 0) return { text, truncated: false }

  const limit = Math.max(1, Math.floor(maxLines))
  // trailing newline terminates the final line, it is not another empty log entry
  const end = text.endsWith('\n') ? text.length - 1 : text.length
  let lines = end > 0 ? 1 : 0

  for (let index = end - 1; index >= 0; index--) {
    if (text[index] !== '\n') continue
    lines++
    if (lines <= limit) continue
    return { text: text.slice(index + 1), truncated: true }
  }

  return { text, truncated: false }
}

// literal as-is, case-insensitive search: offsets always refer to the unmodified input
export const findLogMatches = (text: string, query: string): LogMatch[] => {
  if (!query) return []

  const expression = new RegExp(query.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`), 'gi')
  const matches: LogMatch[] = Array.from(text.matchAll(expression), match => ({
    start: match.index,
    length: match[0].length,
  }))
  return matches
}
