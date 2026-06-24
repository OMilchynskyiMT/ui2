<template>
  <div>
    <button @click="d1?.show()">Show dialog</button>
    <MDialog ref="d1">
      Test body
      <button @click="d1?.close()">Close</button>
    </MDialog>
  </div>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue'

import MDialog, { type Exposed } from '@/components/dialog/MDialog.vue'

const d1 = useTemplateRef<Exposed>('d1')
</script>