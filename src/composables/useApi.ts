import { DEMO_USERS } from '@/constants/accounts'
import { mockApi } from '@/composables/fallback'
import type { AuthUser, FluxRecord, Station, SystemConfig } from '@/types'

export { DEMO_USERS }

const TOKEN_KEY = 'njflux_token'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const res = await fetch(path, { ...init, headers })
    const data = (await res.json().catch(() => ({}))) as T & { success?: boolean; error?: string }
    if (!res.ok || (data && data.success === false)) {
      if (res.status === 404 || data.error === 'Not Found') {
        return mockApi(path, init) as T
      }
      throw new Error(data.error || `请求失败 (${res.status})`)
    }
    return data
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('请求失败') || msg === '账号或密码错误' || msg.includes('权限') || msg.includes('仅')) {
      throw err
    }
    try {
      return mockApi(path, init) as T
    } catch (fallbackErr) {
      throw fallbackErr instanceof Error ? fallbackErr : err
    }
  }
}

export async function loginApi(username: string, password: string) {
  return request<{ success: boolean; token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function fetchStations() {
  return request<{ success: boolean; data: Station[]; online_rate: number; masking: boolean }>('/api/stations')
}

export async function fetchRecords(params: Record<string, string> = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v)
  })
  return request<{ success: boolean; data: FluxRecord[]; total: number; ustar_threshold: number }>(
    `/api/flux/records?${q}`,
  )
}

export async function computeFlux(payload: {
  station_id?: string
  yaw_deg?: number
  pitch_deg?: number
  apply_wpl?: boolean
}) {
  return request<{ success: boolean; before: Record<string, number>; after: FluxRecord; message: string; pipeline: string[] }>(
    '/api/flux/compute',
    { method: 'POST', body: JSON.stringify(payload) },
  )
}

export async function fetchAlerts() {
  return request<{ success: boolean; data: Array<Record<string, unknown>> }>('/api/alerts')
}

export async function fetchDashboard() {
  return request<{ success: boolean; data: Record<string, unknown> }>('/api/dashboard/stats')
}

export async function fetchConfigs() {
  return request<{ success: boolean; data: SystemConfig[] }>('/api/system/configs')
}

export async function updateConfig(config_key: string, config_value: string) {
  return request<{ success: boolean }>('/api/system/configs', {
    method: 'PATCH',
    body: JSON.stringify({ config_key, config_value }),
  })
}

export async function fetchAudit() {
  return request<{ success: boolean; data: Array<Record<string, unknown>> }>('/api/audit')
}

export async function fetchTender() {
  return request<{ success: boolean; data: Record<string, unknown> }>('/api/tender')
}
