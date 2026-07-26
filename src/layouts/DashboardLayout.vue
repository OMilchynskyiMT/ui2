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

        <template #trailing>
          <MButton aria-label="Save & Restart" kind="caution" variant="tonal">
            <MIcon :icon="SaveCheckIcon" />
            <span class="u-hidden-below-lg">Save & Apply</span>
          </MButton>
          <MButton
            ref="commands-button"
            :aria-expanded="commandMenuOpened"
            aria-haspopup="menu"
            kind="neutral"
            variant="icon"
            @click="commandMenuOpened = true"
          >
            <MIcon :icon="SquareTerminalIcon" style="--color: var(--lime-600)" />
            <span class="u-hidden-below-lg">Commands</span>
          </MButton>
          <MButton
            ref="user-menu-button"
            :aria-expanded="userMenuOpened"
            aria-haspopup="menu"
            kind="neutral"
            variant="icon"
            @click="userMenuOpened = true"
          >
            <MUserAvatar size="1rem" style="--accent: var(--purple-500)" />
            <span class="u-hidden-below-lg">admin</span>
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
            :check-active="item => item.value.name === route.name || route.fullPath.startsWith(item.value.fullPath)"
            :items="menuOptions"
            :on-select="
              item => {
                router.push(item.value)
                mainMenuDialog?.close()
              }
            "
            :style="{ '--padding': isCompact ? 'var(--space-xs) var(--space-xl)' : null }"
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
        <img src="/images/MT-logo.svg" style="max-inline-size: 180px" />
        <template #trailing>
          <MButton class="close-button" kind="caution" variant="icon" @click="mainMenuDialog?.close()">
            <MIcon :icon="XIcon" />
          </MButton>
        </template>
      </MBar>
    </MDialog>

    <MPopup
      :anchor="commandsButton?.$el"
      :offset="10"
      :open="commandMenuOpened"
      placement="bottom-end"
      @close="commandMenuOpened = false"
    >
      <div class="menu commands">
        <MTreeMenu :items="commandsOptions" icon-size="1.15rem" />
      </div>
    </MPopup>

    <MPopup
      :anchor="userMenuButton?.$el"
      :offset="10"
      :open="userMenuOpened"
      placement="bottom-end"
      @close="userMenuOpened = false"
    >
      <div class="menu user">
        <MBar>
          <template #leading>
            <MUserAvatar size="2rem" />
          </template>

          <div class="user">
            <div class="username">admin</div>
            <div class="role">Administrator</div>
          </div>
        </MBar>
        <MTreeMenu :items="userMenuOptions" icon-size="1.15rem" />
      </div>
    </MPopup>
  </MAppShell>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import {
  CogIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PaletteIcon,
  RefreshCcwDotIcon,
  SaveCheckIcon,
  SaveIcon,
  SquareTerminalIcon,
  Undo2Icon,
  UserCog2Icon,
  UserKeyIcon,
  XIcon,
} from '@lucide/vue'
import { type RouteLocation, useRoute, useRouter } from 'vue-router'

import MBar from '@/components/bars/MBar.vue'
import MTopBar from '@/components/bars/MTopBar.vue'
import MButton from '@/components/buttons/MButton.vue'
import MDialog, { type Exposed as DialogExposed } from '@/components/dialog/MDialog.vue'
import MAppShell from '@/components/MAppShell.vue'
import MTreeMenu, { type MTreeMenuItem } from '@/components/menu/MTreeMenu.vue'
import MIcon from '@/components/MIcon.vue'
import MUserAvatar from '@/components/MUserAvatar.vue'
import MPopup from '@/components/popup/MPopup.vue'

import { remToPixels, useViewportSizeListener } from '@/composables/useViewportSizeListener'
import { containerTokens } from '@/postcss/containerTokens'

const router = useRouter()
const route = useRoute()
const mainMenuDialog = useTemplateRef<DialogExposed>('mainMenuDialog')
const isCompact = ref(true)
const commandsButton = useTemplateRef('commands-button')
const commandMenuOpened = ref(false)
const userMenuButton = useTemplateRef('user-menu-button')
const userMenuOpened = ref(false)
let stopResizeSubscription: (() => void) | undefined

const menuOptions: MTreeMenuItem<RouteLocation>[] = [
  { title: 'Dashboard', icon: LayoutDashboardIcon, value: router.resolve({ name: 'dashboard' }) },
  {
    title: 'Setup',
    icon: CogIcon,
    value: router.resolve({ name: 'setup' }),
    children: [
      { title: 'WAN', value: router.resolve({ name: 'wan' }) },
      { title: 'DHCP', value: router.resolve({ name: 'dhcp' }) },
      { title: 'SMTP', value: router.resolve({ name: 'smtp' }) },
    ],
  },
  {
    title: 'Administration',
    icon: UserCog2Icon,
    value: router.resolve({ name: 'administration' }),
    children: [
      { title: 'Debug Options', value: router.resolve({ name: 'debug-options' }) },
      { title: 'Usage Policy', value: router.resolve({ name: 'usage-policy' }) },
    ],
  },
]

const userMenuOptions: MTreeMenuItem<string>[] = [
  { title: 'Change password', icon: UserKeyIcon, value: 'change-password' },
  { title: 'Switch color scheme', icon: PaletteIcon, value: 'switch-color-scheme' },
  { title: 'Logout', icon: LogOutIcon, value: 'logout' },
]

const commandsOptions: MTreeMenuItem<string>[] = [
  { title: 'Save changes', icon: SaveIcon, value: 'save' },
  { title: 'Revert changes', icon: Undo2Icon, value: 'revert' },
  { title: 'Restart device', icon: RefreshCcwDotIcon, value: 'restart' },
  { title: 'Restart LoRa services', icon: RefreshCcwDotIcon, value: 'restart-lora' },
  { title: 'Restart BACnet services', icon: RefreshCcwDotIcon, value: 'restart-bacnet' },
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
  grid-template-columns: 1fr;
  gap: var(--space-xxl);
  min-height: 100%;
  padding: var(--space-xxl);

  & > aside {
    width: min(25vw, 22rem);
  }
}

@media (width >= container-token(--container-md)) {
  .content {
    grid-template-columns: auto minmax(0, 1fr);
  }
}

.menu {
  background-color: var(--surface-bg);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: grid;
  gap: var(--space-md);

  & > .bar {
    --sections-gap: 1rem;
  }

  .username {
    font-weight: var(--font-weight-bold);
  }

  .role {
    font-size: var(--font-size-sm);
    color: var(--gray-500);
  }

  &.commands > .tree-menu {
    --icon-color: var(--lime-600);
  }

  &.user > .tree-menu {
    --icon-color: var(--blue-500);
  }
}
</style>