<template>
  <div class="dialogs-view">
    <section>
      <UiSectionHeader description="Basic, confirmation, and form dialogs using the shared dialog infrastructure">
        Dialog types
      </UiSectionHeader>

      <UiCluster>
        <UiButton variant="tonal" @click="d1?.show()">Show dialog</UiButton>
        <UiButton variant="tonal" @click="confirm1">Show confirm</UiButton>
        <UiButton variant="tonal" @click="f1?.show()">Show form</UiButton>
      </UiCluster>
    </section>

    <UiDialog ref="d1" @cancel="console.debug('canceled')">
      <div class="dialog-content">
        <p>Basic dialog content with an explicit close action.</p>
        <UiButton @click="d1?.close()">Close</UiButton>
      </div>
    </UiDialog>

    <UiConfirmDialog ref="c1" title="Confirmation title (optional)">
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, blanditiis quibusdam dignissimos corporis
      error velit pariatur quae nobis aspernatur officiis quidem eius soluta optio ducimus ullam doloremque tempora,
      quod nesciunt.
    </UiConfirmDialog>

    <UiFormDialog
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
        <UiCluster>
          <UiIcon :icon="UserPlusIcon" size="2rem" style="--color: var(--pink-600)" />
          <span>Create user</span>
        </UiCluster>
      </template>

      <UiFormGrid>
        <UiTextField v-model="form.name" label="Name" required />
        <UiTextField v-model="form.email" label="Email" required type="email" />
        <UiSwitch v-model="simulateFailure" label="Simulate API error" />
        <UiCheckbox v-model="keepOpen" label="Return false and keep dialog open" />
      </UiFormGrid>
    </UiFormDialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, useTemplateRef } from 'vue'
import { UserPlusIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiConfirmDialog, { type Exposed as ConfirmExposed } from '@/lib/components/dialog/UiConfirmDialog.vue'
import UiDialog, { type Exposed } from '@/lib/components/dialog/UiDialog.vue'
import UiFormDialog, { type Exposed as FormExposed } from '@/lib/components/dialog/UiFormDialog.vue'
import UiCheckbox from '@/lib/components/fields/UiCheckbox.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

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

<style scoped>
.dialogs-view,
.dialogs-view > section,
.dialog-content {
  min-inline-size: 0;
  display: grid;
}

.dialogs-view {
  gap: var(--space-xxl);

  & > section {
    gap: var(--space-xl);
  }
}

.dialog-content {
  justify-items: start;
  gap: var(--space-lg);
}
</style>
