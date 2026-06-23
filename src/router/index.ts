import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
