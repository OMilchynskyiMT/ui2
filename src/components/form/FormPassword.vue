<template>
  <FormInput :type="showPassword ? 'text' : 'password'">
    <template #before>
      <slot name="before"><AppIcon :icon="LockIcon" /></slot>
    </template>
    <template #after>
      <AppIcon v-if="showPassword" @click.prevent="togglePassword" :icon="EyeOffIcon" class="u-pointer" />
      <AppIcon v-else @click.prevent="togglePassword" :icon="EyeIcon" class="u-pointer" />
    </template>
  </FormInput>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { EyeIcon, EyeOffIcon, LockIcon } from '@lucide/vue'

import AppIcon from '@/components/AppIcon.vue'
import FormInput from '@/components/form/FormInput.vue'

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>
