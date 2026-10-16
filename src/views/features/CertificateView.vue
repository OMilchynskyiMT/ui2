<template>
  <UiStack class="certificate-demo" gap="var(--space-xl)">
    <UiSectionHeader description="Read-only X.509 information from the OpenSSL text report returned by the device API">
      Certificate details
    </UiSectionHeader>

    <UiCluster>
      <UiButton variant="tonal" @click="loadExample('current')">Current</UiButton>
      <UiButton variant="tonal" @click="loadExample('expired')">Expired</UiButton>
      <UiButton variant="tonal" @click="loadExample('future')">Not yet active</UiButton>
      <UiButton variant="tonal" @click="loadExample('self-issued')">Self-issued</UiButton>
    </UiCluster>

    <UiTextarea
      v-model="report"
      :rows="10"
      hint="Paste the textual output of openssl x509 -text, not PEM or DER data"
      label="OpenSSL certificate report"
    />

    <UiAlert v-if="result.error" tone="danger">{{ result.error }}</UiAlert>
    <template v-else-if="result.certificate">
      <CertificateDetails :certificate="result.certificate" />

      <UiSectionHeader description="Compact presentation for certificate list and table cells">
        Compact variant
      </UiSectionHeader>
      <UiCard padding="medium">
        <CertificateDetails :certificate="result.certificate" compact />
      </UiCard>
    </template>
  </UiStack>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiTextarea from '@/lib/components/fields/UiTextarea.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'
import CertificateDetails from '@/components/certificate/CertificateDetails.vue'
import { parseOpenSslCertificateReport } from '@/models/certificate/parseOpenSslCertificateReport'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const opensslDate = (date: Date): string =>
  `${months[date.getUTCMonth()]} ${date.getUTCDate()} ${date.toISOString().slice(11, 19)} ${date.getUTCFullYear()} GMT`

type Example = 'current' | 'expired' | 'future' | 'self-issued'
const createExample = (kind: Example): string => {
  const now = Date.now()
  const day = 86_400_000
  const start = new Date(now + (kind === 'future' ? 20 : kind === 'expired' ? -400 : -30) * day)
  const end = new Date(now + (kind === 'future' ? 400 : kind === 'expired' ? -10 : 300) * day)
  const subject = 'CN = gateway.example.test, O = Example Networks, C = US'
  return `Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            49:5a:01:cd:72
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: ${kind === 'self-issued' ? subject : 'CN = Example Root CA, O = Example Networks, C = US'}
        Validity
            Not Before: ${opensslDate(start)}
            Not After : ${opensslDate(end)}
        Subject: ${subject}
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:gateway.example.test, DNS:gateway, IP Address:192.0.2.5
            X509v3 Basic Constraints: critical
                CA:FALSE`
}

const report = ref(createExample('current'))
const loadExample = (kind: Example): void => {
  report.value = createExample(kind)
}
const result = computed(() => {
  try {
    return { certificate: parseOpenSslCertificateReport(report.value), error: undefined }
  } catch (error) {
    return {
      certificate: undefined,
      error: error instanceof Error ? error.message : 'Could not read certificate report',
    }
  }
})
</script>
