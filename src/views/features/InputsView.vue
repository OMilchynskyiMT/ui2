<template>
  <div class="inputs-view">
    <section>
      <UiSectionHeader description="Text entry states, adornments, supporting text, and read-only behavior">
        Text fields
      </UiSectionHeader>

      <UiFormGrid>
        <UiTextField v-model="inputModel" label="Regular text field" title="Test title" />
        <UiTextField v-model="inputModel" label="With prefix and suffix" prefix="$" suffix=".00" />

        <UiTextField v-model="inputModel" disabled label="Disabled" />
        <UiTextField v-model="inputModel" label="Read only" readonly />

        <UiTextField v-model="inputModel" class="grid-full" label="With error and hint" prefix="$" suffix=".00">
          <template #leading>
            <UiIcon :icon="MailPlusIcon" style="color: var(--green-500)" />
          </template>
          <template #hint>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste veritatis laborum amet quasi esse praesentium,
            nesciunt possimus error odio omnis, itaque accusantium ab sapiente porro facere eaque eligendi, architecto
            officia?
          </template>
          <template #error>Lorem ipsum dolor sit amet consectetur adipisicing elit.</template>
        </UiTextField>

        <UiTextField v-model="inputModel" label="With spinner" placeholder="Loading...">
          <template #leading>
            <UiIcon :icon="MailPlusIcon" />
          </template>
          <template #trailing>
            <UiSpinner :stroke-width="5" size="1.5rem" style="color: var(--blue-300)" />
          </template>
          <template #hint>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste veritatis laborum amet quasi esse praesentium
          </template>
        </UiTextField>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader
        description="Variant and size are independent presentation controls and keep outlined/medium defaults"
      >
        Field presentation
      </UiSectionHeader>

      <UiFormGrid>
        <UiSearchField v-model="searchModel" hint="Default outlined, medium search field" />
        <UiSearchField
          v-model="searchModel"
          aria-label="Unlabeled search"
          hint="Outlined fields keep stable geometry even without a floating label"
          label=""
          placeholder="Unlabeled outlined search"
        />

        <UiSearchField
          v-model="searchModel"
          aria-label="Search"
          hint="Compact filled presentation for search/filter surfaces"
          label=""
          placeholder="Search"
          size="small"
          variant="filled"
        />
        <UiTextField v-model="inputModel" label="Compact filled text field" size="small" variant="filled" />

        <UiTextField v-model="inputModel" label="Compact outlined text field" size="small" />
        <UiSelect
          v-model="selectModel"
          :options="selectOptions"
          label="Compact filled select"
          placeholder="Choose protocol"
          size="small"
          variant="filled"
        />
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Numeric, password, temporal, and color-specific field behavior">
        Specialized fields
      </UiSectionHeader>

      <UiFormGrid>
        <UiNumberField
          v-model="numberModel"
          :max="10"
          :min="5"
          clamp-on-blur
          label="Number field, 5–10, clamp on blur"
        />
        <UiNumberField v-model="numberModel" label="Number field #2" placeholder="Numbers only" />

        <UiPasswordField v-model="passwordModel" label="Password" />
        <UiPasswordField v-model="passwordModel" :icon="KeyRoundIcon" label="Password with custom icon" />

        <UiTextField v-model="dateModel" label="Date" type="date" />
        <UiTextField v-model="timeModel" label="Time" type="time" />
        <UiTextField v-model="dateTimeModel" label="Date and time" type="datetime-local" />

        <UiColorField v-model="colorModel" label="Color picker" suffix="hex">
          <template #hint>Current value: {{ colorModel }}</template>
        </UiColorField>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Single- and multi-value selection fields with grouped options and custom values">
        Selection fields
      </UiSectionHeader>

      <UiFormGrid>
        <UiCombobox
          v-model="comboModel"
          :create-custom-value="value => value"
          :options="comboOptions"
          allow-custom
          label="Combobox"
          suffix="@192.168.2.1"
        >
          <template #leading>
            <UiIcon :icon="EthernetPortIcon" style="color: var(--indigo-600)" />
          </template>
          <template #hint>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste veritatis laborum amet quasi esse praesentium
          </template>
        </UiCombobox>

        <UiSelect v-model="selectModel" :options="selectOptions" label="Select" placeholder="Choose protocol">
          <template #leading>
            <UiIcon :icon="EthernetPortIcon" style="color: var(--indigo-600)" />
          </template>
        </UiSelect>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Boolean and mutually-exclusive selection controls">
        Choice controls
      </UiSectionHeader>

      <UiFormGrid :columns="{ small: 1, medium: 2, large: 3 }">
        <UiCheckbox v-model="checkboxModel" label="Checkbox" />
        <UiCheckbox
          v-model="checkboxModel"
          hint="Custom color"
          label="Custom checkbox"
          style="--control-color: var(--green-500)"
        />
        <UiCheckbox v-model="indeterminateModel" indeterminate label="Indeterminate checkbox" />

        <UiRadioGroup
          v-model="radioModel"
          :options="radioOptions"
          class="grid-full"
          hint="Select the protocol used by this service"
          label="Protocol"
          orientation="horizontal"
        />

        <UiSwitch v-model="toggleModel" label="Toggle" />
        <UiSwitch
          v-model="toggleModel"
          hint="Custom color"
          label="Custom toggle"
          style="--control-color: var(--teal-500)"
        />
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Fixed-height and auto-growing multiline text entry">
        Multiline fields
      </UiSectionHeader>

      <UiFormGrid>
        <UiTextarea v-model="textareaModel" counter hint="Lorem ipsum dolor sit amet" label="Textarea">
          <template #leading>
            <UiIcon :icon="MailPlusIcon" style="color: var(--green-500)" />
          </template>
        </UiTextarea>

        <UiTextarea
          v-model="textareaModel"
          auto-grow
          counter
          hint="Lorem ipsum dolor sit amet"
          label="Textarea auto grow"
        >
          <template #leading>
            <UiIcon :icon="MailPlusIcon" style="color: var(--green-500)" />
          </template>
        </UiTextarea>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Schema-backed validation mapped into field error presentation">
        Validation
      </UiSectionHeader>

      <UiFormGrid :columns="1">
        <UiTextField
          v-model="validationModel.email"
          :error="validation.errors.value.email?.at(0)"
          label="Validated email"
          @input="validation.clear()"
        >
          <template #trailing>
            <UiButton size="small" tone="warning" variant="tonal" @click="validation.validate">Validate</UiButton>
          </template>
        </UiTextField>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Compact field and drag-and-drop presentations for file selection">
        File upload
      </UiSectionHeader>

      <UiFormGrid>
        <UiFilePicker
          v-model="fileModel"
          accept="image/*"
          accept-text="Images only"
          area-text="Drag and drop files here or click to upload"
          hint="Lorem ipsum dolor sit amet"
          label="File upload"
          multiple
        />
        <UiFilePicker
          v-model="fileModel"
          accept="image/*"
          accept-text="Images only"
          area-text="Drag and drop files here or click to upload"
          class="grid-full"
          hint="Lorem ipsum dolor sit amet"
          label="File upload (area)"
          multiple
          variant="area"
        />
      </UiFormGrid>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { EthernetPortIcon, KeyRoundIcon, MailPlusIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiCheckbox from '@/lib/components/fields/UiCheckbox.vue'
import UiColorField from '@/lib/components/fields/UiColorField.vue'
import UiCombobox from '@/lib/components/fields/UiCombobox.vue'
import UiFilePicker from '@/lib/components/fields/UiFilePicker.vue'
import UiNumberField from '@/lib/components/fields/UiNumberField.vue'
import UiPasswordField from '@/lib/components/fields/UiPasswordField.vue'
import UiRadioGroup, { type UiRadioGroupOption } from '@/lib/components/fields/UiRadioGroup.vue'
import UiSearchField from '@/lib/components/fields/UiSearchField.vue'
import UiSelect from '@/lib/components/fields/UiSelect.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiTextarea from '@/lib/components/fields/UiTextarea.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import type { ListboxEntry, ListboxOption } from '@/lib/components/list/listbox.types'
import UiSpinner from '@/lib/components/progress/UiSpinner.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import { email, Schema, types, useValidation } from '@/lib/validation'

const inputModel = ref('')
const numberModel = ref<number | null>(null)
const comboModel = ref()
const selectModel = ref<string | null>(null)
const checkboxModel = ref(false)
const indeterminateModel = ref(false)
const radioModel = ref<'http' | 'https' | 'ssh'>('http')
const searchModel = ref('')
const passwordModel = ref('secret')
const toggleModel = ref(false)
const dateModel = ref('')
const timeModel = ref('')
const dateTimeModel = ref('')
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

const comboOptions: ListboxOption<string>[] = [
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

const radioOptions: UiRadioGroupOption<'http' | 'https' | 'ssh'>[] = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'ssh', label: 'SSH' },
]

const selectOptions: ListboxEntry<string>[] = [
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
.inputs-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }
}
</style>
