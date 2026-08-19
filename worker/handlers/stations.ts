import {
  type Env,
  type Station,
  ECO_LABEL,
  FALLBACK_STATIONS,
  STATUS_LABEL,
  isMaskEnabled,
  json,
  maskStation,
  queryAll,
  requireAuth,
  writeAudit,
} from '../lib'

export async function handleStations(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error

  let rows = await queryAll<Station>(env, 'SELECT * FROM njflux_stations ORDER BY altitude_m DESC')
  if (!rows?.length) rows = FALLBACK_STATIONS
  const mask = await isMaskEnabled(env)
  const data = rows.map((s) => ({
    ...maskStation(s, mask),
    ecosystem_label: ECO_LABEL[s.ecosystem_type] || s.ecosystem_type,
    status_label: STATUS_LABEL[s.station_status] || s.station_status,
    agc_pct: s.station_status === 'WARNING_HEATING' ? 74.5 : 91 + (s.battery_voltage % 5),
    heating: s.station_status === 'WARNING_HEATING',
  }))
  await writeAudit(env, auth.user, 'LIST_STATIONS', request, 200)
  const online = data.filter((s) => s.station_status === 'ONLINE').length
  return json({
    success: true,
    masking: mask,
    online_rate: data.length ? Math.round((online / data.length) * 100) : 0,
    data,
  })
}
