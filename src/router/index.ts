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
        },
        {
          path: 'setup',
          name: 'setup',
          children: [
            {
              path: 'wan',
              name: 'wan',
              component: () => import('@/views/dashboard/WanView.vue'),
            },
            {
              path: 'dhcp',
              name: 'dhcp',
              component: () => import('@/views/dashboard/dhcp/BaseView.vue'),
              redirect: { name: 'dhcp-config' },
              children: [
                {
                  path: 'configuration',
                  name: 'dhcp-config',
                  component: () => import('@/views/dashboard/dhcp/ConfigView.vue'),
                },
                {
                  path: 'new-ipv4',
                  name: 'dhcp-add',
                  component: () => import('@/views/dashboard/dhcp/AddIpv4View.vue'),
                },
                {
                  path: 'new-ipv6',
                  name: 'dhcp-add-v6',
                  component: () => import('@/views/dashboard/dhcp/AddIpv6View.vue'),
                },
              ],
            },
            {
              path: 'smtp',
              name: 'smtp',
              component: () => import('@/views/dashboard/smtp/BaseView.vue'),
              redirect: { name: 'smtp-settings' },
              children: [
                {
                  path: 'configuration',
                  name: 'smtp-settings',
                  component: () => import('@/views/dashboard/smtp/SettingsView.vue'),
                },
                {
                  path: 'log',
                  name: 'smtp-log',
                  component: () => import('@/views/dashboard/smtp/LogView.vue'),
                }
              ],
            },
          ],
        },
        {
          path: 'administration',
          name: 'administration',
          children: [
            {
              path: 'debug-options',
              name: 'debug-options',
              component: () => import('@/views/dashboard/DebugOptionsView.vue'),
            },
            {
              path: 'usage-policy',
              name: 'usage-policy',
              component: () => import('@/views/dashboard/UsagePolicyView.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/features',
      component: () => import('@/layouts/BaseLayout.vue'),
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
              path: 'data-grid',
              name: 'data-grid',
              component: () => import('@/views/features/DataGridView.vue'),
            },
            {
              path: 'notice',
              name: 'notice',
              component: () => import('@/views/features/NoticesView.vue'),
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
