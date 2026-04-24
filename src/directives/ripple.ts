import type { Directive } from 'vue'

interface RippleOptions {
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

const createRipple = (el: RippleElement, event: PointerEvent, centered: boolean) => {
  const state = el.__ripple__

  if (!state) return
  if (state.options.disabled) return
  if (event.button !== 0) return

  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  const x = centered ? rect.width / 2 - size / 2 : event.clientX - rect.left - size / 2

  const y = centered ? rect.height / 2 - size / 2 : event.clientY - rect.top - size / 2

  const ripple = document.createElement('span')

  ripple.className = RIPPLE_CLASS
  ripple.style.setProperty('--ripple-size', `${size}px`)
  ripple.style.setProperty('--ripple-x', `${x}px`)
  ripple.style.setProperty('--ripple-y', `${y}px`)

  el.append(ripple)

  ripple.addEventListener('animationend', () => ripple.remove(), {
    once: true,
  })
}

export const ripple: Directive<RippleElement, RippleOptions | undefined> = {
  mounted(el, binding) {
    const style = getComputedStyle(el)

    const position = el.style.position
    const overflow = el.style.overflow

    if (style.position === 'static') {
      el.style.position = 'relative'
    }

    if (style.overflow === 'visible') {
      el.style.overflow = 'hidden'
    }

    const onPointerDown = (event: PointerEvent) => {
      createRipple(el, event, Boolean(binding.modifiers.center))
    }

    el.addEventListener('pointerdown', onPointerDown, {
      passive: true,
    })

    el.__ripple__ = {
      options: binding.value ?? {},
      cleanup: () => {
        el.removeEventListener('pointerdown', onPointerDown)
      },
      position,
      overflow,
    }
  },

  updated(el, binding) {
    if (!el.__ripple__) return

    el.__ripple__.options = binding.value ?? {}
  },

  unmounted(el) {
    const state = el.__ripple__

    if (!state) return

    state.cleanup()

    el.style.position = state.position
    el.style.overflow = state.overflow

    delete el.__ripple__
  },
}
