<template>
  <Shell>
    <template #header>
      <TopBar>
        <template #leading>
          <UiButton
            aria-label="Open navigation"
            class="u-hidden-above-md"
            style="--padding-inline: 0.5rem"
            tone="neutral"
            variant="text"
            @click="mainMenuDialog?.show()"
          >
            <UiIcon :icon="MenuIcon" style="--color: var(--blue-500)" />
          </UiButton>
        </template>

        <template #trailing>
          <UiButton aria-label="Save & Restart" tone="danger" variant="tonal" @click="saveAndApplyConfirm?.confirm">
            <UiIcon :icon="SaveCheckIcon" />
            <span class="u-hidden-below-lg">Save & Apply</span>
          </UiButton>

          <UiMenuButton
            :items="commandsOptions"
            :menu-style="{ '--menu-icon-color': 'var(--lime-600)' }"
            :offset="10"
            aria-label="Commands"
            menu-aria-label="Commands"
            placement="bottom-end"
            tone="neutral"
            variant="text"
          >
            <UiIcon :icon="SquareTerminalIcon" style="--color: var(--lime-600)" />
            <span class="u-hidden-below-lg">Commands</span>
          </UiMenuButton>

          <UiMenuButton
            :items="userMenuOptions"
            :menu-style="{ '--menu-icon-color': 'var(--blue-500)' }"
            :offset="10"
            aria-label="User actions"
            menu-aria-label="User actions"
            placement="bottom-end"
            tone="neutral"
            variant="text"
            @select="userMenuHandler($event.value)"
          >
            <UserAvatar size="1rem" style="--accent: var(--purple-500)" />
            <span class="u-hidden-below-lg">admin</span>

            <template #menu-header>
              <UiBar style="--sections-gap: 1rem">
                <template #leading>
                  <UserAvatar :style="{ '--accent': 'var(--purple-500)' }" size="2rem" />
                </template>

                <div class="user">
                  <div class="username">admin</div>
                  <div class="role">Administrator</div>
                </div>
              </UiBar>
            </template>
          </UiMenuButton>
        </template>
      </TopBar>
    </template>

    <template #footer>
      <div class="footer-inner">
        <div class="links">
          <a href="#">Help</a>
          <a href="#">About</a>
          <a href="#">Contact Us</a>
        </div>
        <div class="copyright">&copy; 1995-2026 <a href="#">mt prototype</a>.</div>
      </div>
    </template>

    <div class="content">
      <aside aria-label="Main navigation" class="u-hidden-below-md">
        <Teleport :disabled="!isCompact" defer to="#compact-navigation-content">
          <NavigationTree
            :class="{ 'compact-navigation-tree': isCompact }"
            :items="navigationOptions"
            @navigate="mainMenuDialog?.close()"
          />
        </Teleport>
      </aside>

      <main>
        <UiBreadcrumbs :items="breadcrumbs">
          <template #item="{ current, item }">
            <span v-if="current" aria-current="page">{{ item.label }}</span>
            <RouterLink v-else-if="item.target" :to="item.target">{{ item.label }}</RouterLink>
            <a v-else-if="item.href" :href="item.href">{{ item.label }}</a>
            <span v-else>{{ item.label }}</span>
          </template>
        </UiBreadcrumbs>

        <RouterView />
      </main>
    </div>

    <UiDialog id="compact-navigation" ref="mainMenuDialog" aria-label="Main navigation" fullscreen>
      <div class="compact-navigation">
        <UiBar class="compact-navigation-header">
          <img v-if="resolvedScheme === 'light'" alt="MultiTech" src="/images/MT-logo.svg" width="180" />
          <img v-else alt="MultiTech" src="/images/MT-logo-light.svg" width="180" />
          <template #trailing>
            <UiButton
              aria-label="Close navigation"
              class="close-button"
              tone="danger"
              variant="icon"
              @click="mainMenuDialog?.close()"
            >
              <UiIcon :icon="XIcon" />
            </UiButton>
          </template>
        </UiBar>

        <UiScrollArea class="compact-navigation-scroll" fade-edges>
          <div id="compact-navigation-content" />
        </UiScrollArea>
      </div>
    </UiDialog>

    <UiConfirmDialog ref="saveAndApplyConfirm">
      Current configuration will be saved and applied. Continue?
    </UiConfirmDialog>
  </Shell>
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

import UiBar from '@/lib/components/bars/UiBar.vue'
import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiConfirmDialog, { type Exposed as ConfirmExposed } from '@/lib/components/dialog/UiConfirmDialog.vue'
import UiDialog, { type Exposed as DialogExposed } from '@/lib/components/dialog/UiDialog.vue'
import UiScrollArea from '@/lib/components/layout/UiScrollArea.vue'
import type { UiMenuItem } from '@/lib/components/menu/UiMenu.vue'
import UiMenuButton from '@/lib/components/menu/UiMenuButton.vue'
import UiBreadcrumbs from '@/lib/components/navigation/UiBreadcrumbs.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import Shell from '@/components/application/AppShell.vue'
import TopBar from '@/components/bars/TopBar.vue'
import NavigationTree, { type NavigationTreeItem } from '@/components/navigation/NavigationTree.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'
import { useColorScheme } from '@/composables/useColorScheme'
import { remToPixels, useViewportSizeListener } from '@/composables/useViewportSizeListener'
import { containerTokens } from '@/postcss/containerTokens'

const mainMenuDialog = useTemplateRef<DialogExposed>('mainMenuDialog')
const isCompact = ref(true)
const saveAndApplyConfirm = useTemplateRef<ConfirmExposed>('saveAndApplyConfirm')
let stopResizeSubscription: (() => void) | undefined

const { toggleScheme, scheme: resolvedScheme } = useColorScheme()
const { breadcrumbs } = useBreadcrumbs()

const navigationOptions: NavigationTreeItem[] = [
  { title: 'Dashboard', icon: LayoutDashboardIcon, to: { name: 'dashboard' } },
  {
    title: 'Setup',
    icon: CogIcon,
    children: [
      { title: 'WAN', to: { name: 'wan' } },
      { title: 'DHCP', to: { name: 'dhcp' } },
      { title: 'SMTP', to: { name: 'smtp' } },
    ],
  },
  {
    title: 'Administration',
    icon: UserCog2Icon,
    children: [
      { title: 'Debug Options', to: { name: 'debug-options' } },
      { title: 'Usage Policy', to: { name: 'usage-policy' } },
    ],
  },
]

const userMenuOptions: UiMenuItem<string>[] = [
  { title: 'Change password', icon: UserKeyIcon, value: 'change-password' },
  { title: 'Switch color scheme', icon: PaletteIcon, value: 'switch-color-scheme' },
  { title: 'Logout', icon: LogOutIcon, value: 'logout' },
]

const commandsOptions: UiMenuItem<string>[] = [
  { title: 'Save changes', icon: SaveIcon, value: 'save' },
  { title: 'Revert changes', icon: Undo2Icon, value: 'revert' },
  { title: 'Restart device', icon: RefreshCcwDotIcon, value: 'restart' },
  { title: 'Restart LoRa services', icon: RefreshCcwDotIcon, value: 'restart-lora' },
  { title: 'Restart BACnet services', icon: RefreshCcwDotIcon, value: 'restart-bacnet' },
]

const userMenuHandler = (value: string): void => {
  if (value !== 'switch-color-scheme') return
  toggleScheme()
}

onMounted(() => {
  stopResizeSubscription = useViewportSizeListener(({ width }) => {
    isCompact.value = width < remToPixels(Number.parseInt(containerTokens['--container-md']))
    if (!isCompact.value && mainMenuDialog.value?.isVisible()) {
      mainMenuDialog.value.close()
    }
  })
})

onBeforeUnmount(() => {
  stopResizeSubscription?.()
})
</script>

<style scoped>
.footer-inner {
  padding-inline-start: var(--safe-area-left);
  padding-inline-end: var(--safe-area-right);
  padding-block-end: var(--safe-area-bottom);
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
  padding-block-start: var(--space-xxl);
  padding-block-end: var(--space-xxl);
  padding-inline-start: max(var(--space-xxl), var(--safe-area-left));
  padding-inline-end: max(var(--space-xxl), var(--safe-area-right));

  & > aside {
    width: min(25vw, 22rem);
  }

  & > main {
    min-inline-size: 0;
    display: grid;
    align-content: start;
    gap: var(--space-lg);
  }
}

@media (width >= container-token(--container-md)) {
  .content {
    grid-template-columns: auto minmax(0, 1fr);
  }
}

.compact-navigation-header {
  --padding-block-start: max(var(--space-md), var(--safe-area-top));
  --padding-block-end: var(--space-md);
  --padding-inline-start: max(var(--space-md), var(--safe-area-left));
  --padding-inline-end: max(var(--space-md), var(--safe-area-right));
}

.compact-navigation-tree {
  --padding: var(--space-xs) max(var(--space-xl), var(--safe-area-right)) max(var(--space-xl), var(--safe-area-bottom))
    max(var(--space-xl), var(--safe-area-left));
}

.compact-navigation {
  min-block-size: 0;
  block-size: 100%;
  display: flex;
  flex-direction: column;
  overflow: clip;

  & > .compact-navigation-scroll {
    min-block-size: 0;
    flex: 1 1 auto;
    --scroll-area-fade-color: var(--dialog-bg, var(--bg));
  }
}

.user {
  .username {
    font-weight: var(--font-weight-bold);
  }

  .role {
    font-size: var(--font-size-sm);
    color: var(--gray-500);
  }
}
</style>
