// smallest single contiguous replacement between two controlled document values;
// this keeps the selection stable when a parent edits a small part of the model
export const documentChange = (current: string, next: string): { from: number; to: number; insert: string } | null => {
  if (current === next) return null

  let from = 0
  const minLength = Math.min(current.length, next.length)
  while (from < minLength && current[from] === next[from]) from++

  let oldEnd = current.length
  let newEnd = next.length
  while (oldEnd > from && newEnd > from && current[oldEnd - 1] === next[newEnd - 1]) {
    oldEnd--
    newEnd--
  }

  return { from, to: oldEnd, insert: next.slice(from, newEnd) }
}
