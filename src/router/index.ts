import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      redirect: { name: 'dashboard' },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/MainView.vue'),
          meta: { breadcrumb: 'Dashboard' },
        },
        {
          path: 'setup',
          name: 'setup',
          meta: { breadcrumb: { label: 'Setup', to: false } },
          children: [
            {
              path: 'wan',
              name: 'wan',
              component: () => import('@/views/dashboard/WanView.vue'),
              meta: { breadcrumb: 'WAN' },
            },
            {
              path: 'dhcp',
              name: 'dhcp',
              component: () => import('@/views/dashboard/dhcp/BaseView.vue'),
              redirect: { name: 'dhcp-config' },
              meta: { breadcrumb: 'DHCP' },
              children: [
                {
                  path: 'configuration',
                  name: 'dhcp-config',
                  component: () => import('@/views/dashboard/dhcp/ConfigView.vue'),
                  meta: { breadcrumb: 'Configuration' },
                },
                {
                  path: 'new-ipv4',
                  name: 'dhcp-add',
                  component: () => import('@/views/dashboard/dhcp/AddIpv4View.vue'),
                  meta: { breadcrumb: 'New IPv4' },
                },
                {
                  path: 'new-ipv6',
                  name: 'dhcp-add-v6',
                  component: () => import('@/views/dashboard/dhcp/AddIpv6View.vue'),
                  meta: { breadcrumb: 'New IPv6' },
                },
              ],
            },
            {
              path: 'smtp',
              name: 'smtp',
              component: () => import('@/views/dashboard/smtp/BaseView.vue'),
              redirect: { name: 'smtp-settings' },
              meta: { breadcrumb: 'SMTP' },
              children: [
                {
                  path: 'configuration',
                  name: 'smtp-settings',
                  component: () => import('@/views/dashboard/smtp/SettingsView.vue'),
                  meta: { breadcrumb: 'Configuration' },
                },
                {
                  path: 'log',
                  name: 'smtp-log',
                  component: () => import('@/views/dashboard/smtp/LogView.vue'),
                  meta: { breadcrumb: 'Log' },
                },
              ],
            },
          ],
        },
        {
          path: 'administration',
          name: 'administration',
          meta: { breadcrumb: { label: 'Administration', to: false } },
          children: [
            {
              path: 'debug-options',
              name: 'debug-options',
              component: () => import('@/views/dashboard/DebugOptionsView.vue'),
              meta: { breadcrumb: 'Debug Options' },
            },
            {
              path: 'usage-policy',
              name: 'usage-policy',
              component: () => import('@/views/dashboard/UsagePolicyView.vue'),
              meta: { breadcrumb: 'Usage Policy' },
            },
          ],
        },
      ],
    },
    {
      path: '/features',
      component: () => import('@/layouts/BaseLayout.vue'),
      meta: { breadcrumb: 'Features' },
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
            },
            {
              path: 'spinners',
              name: 'spinners',
              component: () => import('@/views/features/SpinnersView.vue'),
            },
            {
              path: 'buttons',
              name: 'buttons',
              component: () => import('@/views/features/ButtonsView.vue'),
            },
            {
              path: 'lists',
              name: 'lists',
              component: () => import('@/views/features/ListsView.vue'),
            },
            {
              path: 'chips',
              name: 'chips',
              component: () => import('@/views/features/ChipsView.vue'),
            },
            {
              path: 'dialogs',
              name: 'dialogs',
              component: () => import('@/views/features/DialogsView.vue'),
            },
            {
              path: 'menu',
              name: 'menu',
              component: () => import('@/views/features/MenuView.vue'),
            },
            {
              path: 'grid',
              name: 'grid',
              component: () => import('@/views/features/GridView.vue'),
            },
            {
              path: 'table',
              name: 'table',
              component: () => import('@/views/features/TableView.vue'),
            },
            {
              path: 'property-list',
              name: 'property-list',
              component: () => import('@/views/features/PropertyListView.vue'),
            },
            {
              path: 'alerts',
              name: 'alerts',
              component: () => import('@/views/features/AlertsView.vue'),
            },
            {
              path: 'notifications',
              name: 'notifications',
              component: () => import('@/views/features/NotificationsView.vue'),
            },
            {
              path: 'navigation',
              name: 'navigation',
              component: () => import('@/views/features/NavigationView.vue'),
              meta: { breadcrumb: 'Navigation' },
            },
          ],
        },
      ],
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/TestView.vue'),
        },
      ],
    },
  ],
})

export default router
