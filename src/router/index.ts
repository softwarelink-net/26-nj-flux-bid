import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES } from '@/types'

const SITE_TITLE = '2026南京师大高寒生态通量涡度测量系统采购招标公告'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
          meta: { requiresAuth: false, title: '身份认证' },
        },
      ],
    },
    {
      path: '/tender',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'tender',
          component: () => import('@/views/tender/TenderView.vue'),
          meta: { requiresAuth: false, title: '招标公告' },
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { title: '高寒生态通量态势大屏', roles: ALL_ROLES },
        },
        {
          path: 'station-iot',
          name: 'station-iot',
          component: () => import('@/views/station-iot/StationIotView.vue'),
          meta: {
            title: '野外台站物联监控',
            roles: ['ROLE_SUPER_ADMIN', 'ROLE_STATION_OPERATOR'],
          },
        },
        {
          path: 'calculation',
          name: 'calculation',
          component: () => import('@/views/calculation/CalculationView.vue'),
          meta: {
            title: '通量物理修正解算',
            roles: ['ROLE_SUPER_ADMIN', 'ROLE_FLUX_SCIENTIST'],
          },
        },
        {
          path: 'qaqc',
          name: 'qaqc',
          component: () => import('@/views/qaqc/QaqcView.vue'),
          meta: {
            title: '通量质控与插补',
            roles: ['ROLE_SUPER_ADMIN', 'ROLE_FLUX_SCIENTIST'],
          },
        },
        {
          path: 'system',
          name: 'system',
          component: () => import('@/views/system/SystemGovernance.vue'),
          meta: { title: '系统总控与信创审计', roles: ['ROLE_SUPER_ADMIN'] },
        },
        {
          path: '403',
          name: 'forbidden',
          component: () => import('@/views/system/ForbiddenView.vue'),
          meta: { title: '无权访问', requiresAuth: true },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.name === 'tender' || to.path === '/tender') {
    return next()
  }

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth !== false) && to.meta.requiresAuth !== false
  const publicPage = to.meta.requiresAuth === false || to.matched.some((r) => r.meta.requiresAuth === false)

  if (!auth.isAuthenticated && requiresAuth && !publicPage) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (auth.isAuthenticated && to.name === 'login') {
    return next({ name: 'dashboard' })
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && auth.isAuthenticated && !auth.hasRole(roles)) {
    return next({ name: 'forbidden' })
  }

  return next()
})

router.afterEach((to) => {
  const page = (to.meta.title as string) || ''
  document.title = page ? `${page} · ${SITE_TITLE}` : SITE_TITLE
})

export default router
