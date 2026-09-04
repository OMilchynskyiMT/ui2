<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 60vw">
    <MTextField v-model="inputModel" label="Regular text field" title="Test title" />
    <MTextField v-model="inputModel" label="with prefix and suffix" prefix="$" suffix=".00" />

    <MTextField v-model="inputModel" disabled label="Disabled" />
    <MTextField v-model="inputModel" label="Read Only" readonly />

    <MTextField v-model="inputModel" label="With error and hint" prefix="$" suffix=".00">
      <template #leading>
        <MIcon :icon="MailPlusIcon" style="color: var(--green-500)" />
      </template>
      <template #hint>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste veritatis laborum amet quasi esse praesentium,
        nesciunt possimus error odio omnis, itaque accusantium ab sapiente porro facere eaque eligendi, architecto
        officia?
      </template>
      <template #error> Lorem ipsum dolor sit amet consectetur adipisicing elit. </template>
    </MTextField>

    <MTextField v-model="inputModel" label="with spinner" placeholder="Loading...">
      <template #leading>
        <MIcon :icon="MailPlusIcon" />
      </template>
      <template #trailing>
        <MSpinner :stroke-width="5" size="1.5rem" style="color: var(--blue-300)" />
      </template>
      <template #hint>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste veritatis laborum amet quasi esse praesentium
      </template>
    </MTextField>

    <MNumber v-model="numberModel" :max="10" :min="5" clamp-on-blur label="Number field x>5<10 with clamp" />
    <MNumber v-model="numberModel" label="Number field #2" placeholder="Numbers only" />

    <MCombobox
      v-model="comboModel"
      :create-custom-value="v => v"
      :options="comboOptions"
      allow-custom
      label="Combobox"
      suffix="@192.168.2.1"
    >
      <template #leading>
        <MIcon :icon="EthernetPortIcon" style="color: var(--indigo-600)" />
      </template>
      <template #hint>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste veritatis laborum amet quasi esse praesentium
      </template>
    </MCombobox>

    <MSelect v-model="selectModel" :options="selectOptions" label="Select" placeholder="Choose protocol">
      <template #leading>
        <MIcon :icon="EthernetPortIcon" style="color: var(--indigo-600)" />
      </template>
    </MSelect>

    <section style="grid-column: 1 / span 2; display: flex; gap: 2rem">
      <MCheckbox v-model="checkboxModel" label="Checkbox" />
      <MCheckbox
        v-model="checkboxModel"
        hint="Custom color"
        label="Custom checkbox"
        style="--control-color: var(--green-500)"
      />
      <MCheckbox v-model="indeterminateModel" indeterminate label="Indeterminate checkbox" />
    </section>

    <MRadioGroup
      v-model="radioModel"
      :options="radioOptions"
      hint="Select the protocol used by this service"
      label="Protocol"
      orientation="horizontal"
      style="grid-column: 1 / span 2"
    />

    <MPasswordField v-model="passwordModel" label="Password" />
    <MPasswordField v-model="passwordModel" :icon="KeyRoundIcon" label="Password with custom icon" />

    <section style="grid-column: 1 / span 2; display: flex; gap: 2rem">
      <MSwitch v-model="toggleModel" label="Toggle" />
      <MSwitch
        v-model="toggleModel"
        hint="Custom color"
        label="Custom toggle"
        style="--control-color: var(--teal-500)"
      />
    </section>

    <MColorField v-model="colorModel" label="Color Picker" suffix="hex">
      <template #hint>Lorem ipsum dolor sit amet consectetur adipisicing elit</template>
    </MColorField>
    <div>{{ colorModel }}</div>

    <MTextarea v-model="textareaModel" counter hint="Lorem ipsum dolor sit amet" label="Textarea">
      <template #leading>
        <MIcon :icon="MailPlusIcon" style="color: var(--green-500)" />
      </template>
    </MTextarea>

    <MTextarea v-model="textareaModel" auto-grow counter hint="Lorem ipsum dolor sit amet" label="Textarea auto grow">
      <template #leading>
        <MIcon :icon="MailPlusIcon" style="color: var(--green-500)" />
      </template>
    </MTextarea>

    <MTextField
      v-model="validationModel.email"
      :error="validation.errors.value.email?.at(0)"
      label="Validated email"
      @input="validation.clear()"
    >
      <template #trailing>
        <MButton size="small" tone="warning" variant="tonal" @click="validation.validate">Validate</MButton>
      </template>
    </MTextField>

    <MFilePicker
      v-model="fileModel"
      accept="image/*"
      accept-text="Images only"
      area-text="Drag and drop files here or click to upload"
      hint="Lorem ipsum dolor sit amet"
      label="File upload"
      multiple
    />
    <MFilePicker
      v-model="fileModel"
      accept="image/*"
      accept-text="Images only"
      area-text="Drag and drop files here or click to upload"
      hint="Lorem ipsum dolor sit amet"
      label="File upload (area)"
      multiple
      variant="area"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { EthernetPortIcon, KeyRoundIcon, MailPlusIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MCheckbox from '@/lib/components/fields/MCheckbox.vue'
import MColorField from '@/lib/components/fields/MColorField.vue'
import MCombobox from '@/lib/components/fields/MCombobox.vue'
import MFilePicker from '@/lib/components/fields/MFilePicker.vue'
import MNumber from '@/lib/components/fields/MNumber.vue'
import MPasswordField from '@/lib/components/fields/MPasswordField.vue'
import MRadioGroup, { type MRadioGroupOption } from '@/lib/components/fields/MRadioGroup.vue'
import MSelect from '@/lib/components/fields/MSelect.vue'
import MSwitch from '@/lib/components/fields/MSwitch.vue'
import MTextarea from '@/lib/components/fields/MTextarea.vue'
import MTextField from '@/lib/components/fields/MTextField.vue'
import type { ListItem, ListOption } from '@/lib/components/list/listbox.types'
import MIcon from '@/lib/components/MIcon.vue'
import MSpinner from '@/lib/components/progress/MSpinner.vue'
import { email, Schema, types, useValidation } from '@/features/validation'

const inputModel = ref('')
const numberModel = ref<number | null>(null)
const comboModel = ref()
const selectModel = ref<string | null>(null)
const checkboxModel = ref(false)
const indeterminateModel = ref(false)
const radioModel = ref<'http' | 'https' | 'ssh'>('http')
const passwordModel = ref('secret')
const toggleModel = ref(false)
const colorModel = ref('#f59')
const textareaModel = ref('')
const fileModel = ref<File[]>([])

type ValidationDemo = {
  email: string
}

const validationModel = reactive<ValidationDemo>({
  email: '',
})
const validationType = types.object<ValidationDemo>({
  email: types.string(email()),
})
const validationSchema = new Schema(validationType)
const validation = useValidation(validationSchema, validationModel)

const comboOptions: ListItem<string>[] = [
  { value: '80' },
  { value: '8080-8085', title: 'Strange Web Server' },
  { value: '443', title: 'HTTPS' },
  { value: '22, 10022', title: 'SSH' },
  { value: '25, 587, 2525', title: 'SMTP' },
  { value: '53', title: 'DNS' },
  { value: '123', title: 'NTP', disabled: true },
  { value: '67, 68', title: 'DHCP' },
  { value: '21', title: 'FTP' },
  { value: '69', title: 'TFTP' },
]

const radioOptions: MRadioGroupOption<'http' | 'https' | 'ssh'>[] = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'ssh', label: 'SSH' },
]

const selectOptions: ListOption<string>[] = [
  {
    type: 'group',
    title: 'Common',
    items: [
      { value: 'http', title: 'HTTP' },
      { value: 'https', title: 'HTTPS' },
      { value: 'ssh', title: 'SSH' },
    ],
  },
  {
    type: 'group',
    title: 'Network',
    items: [
      { value: 'dns', title: 'DNS' },
      { value: 'dhcp', title: 'DHCP' },
      { value: 'ntp', title: 'NTP', disabled: true },
    ],
  },
]
</script>
