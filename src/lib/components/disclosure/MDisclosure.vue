<template>
  <div :data-open="open || undefined" class="disclosure">
    <div class="header">
      <div v-if="$slots.leading" class="leading">
        <slot name="leading" />
      </div>

      <button :aria-expanded="open" class="trigger" type="button" @click="open = !open">
        <span class="summary-content">
          <slot name="summary">
            <h3 v-if="title" class="title">{{ title }}</h3>
            <span v-if="description" class="description">
              {{ description }}
            </span>
          </slot>
        </span>

        <span aria-hidden="true" class="indicator">
          <MIcon :icon="ChevronDownIcon" size="1rem" />
        </span>
      </button>

      <div v-if="$slots.trailing" class="trailing">
        <slot name="trailing" />
      </div>
    </div>

    <div :aria-hidden="!open || undefined" :inert="!open || undefined" class="content-region">
      <div class="content-clip">
        <div class="content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export type MDisclosureProperties = {
  title?: string
  description?: string
}
</script>

<script lang="ts" setup>
import { ChevronDownIcon } from '@lucide/vue'

import MIcon from '../MIcon.vue'

const { title, description } = defineProps<MDisclosureProperties>()
const open = defineModel<boolean>({ default: false })
</script>

<style scoped>
@layer components {
  .disclosure {
    --accent: var(--tone-primary);
    --padding-inline: var(--space-md);
    --padding-block: var(--space-md);
    --gap: var(--space-md);
    --border-color: var(--divider-color);
    --header-bg: transparent;
    --summary-min-size: 12rem;

    overflow: clip;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    background-color: var(--surface-bg);

    & > .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--gap);
      padding: var(--padding-block) var(--padding-inline);
      background-color: var(--header-bg);

      transition: background-color var(--duration-sm) var(--bezier-smooth);

      &:has(> .trigger:is(:hover, :focus-visible)) {
        --header-bg: color-mix(in oklch, var(--accent) 5%, transparent);
      }

      & > :is(.leading, .trailing) {
        min-inline-size: 0;
        max-inline-size: 100%;
        flex: 0 1 auto;
      }

      & > .trigger {
        min-inline-size: min(var(--summary-min-size), 100%);
        flex: 1 1 var(--summary-min-size);

        display: flex;
        align-items: center;
        gap: var(--gap);

        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: start;
        cursor: pointer;

        & > .summary-content {
          min-inline-size: 0;
          flex: 1 1 auto;

          display: grid;

          & > .title {
            font-weight: var(--font-weight-semibold);
          }

          & > .description {
            color: var(--text-color-dimmed);
            font-size: var(--font-size-sm);
          }
        }

        & > .indicator {
          flex: 0 0 auto;

          display: grid;
          place-items: center;

          color: oklch(from currentColor l c h / 0.5);
          transform: scaleY(1);

          transition: transform var(--duration-md) var(--bezier-smooth);
        }
      }
    }

    &[data-open] {
      & > .header > .trigger > .indicator {
        transform: scaleY(-1);
      }

      & > .content-region {
        grid-template-rows: 1fr;

        & > .content-clip > .content {
          opacity: 1;
          translate: 0;
        }
      }
    }

    & > .content-region {
      display: grid;
      grid-template-rows: 0fr;

      transition: grid-template-rows var(--duration-md) var(--bezier-smooth);

      & > .content-clip {
        min-block-size: 0;
        overflow: clip;

        & > .content {
          padding: var(--padding-block) var(--padding-inline);

          opacity: 0;
          translate: 0 -0.25rem;

          transition:
            opacity var(--duration-sm) var(--bezier-smooth),
            translate var(--duration-md) var(--bezier-smooth);
        }
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .disclosure {
      & > .content-region,
      & > .content-region > .content-clip > .content,
      & > .header > .trigger > .indicator {
        transition: none;
      }
    }
  }
}
</style>
