import type { Directive } from 'vue'

type RippleOptions = {
  disabled?: boolean
}

type RippleElement = HTMLElement & {
  __ripple__?: {
    options: RippleOptions
    cleanup: () => void
  }
}

const RIPPLE_CLASS = 'ripple'

const createRipple = (element: RippleElement, event: PointerEvent, isCentered: boolean) => {
  if (
    !element.__ripple__ ||
    element.__ripple__.options.disabled ||
    element.ariaDisabled === 'true' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    event.button !== 0
  ) {
    return
  }

  const rect = element.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  const halfSize = size / 2
  const x = (isCentered ? rect.width / 2 : event.clientX - rect.left) - halfSize
  const y = (isCentered ? rect.height / 2 : event.clientY - rect.top) - halfSize

  const ripple = document.createElement('span')

  ripple.className = RIPPLE_CLASS
  ripple.style.setProperty('--ripple-size', `${size}px`)
  ripple.style.setProperty('--ripple-x', `${x}px`)
  ripple.style.setProperty('--ripple-y', `${y}px`)

  element.append(ripple)

  ripple.addEventListener('animationend', () => ripple.remove(), {
    once: true,
  })
  ripple.addEventListener('animationcancel', () => ripple.remove(), {
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
