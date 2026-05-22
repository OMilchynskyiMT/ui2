<template>
  <div class="notifications">
    <div v-for="item in notifications.items.value" :key="item.id" class="item">
      <strong v-if="item.title">{{ item.title }}</strong>
      <span>{{ item.id }}</span>
      <div>{{ item.message }}</div>
      <button @click="notifications.remove(item.id)">Close</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useNotifications } from '../composables/use-notifications'
const notifications = useNotifications()
</script>
