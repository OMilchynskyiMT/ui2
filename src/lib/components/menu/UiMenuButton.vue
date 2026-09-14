<template>
  <UiButton
    :id="resolvedButtonId"
    ref="button"
    v-bind="attributes"
    :aria-expanded="open"
    :disabled="disabled"
    :label="label"
    :loading="loading"
    :ripple="ripple"
    :size="size"
    :title="title"
    :tone="tone"
    :variant="variant"
    aria-haspopup="menu"
    type="button"
    @click="toggle"
    @keydown="onButtonKeydown"
  >
    <slot>{{ label ?? '' }}</slot>
  </UiButton>

  <UiMenu
    v-model:open="open"
    :anchor="anchor"
    :aria-label="menuAriaLabel"
    :aria-labelledby="menuAriaLabel ? undefined : resolvedButtonId"
    :class="menuClass"
    :icon-size="iconSize"
    :initial-focus="initialFocus"
    :items="items"
    :offset="offset"
    :placement="placement"
    :style="menuStyle"
    @select="emit('select', $event)"
  >
    <template v-if="$slots['menu-header']" #header>
      <slot name="menu-header" />
    </template>
  </UiMenu>
</template>

<script lang="ts">
import type { HTMLAttributes } from 'vue'

import type { Size as UiButtonSize, Variant as UiButtonVariant } from '../buttons/UiButton.vue'
import type { ComponentTone } from '../component.types'
import type { OverlayPlacement } from '../overlay/UiPopover.vue'

export type UiMenuButtonProperties<V> = {
  items: UiMenuItem<V>[]
  id?: string
  menuAriaLabel?: string
  menuClass?: HTMLAttributes['class']
  menuStyle?: HTMLAttributes['style']
  placement?: OverlayPlacement
  offset?: number
  iconSize?: string
  variant?: UiButtonVariant
  tone?: ComponentTone
  size?: UiButtonSize
  ripple?: boolean
  disabled?: boolean
  loading?: boolean
  label?: string
  title?: string
}

export type UiMenuButtonExposed = {
  open: () => void
  close: () => void
  toggle: () => void
}
</script>

<script generic="V" lang="ts" setup>
import { computed, ref, useAttrs, useTemplateRef, watch } from 'vue'

import { useId } from '@/composables/useId'

import UiButton from '../buttons/UiButton.vue'
import UiMenu, { type UiMenuItem } from './UiMenu.vue'

const {
  items,
  id,
  menuAriaLabel,
  menuClass,
  menuStyle,
  placement = 'bottom-start',
  offset = 0,
  iconSize,
  variant = 'filled',
  tone = 'primary',
  size = 'medium',
  ripple = true,
  disabled = false,
  loading = false,
  label,
  title,
} = defineProps<UiMenuButtonProperties<V>>()

const emit = defineEmits<{
  select: [item: UiMenuItem<V>]
}>()

const open = defineModel<boolean>('open', { default: false })

defineOptions({ inheritAttrs: false })

const attributes = useAttrs()
const generatedButtonId = useId()
const resolvedButtonId = id ?? generatedButtonId
const buttonReference = useTemplateRef<InstanceType<typeof UiButton>>('button')
const initialFocus = ref<'first' | 'last'>('first')

const anchor = computed<HTMLElement | null>(() => {
  const element = buttonReference.value?.$el
  return element instanceof HTMLElement ? element : null
})

const canOpen = (): boolean => !disabled && !loading

const show = (focus: 'first' | 'last' = 'first'): void => {
  if (!canOpen()) return
  initialFocus.value = focus
  open.value = true
}

const close = (): void => {
  open.value = false
}

const toggle = (): void => {
  if (!canOpen()) return
  if (open.value) close()
  else show('first')
}

const onButtonKeydown = (event: KeyboardEvent): void => {
  if (!canOpen()) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    show('first')
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    show('last')
  }
}

watch(
  () => [disabled, loading] as const,
  ([isDisabled, isLoading]) => {
    if ((isDisabled || isLoading) && open.value) close()
  },
  { immediate: true }
)

defineExpose<UiMenuButtonExposed>({
  open: show,
  close,
  toggle,
})
</script>
