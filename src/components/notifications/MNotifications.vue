<template>
  <TransitionGroup appear class="notifications" name="notification" tag="div">
    <div v-for="item in latests" :key="item.id" class="item">
      <div :data-tone="item.tone" class="notification">
        <div v-if="item.icon" class="icon">
          <MIcon :icon="item.icon as Component" />
        </div>

        <div class="content">
          <h4 v-if="item.title">{{ item.title }}</h4>
          <p>{{ item.message }}</p>
        </div>

        <div class="close">
          <MButton
            aria-label="Dismiss notification"
            size="small"
            tone="neutral"
            variant="icon"
            @click.prevent="remove(item.id)"
          >
            <MIcon :icon="XIcon" size="1rem" />
          </MButton>
        </div>

        <div
          v-if="item.timeout"
          :key="`${item.id}-${item.expiresAt ?? 0}`"
          :style="timeoutStyle(item)"
          class="progress"
        />
      </div>
    </div>
  </TransitionGroup>
</template>

<script lang="ts" setup>
import { XIcon } from '@lucide/vue'
import type { Component } from 'vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MIcon from '@/lib/components/MIcon.vue'

import { type Notification, useNotifications } from '.'

const { latests, remove } = useNotifications()
const timeoutStyle = (item: Notification): Record<string, string> => {
  if (!item.timeout) return {}

  const remaining = item.timeoutRemaining ?? item.timeout
  const progress = Math.min(1, Math.max(0, remaining / item.timeout))

  return {
    '--timeout-duration': `${remaining}ms`,
    '--timeout-progress': String(progress),
  }
}
</script>

<style scoped>
@layer components {
  div.notifications {
    --accent: currentColor;
    --border-width: 0px;
    --x-icon-size: 1rem;
    --x-icon-color: var(--gray-500);
    --icon-size: 24px;
    --progress-width: 1px;

    position: fixed;
    inset-block-start: max(var(--space-lg), var(--safe-area-top));
    inset-block-end: max(var(--space-lg), var(--safe-area-bottom));
    inset-inline-start: max(var(--space-lg), var(--safe-area-left));
    inset-inline-end: max(var(--space-lg), var(--safe-area-right));
    z-index: 1000;

    display: flex;
    flex-direction: column;
    align-items: flex-end;

    pointer-events: none;

    & > div.item {
      display: grid;
      grid-template-rows: minmax(0, 1fr);

      min-block-size: 0;
      inline-size: fit-content;
      max-inline-size: min(100%, 32rem);
      margin-block-end: var(--space-md);

      &.notification-enter-active,
      &.notification-leave-active {
        transition-property: grid-template-rows, margin-block-end;
        transition-duration: var(--duration-md);
        transition-timing-function: var(--bezier-smooth);

        & > div.notification {
          transition-property: opacity, transform;
          transition-duration: var(--duration-md);
          transition-timing-function: var(--bezier-smooth);
        }
      }

      &.notification-enter-from,
      &.notification-leave-to {
        grid-template-rows: minmax(0, 0fr);
        margin-block-end: 0;

        & > div.notification {
          opacity: 0;
          transform: translateX(0.5rem);
        }
      }

      &.notification-leave-active {
        z-index: 1;

        & > div.notification {
          pointer-events: none;
        }
      }

      & > div.notification {
        --accent: var(--surface-bg);
        --border-width: 0px;

        position: relative;
        overflow: clip;

        align-self: start;
        min-block-size: 0;

        display: flex;
        align-items: center;
        column-gap: var(--space-md);

        border-left: var(--border-width) solid var(--accent);
        padding: var(--space-sm) var(--space-sm) var(--space-sm) var(--space-md);

        background-color: color-mix(in oklch, var(--surface-bg) 90%, transparent);
        backdrop-filter: blur(3px);
        box-shadow: var(--shadow-sm);
        border-radius: var(--radius-md);

        pointer-events: auto;

        &[data-tone]:not([data-tone='neutral']) {
          --accent: var(--tone-color);
          --border-width: 5px;
        }

        &[data-tone='neutral'] {
          --accent: var(--tone-color);
        }

        & > div.content {
          min-inline-size: 0;
          flex: 1 1 auto;

          display: grid;
          gap: var(--space-xxs);

          & > h4 {
            line-height: var(--icon-size);
          }
        }

        & > div.icon,
        & > div.close {
          place-self: flex-start;
          flex: 0 0 auto;

          display: grid;
          place-items: center;
        }

        & > div.icon {
          & svg.icon {
            --size: var(--icon-size);
            --color: var(--accent);
          }
        }

        & > div.close > button {
          --padding-inline: var(--space-xs);
          --padding-block: var(--space-xs);
          & svg.icon {
            --size: var(--x-icon-size);
            --color: var(--x-icon-color);
          }
        }

        & > div.progress {
          position: absolute;
          inset-inline: 0;
          inset-block-end: 0;

          block-size: var(--progress-width);
          overflow: hidden;
          background: color-mix(in oklch, var(--accent) 10%, transparent);

          &::after {
            content: '';

            display: block;
            inline-size: 100%;
            block-size: 100%;

            background: var(--accent);

            transform: scaleX(var(--timeout-progress));
            transform-origin: left center;

            animation: notification-timeout var(--timeout-duration) linear forwards;
          }
        }
      }
    }
  }

  @keyframes notification-timeout {
    from {
      transform: scaleX(var(--timeout-progress));
    }

    to {
      transform: scaleX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    div.notifications > div.item {
      &.notification-enter-active,
      &.notification-leave-active {
        transition: none;

        & > div.notification {
          transition: none;
        }
      }

      & > div.notification > div.progress::after {
        animation: none;
      }
    }
  }
}
</style>
