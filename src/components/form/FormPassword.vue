<template>
  <FormInput :type="showPassword ? 'text' : 'password'">
    <template #before>
      <slot name="before"><AppIcon :icon="LockIcon" /></slot>
    </template>
    <template #after>
      <AppIcon
        v-if="showPassword"
        class="u-pointer"
        :icon="EyeOffIcon"
        @click.prevent="togglePassword" />
      <AppIcon v-else class="u-pointer" :icon="EyeIcon" @click.prevent="togglePassword" />
    </template>
  </FormInput>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EyeIcon, EyeOffIcon, LockIcon } from '@lucide/vue'

import AppIcon from '@/components/AppIcon.vue'
import FormInput from '@/components/form/FormInput.vue'

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>