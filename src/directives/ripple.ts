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
  const state = element.__ripple__

  if (!state) return
  if (state.options.disabled) return
  if (event.button !== 0) return

  const rect = element.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  const x = centered ? rect.width / 2 - size / 2 : event.clientX - rect.left - size / 2
  const y = centered ? rect.height / 2 - size / 2 : event.clientY - rect.top - size / 2

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
    const style = getComputedStyle(element)

    const position = element.style.position
    const overflow = element.style.overflow

    if (style.position === 'static') {
      element.style.position = 'relative'
    }

    if (style.overflow === 'visible') {
      element.style.overflow = 'hidden'
    }

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
      position,
      overflow,
    }
  },

  updated(element, binding) {
    if (!element.__ripple__) return

    element.__ripple__.options = binding.value ?? {}
  },

  unmounted(element) {
    const state = element.__ripple__

    if (!state) return

    state.cleanup()

    element.style.position = state.position
    element.style.overflow = state.overflow

    delete element.__ripple__
  },
}
