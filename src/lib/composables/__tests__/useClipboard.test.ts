import { effectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClipboard } from '../useClipboard'

afterEach(() => {
  vi.unstubAllGlobals()
})

const setup = () => {
  const scope = effectScope()
  const clipboard = scope.run(useClipboard)
  if (!clipboard) throw new Error('Unable to create clipboard composable')
  return { ...clipboard, scope }
}

describe('useClipboard', () => {
  it('copies text and keeps its success status until explicitly invalidated', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const clipboard = setup()

    expect(await clipboard.copy('device log')).toBe(true)
    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText).toHaveBeenCalledWith('device log')
    expect(clipboard.copied.value).toBe(true)
    expect(clipboard.copying.value).toBe(false)

    // There is no timer in the clipboard composable: consumers own visual feedback.
    clipboard.invalidate()
    expect(clipboard.copied.value).toBe(false)
    expect(clipboard.copying.value).toBe(false)
    clipboard.scope.stop()
  })

  it('reports unsupported clipboard access and rejected writes without claiming success', async () => {
    const clipboard = setup()
    vi.stubGlobal('navigator', {})
    await expect(clipboard.copy('x')).rejects.toThrow('Clipboard API is not available')
    expect(clipboard.copied.value).toBe(false)
    expect(clipboard.copying.value).toBe(false)

    const error = new DOMException('Permission denied', 'NotAllowedError')
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(error) } })
    await expect(clipboard.copy('x')).rejects.toBe(error)
    expect(clipboard.copied.value).toBe(false)
    expect(clipboard.copying.value).toBe(false)
    clipboard.scope.stop()
  })

  it('keeps the latest request state when overlapping writes complete out of order', async () => {
    const pending: { resolve?: () => void } = {}
    const writeText = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>(resolve => {
            pending.resolve = resolve
          })
      )
      .mockResolvedValueOnce(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const clipboard = setup()

    const first = clipboard.copy('first')
    expect(clipboard.copying.value).toBe(true)
    expect(await clipboard.copy('second')).toBe(true)
    expect(clipboard.copied.value).toBe(true)
    pending.resolve?.()
    expect(await first).toBe(false)
    expect(clipboard.copied.value).toBe(true)
    expect(clipboard.copying.value).toBe(false)
    clipboard.scope.stop()
  })

  it('invalidates pending copy operations when the displayed source changes', async () => {
    const pending: { resolve?: () => void } = {}
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockImplementation(
          () =>
            new Promise<void>(resolve => {
              pending.resolve = resolve
            })
        ),
      },
    })
    const clipboard = setup()
    const writing = clipboard.copy('old log')
    clipboard.invalidate()
    pending.resolve?.()

    expect(await writing).toBe(false)
    expect(clipboard.copied.value).toBe(false)
    expect(clipboard.copying.value).toBe(false)
    clipboard.scope.stop()
  })

  it('prevents disposed copies from reporting success', async () => {
    const pending: { resolve?: () => void } = {}
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockImplementation(
          () =>
            new Promise<void>(resolve => {
              pending.resolve = resolve
            })
        ),
      },
    })
    const clipboard = setup()
    const writing = clipboard.copy('value')
    clipboard.scope.stop()
    pending.resolve?.()

    expect(await writing).toBe(false)
    expect(clipboard.copied.value).toBe(false)
    expect(clipboard.copying.value).toBe(false)
  })
})
