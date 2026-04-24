<template>
  <FormInput :type="showPassword ? 'text' : 'password'">
    <template #before>
      <slot name="before"><AppIcon :icon="LockIcon" /></slot>
    </template>
    <template #after>
      <AppIcon v-if="showPassword" :icon="EyeOffIcon" @click.prevent="togglePassword" class="u-pointer" />
      <AppIcon v-else :icon="EyeIcon" @click.prevent="togglePassword" class="u-pointer" />
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
