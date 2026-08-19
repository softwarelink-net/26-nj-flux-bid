/// <reference types="@cloudflare/workers-types" />

export interface Env {
  Allworld: D1Database
  ASSETS?: Fetcher
  STORAGE?: R2Bucket
  SITES?: R2Bucket
  JWT_SECRET: string
  PROJECT_SLUG: string
  REPO_NAME: string
  DEPLOYMENT_HOST: string
  HOST_DOMAIN: string
  ROOT_DOMAIN: string
}

export type Role = 'ROLE_SUPER_ADMIN' | 'ROLE_FLUX_SCIENTIST' | 'ROLE_STATION_OPERATOR' | 'ROLE_DECISION_MAKER'

export interface AuthUser {
  id: string
  username: string
  full_name: string
  institute_name: string
  role: Role
  phone?: string
  staff_code?: string
}

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const DEMO_PASSWORDS: Record<string, string> = {
  admin: 'Admin@2026',
  scientist: 'Flux@2026',
  operator: 'Oper@2026',
  leader: 'Leader@2026',
}

export const MOCK_USERS: AuthUser[] = [
  {
    id: 'u-01',
    username: 'admin',
    full_name: '系统超级管理员',
    institute_name: '虚拟地理环境教育部重点实验室',
    role: 'ROLE_SUPER_ADMIN',
    phone: '025-85891187',
    staff_code: 'NNU-FLUX-001',
  },
  {
    id: 'u-02',
    username: 'scientist',
    full_name: '任教授',
    institute_name: '地理科学学院生态气象组',
    role: 'ROLE_FLUX_SCIENTIST',
    phone: '025-85891188',
    staff_code: 'NNU-SCI-1006',
  },
  {
    id: 'u-03',
    username: 'operator',
    full_name: '张运维',
    institute_name: '高寒野外台站观测保障中心',
    role: 'ROLE_STATION_OPERATOR',
    phone: '025-84207240',
    staff_code: 'NNU-OPER-2012',
  },
  {
    id: 'u-04',
    username: 'leader',
    full_name: '南师大院领导',
    institute_name: '南京师范大学科研院',
    role: 'ROLE_DECISION_MAKER',
    phone: '025-85891000',
    staff_code: 'NNU-LEAD-001',
  },
]

export interface Station {
  id: string
  station_code: string
  station_name: string
  ecosystem_type: string
  latitude_masked: string
  longitude_masked: string
  altitude_m: number
  tower_height_m: number
  analyzer_model: string
  sonic_anemometer_model: string
  battery_voltage: number
  ambient_temp_c: number
  rssi_signal_dbm: number
  station_status: string
  last_heartbeat?: string
}

export interface FluxRecord {
  id: string
  station_id: string
  record_timestamp: string
  co2_flux_umol_m2_s: number
  ch4_flux_nmol_m2_s: number
  h2o_flux_latent_heat_w_m2: number
  sensible_heat_w_m2: number
  friction_velocity_u_star: number
  qc_flag_mauder_foken: number
  wpl_correction_applied: number
  energy_balance_ratio: number
}

export interface AlertRow {
  id: string
  station_id: string
  alert_type: string
  optical_agc_signal_pct: number
  alert_description: string
  auto_deice_triggered: number
  status: string
  alert_time?: string
}

export const FALLBACK_STATIONS: Station[] = [
  {
    id: 'st-01',
    station_code: 'QTP-FLUX-01',
    station_name: '青藏高原那曲高寒草甸通量观测站',
    ecosystem_type: 'ALPINE_MEADOW',
    latitude_masked: '31.4***° N',
    longitude_masked: '91.9***° E',
    altitude_m: 4580,
    tower_height_m: 3.5,
    analyzer_model: 'LI-7500DS / LI-7700 CH4',
    sonic_anemometer_model: 'CSAT3B 3D Sonic',
    battery_voltage: 25.2,
    ambient_temp_c: -8.6,
    rssi_signal_dbm: -75,
    station_status: 'ONLINE',
    last_heartbeat: '2026-08-14 12:30:00',
  },
  {
    id: 'st-02',
    station_code: 'QTP-FLUX-02',
    station_name: '若尔盖高原泥炭沼泽湿地碳水通量站',
    ecosystem_type: 'ALPINE_WETLAND',
    latitude_masked: '33.6***° N',
    longitude_masked: '102.8***° E',
    altitude_m: 3420,
    tower_height_m: 4.0,
    analyzer_model: 'EC150 / G2301 Picarro',
    sonic_anemometer_model: 'Gill WindMaster Pro',
    battery_voltage: 24.8,
    ambient_temp_c: -2.4,
    rssi_signal_dbm: -68,
    station_status: 'ONLINE',
    last_heartbeat: '2026-08-14 12:30:00',
  },
  {
    id: 'st-03',
    station_code: 'QTP-FLUX-03',
    station_name: '风火山多年冻土活动层水热通量站',
    ecosystem_type: 'PERMAFROST_TUNDRA',
    latitude_masked: '34.8***° N',
    longitude_masked: '92.9***° E',
    altitude_m: 4720,
    tower_height_m: 3.0,
    analyzer_model: 'LI-7500DS / LI-7700 CH4',
    sonic_anemometer_model: 'CSAT3B 3D Sonic',
    battery_voltage: 23.4,
    ambient_temp_c: -18.2,
    rssi_signal_dbm: -84,
    station_status: 'WARNING_HEATING',
    last_heartbeat: '2026-08-14 12:00:00',
  },
  {
    id: 'st-04',
    station_code: 'QTP-FLUX-04',
    station_name: '祁连山高寒森林草原过渡带碳水站',
    ecosystem_type: 'FOREST_STEPPE',
    latitude_masked: '38.4***° N',
    longitude_masked: '99.5***° E',
    altitude_m: 3280,
    tower_height_m: 8.0,
    analyzer_model: 'LI-7200RS / LI-7700',
    sonic_anemometer_model: 'CSAT3B 3D Sonic',
    battery_voltage: 26.1,
    ambient_temp_c: 4.8,
    rssi_signal_dbm: -62,
    station_status: 'ONLINE',
    last_heartbeat: '2026-08-14 12:00:00',
  },
]

export const FALLBACK_RECORDS: FluxRecord[] = [
  { id: 'rec-01', station_id: 'st-01', record_timestamp: '2026-08-14 12:00:00', co2_flux_umol_m2_s: -4.85, ch4_flux_nmol_m2_s: 22.4, h2o_flux_latent_heat_w_m2: 185.6, sensible_heat_w_m2: 120.4, friction_velocity_u_star: 0.42, qc_flag_mauder_foken: 0, wpl_correction_applied: 1, energy_balance_ratio: 0.91 },
  { id: 'rec-02', station_id: 'st-01', record_timestamp: '2026-08-14 12:30:00', co2_flux_umol_m2_s: -5.12, ch4_flux_nmol_m2_s: 24.1, h2o_flux_latent_heat_w_m2: 192.0, sensible_heat_w_m2: 128.5, friction_velocity_u_star: 0.45, qc_flag_mauder_foken: 0, wpl_correction_applied: 1, energy_balance_ratio: 0.93 },
  { id: 'rec-03', station_id: 'st-01', record_timestamp: '2026-08-14 00:00:00', co2_flux_umol_m2_s: 1.85, ch4_flux_nmol_m2_s: 14.2, h2o_flux_latent_heat_w_m2: 12.0, sensible_heat_w_m2: -18.4, friction_velocity_u_star: 0.28, qc_flag_mauder_foken: 1, wpl_correction_applied: 1, energy_balance_ratio: 0.84 },
  { id: 'rec-04', station_id: 'st-02', record_timestamp: '2026-08-14 12:00:00', co2_flux_umol_m2_s: -6.3, ch4_flux_nmol_m2_s: 95.8, h2o_flux_latent_heat_w_m2: 220.5, sensible_heat_w_m2: 95.2, friction_velocity_u_star: 0.38, qc_flag_mauder_foken: 0, wpl_correction_applied: 1, energy_balance_ratio: 0.89 },
  { id: 'rec-05', station_id: 'st-01', record_timestamp: '2026-08-14 13:00:00', co2_flux_umol_m2_s: -5.46, ch4_flux_nmol_m2_s: 21.8, h2o_flux_latent_heat_w_m2: 205.4, sensible_heat_w_m2: 132.0, friction_velocity_u_star: 0.48, qc_flag_mauder_foken: 0, wpl_correction_applied: 1, energy_balance_ratio: 0.92 },
  { id: 'rec-06', station_id: 'st-01', record_timestamp: '2026-08-14 13:30:00', co2_flux_umol_m2_s: -4.92, ch4_flux_nmol_m2_s: 23.6, h2o_flux_latent_heat_w_m2: 198.2, sensible_heat_w_m2: 118.6, friction_velocity_u_star: 0.41, qc_flag_mauder_foken: 1, wpl_correction_applied: 1, energy_balance_ratio: 0.9 },
  { id: 'rec-07', station_id: 'st-01', record_timestamp: '2026-08-14 00:30:00', co2_flux_umol_m2_s: 2.14, ch4_flux_nmol_m2_s: 15.8, h2o_flux_latent_heat_w_m2: 8.4, sensible_heat_w_m2: -22.1, friction_velocity_u_star: 0.11, qc_flag_mauder_foken: 6, wpl_correction_applied: 1, energy_balance_ratio: 0.71 },
  { id: 'rec-08', station_id: 'st-01', record_timestamp: '2026-08-14 01:00:00', co2_flux_umol_m2_s: 1.62, ch4_flux_nmol_m2_s: 13.1, h2o_flux_latent_heat_w_m2: 6.2, sensible_heat_w_m2: -16.8, friction_velocity_u_star: 0.09, qc_flag_mauder_foken: 8, wpl_correction_applied: 0, energy_balance_ratio: 0.62 },
  { id: 'rec-09', station_id: 'st-02', record_timestamp: '2026-08-14 12:30:00', co2_flux_umol_m2_s: -6.85, ch4_flux_nmol_m2_s: 102.4, h2o_flux_latent_heat_w_m2: 236.0, sensible_heat_w_m2: 88.4, friction_velocity_u_star: 0.36, qc_flag_mauder_foken: 0, wpl_correction_applied: 1, energy_balance_ratio: 0.87 },
  { id: 'rec-10', station_id: 'st-02', record_timestamp: '2026-08-14 00:00:00', co2_flux_umol_m2_s: 0.92, ch4_flux_nmol_m2_s: 68.5, h2o_flux_latent_heat_w_m2: 18.4, sensible_heat_w_m2: -6.2, friction_velocity_u_star: 0.22, qc_flag_mauder_foken: 2, wpl_correction_applied: 1, energy_balance_ratio: 0.81 },
  { id: 'rec-11', station_id: 'st-03', record_timestamp: '2026-08-14 12:00:00', co2_flux_umol_m2_s: -1.84, ch4_flux_nmol_m2_s: 8.6, h2o_flux_latent_heat_w_m2: 96.4, sensible_heat_w_m2: 154.2, friction_velocity_u_star: 0.33, qc_flag_mauder_foken: 3, wpl_correction_applied: 1, energy_balance_ratio: 0.78 },
  { id: 'rec-12', station_id: 'st-03', record_timestamp: '2026-08-14 00:00:00', co2_flux_umol_m2_s: 0.64, ch4_flux_nmol_m2_s: 5.2, h2o_flux_latent_heat_w_m2: 4.1, sensible_heat_w_m2: -28.6, friction_velocity_u_star: 0.08, qc_flag_mauder_foken: 7, wpl_correction_applied: 1, energy_balance_ratio: 0.58 },
  { id: 'rec-13', station_id: 'st-04', record_timestamp: '2026-08-14 12:00:00', co2_flux_umol_m2_s: -7.12, ch4_flux_nmol_m2_s: 12.4, h2o_flux_latent_heat_w_m2: 248.6, sensible_heat_w_m2: 142.8, friction_velocity_u_star: 0.51, qc_flag_mauder_foken: 0, wpl_correction_applied: 1, energy_balance_ratio: 0.94 },
  { id: 'rec-14', station_id: 'st-04', record_timestamp: '2026-08-14 18:00:00', co2_flux_umol_m2_s: -1.2, ch4_flux_nmol_m2_s: 9.8, h2o_flux_latent_heat_w_m2: 62.4, sensible_heat_w_m2: 38.6, friction_velocity_u_star: 0.29, qc_flag_mauder_foken: 2, wpl_correction_applied: 1, energy_balance_ratio: 0.86 },
]

export const FALLBACK_ALERTS: AlertRow[] = [
  {
    id: 'alt-01',
    station_id: 'st-03',
    alert_type: 'FROST_CONTAMINATION',
    optical_agc_signal_pct: 74.5,
    alert_description: '【低温结霜】分析仪光学镜面透过率降至 74.5%（低于80%阈值），已自动启动智能温控加热带除霜。',
    auto_deice_triggered: 1,
    status: 'ACTIVE',
    alert_time: '2026-08-14 06:18:00',
  },
  {
    id: 'alt-02',
    station_id: 'st-01',
    alert_type: 'LOW_BATTERY',
    optical_agc_signal_pct: 92.0,
    alert_description: '夜间连续阴雪天气导致锂电电压轻微波动至 24.2V，已切入超低功耗模式平稳运行。',
    auto_deice_triggered: 0,
    status: 'RESOLVED',
    alert_time: '2026-08-13 23:40:00',
  },
  {
    id: 'alt-03',
    station_id: 'st-03',
    alert_type: 'SONIC_PATH_BLOCKED',
    optical_agc_signal_pct: 81.2,
    alert_description: '【超声声程】CSAT3B 声程被积雪部分遮挡，三维风速脉动尖峰率升高，建议远程启动除雪加热。',
    auto_deice_triggered: 1,
    status: 'HANDLING',
    alert_time: '2026-08-14 07:02:00',
  },
  {
    id: 'alt-04',
    station_id: 'st-02',
    alert_type: 'HIGH_SPIKE_RATE',
    optical_agc_signal_pct: 88.6,
    alert_description: '【尖峰率】CH4 开路分析仪瞬时尖峰率 4.8%，已标记 QC=4 并进入频谱衰减复核。',
    auto_deice_triggered: 0,
    status: 'RESOLVED',
    alert_time: '2026-08-14 11:16:00',
  },
]

export const FALLBACK_CONFIGS = [
  {
    config_key: 'FEATURE_AUTO_WPL_PIPELINE',
    config_value: 'true',
    category: 'FEATURE_FLAG',
    description: '是否开启 20Hz 原始数据半小时自动 WPL 密度效应与坐标旋转修正',
  },
  {
    config_key: 'FEATURE_SM4_GEO_MASKING',
    config_value: 'true',
    category: 'SECURITY',
    description: '是否启用高寒科研野外观测台站精准经纬度国密 SM4 动态脱敏',
  },
  {
    config_key: 'USTAR_THRESHOLD_FILTER',
    config_value: '0.15',
    category: 'ALGORITHM',
    description: '夜间摩擦风速 u* 湍流充分发育临界阈值 (m/s)',
  },
  {
    config_key: 'AGC_CLEANLINESS_ALERT_THRESHOLD',
    config_value: '80.0',
    category: 'MONITOR',
    description: '分析仪光学信号透过率触发自动除霜加热阈值 (%)',
  },
]

export const TENDER = {
  title: '高寒生态系统CH4 CO2 H2O通量涡度测量系统公开招标公告',
  issuer: '南京师范大学',
  project_no: 'JSZC-320000-SNZX-G2026-0117',
  publish_time: '2026-08-13 16:42',
  keywords:
    '南京师范大学, 通量涡度测量系统, 涡度相关系统, 温室气体通量监测, 高寒生态系统, JSZC-320000-SNZX-G2026-0117, 江苏政府采购',
  summary:
    '南京师范大学公开招标高寒生态系统CH4/CO2/H2O通量涡度测量系统，预算金额180万元，采购内容为连续测定高寒生态系统CO2/CH4通量、显热通量和潜热通量及气象参数的仪器设备与软件系统。本项目接受进口产品投标，合同履行期限为120日历天，投标文件递交截止时间为2026年9月3日09:00。',
  budget: 1800000,
  deadline: '2026-09-03 09:00:00',
  period: '120日历天',
  import_allowed: true,
  tech_points: [
    '高频多组分温室气体毫秒级流式采集：支持 CH4、CO2、H2O 气体分析仪与三维超声风速计 10Hz~20Hz 连续观测与数据预处理。',
    '微气象通量物理修正全流程流水线：集成二维坐标旋转（2D Rotation）、WPL 密度修正、频谱衰减校正与超声虚温修正。',
    '高寒极端环境低功耗自治与除霜联动：提供野外太阳能电量预测、光学探头结冰智能识别与微环境加温控制。',
    '信创国密脱敏与极简 Serverless 架构：野外台站地理信息国密 SM4 动态脱敏，基于 Cloudflare Workers + D1 实现极简零运维与高弹性。',
  ],
  innovation: [
    '高寒生态系统碳氮水循环数字孪生大屏：实现生态净交换量（NEE）、总初级生产力（GPP）与生态系统呼吸（Re）的半小时尺度高精度实时反演。',
    '通量观测全生命周期质量评估模型：融合能量平衡闭合率检验与非稳态湍流自动剔除，保障气候科研数据国际级公信力。',
  ],
  ca_guide: [
    '登录江苏政府采购“苏采云”系统完成供应商注册、CA 数字证书绑定与实名认证。',
    '下载招标文件，按采购文件编制投标文件，使用符合要求的电子签章完成加密。',
    '于 2026 年 9 月 3 日 09:00 前通过苏采云完成投标文件递交，逾期系统将自动拒收。',
    '保留递交回执、文件哈希与操作日志，作为电子档案不可篡改存证。',
  ],
}

export const ECO_LABEL: Record<string, string> = {
  ALPINE_MEADOW: '高寒草甸',
  ALPINE_WETLAND: '高寒湿地',
  PERMAFROST_TUNDRA: '多年冻土苔原',
  FOREST_STEPPE: '森林草原',
}

export const STATUS_LABEL: Record<string, string> = {
  ONLINE: '在线',
  WARNING_HEATING: '除霜加热',
  OFFLINE: '离线',
}

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  })
}

export function error(message: string, status = 400) {
  return json({ success: false, error: message }, status)
}

export async function parseBody<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export function getDB(env: Env): D1Database | undefined {
  return env.Allworld
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let bin = ''
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function utf8ToBase64Url(str: string) {
  return bytesToBase64Url(new TextEncoder().encode(str))
}

function base64UrlToBytes(s: string) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function base64UrlToUtf8(s: string) {
  return new TextDecoder().decode(base64UrlToBytes(s))
}

export async function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const h = utf8ToBase64Url(JSON.stringify(header))
  const p = utf8ToBase64Url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 8 * 3600 * 1000 }))
  const data = `${h}.${p}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return `${data}.${bytesToBase64Url(sig)}`
}

export async function verifyJwt(token: string, secret: string) {
  if (!token) return null
  const parts = token.replace(/^Bearer\s+/i, '').split('.')
  if (parts.length !== 3) return null
  const data = `${parts[0]}.${parts[1]}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const ok = await crypto.subtle.verify('HMAC', key, base64UrlToBytes(parts[2]), new TextEncoder().encode(data))
  if (!ok) return null
  try {
    const payload = JSON.parse(base64UrlToUtf8(parts[1])) as Record<string, unknown> & { exp?: number }
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function requireAuth(request: Request, env: Env, roles: Role[] = []) {
  const auth = request.headers.get('Authorization') || ''
  const secret = env.JWT_SECRET || 'nj-flux-bid-demo-jwt-secret-2026'
  const payload = (await verifyJwt(auth, secret)) as AuthUser | null
  if (!payload?.id) return { error: error('未授权，请先登录', 401) }
  if (roles.length && payload.role !== 'ROLE_SUPER_ADMIN' && !roles.includes(payload.role)) {
    return { error: error('权限不足', 403) }
  }
  return { user: payload }
}

export async function queryAll<T = Record<string, unknown>>(env: Env, sql: string, binds: unknown[] = []) {
  const db = getDB(env)
  if (!db) return null
  try {
    const stmt = db.prepare(sql)
    const res = binds.length ? await stmt.bind(...binds).all() : await stmt.all()
    return (res.results || []) as T[]
  } catch {
    return null
  }
}

export async function queryFirst<T = Record<string, unknown>>(env: Env, sql: string, binds: unknown[] = []) {
  const db = getDB(env)
  if (!db) return null
  try {
    const stmt = db.prepare(sql)
    return (binds.length ? await stmt.bind(...binds).first() : await stmt.first()) as T | null
  } catch {
    return null
  }
}

export async function runSql(env: Env, sql: string, binds: unknown[] = []) {
  const db = getDB(env)
  if (!db) return false
  try {
    const stmt = db.prepare(sql)
    if (binds.length) await stmt.bind(...binds).run()
    else await stmt.run()
    return true
  } catch {
    return false
  }
}

export function clientIp(request: Request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1'
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
}

async function flagOn(env: Env, key: string, fallback = true) {
  const row = await queryFirst<{ config_value: string }>(
    env,
    'SELECT config_value FROM njflux_system_configs WHERE config_key = ?',
    [key],
  )
  if (!row) return fallback
  return row.config_value === 'true'
}

export async function isMaskEnabled(env: Env) {
  return flagOn(env, 'FEATURE_SM4_GEO_MASKING', true)
}

export async function isWplEnabled(env: Env) {
  return flagOn(env, 'FEATURE_AUTO_WPL_PIPELINE', true)
}

export async function getUstar(env: Env) {
  const row = await queryFirst<{ config_value: string }>(
    env,
    'SELECT config_value FROM njflux_system_configs WHERE config_key = ?',
    ['USTAR_THRESHOLD_FILTER'],
  )
  const n = Number(row?.config_value || 0.15)
  return Number.isFinite(n) ? n : 0.15
}

export function maskStation(st: Station, enabled: boolean): Station {
  if (enabled) return st
  return {
    ...st,
    latitude_masked: st.latitude_masked.replace(/\*/g, '2'),
    longitude_masked: st.longitude_masked.replace(/\*/g, '6'),
  }
}

export async function writeAudit(
  env: Env,
  user: AuthUser | null | undefined,
  actionName: string,
  request: Request,
  statusCode: number,
  stationCode?: string | null,
) {
  const url = new URL(request.url)
  await runSql(
    env,
    `INSERT INTO njflux_audit_logs (id, user_id, username, action_name, station_code, ip_address, request_uri, status_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newId('aud'),
      user?.id || null,
      user?.username || 'anonymous',
      actionName,
      stationCode || null,
      clientIp(request),
      url.pathname,
      statusCode,
    ],
  )
}

export function diurnalNEE() {
  return Array.from({ length: 24 }, (_, h) => {
    const rad = ((h - 6) / 12) * Math.PI
    const day = h >= 6 && h <= 18
    const nee = day ? -Math.sin(rad) * 5.4 - 0.4 : 1.6 + Math.sin(h / 4) * 0.4
    const hFlux = day ? Math.sin(rad) * 140 : -18
    const le = day ? Math.sin(rad) * 190 : 10
    const ch4 = 18 + Math.sin(h / 3) * 8 + (h > 20 || h < 6 ? 6 : 0)
    return {
      h: `${String(h).padStart(2, '0')}:00`,
      nee: Math.round(nee * 100) / 100,
      H: Math.round(hFlux * 10) / 10,
      LE: Math.round(le * 10) / 10,
      ch4: Math.round(ch4 * 10) / 10,
      ebr: Math.round((0.78 + (day ? 0.14 : 0.02) + Math.sin(h) * 0.03) * 100) / 100,
    }
  })
}
