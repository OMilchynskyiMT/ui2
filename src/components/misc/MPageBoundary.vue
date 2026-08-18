<template>
  <div v-if="loading" class="state loading">
    <slot name="loading">
      <MSpinner />
    </slot>
  </div>

  <div v-else-if="error !== undefined" class="state error">
    <slot :error :retry name="error">
      <div class="error-content">
        <strong>Failed to load page data</strong>
        <MButton @click="retry">Retry</MButton>
      </div>
    </slot>
  </div>

  <slot v-else />
</template>

<script lang="ts" setup>
import MButton from '../buttons/MButton.vue'
import MSpinner from '../progress/MSpinner.vue'

type Properties = {
  loading?: boolean
  error?: unknown
}

const { loading = false, error } = defineProps<Properties>()

const emit = defineEmits<{
  retry: []
}>()

const retry = (): void => {
  emit('retry')
}
</script>

<style scoped>
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
</style>
