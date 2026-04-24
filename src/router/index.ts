import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/base-layout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/test-view.vue'),
        },
      ],
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/dashboard-layout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/test-view.vue'),
        },
      ],
    },
  ],
})

export default router
