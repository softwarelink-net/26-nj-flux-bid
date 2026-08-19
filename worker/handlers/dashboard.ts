import {
  type Env,
  type AlertRow,
  type FluxRecord,
  type Station,
  FALLBACK_ALERTS,
  FALLBACK_CONFIGS,
  FALLBACK_RECORDS,
  FALLBACK_STATIONS,
  diurnalNEE,
  json,
  queryAll,
  requireAuth,
} from '../lib'

export async function handleDashboard(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error

  let stations = await queryAll<Station>(env, 'SELECT * FROM njflux_stations')
  let records = await queryAll<FluxRecord>(env, 'SELECT * FROM njflux_records')
  let alerts = await queryAll<AlertRow>(env, 'SELECT * FROM njflux_alerts ORDER BY alert_time DESC')
  let configs = await queryAll(env, 'SELECT * FROM njflux_system_configs')
  if (!stations?.length) stations = FALLBACK_STATIONS
  if (!records?.length) records = FALLBACK_RECORDS
  if (!alerts?.length) alerts = FALLBACK_ALERTS
  if (!configs?.length) configs = FALLBACK_CONFIGS

  const online = stations.filter((s) => s.station_status === 'ONLINE').length
  const heating = stations.filter((s) => s.station_status === 'WARNING_HEATING').length
  const meanNEE =
    records.reduce((a, r) => a + Number(r.co2_flux_umol_m2_s), 0) / Math.max(1, records.length)
  const meanEBR =
    records.reduce((a, r) => a + Number(r.energy_balance_ratio), 0) / Math.max(1, records.length)
  const meanCH4 =
    records.reduce((a, r) => a + Number(r.ch4_flux_nmol_m2_s), 0) / Math.max(1, records.length)
  const goodQc = records.filter((r) => r.qc_flag_mauder_foken <= 2).length
  const queue = records.filter((r) => r.wpl_correction_applied === 0).length

  const mapPoints = stations.map((s) => ({
    name: s.station_code,
    value: [
      Number(String(s.longitude_masked).replace(/[^\d.]/g, '')) || 92,
      Number(String(s.latitude_masked).replace(/[^\d.]/g, '')) || 33,
      Math.abs(meanNEE) * 20 + s.altitude_m / 80,
    ],
    status: s.station_status,
    eco: s.ecosystem_type,
  }))

  const seasonal = [
    { season: 'DJF', nee: 18.4, gpp: 6.2, re: 24.6 },
    { season: 'MAM', nee: -42.8, gpp: 86.4, re: 43.6 },
    { season: 'JJA', nee: -128.6, gpp: 214.2, re: 85.6 },
    { season: 'SON', nee: -36.2, gpp: 72.8, re: 36.6 },
  ]

  const radar = [
    { name: 'CH4 湿地排放', value: 86 },
    { name: '草甸碳汇', value: 72 },
    { name: '冻土热通量', value: 58 },
    { name: '夜间 u*', value: 64 },
    { name: '能量闭合', value: Math.round(meanEBR * 100) },
    { name: 'QC 优级占比', value: Math.round((goodQc / Math.max(1, records.length)) * 100) },
  ]

  return json({
    success: true,
    data: {
      kpis: {
        stationOnline: online,
        stationTotal: stations.length,
        onlineRate: stations.length ? Math.round((online / stations.length) * 1000) / 10 : 0,
        heating,
        meanNEE: Math.round(meanNEE * 100) / 100,
        meanCH4: Math.round(meanCH4 * 10) / 10,
        meanEBR: Math.round(meanEBR * 100) / 100,
        computeQueue: queue,
        batteryWarn: stations.filter((s) => s.battery_voltage < 24).length,
        qcGoodPct: Math.round((goodQc / Math.max(1, records.length)) * 1000) / 10,
      },
      diurnal: diurnalNEE(),
      seasonal,
      mapPoints,
      radar,
      alerts: alerts.slice(0, 8).map((a) => ({
        id: a.id,
        time: String(a.alert_time || '').slice(11, 16) || '—',
        text: a.alert_description,
        level: a.status === 'ACTIVE' ? 'danger' : a.status === 'HANDLING' ? 'warn' : 'ok',
      })),
      stations,
      configs,
    },
  })
}
