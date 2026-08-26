<template>
  <div class="shell">
    <header v-if="slots.header"><slot name="header" /></header>
    <div class="layout"><slot /></div>
    <footer v-if="slots.footer"><slot name="footer" /></footer>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-rows: 1fr;
  min-height: 100dvh;
  container-type: inline-size;

  &:has(> header) {
    grid-template-rows: auto 1fr;
  }

  &:has(> footer) {
    grid-template-rows: 1fr auto;
  }

  &:has(> header, > footer) {
    grid-template-rows: auto 1fr auto;
  }
}
</style>
