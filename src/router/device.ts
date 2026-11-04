import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/layouts/DashboardLayout.vue'),
    children: [],
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
]
