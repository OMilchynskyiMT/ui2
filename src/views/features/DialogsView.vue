<template>
  <div class="dialogs-view">
    <section>
      <MSectionHeader description="Basic, confirmation, and form dialogs using the shared dialog infrastructure">
        Dialog types
      </MSectionHeader>

      <MCluster>
        <MButton variant="tonal" @click="d1?.show()">Show dialog</MButton>
        <MButton variant="tonal" @click="confirm1">Show confirm</MButton>
        <MButton variant="tonal" @click="f1?.show()">Show form</MButton>
      </MCluster>
    </section>

    <MDialog ref="d1" @cancel="console.debug('canceled')">
      <div class="dialog-content">
        <p>Basic dialog content with an explicit close action.</p>
        <MButton @click="d1?.close()">Close</MButton>
      </div>
    </MDialog>

    <MConfirmDialog ref="c1" title="Confirmation title (optional)">
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
        <MCluster>
          <MIcon :icon="UserPlusIcon" size="2rem" style="--color: var(--pink-600)" />
          <span>Create user</span>
        </MCluster>
      </template>

      <MFormGrid>
        <MTextField v-model="form.name" label="Name" required />
        <MTextField v-model="form.email" label="Email" required type="email" />
        <MSwitch v-model="simulateFailure" label="Simulate API error" />
        <MCheckbox v-model="keepOpen" label="Return false and keep dialog open" />
      </MFormGrid>
    </MFormDialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, useTemplateRef } from 'vue'
import { UserPlusIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MConfirmDialog, { type Exposed as ConfirmExposed } from '@/lib/components/dialog/MConfirmDialog.vue'
import MDialog, { type Exposed } from '@/lib/components/dialog/MDialog.vue'
import MFormDialog, { type Exposed as FormExposed } from '@/lib/components/dialog/MFormDialog.vue'
import MCheckbox from '@/lib/components/fields/MCheckbox.vue'
import MSwitch from '@/lib/components/fields/MSwitch.vue'
import MTextField from '@/lib/components/fields/MTextField.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MCluster from '@/lib/components/layout/MCluster.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'

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
