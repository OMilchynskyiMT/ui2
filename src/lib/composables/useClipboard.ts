import { onScopeDispose, readonly, ref } from 'vue'

export const useClipboard = () => {
  const copied = ref(false)
  const copying = ref(false)
  let request = 0
  let isDisposed = false

  const invalidate = (): void => {
    ++request
    copied.value = false
    copying.value = false
  }

  const copy = async (text: string): Promise<boolean> => {
    const currentRequest = ++request
    copied.value = false
    copying.value = true

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is not available')
      }

      await navigator.clipboard.writeText(text)

      if (isDisposed || currentRequest !== request) return false
      copied.value = true
      return true
    } finally {
      if (!isDisposed && currentRequest === request) copying.value = false
    }
  }

  onScopeDispose(() => {
    isDisposed = true
    invalidate()
  })

  return { copy, invalidate, copied: readonly(copied), copying: readonly(copying) }
}
