<template>
  <div>
    <div style="display: flex; gap: 1rem">
      <button @click="d1?.show()">Show dialog</button>
      <button @click="confirm1">Show confirm</button>
      <button @click="f1?.show()">Show Form</button>
    </div>

    <MDialog ref="d1" @cancel="console.debug('canceled')">
      Test body
      <button @click="d1?.close()">Close</button>
    </MDialog>

    <MConfirmDialog ref="c1" title="confirmation title (optional)">
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, blanditiis quibusdam dignissimos corporis
      error velit pariatur quae nobis aspernatur officiis quidem eius soluta optio ducimus ullam doloremque tempora,
      quod nesciunt.
    </MConfirmDialog>

    <MFormDialog
      ref="f1"
      :submit="submit"
      :submit-disabled="!canSubmit"
      style="--dialog-width: 50rem"
      submit-text="Create"
      @cancel="log('cancel')"
      @close="log('close')"
      @error="error"
      @show="log('show')"
      @submit="log('submit')"
    >
      <template #title>
        <div style="display: flex; gap: 0.5rem; align-items: center">
          <MIcon :icon="UserPlusIcon" size="2rem" style="--color: var(--pink-600)" />
          Create User
        </div>
      </template>

      <MTextField v-model="form.name" label="Name" required />
      <MTextField v-model="form.email" label="Email" required type="email" />
      <MSwitch v-model="simulateFailure" label="Simulate API error" />
      <MCheckbox v-model="keepOpen" label="Return false and keep dialog open" />
    </MFormDialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, useTemplateRef } from 'vue'
import { UserPlusIcon } from '@lucide/vue'

import MConfirmDialog, { type Exposed as ConfirmExposed } from '@/components/dialog/MConfirmDialog.vue'
import MDialog, { type Exposed } from '@/components/dialog/MDialog.vue'
import MFormDialog, { type Exposed as FormExposed } from '@/components/dialog/MFormDialog.vue'
import MCheckbox from '@/components/fields/MCheckbox.vue'
import MSwitch from '@/components/fields/MSwitch.vue'
import MTextField from '@/components/fields/MTextField.vue'
import MIcon from '@/components/MIcon.vue'

const d1 = useTemplateRef<Exposed>('d1')
const c1 = useTemplateRef<ConfirmExposed>('c1')
const f1 = useTemplateRef<FormExposed>('f1')

const form = reactive({
  name: '',
  email: '',
})
const simulateFailure = ref(false)
const keepOpen = ref(false)
const logs = ref<string[]>([])

const canSubmit = computed(() => {
  return form.name.trim().length > 0 && form.email.trim().length > 0
})

const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const log = (message: string): void => {
  console.debug('[dialog form]', new Date().toLocaleTimeString(), message)
  logs.value.unshift(`${new Date().toLocaleTimeString()} — ${message}`)
}

const submit = async (): Promise<boolean | void> => {
  await wait(1000)

  if (simulateFailure.value) {
    throw new Error('Fake API error')
  }

  if (keepOpen.value) {
    log('submit returned false')
    return false
  }

  log(`created user: ${form.name} / ${form.email}`)
}

const error = (unknownError: unknown): void => {
  const message = unknownError instanceof Error ? unknownError.message : String(unknownError)
  log(`error: ${message}`)
}

const confirm1 = async (): Promise<void> => {
  if (await c1.value?.confirm()) {
    console.debug('Confirmed')
  } else {
    console.debug('Declined')
  }
}
</script>
