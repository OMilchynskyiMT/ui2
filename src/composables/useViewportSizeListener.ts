import { onScopeDispose } from 'vue'

import { useEventListeners } from '@/lib/composables/useEventListeners'

export type ViewportSize = Readonly<{
  width: number
  height: number
}>

export const getViewportSize = (): ViewportSize => {
  const root = document.documentElement
  return {
    width: root.clientWidth,
    height: root.clientHeight,
  }
}

export const getRootFontSize = (): number => {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  if (!Number.isFinite(value)) {
    throw new TypeError('Unable to resolve the root font size')
  }

  return value
}

export const remToPixels = (value: number): number => value * getRootFontSize()

export const useViewportSizeListener = (listener: (size: ViewportSize) => void): (() => void) => {
  let animationFrame: number | undefined

  const update = (): void => {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
    animationFrame = requestAnimationFrame(() => {
      animationFrame = undefined
      listener(getViewportSize())
    })
  }

  const events = useEventListeners(() => [
    {
      target: globalThis,
      type: 'resize',
      listener: update,
    },
  ])

  const cancelUpdate = (): void => {
    if (animationFrame === undefined) return
    cancelAnimationFrame(animationFrame)
    animationFrame = undefined
  }

  const stop = (): void => {
    events.stop()
    cancelUpdate()
  }

  events.start()
  update()
  onScopeDispose(cancelUpdate)

  return stop
}
