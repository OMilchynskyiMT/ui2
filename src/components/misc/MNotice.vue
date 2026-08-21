<template>
  <div :class="['notice', type]">
    <div v-if="slots.icon || icon" aria-hidden="true" class="icon">
      <slot name="icon">
        <MIcon :icon="actualIcon" />
      </slot>
    </div>

    <div class="content">
      <slot />
    </div>

    <div v-if="slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Component, computed, useSlots } from 'vue'
import { AlertTriangleIcon, InfoIcon, LightbulbIcon, OctagonXIcon } from '@lucide/vue'

import MIcon from '../MIcon.vue'

type NoticeType = 'neutral' | 'info' | 'warning' | 'danger'

type Properties = {
  type?: NoticeType
  icon?: boolean
}

const slots = useSlots()
const { type = 'neutral', icon = true } = defineProps<Properties>()
const actualIcon = computed((): Component => {
  switch (type) {
    case 'info': {
      return InfoIcon
    }
    case 'warning': {
      return AlertTriangleIcon
    }
    case 'danger': {
      return OctagonXIcon
    }
    default: {
      return LightbulbIcon
    }
  }
})
</script>

<style scoped>
@layer components {
  .notice {
    --border-width: 1px;
    --icon-size: 24px;
    --accent: light-dark(var(--gray-600), var(--gray-400));
    --align-items: start;

    display: grid;
    align-items: var(--align-items);
    gap: var(--space-md);

    padding: var(--space-md) var(--space-lg);

    border: var(--border-width) solid color-mix(in srgb, var(--accent) 20%, transparent);
    border-radius: var(--radius-xl);

    background-color: color-mix(in oklch, var(--accent) 8%, transparent);

    &:has(> .icon) {
      grid-template-columns: var(--icon-size) minmax(0, 1fr);
    }
    &:has(> .actions) {
      grid-template-columns: minmax(0, 1fr) auto;
    }
    &:has(> .icon, > .actions) {
      grid-template-columns: var(--icon-size) minmax(0, 1fr) auto;
    }

    &.info {
      --accent: light-dark(var(--green-600), var(--green-400));
    }

    &.warning {
      --accent: light-dark(var(--orange-600), var(--orange-400));
    }

    &.danger {
      --accent: light-dark(var(--red-600), var(--red-400));
    }

    & > .icon {
      display: flex;
      align-items: center;
      justify-content: center;

      & > svg.icon {
        --size: var(--icon-size);
        --color: var(--accent);
      }
    }

    > .content {
      min-width: 0;
    }

    > .actions {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
  }
}
</style>
