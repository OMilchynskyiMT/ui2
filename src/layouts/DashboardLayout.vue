<template>
  <div
    :class="[
      'dashboard-layout',
      {
        hidden: !desktopNavigationVisible,
        'mobile-open': mobileNavigationOpen,
      },
    ]"
  >
    <nav
      id="main-navigation"
      :inert="!navigationVisible || undefined"
      aria-label="Main navigation"
      class="panel"
      @keydown.esc.stop="closeCompactNavigation(true)"
    >
      <div class="header">
        <img v-if="resolvedScheme === 'light'" alt="MultiTech" src="/images/MT-logo.svg" width="180" />
        <img v-else alt="MultiTech" src="/images/MT-logo-light.svg" width="180" />

        <UiButton
          id="navigation-close"
          :icon="XIcon"
          aria-label="Close navigation"
          class="u-hidden-above-lg close"
          layout="icon"
          tone="neutral"
          variant="text"
          @click="closeCompactNavigation(true)"
        />
      </div>

      <UiScrollArea class="scroll" fade-edges overscroll="contain">
        <NavigationTree :items="navigationOptions" class="tree" @navigate="closeCompactNavigation(true)" />
      </UiScrollArea>
    </nav>

    <button aria-hidden="true" class="backdrop" tabindex="-1" type="button" @click="closeCompactNavigation(true)" />

    <Shell :inert="(isCompact && mobileNavigationOpen) || undefined" class="page-shell">
      <template #header>
        <TopBar>
          <template #leading>
            <UiButton
              id="navigation-toggle"
              :aria-expanded="navigationVisible"
              :aria-label="navigationVisible ? 'Hide navigation' : 'Show navigation'"
              :icon="MenuIcon"
              aria-controls="main-navigation"
              style="--padding-inline: 0.5rem"
              tone="neutral"
              variant="text"
              @click="toggleNavigation"
            />
          </template>

          <template #trailing>
            <UiButton
              :icon="SaveCheckIcon"
              aria-label="Save & Restart"
              layout="adaptive"
              title="Save and Apply"
              tone="danger"
              variant="tonal"
              @click="saveAndApplyConfirm?.confirm"
            >
              Save & Apply
            </UiButton>

            <UiMenuButton
              :icon="TerminalIcon"
              :items="commandsOptions"
              :menu-style="{ '--menu-icon-color': 'var(--green-600)' }"
              :offset="10"
              aria-label="Commands"
              layout="adaptive"
              menu-aria-label="Commands"
              placement="bottom-end"
              title="Commands"
              tone="success"
              variant="text"
            >
              Commands
            </UiMenuButton>

            <UiMenuButton
              :icon="UserIcon"
              :items="userMenuOptions"
              :menu-style="{ '--menu-icon-color': 'var(--blue-500)' }"
              :offset="10"
              aria-label="User actions"
              layout="adaptive"
              menu-aria-label="User actions"
              placement="bottom-end"
              style="--icon-color: var(--tone-primary)"
              title="User actions"
              tone="neutral"
              variant="text"
              @select="userMenuHandler($event.value)"
            >
              <strong>admin</strong>

              <template #menu-header>
                <UiBar style="--sections-gap: 1rem">
                  <template #leading>
                    <UiAvatar :style="{ '--accent': 'var(--purple-500)' }" size="2rem" />
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

        <UiBreadcrumbs :items="breadcrumbs" class="page-breadcrumbs">
          <template #leading>
            <RouterLink :to="{ name: 'home' }"><UiIcon :icon="HomeIcon" size="1em" /></RouterLink>
          </template>
          <template #item="{ current, item }">
            <span v-if="current" aria-current="page">{{ item.label }}</span>
            <RouterLink v-else-if="item.target" :to="item.target">{{ item.label }}</RouterLink>
            <a v-else-if="item.href" :href="item.href">{{ item.label }}</a>
            <span v-else>{{ item.label }}</span>
          </template>
        </UiBreadcrumbs>
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
        <main><RouterView /></main>
      </div>

      <UiConfirmDialog ref="saveAndApplyConfirm">
        Current configuration will be saved and applied. Continue?
      </UiConfirmDialog>
    </Shell>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import {
  CogIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PaletteIcon,
  RefreshCcwDotIcon,
  SaveCheckIcon,
  SaveIcon,
  TerminalIcon,
  Undo2Icon,
  UserCog2Icon,
  UserIcon,
  UserKeyIcon,
  XIcon,
} from '@lucide/vue'

import UiBar from '@/lib/components/bars/UiBar.vue'
import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiConfirmDialog, { type Exposed as ConfirmExposed } from '@/lib/components/dialog/UiConfirmDialog.vue'
import UiScrollArea from '@/lib/components/layout/UiScrollArea.vue'
import type { UiMenuItem } from '@/lib/components/menu/UiMenu.vue'
import UiMenuButton from '@/lib/components/menu/UiMenuButton.vue'
import UiBreadcrumbs from '@/lib/components/navigation/UiBreadcrumbs.vue'
import UiAvatar from '@/lib/components/UiAvatar.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import Shell from '@/components/application/AppShell.vue'
import TopBar from '@/components/bars/TopBar.vue'
import NavigationTree, { type NavigationTreeItem } from '@/components/navigation/NavigationTree.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'
import { useColorScheme } from '@/composables/useColorScheme'
import { getViewportSize, remToPixels, useViewportSizeListener } from '@/composables/useViewportSizeListener'
import { containerTokens } from '@/postcss/containerTokens'

const compactBreakpoint = (): number => remToPixels(Number.parseInt(containerTokens['--container-lg']))

const isCompact = ref(getViewportSize().width < compactBreakpoint())
const desktopNavigationVisible = ref(true)
const mobileNavigationOpen = ref(false)
const saveAndApplyConfirm = useTemplateRef<ConfirmExposed>('saveAndApplyConfirm')
let stopResizeSubscription: (() => void) | undefined

const { toggleScheme, scheme: resolvedScheme } = useColorScheme()
const { breadcrumbs } = useBreadcrumbs()

const navigationVisible = computed(() => {
  return isCompact.value ? mobileNavigationOpen.value : desktopNavigationVisible.value
})

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

const focusNavigationButton = (selector: string): void => {
  const button = document.querySelector<HTMLButtonElement>(selector)
  button?.focus({ preventScroll: true })
}

const closeCompactNavigation = (shouldRestoreFocus: boolean): void => {
  if (!isCompact.value || !mobileNavigationOpen.value) return

  mobileNavigationOpen.value = false
  if (shouldRestoreFocus) void nextTick(() => focusNavigationButton('#navigation-toggle'))
}

const toggleNavigation = (): void => {
  if (isCompact.value) {
    mobileNavigationOpen.value = !mobileNavigationOpen.value
    if (mobileNavigationOpen.value) {
      void nextTick(() => focusNavigationButton('#navigation-close'))
    }
    return
  }

  desktopNavigationVisible.value = !desktopNavigationVisible.value
}

const userMenuHandler = (value: string): void => {
  if (value !== 'switch-color-scheme') return
  toggleScheme()
}

onMounted(() => {
  stopResizeSubscription = useViewportSizeListener(({ width }) => {
    const isCompact_ = width < compactBreakpoint()
    if (isCompact_ !== isCompact.value) mobileNavigationOpen.value = false
    isCompact.value = isCompact_
  })
})

onBeforeUnmount(() => {
  stopResizeSubscription?.()
})
</script>

<style scoped>
.dashboard-layout {
  --navigation-width: 18rem;
  --navigation-column-width: var(--navigation-width);

  min-block-size: 100dvh;
  display: grid;
  grid-template-columns: var(--navigation-column-width) minmax(0, 1fr);

  transition: grid-template-columns var(--duration-lg) var(--bezier-smooth);

  &.hidden {
    --navigation-column-width: 0px;
  }

  & > .page-shell {
    min-inline-size: 0;
  }
}

.page-breadcrumbs {
  font-size: var(--font-size-xs);
  background-color: oklch(from var(--surface-bg) l c h / 0.5);
  padding-inline: var(--space-sm);
  padding-block: var(--space-xxs);
  color: var(--text-color-dimmed);
}

.panel {
  position: sticky;
  z-index: 2;
  inset-block-start: 0;
  align-self: start;
  min-inline-size: 0;
  inline-size: var(--navigation-width);
  block-size: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: clip;
  border-inline-end: 1px solid var(--divider-color);
  background: var(--surface-bg);

  transition-property: transform;
  transition-duration: var(--duration-lg);
  transition-timing-function: var(--bezier-smooth);

  & > .header {
    min-block-size: calc(3rem + var(--safe-area-top));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding-block-start: var(--safe-area-top);
    padding-inline-start: max(var(--space-lg), var(--safe-area-left));
    padding-inline-end: var(--space-lg);

    & > img {
      min-inline-size: 0;
      max-inline-size: 100%;
      block-size: auto;
    }

    & > .info {
      font-size: var(--font-size-sm);
    }

    & > .close {
      position: absolute;
      right: 0.5rem;
    }
  }

  & > .scroll {
    --scroll-area-fade-color: var(--bg);

    min-block-size: 0;
  }

  .tree {
    --padding: var(--space-xl) var(--space-xl) max(var(--space-xl), var(--safe-area-bottom))
      max(var(--space-xl), var(--safe-area-left));
  }
}

.dashboard-layout.hidden > .panel {
  transform: translateX(-100%);
}

.backdrop {
  display: none;
}

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
  min-block-size: 100%;
  padding-block-start: var(--space-xl);
  padding-block-end: var(--space-xxl);
  padding-inline-start: max(var(--space-xxl), var(--safe-area-left));
  padding-inline-end: max(var(--space-xxl), var(--safe-area-right));

  & > main {
    min-inline-size: 0;
    display: grid;
    align-content: start;
    gap: var(--space-lg);
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

@media (width < container-token(--container-lg)) {
  :global(html:has(.dashboard-layout.mobile-open)) {
    overflow: hidden;
  }

  .dashboard-layout {
    display: block;

    & > .panel {
      position: fixed;
      z-index: 30;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: min(22rem, calc(100vi - var(--space-xxl)));
      max-inline-size: 100%;
      border-inline-end: 0;
      border-start-end-radius: var(--radius-xl);
      border-end-end-radius: var(--radius-xl);
      background: var(--surface-bg);
      transform: translate3d(-100%, 0, 0);
      box-shadow: var(--shadow-xl);
      will-change: transform;
    }

    &.mobile-open > .panel {
      transform: translate3d(0, 0, 0);
    }

    & > .backdrop {
      position: fixed;
      z-index: 20;
      inset: 0;
      display: block;
      border: 0;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      backdrop-filter: blur(var(--blur-size-sm)) grayscale(33%);

      transition-property: opacity, visibility;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-smooth);
    }

    &.mobile-open > .backdrop {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }

  .panel {
    & > .header {
      padding-inline-end: max(var(--space-md), var(--safe-area-right));
    }

    & > .scroll {
      --scroll-area-fade-color: var(--surface-bg);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-layout,
  .panel,
  .backdrop {
    transition: none;
  }
}
</style>
