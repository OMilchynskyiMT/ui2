<template>
  <div :data-open="open || undefined" :data-variant="variant" class="disclosure">
    <div class="header">
      <div v-if="$slots.leading" class="leading">
        <slot name="leading" />
      </div>

      <component :is="variant === 'plain' ? 'h2' : 'h3'" class="heading">
        <button :aria-controls="contentId" :aria-expanded="open" class="trigger" type="button" @click="open = !open">
          <span class="summary-content">
            <slot name="summary">
              <span v-if="title" class="title">{{ title }}</span>
              <span v-if="description" class="description">{{ description }}</span>
            </slot>
          </span>

          <span aria-hidden="true" class="indicator">
            <UiIcon :icon="ChevronDownIcon" size="1rem" />
          </span>
        </button>
      </component>

      <div v-if="$slots.trailing" class="trailing">
        <slot name="trailing" />
      </div>
    </div>

    <div :id="contentId" :aria-hidden="!open || undefined" :inert="!open || undefined" class="content-region">
      <div class="content-clip">
        <div class="content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export type UiDisclosureProperties = {
  title?: string
  description?: string
  variant?: 'panel' | 'plain'
}
</script>

<script lang="ts" setup>
import { ChevronDownIcon } from '@lucide/vue'

import { useId } from '@/lib/composables/useId'

import UiIcon from '../UiIcon.vue'

const { title, description, variant = 'panel' } = defineProps<UiDisclosureProperties>()
const contentId = useId()
const open = defineModel<boolean>({ default: false })
</script>

<style scoped>
@layer components {
  .disclosure {
    --disclosure-accent-color: var(--tone-primary);
    --disclosure-padding-inline: var(--space-md);
    --disclosure-padding-block: var(--space-md);
    --disclosure-gap: var(--space-md);
    --disclosure-border-color: var(--divider-color);
    --disclosure-header-bg: transparent;
    --disclosure-summary-min-size: min-content;

    overflow: clip;
    border: var(--border-width-thin) solid var(--disclosure-border-color);
    border-radius: var(--radius-lg);
    background-color: var(--surface-card);

    & > .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--disclosure-gap);
      padding: var(--disclosure-padding-block) var(--disclosure-padding-inline);
      background-color: var(--disclosure-header-bg);
      transition: background-color var(--duration-sm) var(--bezier-smooth);

      &:has(> .heading > .trigger:focus-visible) {
        --disclosure-header-bg: color-mix(in oklab, var(--disclosure-accent-color) 5%, transparent);
      }

      @media (hover: hover) {
        &:has(> .heading > .trigger:hover) {
          --disclosure-header-bg: color-mix(in oklab, var(--disclosure-accent-color) 5%, transparent);
        }
      }

      & > :is(.leading, .trailing) {
        min-inline-size: 0;
        max-inline-size: 100%;
        flex: 0 1 auto;
      }

      & > .heading {
        flex: 1 1 0;
        min-inline-size: var(--disclosure-summary-min-size);
        font-size: var(--font-size-lg);
        line-height: var(--line-height-tight);

        & > .trigger {
          display: flex;
          align-items: center;
          gap: var(--disclosure-gap);
          inline-size: 100%;
          text-align: start;
          cursor: pointer;

          & > .summary-content {
            min-inline-size: 0;
            flex: 1 1 auto;
            display: grid;

            & > .description {
              color: var(--text-color-dimmed);
              font-size: var(--font-size-sm);
              font-weight: normal;
            }
          }

          & > .indicator {
            flex: 0 0 auto;
            display: grid;
            place-items: center;
            color: var(--icon-color-muted);
            transform: scaleY(1);
            transition: transform var(--duration-md) var(--bezier-smooth);
          }
        }
      }
    }

    &[data-open] {
      & > .header > .heading > .trigger > .indicator {
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
          padding: var(--disclosure-padding-block) var(--disclosure-padding-inline);
          opacity: 0;
          translate: 0 calc(-1 * var(--space-xs));
          transition:
            opacity var(--duration-sm) var(--bezier-smooth),
            translate var(--duration-md) var(--bezier-smooth);
        }
      }
    }

    &[data-variant='plain'] {
      --disclosure-padding-block: 0px;
      --disclosure-padding-inline: 0px;
      --disclosure-summary-min-size: min(100%, 18rem);

      overflow: visible;
      border: 0;
      border-radius: 0;
      background: transparent;

      & > .header {
        position: relative;
        isolation: isolate;
        padding: 0;
        background: transparent;
        border-radius: var(--radius-sm);

        &::before {
          position: absolute;
          z-index: -1;
          inset: calc(-1 * var(--space-sm));
          border-radius: var(--radius-sm);
          background: var(--disclosure-header-bg);
          content: '';
          pointer-events: none;
        }

        &:has(> .heading > .trigger:focus-visible)::before {
          outline: var(--focus-ring-width) solid var(--focus-ring-color);
          outline-offset: var(--focus-ring-offset);
        }

        & > .heading {
          font-size: var(--section-header-title-size, var(--font-size-lg));
          line-height: var(--line-height-tight);

          & > .trigger {
            &:focus-visible {
              outline: none;
            }

            & > .summary-content {
              gap: var(--space-xxs);

              & > .description {
                line-height: var(--line-height-compact);
              }
            }
          }
        }
      }

      & > .content-region > .content-clip > .content {
        padding-block-start: var(--space-xxl);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .disclosure {
      & > .content-region,
      & > .content-region > .content-clip > .content,
      & > .header > .heading > .trigger > .indicator {
        transition: none;
      }
    }
  }
}
</style>
