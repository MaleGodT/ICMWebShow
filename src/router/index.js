import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'RealTime',
    component: () => import('../views/RealTime.vue'),
    meta: { title: '实时数据' }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: { title: '历史数据' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
