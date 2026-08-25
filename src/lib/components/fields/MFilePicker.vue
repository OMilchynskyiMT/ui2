<template>
  <div
    v-bind="attributes"
    :class="[
      'file-upload',
      `file-upload-${variant}`,
      {
        disabled,
        readonly,
        dragging: isDragging,
      },
    ]"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <FieldFrame
      :id="id"
      :class="['file-frame', `file-frame-${variant}`]"
      :disabled="disabled"
      :error="error"
      :focused="isFocused || isDragging"
      :hint="hint"
      :invalid="isInvalid"
      :label="label"
      :multiline="variant === 'area'"
      :populated="variant === 'area' || model.length > 0 || placeholder.trim() !== ''"
      :readonly="readonly"
      :title="title"
      @request-focus="browse"
    >
      <template v-if="variant === 'field'" #leading>
        <slot name="icon">
          <MIcon :icon="FileUpIcon" class="upload-icon" />
        </slot>
      </template>

      <button
        v-if="variant === 'field'"
        :id="id"
        ref="control"
        :aria-describedby="description"
        :aria-disabled="readonly || undefined"
        :aria-errormessage="isInvalid && (error || slots.error) ? `${id}-error` : undefined"
        :aria-invalid="isInvalid || undefined"
        :aria-readonly="readonly || undefined"
        :disabled="disabled"
        :title="selectedTitle || undefined"
        class="field-control"
        type="button"
        @click="browse"
      >
        <slot :files="model" :text="summaryText" :total-size="totalSize" name="summary">
          <span :class="['summary', { placeholder: model.length === 0 }]" aria-live="polite">
            {{ summaryText }}
          </span>
        </slot>
      </button>

      <div
        v-else
        class="area-content"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @dragover="onDragOver"
        @drop="onDrop"
      >
        <button
          :id="id"
          ref="control"
          :aria-describedby="description"
          :aria-disabled="readonly || undefined"
          :aria-errormessage="isInvalid && (error || slots.error) ? `${id}-error` : undefined"
          :aria-invalid="isInvalid || undefined"
          :aria-readonly="readonly || undefined"
          :disabled="disabled"
          class="drop-zone"
          type="button"
          @click="browse"
        >
          <slot :accept="accept" :browse="browse" :files="model" :multiple="multiple" name="empty">
            <span class="area-icon">
              <slot name="icon">
                <MIcon :icon="FileUpIcon" class="upload-icon" size="2.5rem" />
              </slot>
            </span>

            <span class="area-message">
              <strong>{{ resolvedAreaText }}</strong>
              <small v-if="resolvedAcceptText">{{ resolvedAcceptText }}</small>
            </span>
          </slot>
        </button>

        <ul v-if="model.length > 0" aria-live="polite" class="files">
          <li v-for="(file, index) in model" :key="`${fileKey(file)}:${index}`" class="file">
            <slot
              :file="file"
              :formatted-size="formatSize(file.size)"
              :index="index"
              :remove="() => remove(index)"
              name="file"
            >
              <span :title="file.name" class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatSize(file.size) }}</span>
            </slot>

            <button
              v-if="clearable && !disabled && !readonly"
              :aria-label="`Remove ${file.name}`"
              :title="`Remove ${file.name}`"
              class="remove"
              type="button"
              @click.stop="remove(index)"
              @pointerdown.stop
            >
              <MIcon :icon="XIcon" size="1.25rem" />
            </button>
          </li>
        </ul>
      </div>

      <template v-if="variant === 'field' && (slots.trailing || showClear)" #trailing>
        <slot :clear="clear" :files="model" name="trailing">
          <button
            :aria-label="multiple ? 'Clear selected files' : 'Clear selected file'"
            :title="multiple ? 'Clear selected files' : 'Clear selected file'"
            class="clear"
            type="button"
            @click.stop="clear"
            @pointerdown.stop
          >
            <MIcon :icon="XIcon" />
          </button>
        </slot>
      </template>

      <template v-for="slot in ['label', 'error', 'hint', 'counter'].filter(s => slots[s])" #[slot]>
        <slot :name="slot" />
      </template>
    </FieldFrame>

    <input
      :id="`${id}-native`"
      ref="input"
      :accept="accept || undefined"
      :capture="capture"
      :disabled="disabled || readonly"
      :form="form"
      :multiple="multiple"
      :name="name"
      tabindex="-1"
      type="file"
      @cancel="onCancel"
      @change="onNativeChange"
    />
  </div>
</template>

<script lang="ts">
export type MFilePickerVariant = 'field' | 'area'
export type MFilePickerChangeSource = 'picker' | 'drop' | 'clear' | 'remove'
export type MFileRejectionReason = 'accept' | 'multiple'

export type MFileRejection = {
  file: File
  reason: MFileRejectionReason
}

export type MFilePickerExpose = {
  browse: () => void
  clear: () => void
  focus: (options?: FocusOptions) => void
}
</script>

<script lang="ts" setup>
import { computed, onMounted, ref, useAttrs, useId, useSlots, useTemplateRef, watch } from 'vue'
import { FileUpIcon, XIcon } from '@lucide/vue'

import MIcon from '../MIcon.vue'

import FieldFrame from './FieldFrame.vue'
import { type MFieldProperties } from './mfield.shared'

type Properties = Omit<MFieldProperties, 'id' | 'focused' | 'populated' | 'multiline' | 'prefix' | 'suffix'> & {
  id?: string
  variant?: MFilePickerVariant
  accept?: string
  multiple?: boolean
  name?: string
  form?: string
  capture?: 'user' | 'environment'
  placeholder?: string
  areaText?: string
  acceptText?: string
  clearable?: boolean
}

defineOptions({
  inheritAttrs: false,
})

const slots = useSlots()
const attributes = useAttrs()

const {
  id = useId(),
  variant = 'field',
  readonly = false,
  disabled = false,
  label = '',
  title,
  error = '',
  invalid = false,
  hint = '',
  accept = '',
  multiple = false,
  name,
  form,
  capture,
  placeholder = 'No file selected',
  areaText,
  acceptText,
  clearable = true,
} = defineProps<Properties>()

const model = defineModel<File[]>({ required: true })
const inputReference = useTemplateRef<HTMLInputElement>('input')
const controlReference = useTemplateRef<HTMLButtonElement>('control')
const isFocused = ref(false)
const isDragging = ref(false)
const dragDepth = ref(0)

const emit = defineEmits<{
  change: [files: File[], source: MFilePickerChangeSource, event?: Event]
  reject: [rejections: MFileRejection[], source: 'picker' | 'drop', event: Event]
  cancel: [event: Event]
}>()

// TODO: move into composable component
const formatSize = (size: number): string => {
  if (size < 1024) return `${size} B`

  const units = ['KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length)
  const value = size / 1024 ** exponent
  const formatted = value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '')

  return `${formatted} ${units[exponent - 1]}`
}

const fileKey = (file: File): string => `${file.name}:${file.size}:${file.lastModified}:${file.type}`

const canChange = computed(() => !disabled && !readonly)
const isInvalid = computed(() => invalid || Boolean(error || slots.error))
const totalSize = computed(() => model.value.reduce((total, file) => total + file.size, 0))

const summaryText = computed(() => {
  if (model.value.length === 0) return placeholder
  if (model.value.length === 1) {
    const [file] = model.value
    if (!file) return placeholder
    return `${file.name} - ${formatSize(file.size)}`
  }

  return `${model.value.length} files - ${formatSize(totalSize.value)}`
})

const selectedTitle = computed(() => model.value.map(file => `${file.name} - ${formatSize(file.size)}`).join('\n'))

const resolvedAreaText = computed(() => {
  if (areaText !== undefined) return areaText
  if (isDragging.value) return multiple ? 'Drop files to select them' : 'Drop file to select it'
  if (model.value.length > 0) {
    return multiple ? 'Drop files here or click to replace' : 'Drop a file here or click to replace'
  }

  return multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse'
})

const resolvedAcceptText = computed(() => {
  if (acceptText !== undefined) return acceptText
  return accept ? `Accepted: ${accept}` : ''
})

const showClear = computed(() => clearable && model.value.length > 0 && !disabled && !readonly)

const description = computed(() => {
  const identifiers: string[] = []
  if (isInvalid.value && (error || slots.error)) identifiers.push(`${id}-error`)
  if (hint || slots.hint) identifiers.push(`${id}-hint`)

  return identifiers.length > 0 ? identifiers.join(' ') : undefined
})

const acceptTokens = computed(() =>
  accept
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
)

const syncNativeFiles = (files: File[]): void => {
  const input = inputReference.value
  if (!input) return

  if (files.length === 0) {
    input.value = ''
    return
  }

  if (typeof DataTransfer === 'undefined') return

  try {
    const transfer = new DataTransfer()
    for (const file of files) transfer.items.add(file)
    input.files = transfer.files
  } catch {
    // The File[] model remains authoritative if a browser rejects FileList assignment
  }
}

const commit = (files: File[], source: MFilePickerChangeSource, event?: Event): void => {
  model.value = files
  syncNativeFiles(files)
  emit('change', files, source, event)
}

const browse = (): void => {
  if (!canChange.value) return
  inputReference.value?.click()
}

const clear = (): void => {
  if (!canChange.value || model.value.length === 0) return
  commit([], 'clear')
}

const remove = (index: number): void => {
  if (!canChange.value || index < 0 || index >= model.value.length) return
  commit(
    model.value.filter((_, fileIndex) => fileIndex !== index),
    'remove'
  )
}

const isMatchesAccept = (file: File): boolean => {
  if (acceptTokens.value.length === 0) return true

  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return acceptTokens.value.some(token => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

const selectFiles = (files: FileList | File[], source: 'picker' | 'drop', event: Event): void => {
  const accepted: File[] = []
  const rejected: MFileRejection[] = []

  for (const file of files) {
    if (!isMatchesAccept(file)) {
      rejected.push({ file, reason: 'accept' })
      continue
    }

    if (!multiple && accepted.length > 0) {
      rejected.push({ file, reason: 'multiple' })
      continue
    }

    accepted.push(file)
  }

  if (rejected.length > 0) emit('reject', rejected, source, event)

  if (accepted.length === 0) {
    syncNativeFiles(model.value)
    return
  }

  commit(accepted, source, event)
}

const onNativeChange = (event: Event): void => {
  const input = event.currentTarget as HTMLInputElement
  if (!input.files) return
  selectFiles(input.files, 'picker', event)
}

const onCancel = (event: Event): void => {
  syncNativeFiles(model.value)
  emit('cancel', event)
}

const isFileDrag = (event: DragEvent): boolean => event.dataTransfer?.types.includes('Files') ?? false

const stopPropagation = (event: Event): void => {
  event.preventDefault()
  event.stopPropagation()
}

const onDragEnter = (event: DragEvent): void => {
  if (!isFileDrag(event)) return
  stopPropagation(event)
  dragDepth.value += 1
  if (canChange.value) isDragging.value = true
}

const onDragOver = (event: DragEvent): void => {
  if (!isFileDrag(event)) return
  stopPropagation(event)
  if (event.dataTransfer) event.dataTransfer.dropEffect = canChange.value ? 'copy' : 'none'
}

const onDragLeave = (event: DragEvent): void => {
  if (dragDepth.value === 0) return
  stopPropagation(event)
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (dragDepth.value === 0) isDragging.value = false
}

const onDrop = (event: DragEvent): void => {
  if (!isFileDrag(event)) return
  stopPropagation(event)
  dragDepth.value = 0
  isDragging.value = false

  if (!canChange.value || !event.dataTransfer) return
  selectFiles(event.dataTransfer.files, 'drop', event)
}

const onFocusIn = (): void => {
  isFocused.value = true
}

const onFocusOut = (event: FocusEvent): void => {
  const currentTarget = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget
  if (relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) return
  isFocused.value = false
}

defineExpose<MFilePickerExpose>({
  browse,
  clear,
  focus: options => controlReference.value?.focus(options),
})

watch(model, files => syncNativeFiles(files), { flush: 'post' })

onMounted(() => syncNativeFiles(model.value))
</script>

<style scoped>
@layer components {
  .file-upload {
    min-inline-size: 0;

    & > input[type='file'] {
      display: none;
    }

    div.field {
      --cursor: default;
    }

    div.field button.field-control {
      display: flex;
      align-items: center;
      inline-size: 100%;
      block-size: var(--input-height);
      text-align: start;

      & > .summary {
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:is(.placeholder) {
          color: var(--input-hint-color);
        }
      }
    }

    & :is(.upload-icon, .clear, .remove) {
      cursor: pointer;
    }

    &:is(.file-upload-field) .upload-icon {
      color: var(--input-border-active-color);
    }
    &:is(.file-upload-area) .upload-icon {
      color: var(--text-color-dimmed);
    }

    :is(.clear, .remove) {
      color: var(--red-500);
    }
  }

  .file-upload-area {
    :deep(.file-frame-area > div.container > div.area > .control) {
      align-items: stretch;
      inline-size: auto;
    }
  }

  .area-content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    inline-size: 100%;

    .drop-zone {
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: var(--input-gap-x);
      inline-size: 100%;
      min-block-size: calc(var(--input-height) * 2.5);
      border-radius: var(--input-border-radius);
      cursor: pointer;
      text-align: start;

      transition: background-color var(--duration-md) var(--bezier-smooth);

      & > .area-icon {
        display: grid;
        flex: 0 0 auto;
        place-items: center;
      }

      & > .area-message {
        display: flex;
        flex-direction: column;
        row-gap: var(--space-xs);

        & > strong {
          font-weight: inherit;
        }

        & > small {
          overflow-wrap: anywhere;
          color: var(--input-hint-color);
          font-size: var(--font-size-sm);
        }
      }
    }
  }

  .file-upload-area:where(:not(.disabled, .readonly)) {
    & .drop-zone:hover,
    &:is(.dragging) .drop-zone {
      background-color: oklch(from currentColor l c h / 0.05);
    }
  }

  :is(button.field-control, .area-content, .drop-zone, .area-message, .files, .file, .file-name) {
    min-inline-size: 0;
  }

  .files {
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--input-padding-inline) / 2);
    padding-block-start: var(--input-padding-inline);

    .file {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      column-gap: var(--input-gap-x);

      & > .file-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-color);
      }

      & > .file-size {
        color: var(--input-hint-color);
        font-size: var(--font-size-sm);
        white-space: nowrap;
      }
    }
  }

  .file-upload {
    :is(.disabled) {
      & :is(.drop-zone, .field-control) {
        cursor: not-allowed;
      }
    }

    :is(.readonly) {
      & :is(.drop-zone, .field-control) {
        cursor: default;
      }
    }
  }
}
</style>
