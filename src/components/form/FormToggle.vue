<template>
  <div class="form-toggle">
    <div class="control">
      <div v-if="slots.before" class="before">
        <slot name="before" />
      </div>

      <label class="main" :for="id" :title="title || undefined">
        <input :id="id" type="checkbox" v-bind="attrs" />

        <span class="switch" aria-hidden="true">
          <span class="thumb" />
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
.form-toggle {
  --gap: 0.375rem;
  display: grid;
  gap: var(--gap);

  & > .control {
    --switch-width: 2.5rem;
    --switch-height: 1.5rem;
    --thumb-size: calc(var(--switch-height) - 0.25rem);

    display: flex;
    align-items: center;
    gap: calc(var(--gap) * 6);

    & > .before,
    & > .after {
      flex: none;
      display: grid;
      place-items: center;
      user-select: none;
    }

    & > .main {
      display: inline-flex;
      align-items: center;
      gap: var(--gap);
      min-width: 0;
      cursor: pointer;

      &:has(> input:disabled) {
        cursor: not-allowed;
        opacity: 0.72;
      }

      & > input {
        position: absolute;
        opacity: 0;
        pointer-events: none;

        &:focus-visible + .switch {
          --toggle-track-color: var(--input-border-active-color);
          box-shadow: 0 0 0 0.1875rem
            color-mix(in srgb, var(--input-border-active-color) 20%, transparent);
        }

        &:checked + .switch {
          --toggle-track-color: var(--toggle-active-color, var(--input-border-active-color));

          & > .thumb {
            transform: translateX(calc(var(--switch-width) - var(--thumb-size) - 0.25rem));
          }
        }

        &:disabled + .switch {
          opacity: 0.6;
        }
      }

      & > .switch {
        position: relative;
        flex: none;
        width: var(--switch-width);
        height: var(--switch-height);
        border-radius: 999px;
        background-color: var(--toggle-track-color, var(--input-border-color));
        transition:
          background-color var(--duration-md),
          box-shadow var(--duration-md);
        transition-timing-function: var(--bezier-magnetic);

        & > .thumb {
          position: absolute;
          top: 0.125rem;
          left: 0.125rem;
          width: var(--thumb-size);
          height: var(--thumb-size);
          border-radius: 50%;
          background-color: var(--toggle-thumb-color, var(--surface-bg));
          transition:
            transform var(--duration-md),
            background-color var(--duration-md);
          transition-timing-function: var(--bezier-magnetic);
        }
      }

      & > .label {
        min-width: 0;
        color: var(--input-label-color);
        line-height: 1.35;
        user-select: none;
      }

      &:hover .switch {
        --toggle-track-color: var(--input-border-hover-color);
      }
    }
  }
}

.form-toggle:has(.error) .switch {
  --toggle-track-color: var(--input-border-error-color);
}

.error {
  color: var(--input-error-color);
  font-size: var(--input-error-font-size);
  line-height: 1.35;
}
</style>
