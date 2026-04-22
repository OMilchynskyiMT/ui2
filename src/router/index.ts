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
        },
      ]
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/TestView.vue'),
        }
      ]
    }
  ],
})

export default router
