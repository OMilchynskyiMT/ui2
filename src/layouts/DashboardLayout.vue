<template>
  <MAppShell>
    <template #header>
      <MTopBar>
        <template #leading>
          <MButton
            aria-label="Open navigation"
            class="u-hidden-above-md"
            kind="neutral"
            style="--padding-inline: 0.5rem"
            variant="text"
            @click="mainMenuDialog?.show()"
          >
            <MIcon :icon="MenuIcon" style="--color: var(--blue-500)" />
          </MButton>
        </template>
      </MTopBar>
    </template>

    <template #footer>
      <div class="footer-inner">
        <div class="links">
          <a href="#">Help</a>
          <a href="#">About</a>
          <a href="#">Contact Us</a>
        </div>
        <div class="copyright">&copy; 1995-2026 <a href="#">Multi-Tech Systems, Inc</a>.</div>
      </div>
    </template>

    <div class="content">
      <aside aria-label="Main navigation" class="u-hidden-below-md">
        <Teleport :disabled="!isCompact" defer to="#compact-navigation > .surface">
          <MTreeMenu
            :check-active="item => item.title === 'WAN'"
            :items="menuOptions2"
            :style="{ '--padding': isCompact ? 'var(--space-xl)' : null }"
          />
        </Teleport>
      </aside>

      <main><RouterView /></main>
    </div>

    <MDialog
      id="compact-navigation"
      ref="mainMenuDialog"
      aria-label="Main navigation"
      style="--dialog-width: 100%; --dialog-height: 100%; --outer-gap: 0"
    >
      <MBar style="--padding-inline: var(--space-md); --padding-block: var(--space-md)">
        <h2>Menu</h2>
        <template #trailing>
          <MButton class="close-button" kind="caution" variant="icon" @click.prevent="mainMenuDialog?.close()">
            <MIcon :icon="XIcon" />
          </MButton>
        </template>
      </MBar>
    </MDialog>
  </MAppShell>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { CogIcon, LayoutDashboardIcon, MenuIcon, UserCog2Icon, XIcon } from '@lucide/vue'
import { useRouter } from 'vue-router'

import MBar from '@/components/bars/MBar.vue'
import MTopBar from '@/components/bars/MTopBar.vue'
import MButton from '@/components/buttons/MButton.vue'
import MDialog, { type Exposed as DialogExposed } from '@/components/dialog/MDialog.vue'
import MAppShell from '@/components/MAppShell.vue'
import MTreeMenu, { type MTreeMenuItem } from '@/components/menu/MTreeMenu.vue'
import MIcon from '@/components/MIcon.vue'

import { remToPixels, useViewportSizeListener } from '@/composables/useViewportSizeListener'
import { containerTokens } from '@/postcss/containerTokens'

const router = useRouter()
const mainMenuDialog = useTemplateRef<DialogExposed>('mainMenuDialog')
const isCompact = ref(true)
let stopResizeSubscription: (() => void) | undefined

const menuOptions2: MTreeMenuItem<unknown>[] = [
  { title: 'Dashboard', icon: LayoutDashboardIcon, value: router.resolve({ name: '' }) },
  {
    title: 'Setup',
    icon: CogIcon,
    value: undefined,
    children: [
      { title: 'WAN', value: router.resolve({ name: '' }) },
      { title: 'DHCP', value: router.resolve({ name: '' }) },
      { title: 'SMTP', value: router.resolve({ name: '' }) },
    ],
  },
  {
    title: 'Administration',
    icon: UserCog2Icon,
    value: undefined,
    children: [
      { title: 'Debug Options', value: router.resolve({ name: '' }) },
      { title: 'Usage Policy', value: router.resolve({ name: '' }) },
    ],
  },
]

onMounted(() => {
  stopResizeSubscription = useViewportSizeListener(({ width }) => {
    isCompact.value = width < remToPixels(Number.parseInt(containerTokens['--container-md']))
    if (!isCompact.value && mainMenuDialog.value?.isVisible()) {
      mainMenuDialog.value?.close()
    }
  })
})
onBeforeUnmount(() => {
  stopResizeSubscription?.()
})
</script>

<style scoped>
.footer-inner {
  font-size: var(--font-size-sm);

  & > div.copyright {
    text-align: center;
    color: var(--gray-500);
  }

  & > div.links {
    display: flex;
    justify-content: center;
    gap: var(--space-md);
  }
}

.content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-xxl);
  min-height: 100%;
  padding: var(--space-xxl);

  & > aside {
    width: min(25vw, 22rem);
  }
}
</style>