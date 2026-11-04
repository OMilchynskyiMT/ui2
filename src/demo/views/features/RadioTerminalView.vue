<template>
  <UiStack gap="var(--space-xl)">
    <UiSectionHeader
      description="Asynchronous AT commands, editable input, keyboard history, and a searchable transcript"
    >
      Radio terminal
    </UiSectionHeader>

    <UiAlert tone="info">
      Try <code>AT</code>, <code>AT+CSQ</code>, <code>AT+CGMM</code>, or <code>AT+TIMEOUT</code> to exercise a failed
      request
    </UiAlert>

    <RadioTerminal :on-execute="executeCommand" />
  </UiStack>
</template>

<script lang="ts" setup>
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'
import RadioTerminal from '@/components/radio/RadioTerminal.vue'

const executeCommand = async (command: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1200))

  switch (command.toUpperCase()) {
    case 'AT': {
      return 'OK'
    }
    case 'AT+CSQ': {
      return '+CSQ: 18,99\nOK'
    }
    case 'AT+CGMM': {
      return 'EG25-G\nOK'
    }
    case 'AT+TIMEOUT': {
      throw new Error('Device did not respond')
    }
    default: {
      return 'ERROR'
    }
  }
}
</script>
