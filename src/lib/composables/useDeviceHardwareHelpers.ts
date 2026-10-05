import { onBeforeUnmount, onMounted, readonly, type Ref, ref, watch } from 'vue'

type DevicePixelSize = {
  inlineSize: number
  blockSize: number
}

const getDevicePixelRatio = (): number => {
  return globalThis.devicePixelRatio || 1
}

export const useDevicePixelRatio = () => {
  const ratio = ref(getDevicePixelRatio())
  let mediaQuery: MediaQueryList | undefined

  const update = () => {
    mediaQuery?.removeEventListener('change', update)
    ratio.value = getDevicePixelRatio()
    if (typeof matchMedia !== 'function') return

    mediaQuery = matchMedia(`(resolution: ${ratio.value}dppx)`)
    mediaQuery.addEventListener('change', update, {
      once: true,
    })
  }

  onMounted(update)
  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', update)
  })

  return readonly(ratio)
}

export const useSnapToDevicePixel = (value: number): number => {
  const ratio = getDevicePixelRatio()
  return Math.round(value * ratio) / ratio
}

export const useElementDevicePixelSize = (element: Readonly<Ref<Element | null | undefined>>) => {
  const ratio = useDevicePixelRatio()

  const size = ref<DevicePixelSize>({
    inlineSize: 0,
    blockSize: 0,
  })

  let observer: ResizeObserver | undefined
  let contentSize: DevicePixelSize | undefined

  const updateFromContentSize = () => {
    if (!contentSize) return
    size.value = {
      inlineSize: Math.round(contentSize.inlineSize * ratio.value),
      blockSize: Math.round(contentSize.blockSize * ratio.value),
    }
  }

  watch(ratio, updateFromContentSize)
  watch(
    element,
    target => {
      observer?.disconnect()
      observer = undefined
      contentSize = undefined

      size.value = {
        inlineSize: 0,
        blockSize: 0,
      }

      if (!target || typeof ResizeObserver === 'undefined') return
      observer = new ResizeObserver(entries => {
        const entry = entries[0]
        if (!entry) return

        const contentBox = entry.contentBoxSize[0]
        contentSize = contentBox
          ? {
              inlineSize: contentBox.inlineSize,
              blockSize: contentBox.blockSize,
            }
          : {
              inlineSize: entry.contentRect.width,
              blockSize: entry.contentRect.height,
            }

        const devicePixelBox = entry.devicePixelContentBoxSize?.[0]
        if (devicePixelBox) {
          size.value = {
            inlineSize: Math.round(devicePixelBox.inlineSize),
            blockSize: Math.round(devicePixelBox.blockSize),
          }
          return
        }

        updateFromContentSize()
      })

      try {
        observer.observe(target, {
          box: 'device-pixel-content-box',
        })
      } catch {
        observer.observe(target)
      }
    },
    {
      flush: 'post',
      immediate: true,
    }
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return readonly(size)
}
