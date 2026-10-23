<template>
  <UiStack gap="var(--space-xl)">
    <UiSectionHeader
      description="CodeMirror 6, custom language intelligence, reactive settings, search/replace and external diagnostics"
    >
      Code editor
    </UiSectionHeader>

    <UiAlert tone="info">
      Use <kbd>Ctrl+Space</kbd> for completions, <kbd>Ctrl+F</kbd> for search and replace, and <kbd>Ctrl+Z</kbd> to
      undo. Use <kbd>Esc</kbd> then <kbd>Tab</kbd> to move focus out of an editor. Try OpenVPN <code>proto</code>,
      <code>dev</code> and <code>&lt;ca&gt;</code> completions.
    </UiAlert>

    <UiCluster gap="var(--space-md) var(--space-xl)">
      <UiSwitch v-model="readOnly" label="Read-only" />
      <UiSwitch v-model="disabled" label="Disabled" />
      <UiSwitch v-model="wrapped" label="Wrap lines" />
      <UiSwitch v-model="languageLint" label="Language diagnostics" />
      <UiSwitch v-model="showExternalError" label="Show server diagnostic" />
      <UiButton size="small" tone="neutral" variant="outlined" @click="replaceFromOutside">
        Replace JavaScript model
      </UiButton>
    </UiCluster>

    <UiAutoGrid gap="var(--space-xl)" min-item-size="26rem">
      <UiStack gap="var(--space-sm)" tag="section">
        <h3>JavaScript decoder</h3>
        <UiCodeEditor
          ref="javascriptEditor"
          v-model="javascriptCode"
          :diagnostics="externalDiagnostics"
          :disabled="disabled"
          :lint="languageLint"
          :readonly="readOnly"
          :wrap="wrapped"
          label="JavaScript decoder"
        />
      </UiStack>
      <UiStack gap="var(--space-sm)" tag="section">
        <h3>JSON configuration</h3>
        <UiCodeEditor
          v-model="jsonCode"
          :disabled="disabled"
          :lint="languageLint"
          :readonly="readOnly"
          :wrap="wrapped"
          label="JSON configuration"
          language="json"
        />
      </UiStack>
      <UiStack gap="var(--space-sm)" tag="section">
        <h3>OpenVPN configuration</h3>
        <UiCodeEditor
          v-model="openVpnCode"
          :disabled="disabled"
          :lint="languageLint"
          :readonly="readOnly"
          :wrap="wrapped"
          label="OpenVPN configuration"
          language="openvpn"
        />
      </UiStack>
    </UiAutoGrid>
  </UiStack>
</template>

<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import type { CodeEditorDiagnostic, UiCodeEditorExpose } from '@/lib/components/editor/editor.types'
import UiCodeEditor from '@/lib/components/editor/UiCodeEditor.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiAutoGrid from '@/lib/components/grid/UiAutoGrid.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'

const javascriptEditor = useTemplateRef<UiCodeEditorExpose>('javascriptEditor')
const readOnly = ref(false)
const disabled = ref(false)
const languageLint = ref(true)
const wrapped = ref(false)
const showExternalError = ref(false)
const javascriptCode = ref(`function decodeUplink(input) {
  const bytes = input.bytes
  return {
    temperature: bytes[0] / 2,
    humidity: bytes[1],
  }
}
`)
const jsonCode = ref('{\n  "enabled": true,\n  "port": 1194,\n  "peers": ["node-a", "node-b"]\n}\n')
const openVpnCode = ref('client\ndev tun\nproto udp\nremote vpn.example.net 1194\npersist-key\npersist-tun\n')

const externalDiagnostics = computed<CodeEditorDiagnostic[]>(() =>
  showExternalError.value
    ? [
        {
          line: 2,
          column: 3,
          endColumn: 14,
          message: 'Example backend validation error',
          severity: 'error',
          source: 'server',
        },
      ]
    : []
)

const replaceFromOutside = (): void => {
  javascriptCode.value = 'const result = { status: "updated externally" }\n'
  javascriptEditor.value?.focus()
}
</script>

<style scoped>
h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
</style>
