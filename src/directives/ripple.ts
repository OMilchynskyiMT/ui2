import type { Directive } from 'vue'

type RippleOptions = {
  disabled?: boolean
}

type RippleElement = HTMLElement & {
  __ripple__?: {
    options: RippleOptions
    cleanup: () => void
    position: string
    overflow: string
  }
}

const RIPPLE_CLASS = 'ripple'

const createRipple = (element: RippleElement, event: PointerEvent, centered: boolean) => {
  if (
    !element.__ripple__ ||
    element.__ripple__.options.disabled ||
    element.ariaDisabled ||
    globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    event.button !== 0
  ) {
    return
  }

  const rect = element.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  const halfSize = size / 2
  const x = centered ? rect.width / 2 - halfSize : event.clientX - rect.left - halfSize
  const y = centered ? rect.height / 2 - halfSize : event.clientY - rect.top - halfSize

  const ripple = document.createElement('span')

  ripple.className = RIPPLE_CLASS
  ripple.style.setProperty('--ripple-size', `${size}px`)
  ripple.style.setProperty('--ripple-x', `${x}px`)
  ripple.style.setProperty('--ripple-y', `${y}px`)

  element.append(ripple)

  ripple.addEventListener('animationend', () => ripple.remove(), {
    once: true,
  })
}

export const ripple: Directive<RippleElement, RippleOptions | undefined> = {
  mounted(element, binding) {
    const onPointerDown = (event: PointerEvent) => {
      createRipple(element, event, Boolean(binding.modifiers.center))
    }

    element.addEventListener('pointerdown', onPointerDown, {
      passive: true,
    })

    element.__ripple__ = {
      options: binding.value ?? {},
      cleanup: () => {
        element.removeEventListener('pointerdown', onPointerDown)
      },
      position: element.style.position,
      overflow: element.style.overflow,
    }
  },

  updated(element, binding) {
    if (!element.__ripple__) return
    element.__ripple__.options = binding.value ?? {}
  },

  unmounted(element) {
    if (!element.__ripple__) return
    element.__ripple__.cleanup()
    delete element.__ripple__
  },
}
