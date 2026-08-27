<template>
  <MShell>
    <template #header>
      <MTopBar>
        <template #leading>
          <MButton
            aria-label="Open navigation"
            class="u-hidden-above-md"
            style="--padding-inline: 0.5rem"
            tone="neutral"
            variant="text"
            @click="mainMenuDialog?.show()"
          >
            <MIcon :icon="MenuIcon" style="--color: var(--blue-500)" />
          </MButton>
        </template>

        <template #trailing>
          <MButton aria-label="Save & Restart" tone="danger" variant="tonal" @click="saveAndApplyConfirm?.confirm">
            <MIcon :icon="SaveCheckIcon" />
            <span class="u-hidden-below-lg">Save & Apply</span>
          </MButton>

          <MMenuButton
            :items="commandsOptions"
            :menu-style="{ '--menu-icon-color': 'var(--lime-600)' }"
            :offset="10"
            menu-aria-label="Commands"
            placement="bottom-end"
            tone="neutral"
            variant="icon"
          >
            <MIcon :icon="SquareTerminalIcon" style="--color: var(--lime-600)" />
            <span class="u-hidden-below-lg">Commands</span>
          </MMenuButton>

          <MMenuButton
            :items="userMenuOptions"
            :menu-style="{ '--menu-icon-color': 'var(--blue-500)' }"
            :offset="10"
            menu-aria-label="User actions"
            placement="bottom-end"
            tone="neutral"
            variant="icon"
            @select="userMenuHandler($event.value)"
          >
            <MUserAvatar size="1rem" style="--accent: var(--purple-500)" />
            <span class="u-hidden-below-lg">admin</span>

            <template #menu-header>
              <MBar style="--sections-gap: 1rem">
                <template #leading>
                  <MUserAvatar :style="{ '--accent': 'var(--purple-500)' }" size="2rem" />
                </template>

                <div class="user">
                  <div class="username">admin</div>
                  <div class="role">Administrator</div>
                </div>
              </MBar>
            </template>
          </MMenuButton>
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
        <div class="copyright">&copy; 1995-2026 <a href="#">mt prototype</a>.</div>
      </div>
    </template>

    <div class="content">
      <aside aria-label="Main navigation" class="u-hidden-below-md">
        <Teleport :disabled="!isCompact" defer to="#compact-navigation-content">
          <MNavigationTree
            :class="{ 'compact-navigation-tree': isCompact }"
            :items="navigationOptions"
            @navigate="mainMenuDialog?.close()"
          />
        </Teleport>
      </aside>

      <main><RouterView /></main>
    </div>

    <MDialog id="compact-navigation" ref="mainMenuDialog" aria-label="Main navigation" fullscreen>
      <div class="compact-navigation">
        <MBar class="compact-navigation-header">
          <img v-if="resolvedScheme === 'light'" src="/images/MT-logo.svg" width="180" />
          <img v-else src="/images/MT-logo-light.svg" width="180" />
          <template #trailing>
            <MButton class="close-button" tone="danger" variant="icon" @click="mainMenuDialog?.close()">
              <MIcon :icon="XIcon" />
            </MButton>
          </template>
        </MBar>

        <MScrollArea class="compact-navigation-scroll" fade-edges>
          <div id="compact-navigation-content" />
        </MScrollArea>
      </div>
    </MDialog>

    <MConfirmDialog ref="saveAndApplyConfirm">
      Current configuration will be saved and applied. Continue?
    </MConfirmDialog>
  </MShell>
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

import MBar from '@/lib/components/bars/MBar.vue'
import MButton from '@/lib/components/buttons/MButton.vue'
import MConfirmDialog, { type Exposed as ConfirmExposed } from '@/lib/components/dialog/MConfirmDialog.vue'
import MDialog, { type Exposed as DialogExposed } from '@/lib/components/dialog/MDialog.vue'
import MScrollArea from '@/lib/components/layout/MScrollArea.vue'
import type { MMenuItem } from '@/lib/components/menu/MMenu.vue'
import MMenuButton from '@/lib/components/menu/MMenuButton.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MShell from '@/components/application/MShell.vue'
import MTopBar from '@/components/bars/MTopBar.vue'
import MUserAvatar from '@/components/MUserAvatar.vue'
import MNavigationTree, { type MNavigationTreeItem } from '@/components/navigation/MNavigationTree.vue'
import { useColorScheme } from '@/composables/useColorScheme'
import { remToPixels, useViewportSizeListener } from '@/composables/useViewportSizeListener'
import { containerTokens } from '@/postcss/containerTokens'

const mainMenuDialog = useTemplateRef<DialogExposed>('mainMenuDialog')
const isCompact = ref(true)
const saveAndApplyConfirm = useTemplateRef<ConfirmExposed>('saveAndApplyConfirm')
let stopResizeSubscription: (() => void) | undefined

const { toggleScheme, scheme: resolvedScheme } = useColorScheme()

const navigationOptions: MNavigationTreeItem[] = [
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

const userMenuOptions: MMenuItem<string>[] = [
  { title: 'Change password', icon: UserKeyIcon, value: 'change-password' },
  { title: 'Switch color scheme', icon: PaletteIcon, value: 'switch-color-scheme' },
  { title: 'Logout', icon: LogOutIcon, value: 'logout' },
]

const commandsOptions: MMenuItem<string>[] = [
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
