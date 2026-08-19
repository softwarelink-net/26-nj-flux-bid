import { type Env, type AlertRow, FALLBACK_ALERTS, json, queryAll, requireAuth, writeAudit } from '../lib'

export async function handleAlerts(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  let rows = await queryAll<AlertRow>(
    env,
    'SELECT a.*, s.station_code, s.station_name FROM njflux_alerts a LEFT JOIN njflux_stations s ON s.id = a.station_id ORDER BY a.alert_time DESC',
  )
  if (!rows?.length) rows = FALLBACK_ALERTS
  await writeAudit(env, auth.user, 'LIST_ALERTS', request, 200)
  return json({ success: true, data: rows })
}
