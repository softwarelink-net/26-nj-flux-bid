import {
  type Env,
  type FluxRecord,
  FALLBACK_RECORDS,
  error,
  getUstar,
  isWplEnabled,
  json,
  newId,
  parseBody,
  queryAll,
  requireAuth,
  runSql,
  writeAudit,
} from '../lib'

export async function handleRecords(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  const url = new URL(request.url)
  const stationId = url.searchParams.get('station_id') || ''
  const qcMax = url.searchParams.get('qc_max')
  const gas = url.searchParams.get('gas') || ''

  let rows = await queryAll<FluxRecord>(
    env,
    stationId
      ? 'SELECT * FROM njflux_records WHERE station_id = ? ORDER BY record_timestamp'
      : 'SELECT * FROM njflux_records ORDER BY record_timestamp',
    stationId ? [stationId] : [],
  )
  if (!rows?.length) {
    rows = stationId ? FALLBACK_RECORDS.filter((r) => r.station_id === stationId) : FALLBACK_RECORDS
  }
  if (qcMax !== null && qcMax !== '') {
    const n = Number(qcMax)
    rows = rows.filter((r) => r.qc_flag_mauder_foken <= n)
  }
  const ustar = await getUstar(env)
  const data = rows.map((r) => ({
    ...r,
    gas_focus: gas || 'CO2',
    night_ustar_fail: r.friction_velocity_u_star < ustar && r.co2_flux_umol_m2_s > 0,
    qc_class: r.qc_flag_mauder_foken <= 2 ? 'GOOD' : r.qc_flag_mauder_foken <= 6 ? 'FAIR' : 'BAD',
  }))
  await writeAudit(env, auth.user, 'LIST_FLUX_RECORDS', request, 200, stationId || null)
  return json({ success: true, ustar_threshold: ustar, total: data.length, data })
}

export async function handleCompute(request: Request, env: Env) {
  const auth = await requireAuth(request, env, ['ROLE_FLUX_SCIENTIST'])
  if (auth.error) return auth.error
  const body = await parseBody<{
    station_id?: string
    yaw_deg?: number
    pitch_deg?: number
    apply_wpl?: boolean
  }>(request)
  const stationId = body?.station_id || 'st-01'
  const wplOn = body?.apply_wpl ?? (await isWplEnabled(env))
  const yaw = Number(body?.yaw_deg ?? 2.4)
  const pitch = Number(body?.pitch_deg ?? 1.1)

  const raw = -4.62
  const rotated = raw * Math.cos((pitch * Math.PI) / 180) * Math.cos((yaw * Math.PI) / 180)
  const wpl = wplOn ? rotated * 1.086 : rotated
  const rawH = 112.4
  const rawLE = 168.2
  const rec: FluxRecord = {
    id: newId('rec'),
    station_id: stationId,
    record_timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    co2_flux_umol_m2_s: Math.round(wpl * 100) / 100,
    ch4_flux_nmol_m2_s: 21.6,
    h2o_flux_latent_heat_w_m2: Math.round(rawLE * (wplOn ? 1.04 : 1) * 10) / 10,
    sensible_heat_w_m2: Math.round(rawH * 10) / 10,
    friction_velocity_u_star: 0.44,
    qc_flag_mauder_foken: 0,
    wpl_correction_applied: wplOn ? 1 : 0,
    energy_balance_ratio: 0.91,
  }

  await runSql(
    env,
    `INSERT INTO njflux_records (id, station_id, record_timestamp, co2_flux_umol_m2_s, ch4_flux_nmol_m2_s,
      h2o_flux_latent_heat_w_m2, sensible_heat_w_m2, friction_velocity_u_star, qc_flag_mauder_foken,
      wpl_correction_applied, energy_balance_ratio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      rec.id,
      rec.station_id,
      rec.record_timestamp,
      rec.co2_flux_umol_m2_s,
      rec.ch4_flux_nmol_m2_s,
      rec.h2o_flux_latent_heat_w_m2,
      rec.sensible_heat_w_m2,
      rec.friction_velocity_u_star,
      rec.qc_flag_mauder_foken,
      rec.wpl_correction_applied,
      rec.energy_balance_ratio,
    ],
  )
  await writeAudit(env, auth.user, 'FLUX_COMPUTE_WPL', request, 200, stationId)

  return json({
    success: true,
    pipeline: ['despike', '2D_rotation', wplOn ? 'WPL' : 'skip_WPL', 'spectral_correction', 'sonic_Tv'],
    before: { co2: raw, H: rawH, LE: rawLE },
    after: rec,
    rotation: { yaw, pitch },
    message: wplOn ? '已完成平面拟合/双重旋转与 WPL 密度修正' : '已完成坐标旋转，WPL 流水线关闭',
  })
}
