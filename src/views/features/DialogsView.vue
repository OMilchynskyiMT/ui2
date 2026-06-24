<template>
  <div>
    <button @click="d1?.show()">Show dialog</button>
    <button @click="confirm1">Show confirm</button>

    <MDialog ref="d1" @cancel="console.debug('canceled')">
      Test body
      <button @click="d1?.close()">Close</button>
    </MDialog>

    <MConfirm ref="c1" title="confirmation title (optional)">
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, blanditiis quibusdam dignissimos corporis error velit pariatur quae nobis aspernatur officiis quidem eius soluta optio ducimus ullam doloremque tempora, quod nesciunt.
    </MConfirm>
  </div>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue'

import MConfirm, { type Exposed as ConfirmExposed } from '@/components/dialog/MConfirm.vue'
import MDialog, { type Exposed } from '@/components/dialog/MDialog.vue'

const d1 = useTemplateRef<Exposed>('d1')
const c1 = useTemplateRef<ConfirmExposed>('c1')

const confirm1 = async (): Promise<void> => {
  if ((await c1.value?.confirm())) {
    console.debug('Confirmed')
  } else {
    console.debug('Declined')
  }
}
</script>