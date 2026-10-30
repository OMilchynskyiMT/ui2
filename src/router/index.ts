import { createRouter, createWebHashHistory, type Router, type RouterOptions } from 'vue-router'

import { applyPageMetadata } from '@/composables/usePageMeta'

import { installAccessGuard } from './access'

const routes: RouterOptions['routes'] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/layouts/DashboardLayout.vue'),
    redirect: { name: 'dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/MainView.vue'),
        meta: {
          title: 'Dashboard',
        },
      },
      {
        path: 'setup',
        name: 'setup',
        meta: { title: 'Setup', breadcrumb: { to: false } },
        children: [
          {
            path: 'wan',
            name: 'wan',
            component: () => import('@/views/dashboard/WanView.vue'),
            meta: { title: 'WAN' },
          },
          {
            path: 'dhcp',
            name: 'dhcp',
            component: () => import('@/views/dashboard/dhcp/BaseView.vue'),
            redirect: { name: 'dhcp-config' },
            meta: { title: 'DHCP' },
            children: [
              {
                path: 'configuration',
                name: 'dhcp-config',
                component: () => import('@/views/dashboard/dhcp/ConfigView.vue'),
                meta: { breadcrumb: 'Configuration', title: 'DHCP Configuration' },
              },
              {
                path: 'new-ipv4',
                name: 'dhcp-add',
                component: () => import('@/views/dashboard/dhcp/AddIpv4View.vue'),
                meta: { breadcrumb: 'New IPv4', title: 'Add IPv4 DHCP Server' },
              },
              {
                path: 'new-ipv6',
                name: 'dhcp-add-v6',
                component: () => import('@/views/dashboard/dhcp/AddIpv6View.vue'),
                meta: { breadcrumb: 'New IPv6', title: 'Add DHCPv6/RA' },
              },
            ],
          },
          {
            path: 'smtp',
            name: 'smtp',
            component: () => import('@/views/dashboard/smtp/BaseView.vue'),
            redirect: { name: 'smtp-settings' },
            meta: { title: 'SMTP' },
            children: [
              {
                path: 'configuration',
                name: 'smtp-settings',
                component: () => import('@/views/dashboard/smtp/SettingsView.vue'),
                meta: { breadcrumb: 'Configuration', title: 'SMTP Configuration' },
              },
              {
                path: 'log',
                name: 'smtp-log',
                component: () => import('@/views/dashboard/smtp/LogView.vue'),
                meta: { breadcrumb: 'Log', title: 'Mail Log' },
              },
            ],
          },
        ],
      },
      {
        path: 'administration',
        name: 'administration',
        meta: { title: 'Administration', breadcrumb: { to: false } },
        children: [
          {
            path: 'debug-options',
            name: 'debug-options',
            component: () => import('@/views/dashboard/DebugOptionsView.vue'),
            meta: { title: 'Debug Options' },
          },
          {
            path: 'usage-policy',
            name: 'usage-policy',
            component: () => import('@/views/dashboard/UsagePolicyView.vue'),
            meta: { title: 'Usage Policy' },
          },
        ],
      },
    ],
  },
  {
    path: '/access-denied',
    name: 'access-denied',
    component: () => import('@/views/AccessIssueView.vue'),
    props: {
      title: 'Access denied',
      message: 'The current session does not have permission to view this page.',
    },
    meta: { title: 'Access denied' },
  },
  {
    path: '/feature-unavailable',
    name: 'feature-unavailable',
    component: () => import('@/views/AccessIssueView.vue'),
    props: {
      title: 'Feature unavailable',
      message: 'This feature is not supported by the device, or its capabilities could not be retrieved.',
    },
    meta: { title: 'Feature unavailable' },
  },
  {
    path: '/features',
    component: () => import('@/layouts/BaseLayout.vue'),
    meta: { title: 'Features' },
    children: [
      {
        path: '',
        component: () => import('@/views/TestView.vue'),
        redirect: { name: 'inputs' },
        children: [
          {
            path: 'inputs',
            name: 'inputs',
            component: () => import('@/views/features/InputsView.vue'),
            meta: { title: 'Inputs' },
          },
          {
            path: 'sign-in',
            name: 'sign-in',
            component: () => import('@/views/features/SignInView.vue'),
            meta: { title: 'Sign in' },
          },
          {
            path: 'spinners',
            name: 'spinners',
            component: () => import('@/views/features/SpinnersView.vue'),
            meta: { title: 'Spinners' },
          },
          {
            path: 'buttons',
            name: 'buttons',
            component: () => import('@/views/features/ButtonsView.vue'),
            meta: { title: 'Buttons' },
          },
          {
            path: 'lists',
            name: 'lists',
            component: () => import('@/views/features/ListsView.vue'),
            meta: { title: 'Lists' },
          },
          {
            path: 'chips',
            name: 'chips',
            component: () => import('@/views/features/ChipsView.vue'),
            meta: { title: 'Chips' },
          },
          {
            path: 'dialogs',
            name: 'dialogs',
            component: () => import('@/views/features/DialogsView.vue'),
            meta: { title: 'Dialogs' },
          },
          {
            path: 'menu',
            name: 'menu',
            component: () => import('@/views/features/MenuView.vue'),
            meta: { title: 'Menu' },
          },
          {
            path: 'grid',
            name: 'grid',
            component: () => import('@/views/features/GridView.vue'),
            meta: { title: 'Grid' },
          },
          {
            path: 'certificate',
            name: 'certificate',
            component: () => import('@/views/features/CertificateView.vue'),
            meta: { title: 'Certificate Details' },
          },
          {
            path: 'log-viewer',
            name: 'log-viewer',
            component: () => import('@/views/features/LogViewerView.vue'),
            meta: { title: 'Log Viewer' },
          },
          {
            path: 'code-editor',
            name: 'code-editor',
            component: () => import('@/views/features/CodeEditorView.vue'),
            meta: { title: 'Code editor' },
          },
          {
            path: 'gps',
            name: 'gps',
            component: () => import('@/views/features/GpsView.vue'),
            meta: { title: 'GPS Position' },
          },
          {
            path: 'relative-time',
            name: 'relative-time',
            component: () => import('@/views/features/RelativeTimeView.vue'),
            meta: { title: 'Relative Time' },
          },
          {
            path: 'steps',
            name: 'steps',
            component: () => import('@/views/features/StepsView.vue'),
            meta: { title: 'Steps' },
          },
          {
            path: 'radio-terminal',
            name: 'radio-terminal',
            component: () => import('@/views/features/RadioTerminalView.vue'),
            meta: { title: 'Radio Terminal' },
          },
          {
            path: 'table',
            name: 'table',
            component: () => import('@/views/features/TableView.vue'),
            meta: { title: 'Table' },
          },
          {
            path: 'property-list',
            name: 'property-list',
            component: () => import('@/views/features/PropertyListView.vue'),
            meta: { title: 'Property List' },
          },
          {
            path: 'alerts',
            name: 'alerts',
            component: () => import('@/views/features/AlertsView.vue'),
            meta: { title: 'Alerts' },
          },
          {
            path: 'notifications',
            name: 'notifications',
            component: () => import('@/views/features/NotificationsView.vue'),
            meta: { title: 'Notifications' },
          },
          {
            path: 'navigation',
            name: 'navigation',
            component: () => import('@/views/features/NavigationView.vue'),
            meta: { title: 'Navigation' },
          },
          {
            path: 'mobile',
            name: 'mobile',
            component: () => import('@/views/features/MobileView.vue'),
            meta: { title: 'Mobile Components', breadcrumb: 'Mobile' },
          },
          {
            path: 'bar-chart',
            name: 'bar-chart',
            component: () => import('@/views/features/ChartsView.vue'),
            meta: { title: 'Bar Chart' },
          },
          {
            path: 'dashboard-widgets',
            name: 'dashboard-widgets',
            component: () => import('@/views/features/DashboardWidgetsView.vue'),
            meta: { title: 'Dashboard Widgets' },
          },
        ],
      },
    ],
  },
]

export const createAppRouter = (): Router => {
  const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes,
  })

  installAccessGuard(router)

  router.afterEach((to, _from, failure) => {
    if (!failure) applyPageMetadata(to)
  })

  return router
}
