import { DEMO_USERS } from '@/constants/accounts'
import { FALLBACK, FALLBACK_DASHBOARD } from '@/composables/fallbackData'

export function mockApi(path: string, init: RequestInit = {}) {
  const method = (init.method || 'GET').toUpperCase()
  if (path.startsWith('/api/auth/login') && method === 'POST') {
    const body = JSON.parse(String(init.body || '{}')) as { username?: string; password?: string }
    const demo = DEMO_USERS.find((u) => u.username === body.username && u.password === body.password)
    if (!demo) throw new Error('账号或密码错误')
    const user = FALLBACK.users.find((u) => u.username === demo.username)!
    return { success: true, token: `mock.${demo.username}`, user }
  }
  if (path.startsWith('/api/stations')) {
    return { success: true, masking: true, online_rate: 75, data: FALLBACK.stations }
  }
  if (path.startsWith('/api/flux/compute')) {
    return {
      success: true,
      pipeline: ['despike', '2D_rotation', 'WPL', 'spectral_correction', 'sonic_Tv'],
      before: { co2: -4.62, H: 112.4, LE: 168.2 },
      after: { ...FALLBACK.records[0], co2_flux_umol_m2_s: -5.02 },
      message: '已完成平面拟合/双重旋转与 WPL 密度修正',
    }
  }
  if (path.startsWith('/api/flux/records')) {
    return { success: true, ustar_threshold: 0.15, total: FALLBACK.records.length, data: FALLBACK.records }
  }
  if (path.startsWith('/api/alerts')) return { success: true, data: FALLBACK.alerts }
  if (path.startsWith('/api/dashboard/stats')) return { success: true, data: FALLBACK_DASHBOARD }
  if (path.startsWith('/api/system/configs') && method === 'GET') return { success: true, data: FALLBACK.configs }
  if (path.startsWith('/api/system/configs')) return { success: true }
  if (path.startsWith('/api/audit')) return { success: true, data: FALLBACK.audit }
  if (path.startsWith('/api/tender')) return { success: true, data: FALLBACK.tender }
  throw new Error('演示接口未覆盖')
}
