import type { Env } from './lib'
import { CORS_HEADERS, json } from './lib'
import { handleLogin, handleMe } from './handlers/auth'
import { handleHealth, handleTender } from './handlers/tender'
import { handleStations } from './handlers/stations'
import { handleCompute, handleRecords } from './handlers/flux'
import { handleAlerts } from './handlers/alerts'
import { handleDashboard } from './handlers/dashboard'
import { handleAuditLogs, handleConfigs, handleUpdateConfig } from './handlers/system'

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/$/, '') || '/'
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (path === '/api/health' && method === 'GET') return handleHealth(env)
  if (path === '/api/tender' && method === 'GET') return handleTender()
  if (path === '/api/auth/login' && method === 'POST') return handleLogin(request, env)
  if (path === '/api/auth/me' && method === 'GET') return handleMe(request, env)
  if (path === '/api/stations' && method === 'GET') return handleStations(request, env)
  if (path === '/api/flux/records' && method === 'GET') return handleRecords(request, env)
  if (path === '/api/flux/compute' && method === 'POST') return handleCompute(request, env)
  if (path === '/api/alerts' && method === 'GET') return handleAlerts(request, env)
  if (path === '/api/dashboard/stats' && method === 'GET') return handleDashboard(request, env)
  if (path === '/api/system/configs' && method === 'GET') return handleConfigs(request, env)
  if (path === '/api/system/configs' && (method === 'POST' || method === 'PATCH')) {
    return handleUpdateConfig(request, env)
  }
  if (path === '/api/audit' && method === 'GET') return handleAuditLogs(request, env)

  return json({ success: false, error: 'Not Found' }, 404)
}
