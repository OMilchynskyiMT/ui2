<template>
  <FormInput :type="showPassword ? 'text' : 'password'">
    <template #before><LockIcon /></template>
    <template #after>
      <EyeOffIcon v-if="showPassword" class="u-pointer" @click.prevent="togglePassword" />
      <EyeIcon v-else class="u-pointer" @click.prevent="togglePassword" />
    </template>
  </FormInput>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormInput from './FormInput.vue'
import { LockIcon, EyeOffIcon, EyeIcon } from '@lucide/vue'

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>
