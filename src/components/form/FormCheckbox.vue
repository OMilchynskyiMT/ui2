<template>
  <div class="form-checkbox">
    <div class="control">
      <div v-if="slots.before" class="before">
        <slot name="before" />
      </div>

      <label class="main" :for="id" :title="title">
        <input :id="id" type="checkbox" v-bind="attrs" />

        <span class="indicator" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
        </span>

        <span v-if="slots.default || label" class="label">
          <slot>{{ label }}</slot>
        </span>
      </label>

      <div v-if="slots.after" class="after">
        <slot name="after" />
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
import { useAttrs, useSlots } from 'vue'
import { generateHtmlId } from '@/components/form/FormInput.vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const slots = useSlots()

const {
  id = generateHtmlId(),
  label = null,
  title = '',
  error = null,
} = defineProps<{
  id?: string
  label?: string | null
  title?: string
  error?: string | null
}>()
</script>

<style scoped>
.form-checkbox {
  --gap: 0.375rem;
  display: grid;
  gap: var(--gap);

  & > .control {
    --size: 1.25rem;

    display: flex;
    align-items: center;
    gap: calc(var(--gap) * 3);

    & > .before,
    & > .after {
      flex: none;
      display: grid;
      place-items: center;
      user-select: none;
    }

    & > .main {
      min-width: 0;
      color: var(--input-label-color);
      user-select: none;

      display: inline-flex;
      align-items: flex-start;
      gap: var(--gap);
      min-width: 0;
      cursor: pointer;

      & > input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      & > .indicator {
        width: var(--size);
        height: var(--size);
        flex: none;
        display: grid;
        place-items: center;
        border: var(--input-border-width) solid
          var(--checkbox-border-color, var(--input-border-color));
        border-radius: calc(var(--input-border-radius) / 2);
        background-color: var(--checkbox-bg, var(--surface-bg));
        transition:
          border-color var(--duration-md),
          background-color var(--duration-md),
          box-shadow var(--duration-md);
        transition-timing-function: var(--bezier-magnetic);

        & > svg {
          width: calc(var(--size) * 0.7);
          height: calc(var(--size) * 0.7);
          opacity: var(--checkbox-opacity, 0);
          transform: var(--checkbox-transform, scale(0.75) translateY(calc(-0.25 * var(--size))));
          transition:
            opacity var(--duration-xs),
            transform var(--duration-md);
          transition-timing-function: var(--bezier-magnetic);

          & > path {
            fill: none;
            stroke: var(--checkbox-icon-color, white);
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        }
      }

      &:hover .indicator {
        --checkbox-border-color: var(--input-border-hover-color);
      }

      & > input:focus-visible + .indicator {
        --checkbox-border-color: var(--input-border-active-color);
      }

      & > input:checked + .indicator {
        --checkbox-border-color: var(--checkbox-active-color, var(--input-border-active-color));
        --checkbox-bg: var(--checkbox-active-color, var(--input-border-active-color));
      }

      & > input:checked + .indicator > svg {
        --checkbox-opacity: 1;
        --checkbox-transform: scale(1.25) translateY(0);
      }

      & > input:disabled + .indicator {
        --checkbox-opacity: 0.6;
      }

      &:has(> input:disabled) {
        cursor: not-allowed;
        --checkbox-opacity: 0.72;
      }
    }
  }

  &:has(.error) .indicator {
    --checkbox-border-color: var(--input-border-error-color);
  }

  & > .error {
    color: var(--input-error-color);
    font-size: var(--input-error-font-size);
    line-height: 1.35;
  }
}
</style>
