<template>
  <section class="sign-in-demo">
    <UiStack class="sign-in-panel" gap="calc(var(--space-xxl) * 1.5)">
      <UiStack align="center" class="brand" gap="var(--space-lg)" tag="header">
        <img v-if="resolvedScheme === 'light'" alt="MultiTech" src="/images/MT-logo.svg" />
        <img v-else alt="MultiTech" src="/images/MT-logo-light.svg" />
      </UiStack>

      <div :class="{ 'has-policy': usagePolicy }" class="content">
        <UiCard v-if="usagePolicy" class="policy-card">
          <UiStack aria-label="Usage policy" class="policy" gap="var(--space-xxl)" tag="section">
            <UiSectionHeader
              :icon="ScaleIcon"
              description="Review the policy for use of this device before signing in."
            >
              Usage Policy
            </UiSectionHeader>

            <UiScrollArea class="policy-content" fade-edges overscroll="contain">
              <p>{{ usagePolicy }}</p>
            </UiScrollArea>
          </UiStack>
        </UiCard>

        <UiCard class="sign-in-card">
          <UiStack class="sign-in-form" gap="var(--space-xxl)" tag="form" @submit.prevent="submit">
            <UiSectionHeader description="Sign in with your device credentials">Sign In</UiSectionHeader>

            <UiAlert v-if="submitted" tone="info">
              This is a component demo. No authentication request was sent.
            </UiAlert>

            <UiStack class="fields" gap="var(--space-lg)">
              <UiTextField
                v-model="username"
                autocapitalize="none"
                autocomplete="username"
                label="Username"
                required
                spellcheck="false"
              >
                <template #leading>
                  <UiIcon :icon="UserIcon" aria-hidden="true" />
                </template>
              </UiTextField>

              <UiPasswordField v-model="password" autocomplete="current-password" label="Password" required />
            </UiStack>

            <UiButton :icon="LogInIcon" class="submit" type="submit">Sign in</UiButton>
          </UiStack>
        </UiCard>
      </div>
    </UiStack>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogInIcon, ScaleIcon, UserIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiPasswordField from '@/lib/components/fields/UiPasswordField.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiScrollArea from '@/lib/components/layout/UiScrollArea.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import { useColorScheme } from '@/composables/useColorScheme'

const { scheme: resolvedScheme } = useColorScheme()
const username = ref('')
const password = ref('')
const submitted = ref(false)

const usagePolicy = `This system is for the use of authorized users only. Individuals using this system without authority, or in excess of their authority, are subject to having all their activities on this system monitored and recorded by system personnel.

Anyone using this system expressly consents to such monitoring and is advised that if such monitoring reveals possible evidence of criminal activity, system personnel may provide the evidence of such monitoring to law enforcement officials.`

const submit = (): void => {
  submitted.value = true
}
</script>

<style scoped>
@layer components {
  .sign-in-demo {
    min-block-size: min(42rem, calc(100dvh - 10rem));
    display: grid;
    place-items: center;
    padding: var(--space-xxl);
    border: 1px solid var(--divider-color);
    border-radius: var(--radius-lg);
    background:
      radial-gradient(circle at 50% 15%, oklch(from var(--tone-primary) l c h / 0.12), var(--bg) 60%),
      url('/images/noise.svg') repeat,
      var(--bg);
  }

  .sign-in-panel {
    inline-size: min(100%, 62rem);
  }

  .brand {
    text-align: center;

    & > img {
      inline-size: min(13rem, 65%);
      block-size: auto;
    }
  }

  .content {
    display: grid;
    grid-template-columns: minmax(0, 28rem);
    align-items: start;
    justify-content: center;
    gap: var(--space-xxl);

    &.has-policy {
      grid-template-columns: minmax(0, 1fr) minmax(0, 28rem);
    }
  }

  .sign-in-card,
  .policy-card {
    --padding-block: var(--space-xxl);
    --padding-inline: var(--space-xxl);
    --radius: var(--radius-lg);
    --shadow: var(--shadow-md);
  }

  .submit {
    inline-size: 100%;
  }

  .policy-content {
    max-block-size: 15rem;

    & p {
      white-space: pre-wrap;
      line-height: 1.6;
    }
  }

  @media (width < container-token(--container-lg)) {
    .sign-in-panel {
      inline-size: min(100%, 32rem);
    }

    .content.has-policy {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (width < container-token(--container-sm)) {
    .sign-in-demo {
      min-block-size: auto;
      padding: var(--space-lg);
    }

    .sign-in-card,
    .policy-card {
      --padding-block: var(--space-xl);
      --padding-inline: var(--space-xl);
    }
  }
}
</style>
