<template>
  <form-input :type="showPassword ? 'text' : 'password'">
    <template #before>
      <slot name="before"><app-icon :icon="LockIcon" /></slot>
    </template>
    <template #after>
      <app-icon v-if="showPassword" :icon="EyeOffIcon" class="u-pointer" @click.prevent="togglePassword" />
      <app-icon v-else :icon="EyeIcon" class="u-pointer" @click.prevent="togglePassword" />
    </template>
  </form-input>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { EyeIcon, EyeOffIcon, LockIcon } from '@lucide/vue'

import AppIcon from '@/components/app-icon.vue'
import FormInput from '@/components/form/form-input.vue'

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>
