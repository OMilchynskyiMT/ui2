import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      children: [
        {
          path: '',
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
              component: () => import('@/views/dashboard/DhcpView.vue'),
            },
            {
              path: 'smtp',
              name: 'smtp',
              component: () => import('@/views/dashboard/SmtpView.vue'),
            }
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
            }
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
