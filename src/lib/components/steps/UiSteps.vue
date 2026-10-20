<template>
  <component
    :is="interactive ? 'nav' : 'div'"
    v-if="steps.length > 0"
    :aria-label="ariaLabel"
    :role="interactive ? undefined : 'group'"
    class="steps"
  >
    <ol :style="{ '--step-count': steps.length }" class="steps-list">
      <li
        v-for="({ step, status }, index) in displayedSteps"
        :key="step.value"
        :aria-current="!interactive && step.value === current ? 'step' : undefined"
        :class="{ 'previous-complete': index > 0 && displayedSteps[index - 1]?.status === 'complete' }"
        :data-status="status"
        class="step"
      >
        <component
          :is="interactive ? 'button' : 'div'"
          :aria-current="interactive && step.value === current ? 'step' : undefined"
          :disabled="interactive && step.disabled ? true : undefined"
          :type="interactive ? 'button' : undefined"
          class="step-content"
          @click="selectStep(step)"
        >
          <span aria-hidden="true" class="indicator">
            <UiIcon v-if="status === 'complete'" :icon="CheckIcon" size="1rem" />
            <UiIcon v-else-if="status === 'error'" :icon="AlertCircleIcon" size="1rem" />
            <UiIcon v-else-if="status === 'skipped'" :icon="MinusIcon" size="1rem" />
            <span v-else class="step-number">{{ index + 1 }}</span>
          </span>
          <UiStack class="details" gap="var(--space-xxs)" tag="span">
            <span class="title">{{ step.title }}</span>
            <span v-if="step.description" class="description">{{ step.description }}</span>
            <span v-if="step.optional" class="optional">Optional</span>
          </UiStack>
          <span v-if="status !== 'upcoming'" class="visually-hidden">
            {{ getStatusLabel(status) }}
          </span>
        </component>
      </li>
    </ol>
  </component>
</template>

<script lang="ts">
export type UiStepsProperties<Value extends string | number> = {
  steps: readonly UiStep<Value>[]
  current: Value
  interactive?: boolean
  ariaLabel?: string
}
</script>

<script generic="Value extends string | number" lang="ts" setup>
import { computed } from 'vue'
import { AlertCircleIcon, CheckIcon, MinusIcon } from '@lucide/vue'

import UiStack from '../layout/UiStack.vue'
import UiIcon from '../UiIcon.vue'
import { getStepStatuses, type UiStep, type UiStepStatus } from './steps.shared'

const { steps, current, interactive = false, ariaLabel = 'Progress steps' } = defineProps<UiStepsProperties<Value>>()

const emit = defineEmits<{
  select: [step: UiStep<Value>]
}>()

const displayedSteps = computed(() => {
  const statuses = getStepStatuses(steps, current)
  return steps.map((step, index) => ({ step, status: statuses[index] ?? 'upcoming' }))
})

const getStatusLabel = (status: UiStepStatus): string => {
  switch (status) {
    case 'complete': {
      return 'Completed'
    }
    case 'skipped': {
      return 'Skipped'
    }
    case 'error': {
      return 'Error'
    }
    case 'current': {
      return 'Current step'
    }
    default: {
      return ''
    }
  }
}

const selectStep = (step: UiStep<Value>): void => {
  if (!interactive || step.disabled || step.value === current) return
  emit('select', step)
}
</script>

<style scoped>
@layer components {
  .steps {
    --indicator-size: 2.25rem;
    --connector-gap: var(--space-sm);
    --connector-color: var(--divider-color);
    --accent-color: var(--tone-primary);

    min-inline-size: 0;
    max-inline-size: 100%;
    container: steps / inline-size;

    .steps-list {
      display: grid;
      grid-template-columns: repeat(var(--step-count), minmax(0, 1fr));
      gap: var(--space-md);
      margin: 0;
      padding: 0;
      list-style: none;

      @container steps (width <= container-token(--container-sm)) {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--space-lg);
      }

      .step {
        --step-accent: var(--accent-color);
        --indicator-border: var(--divider-color);
        --indicator-color: var(--text-color-secondary);
        --indicator-background: var(--surface-container);

        position: relative;
        min-inline-size: 0;
        color: var(--text-color-secondary);

        &:not(:first-child)::before {
          content: '';
          position: absolute;
          block-size: var(--border-width-thick);
          inset-block-start: calc(var(--indicator-size) / 2);
          inset-inline-start: calc(-50% - var(--space-md) + var(--indicator-size) / 2 + var(--connector-gap));
          inset-inline-end: calc(50% + var(--indicator-size) / 2 + var(--connector-gap));
          background: var(--connector-color);
        }

        &.previous-complete::before {
          background: var(--step-accent);
        }

        &[data-status='current'] {
          --indicator-border: var(--step-accent);
          --indicator-color: var(--on-accent-color);
          --indicator-background: var(--step-accent);

          color: var(--text-color-strong);
        }

        &[data-status='complete'],
        &[data-status='error'] {
          --indicator-border: var(--step-accent);
          --indicator-color: var(--step-accent);
        }

        &[data-status='error'] {
          --step-accent: var(--tone-danger);

          color: var(--text-color-strong);
        }

        &[data-status='skipped'] {
          --step-accent: var(--tone-neutral);
        }

        .step-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          min-inline-size: 0;
          inline-size: 100%;
          min-block-size: var(--touch-target-min);
          padding: 0;
          border: 0;
          border-radius: var(--radius-md);
          background: none;
          color: inherit;
          font: inherit;
          text-align: center;

          &:is(button) {
            cursor: default;

            &:not(:disabled, [aria-current='step']) {
              cursor: pointer;
            }

            &:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }

            &:focus-visible {
              outline: none;

              & > .indicator {
                outline: var(--focus-ring-width) solid var(--focus-ring-color);
                outline-offset: var(--space-xs);
              }
            }

            @media (hover: hover) {
              &:not(:disabled, [aria-current='step']):hover {
                --indicator-background: color-mix(in oklab, var(--step-accent) 12%, var(--surface-container));
              }
            }
          }

          .indicator {
            position: relative;
            flex: 0 0 var(--indicator-size);
            display: grid;
            place-items: center;
            inline-size: var(--indicator-size);
            block-size: var(--indicator-size);
            border: var(--border-width-thick) solid var(--indicator-border);
            border-radius: var(--radius-full);
            background: var(--indicator-background);
            color: var(--indicator-color);
            font-size: var(--font-size-md);
            font-weight: var(--font-weight-medium);
            transition: background-color var(--duration-sm) var(--bezier-smooth);
          }

          .details {
            overflow-wrap: break-word;
          }

          .title {
            font-weight: var(--font-weight-medium);
          }

          .description,
          .optional {
            font-size: var(--font-size-sm);
            color: var(--text-color-dimmed);
          }
        }

        &[data-status='skipped'] .indicator {
          border-style: dashed;
        }

        @container steps (width <= container-token(--container-sm)) {
          &:not(:first-child)::before {
            display: none;
          }

          &:not(:last-child)::after {
            content: '';
            position: absolute;
            inset-inline-start: calc(var(--indicator-size) / 2);
            inset-block-start: calc(var(--indicator-size) + var(--space-xs));
            inset-block-end: calc(-1 * var(--space-lg) + var(--space-xs));
            inline-size: var(--border-width-thick);
            background: var(--connector-color);
          }

          &[data-status='complete']::after {
            background: var(--tone-primary);
          }

          .step-content {
            flex-direction: row;
            align-items: flex-start;
            text-align: start;

            .details {
              padding-block-start: var(--space-xxs);
            }
          }
        }
      }
    }
  }
}
</style>
