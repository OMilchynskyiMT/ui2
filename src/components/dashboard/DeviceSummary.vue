<template>
  <UiCard class="device-summary" padding="medium" variant="filled">
    <div class="product-visual">
      <img v-if="imageSrc" :alt="imageAlt || modelNumber" :src="imageSrc" />
      <span v-else aria-hidden="true" class="fallback">
        <UiIcon :icon="SmartphoneIcon" size="2.25rem" />
      </span>
    </div>

    <UiStack class="content" gap="var(--space-lg)">
      <UiStack class="identity" gap="var(--space-xxs)">
        <strong class="name">{{ customName }}</strong>
        <span class="model">{{ modelNumber }}</span>
      </UiStack>

      <dl class="metrics">
        <div class="metric">
          <dt>Firmware version</dt>
          <dd>{{ firmwareVersion }}</dd>
        </div>
        <div class="metric">
          <dt>Up time</dt>
          <dd>{{ uptime }}</dd>
        </div>
        <div class="metric">
          <dt>Current time</dt>
          <dd>{{ currentTime }}</dd>
        </div>
      </dl>

      <UiCluster align="baseline" class="metadata">
        <span>
          <strong>Serial number</strong>
          <UiCopyButton :text="serialNumber">{{ serialNumber }}</UiCopyButton>
        </span>
        <span v-if="imei">
          <strong>IMEI</strong>
          <UiCopyButton :text="imei">{{ imei }}</UiCopyButton>
        </span>
      </UiCluster>
    </UiStack>
  </UiCard>
</template>

<script lang="ts" setup>
import { SmartphoneIcon } from '@lucide/vue'

import UiCopyButton from '@/lib/components/buttons/UiCopyButton.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

const { customName, modelNumber, serialNumber, imei, firmwareVersion, uptime, currentTime, imageSrc, imageAlt } =
  defineProps<{
    customName: string
    modelNumber: string
    serialNumber: string
    imei?: string
    firmwareVersion: string
    uptime: string
    currentTime: string
    imageSrc?: string
    imageAlt?: string
  }>()
</script>

<style scoped>
@layer components {
  .device-summary {
    --display: grid;

    grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr);
    align-items: center;
    gap: var(--space-xl);

    & > .product-visual {
      inline-size: 100%;
      aspect-ratio: 31 / 18;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: color-mix(in oklch, var(--tone-primary) 5%, var(--surface-card));

      & > img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: contain;
      }

      & > .fallback {
        inline-size: 4.5rem;
        block-size: 4.5rem;
        display: grid;
        place-items: center;
        border-radius: var(--radius-xl);
        background: color-mix(in oklch, var(--tone-primary) 14%, transparent);
        color: var(--tone-primary);
      }
    }

    & > .content {
      min-inline-size: 0;
      align-content: center;

      & > .identity {
        min-inline-size: 0;

        & > .name {
          overflow: hidden;
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          line-height: var(--line-height-tight);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        & > .model {
          overflow: hidden;
          color: var(--text-color-dimmed);
          font-size: var(--font-size-sm);
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      & > .metrics {
        min-inline-size: 0;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-lg);

        & > .metric {
          min-inline-size: 0;
          display: grid;
          gap: var(--space-xxs);
          padding-inline-start: var(--space-lg);
          border-inline-start: var(--border-width-thin) solid var(--divider-color);

          &:first-child {
            padding-inline-start: 0;
            border-inline-start: 0;
          }

          & > dt {
            color: var(--text-color-dimmed);
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-semibold);
          }

          & > dd {
            min-inline-size: 0;
            overflow: hidden;
            font-weight: var(--font-weight-semibold);
            font-variant-numeric: tabular-nums;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      & > .metadata {
        --cluster-gap: var(--space-xs) var(--space-xl);

        padding-block-start: var(--space-md);
        border-block-start: var(--border-width-thin) solid var(--divider-color);
        color: var(--text-color-dimmed);
        font-size: var(--font-size-xs);

        & strong {
          margin-inline-end: var(--space-xs);
          color: var(--text-color);
          font-weight: var(--font-weight-semibold);
        }
      }
    }

    @media (width < container-token(--container-md)) {
      grid-template-columns: 1fr;

      & > .product-visual {
        inline-size: min(100%, 25rem);
        justify-self: center;
      }

      & > .content > .metrics {
        grid-template-columns: 1fr;
        gap: var(--space-sm);

        & > .metric {
          grid-template-columns: minmax(6rem, 0.8fr) minmax(0, 1.2fr);
          align-items: baseline;
          gap: var(--space-md);
          padding-inline-start: 0;
          border-inline-start: 0;
        }
      }
    }
  }
}
</style>
