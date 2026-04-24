<template>
  <FormInput :type="showPassword ? 'text' : 'password'">
    <template #before>
      <slot name="before"><AppIcon :icon="LockIcon" /></slot>
    </template>
    <template #after>
      <AppIcon v-if="showPassword" :icon="EyeOffIcon" class="u-pointer" @click.prevent="togglePassword" />
      <AppIcon v-else :icon="EyeIcon" class="u-pointer" @click.prevent="togglePassword" />
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
