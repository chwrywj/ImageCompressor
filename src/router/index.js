import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'image-compress',
      component: () => import('../views/ImageCompress.vue')
    }
  ]
})

export default router
