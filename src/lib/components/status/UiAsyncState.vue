<template>
  <div v-if="loading" class="state loading">
    <slot name="loading">
      <UiSpinner />
    </slot>
  </div>

  <div v-else-if="error !== undefined" class="state error">
    <slot :error :retry name="error">
      <div class="error-content">
        <strong>Failed to load data</strong>
        <UiButton @click="retry">Retry</UiButton>
      </div>
    </slot>
  </div>

  <div v-else-if="empty" class="state empty">
    <slot name="empty">
      <UiEmptyState title="No data" />
    </slot>
  </div>

  <slot v-else />
</template>

<script lang="ts" setup>
import UiButton from '../buttons/UiButton.vue'
import UiSpinner from '../progress/UiSpinner.vue'
import UiEmptyState from './UiEmptyState.vue'

type Properties = {
  loading?: boolean
  error?: unknown
  empty?: boolean
}

const { loading = false, error, empty = false } = defineProps<Properties>()

const emit = defineEmits<{
  retry: []
}>()

const retry = (): void => {
  emit('retry')
}
</script>

<style scoped>
@layer components {
  .state {
    display: grid;
    place-items: center;

    inline-size: 100%;
    min-block-size: var(--min-block-size, 8rem);

    &.error {
      text-align: center;

      .error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xl);
      }
    }
  }
}
</style>
