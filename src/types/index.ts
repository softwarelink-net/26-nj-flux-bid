export type Role = 'ROLE_SUPER_ADMIN' | 'ROLE_FLUX_SCIENTIST' | 'ROLE_STATION_OPERATOR' | 'ROLE_DECISION_MAKER'

export const ALL_ROLES: Role[] = [
  'ROLE_SUPER_ADMIN',
  'ROLE_FLUX_SCIENTIST',
  'ROLE_STATION_OPERATOR',
  'ROLE_DECISION_MAKER',
]

export const ROLE_LABELS: Record<Role, string> = {
  ROLE_SUPER_ADMIN: '重点实验室系统总管',
  ROLE_FLUX_SCIENTIST: '通量微气象科研专家',
  ROLE_STATION_OPERATOR: '野外台站运维工程师',
  ROLE_DECISION_MAKER: '院领导 / 学科带头人',
}

export interface AuthUser {
  id: string
  username: string
  full_name: string
  institute_name: string
  role: Role
  phone?: string
  staff_code?: string
}

export interface Station {
  id: string
  station_code: string
  station_name: string
  ecosystem_type: string
  ecosystem_label?: string
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
  status_label?: string
  agc_pct?: number
  heating?: boolean
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
  qc_class?: string
  night_ustar_fail?: boolean
}

export interface SystemConfig {
  config_key: string
  config_value: string
  category: string
  description?: string
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

export const QC_LABEL: Record<number, string> = {
  0: '0 优',
  1: '1 优',
  2: '2 优',
  3: '3 中',
  4: '4 中',
  5: '5 中',
  6: '6 中',
  7: '7 差',
  8: '8 差',
  9: '9 过滤',
}
