<template>
  <section class="sign-in-demo">
    <div class="sign-in-panel">
      <header class="brand">
        <img v-if="resolvedScheme === 'light'" alt="MultiTech" src="/images/MT-logo.svg" />
        <img v-else alt="MultiTech" src="/images/MT-logo-light.svg" />

        <div class="product">
          <strong>mPower™ Edge Intelligence Conduit AP</strong>
          <span>MTCAP3-L4G2D-WIFI · Firmware 8.0.0-dev1</span>
        </div>
      </header>

      <div :class="{ 'has-policy': usagePolicy }" class="content">
        <MCard v-if="usagePolicy" class="policy-card">
          <section aria-labelledby="usage-policy-title" class="policy">
            <MSectionHeader style="--sections-gap: var(--space-md);" description="Review the policy for use of this device before signing in.">
              <template #leading>
                <MIcon :icon="ScaleIcon" style="--color: var(--tone-primary);" size="32px" />
              </template>
              Usage Policy
            </MSectionHeader>

            <MScrollArea class="policy-content" fade-edges overscroll="contain">
              <p>{{ usagePolicy }}</p>
            </MScrollArea>
          </section>
        </MCard>

        <MCard class="sign-in-card">
          <form class="sign-in-form" @submit.prevent="submit">
            <MSectionHeader description="Sign in with your device credentials">Sign In</MSectionHeader>

            <MAlert v-if="submitted" tone="info">
              This is a component demo. No authentication request was sent.
            </MAlert>

            <div class="fields">
              <MTextField
                v-model="username"
                autocapitalize="none"
                autocomplete="username"
                label="Username"
                required
                spellcheck="false"
              >
                <template #leading>
                  <MIcon :icon="UserIcon" aria-hidden="true" />
                </template>
              </MTextField>

              <MPasswordField v-model="password" autocomplete="current-password" label="Password" required />
            </div>

            <MButton class="submit" type="submit">
              <MIcon :icon="LogInIcon" aria-hidden="true" />
              Sign in
            </MButton>
          </form>
        </MCard>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogInIcon, ScaleIcon, UserIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MPasswordField from '@/lib/components/fields/MPasswordField.vue'
import MTextField from '@/lib/components/fields/MTextField.vue'
import MScrollArea from '@/lib/components/layout/MScrollArea.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MCard from '@/lib/components/section/MCard.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import MAlert from '@/lib/components/status/MAlert.vue'
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
      radial-gradient(circle at 50% 15%, color-mix(in oklch, var(--tone-primary) 8%, transparent), transparent 40%),
      var(--bg);
  }

  .sign-in-panel {
    display: grid;
    gap: var(--space-xxl);
    inline-size: min(100%, 62rem);
  }

  .brand {
    display: grid;
    justify-items: center;
    gap: var(--space-lg);
    text-align: center;

    & > img {
      inline-size: min(13rem, 65%);
      block-size: auto;
    }
  }

  .product {
    display: grid;
    gap: var(--space-xs);

    & > strong {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    & > span {
      color: var(--text-color-dimmed);
      font-size: var(--font-size-sm);
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

  .sign-in-form,
  .policy {
    display: grid;
    gap: var(--space-xxl);
  }

  .heading {
    display: grid;
    gap: var(--space-xs);

    & > h1 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
    }

    & > p {
      color: var(--text-color-dimmed);
    }
  }

  .fields {
    display: grid;
    gap: var(--space-lg);
  }

  .submit {
    inline-size: 100%;
  }

  .policy-heading {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: var(--space-md);

    & > .icon {
      margin-block-start: 0.125rem;
    }

    & > div {
      display: grid;
      gap: var(--space-xs);
    }

    & h2 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    & p {
      color: var(--text-color-dimmed);
      font-size: var(--font-size-sm);
    }
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
