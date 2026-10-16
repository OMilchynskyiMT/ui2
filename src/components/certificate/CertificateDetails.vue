<template>
  <component
    :is="compact ? 'div' : UiCard"
    :data-compact="compact || undefined"
    :padding="compact ? undefined : 'large'"
    class="certificate"
  >
    <UiStack gap="var(--space-lg)">
      <div class="overview">
        <span aria-hidden="true" class="emblem">
          <UiIcon :icon="ShieldQuestionIcon" :size="compact ? '1.5rem' : '2rem'" />
        </span>

        <UiStack class="identity" gap="var(--space-xs)">
          <div class="name">{{ title }}</div>
          <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
          <UiCluster gap="var(--space-xs)">
            <UiBadge :tone="statusTone">{{ statusLabel }}</UiBadge>
            <UiBadge v-if="certificate.selfIssued" tone="neutral">Self-issued</UiBadge>
          </UiCluster>
          <div v-if="compact" class="compact-expiry">Expires {{ formatDate(certificate.notAfter) }}</div>
        </UiStack>
      </div>

      <template v-if="!compact">
        <UiPropertyList :data="overviewData" :items="overviewItems">
          <template v-if="certificate.serialNumber" #value-serial="{ value }">
            <UiCopyButton :text="String(value)">{{ value }}</UiCopyButton>
          </template>
        </UiPropertyList>

        <UiDisclosure description="Subject, issuer, and alternative names" title="Identity and extensions">
          <UiStack gap="var(--space-lg)">
            <section v-if="subjectItems.length > 0" class="detail-section">
              <h3>Subject</h3>
              <UiPropertyList :data="subjectData" :items="subjectItems" />
            </section>
            <section class="detail-section">
              <h3>Issuer</h3>
              <UiPropertyList :data="issuerData" :items="issuerItems" />
            </section>
            <section v-if="certificate.subjectAlternativeNames.length > 0" class="detail-section">
              <h3>Subject alternative names</h3>
              <UiPropertyList :data="alternativeNames.data" :items="alternativeNames.items">
                <template #value="{ value }">
                  <span class="alternative-value">{{ value }}</span>
                </template>
              </UiPropertyList>
            </section>
          </UiStack>
        </UiDisclosure>
      </template>
    </UiStack>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ShieldQuestionIcon } from '@lucide/vue'

import UiCopyButton from '@/lib/components/buttons/UiCopyButton.vue'
import UiDisclosure from '@/lib/components/disclosure/UiDisclosure.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiPropertyList, { type Item as PropertyListItem } from '@/lib/components/list/UiPropertyList.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiBadge from '@/lib/components/UiBadge.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import type { CertificateDetails, CertificateName } from '@/models/certificate/parseOpenSslCertificateReport'
import { getCertificateTimeStatus } from '@/models/certificate/parseOpenSslCertificateReport'

type Properties = {
  certificate: CertificateDetails
  compact?: boolean
}

const { certificate, compact = false } = defineProps<Properties>()

const status = computed(() => getCertificateTimeStatus(certificate))
const statusLabel = computed(() => {
  switch (status.value) {
    case 'current': {
      return 'Within date range'
    }
    case 'expired': {
      return 'Expired'
    }
    case 'not-yet-valid': {
      return 'Not yet active'
    }
  }
})
const statusTone = computed<'info' | 'warning'>(() => (status.value === 'current' ? 'info' : 'warning'))
const title = computed(
  () =>
    [
      certificate.subject.commonName,
      certificate.subject.organization,
      certificate.subjectAlternativeNames.find(entry => entry.type === 'DNS')?.value,
      certificate.subjectAlternativeNames[0]?.value,
    ].find(Boolean) ?? 'Unnamed certificate'
)
const subtitle = computed(() => {
  const { organization, locality, country } = certificate.subject
  return [organization === title.value ? undefined : organization, locality, country].filter(Boolean).join(' · ')
})

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const formatDate = (date: Date): string => dateFormatter.format(date)

const overviewData = computed(() => ({
  issuer: [certificate.issuer.commonName, certificate.issuer.organization, certificate.issuer.raw].find(Boolean),
  notBefore: formatDate(certificate.notBefore),
  notAfter: formatDate(certificate.notAfter),
  serial: certificate.serialNumber,
  publicKey: [certificate.publicKeyAlgorithm, certificate.publicKeyBits && `${certificate.publicKeyBits} bits`]
    .filter(Boolean)
    .join(' · '),
  signature: certificate.signatureAlgorithm,
}))
const overviewItems = computed(() => {
  const items: PropertyListItem<typeof overviewData.value>[] = [
    { field: 'issuer', label: 'Issued by' },
    { field: 'notBefore', label: 'Valid from' },
    { field: 'notAfter', label: 'Valid until' },
  ]
  if (certificate.serialNumber) items.push({ field: 'serial', label: 'Serial number' })
  if (certificate.publicKeyAlgorithm) items.push({ field: 'publicKey', label: 'Public key' })
  if (certificate.signatureAlgorithm) items.push({ field: 'signature', label: 'Signature algorithm' })
  return items
})

const nameDetails = (name: CertificateName) => ({
  commonName: name.commonName,
  organization: name.organization,
  organizationalUnit: name.organizationalUnit,
  locality: name.locality,
  state: name.state,
  country: name.country,
  raw: name.raw,
})
const subjectData = computed(() => nameDetails(certificate.subject))
const issuerData = computed(() => nameDetails(certificate.issuer))
const allNameItems = [
  { field: 'commonName', label: 'Common name' },
  { field: 'organization', label: 'Organization' },
  { field: 'organizationalUnit', label: 'Unit' },
  { field: 'locality', label: 'Locality' },
  { field: 'state', label: 'State' },
  { field: 'country', label: 'Country' },
  { field: 'raw', label: 'Full name' },
] satisfies readonly PropertyListItem<ReturnType<typeof nameDetails>>[]
const visibleNameItems = (name: CertificateName): readonly PropertyListItem<ReturnType<typeof nameDetails>>[] => {
  const details = nameDetails(name)
  return allNameItems.filter(item => details[item.field])
}
const subjectItems = computed(() => visibleNameItems(certificate.subject))
const issuerItems = computed(() => visibleNameItems(certificate.issuer))
const alternativeNames = computed(() => {
  const data: Record<string, string> = {}
  const items: PropertyListItem<Record<string, string>>[] = []

  for (const [index, entry] of certificate.subjectAlternativeNames.entries()) {
    const field = `alternative-${index}`
    data[field] = entry.value
    items.push({ field, label: entry.type })
  }

  return { data, items }
})
</script>

<style scoped>
@layer components {
  .certificate {
    min-inline-size: 0;

    & .overview {
      display: flex;
      align-items: flex-start;
      gap: var(--space-lg);
      min-inline-size: 0;

      & > .emblem {
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        inline-size: 3rem;
        block-size: 3rem;
        border-radius: var(--radius-lg);
        background: var(--tone-primary-container);
        color: var(--tone-primary);
      }

      & > .identity {
        flex: 1;
        min-inline-size: 0;

        & > .name {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          line-height: var(--line-height-tight);
          color: var(--text-color-strong);
          overflow-wrap: anywhere;
        }

        & > .subtitle,
        & > .compact-expiry {
          color: var(--text-color-dimmed);
          font-size: var(--font-size-sm);
          overflow-wrap: anywhere;
        }
      }
    }

    & .detail-section {
      display: grid;
      gap: var(--space-sm);
      min-inline-size: 0;
    }

    & .alternative-value {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
    }

    &[data-compact] {
      & .overview {
        gap: var(--space-sm);

        & > .emblem {
          inline-size: 2rem;
          block-size: 2rem;
          border-radius: var(--radius-md);
        }
        & > .identity > .name {
          font-size: var(--font-size-md);
        }
      }
    }
  }
}
</style>
