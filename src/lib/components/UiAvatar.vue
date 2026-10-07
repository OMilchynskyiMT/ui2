<template>
  <span :style="{ '--avatar-size': size }" class="avatar">
    <img v-if="src" :alt="alt" :src="src" />
    <span v-else-if="initials" class="initials">{{ initials }}</span>
    <UiIcon v-else :icon="icon ?? User2Icon" :size="size" />
  </span>
</template>

<script lang="ts">
import type { Component } from 'vue'

export type UiAvatarProperties = {
  src?: string
  alt?: string
  initials?: string
  icon?: Component
  size?: string
}
</script>

<script lang="ts" setup>
import { User2Icon } from '@lucide/vue'

import UiIcon from './UiIcon.vue'

const { src, alt = '', initials, icon, size = '1.5rem' } = defineProps<UiAvatarProperties>()
</script>

<style scoped>
@layer components {
  .avatar {
    /* Public CSS customization hook. */
    --avatar-color: var(--tone-primary);
    --avatar-padding: calc(var(--avatar-size) / 4);
    --avatar-bg: oklch(from var(--avatar-color) l c h / 0.2);

    display: inline-grid;
    place-items: center;
    inline-size: calc(var(--avatar-size) + 2 * var(--avatar-padding));
    block-size: calc(var(--avatar-size) + 2 * var(--avatar-padding));
    overflow: hidden;
    border-radius: 50%;
    background-color: var(--avatar-bg);
    color: var(--avatar-color);
    line-height: 1;

    & > img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }

    & > .initials {
      font-size: calc(var(--avatar-size) * 0.6);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
    }
  }
}
</style>
