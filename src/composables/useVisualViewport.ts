import { onMounted, onScopeDispose, readonly, type Ref, shallowRef } from 'vue'

export type UseVisualViewport = {
  supported: Readonly<Ref<boolean>>
  width: Readonly<Ref<number>>
  height: Readonly<Ref<number>>
  offsetTop: Readonly<Ref<number>>
  offsetLeft: Readonly<Ref<number>>
  scale: Readonly<Ref<number>>
}

export const useVisualViewport = (): UseVisualViewport => {
  const supported = shallowRef(false)
  const width = shallowRef(0)
  const height = shallowRef(0)
  const offsetTop = shallowRef(0)
  const offsetLeft = shallowRef(0)
  const scale = shallowRef(1)

  let animationFrame: number | undefined
  let viewport: VisualViewport | null = null

  const update = (): void => {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)

    animationFrame = requestAnimationFrame(() => {
      animationFrame = undefined

      if (viewport) {
        width.value = viewport.width
        height.value = viewport.height
        offsetTop.value = viewport.offsetTop
        offsetLeft.value = viewport.offsetLeft
        scale.value = viewport.scale
        return
      }

      width.value = document.documentElement.clientWidth
      height.value = document.documentElement.clientHeight
      offsetTop.value = 0
      offsetLeft.value = 0
      scale.value = 1
    })
  }

  const stop = (): void => {
    if (viewport) {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    } else {
      window.removeEventListener('resize', update)
    }

    if (animationFrame !== undefined) {
      cancelAnimationFrame(animationFrame)
      animationFrame = undefined
    }
  }

  onMounted(() => {
    viewport = window.visualViewport
    supported.value = Boolean(viewport)

    if (viewport) {
      viewport.addEventListener('resize', update)
      viewport.addEventListener('scroll', update)
    } else {
      window.addEventListener('resize', update)
    }

    update()
  })

  onScopeDispose(stop)

  return {
    supported: readonly(supported),
    width: readonly(width),
    height: readonly(height),
    offsetTop: readonly(offsetTop),
    offsetLeft: readonly(offsetLeft),
    scale: readonly(scale),
  }
}
