<template>
  <main>
    <section>
      <h2>Regular buttons</h2>
      <div v-for="variant in ['outlined', 'filled', 'text', 'tonal', 'icon']" :key="variant" class="container">
        <div v-for="kind in ['primary', 'attention', 'success', 'neutral', 'caution']" :key="kind">
          <MButton :kind="kind" :variant="variant">
            <MIcon :icon="UserIcon" size="1rem" />
            {{ kind }}
          </MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Disabled</h2>

      <div v-for="variant in ['outlined', 'filled', 'text', 'tonal']" :key="variant" class="container">
        <div v-for="kind in ['primary', 'attention', 'success', 'neutral', 'caution']" :key="kind">
          <MButton :kind="kind" :variant="variant" disabled @click="() => console.debug('click')">{{ kind }}</MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Loading</h2>

      <div v-for="variant in ['outlined', 'filled', 'text', 'tonal']" :key="variant" class="container">
        <div v-for="kind in ['primary', 'attention', 'success', 'neutral', 'caution']" :key="kind">
          <MButton :kind="kind" :variant="variant" loading>{{ kind }}</MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Sizes</h2>

      <div v-for="variant in ['outlined', 'filled', 'text', 'tonal']" :key="variant" class="container">
        <div v-for="size in ['small', 'medium', 'large']" :key="size">
          <MButton :size="size" :variant="variant" kind="primary">{{ size }}</MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Interactive</h2>

      <div v-for="variant in ['outlined', 'filled', 'text', 'tonal']" :key="variant" class="container">
        <div v-for="kind in ['primary', 'attention', 'success', 'neutral', 'caution']" :key="kind">
          <MButton :kind="kind" :loading="loading" :variant="variant" @click="setLoading">
            <MIcon :icon="UserIcon" size="1rem" />
            {{ kind }}
          </MButton>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { UserIcon } from '@lucide/vue'

import MButton from '@/components/buttons/MButton.vue'
import MIcon from '@/components/MIcon.vue'

const loading = ref(false)

const setLoading = (): void => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<style scoped>
main {
  display: grid;
  gap: 3rem;

  & > section {
    display: grid;
    gap: 2rem;

    & > div.container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: 2rem;
    }
  }
}
</style>
