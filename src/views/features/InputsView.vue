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

    <section style="grid-column: 1 / span 2; display: flex; gap: 2rem">
      <MRadio
        v-model="radioModel"
        label="HTTP"
        name="protocol-radio"
        style="--control-color: var(--red-500)"
        value="http"
      />
      <MRadio
        v-model="radioModel"
        label="HTTPS"
        name="protocol-radio"
        style="--control-color: var(--yellow-500)"
        value="https"
      />
      <MRadio
        v-model="radioModel"
        label="SSH"
        name="protocol-radio"
        style="--control-color: var(--green-500)"
        value="ssh"
      />
    </section>

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
import { ref } from 'vue'
import { EthernetPortIcon, MailPlusIcon } from '@lucide/vue'

import MCheckbox from '@/components/fields/MCheckbox.vue'
import MColorField from '@/components/fields/MColorField.vue'
import MCombobox from '@/components/fields/MCombobox.vue'
import MFilePicker from '@/components/fields/MFilePicker.vue'
import MNumber from '@/components/fields/MNumber.vue'
import MRadio from '@/components/fields/MRadio.vue'
import MSelect from '@/components/fields/MSelect.vue'
import MSwitch from '@/components/fields/MSwitch.vue'
import MTextarea from '@/components/fields/MTextarea.vue'
import MTextField from '@/components/fields/MTextField.vue'
import type { ListItem, ListOption } from '@/components/list/MListbox.vue'
import MIcon from '@/components/MIcon.vue'
import MSpinner from '@/components/progress/MSpinner.vue'

const inputModel = ref('')
const numberModel = ref<number | null>(null)
const comboModel = ref()
const selectModel = ref<string | null>(null)
const checkboxModel = ref(false)
const indeterminateModel = ref(false)
const radioModel = ref('http')
const toggleModel = ref(false)
const colorModel = ref('#f59')
const textareaModel = ref('')
const fileModel = ref<File[]>([])

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

<style scoped>
.selection-demo {
  display: flex;
  flex-direction: column;
  gap: calc(var(--input-gap-x) * 1.5);
}
</style>
