-- 1. 用户与科研/运维人员信息表 (Users)
CREATE TABLE IF NOT EXISTS njflux_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    institute_name TEXT NOT NULL,       -- 地理科学学院, 虚拟地理环境教育部重点实验室, 环境学院
    role TEXT NOT NULL CHECK(role IN ('ROLE_SUPER_ADMIN', 'ROLE_FLUX_SCIENTIST', 'ROLE_STATION_OPERATOR', 'ROLE_DECISION_MAKER')),
    phone TEXT,
    staff_code TEXT,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 系统全局配置与 Feature Flags (System Configs)
CREATE TABLE IF NOT EXISTS njflux_system_configs (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 高寒生态观测台站与传感器资产表 (Flux Stations & Sensors)
CREATE TABLE IF NOT EXISTS njflux_stations (
    id TEXT PRIMARY KEY,
    station_code TEXT NOT NULL UNIQUE,  -- 如 QTP-FLUX-01 (青藏高原高寒草甸站)
    station_name TEXT NOT NULL,
    ecosystem_type TEXT NOT NULL CHECK(ecosystem_type IN ('ALPINE_MEADOW', 'ALPINE_WETLAND', 'PERMAFROST_TUNDRA', 'FOREST_STEPPE')),
    latitude_masked TEXT NOT NULL,      -- 国密脱敏展示坐标（如 34.2***° N）
    longitude_masked TEXT NOT NULL,     -- 国密脱敏展示坐标（如 92.5***° E）
    altitude_m REAL NOT NULL,           -- 海拔高度（如 4650.0m）
    tower_height_m REAL DEFAULT 3.5,    -- 观测塔高度
    analyzer_model TEXT NOT NULL,       -- LI-7500DS / LI-7700 / EC150 / G2301
    sonic_anemometer_model TEXT NOT NULL,-- CSAT3B / Gill WindMaster
    battery_voltage REAL DEFAULT 24.6,  -- 太阳能蓄电池电压 (V)
    ambient_temp_c REAL DEFAULT -12.4,  -- 环境气温 (℃)
    rssi_signal_dbm INTEGER DEFAULT -78,-- 4G/卫星通信信号强度
    station_status TEXT DEFAULT 'ONLINE' CHECK(station_status IN ('ONLINE', 'WARNING_HEATING', 'OFFLINE')),
    last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 半小时通量解算结果主表 (Half-Hourly Flux Records)
CREATE TABLE IF NOT EXISTS njflux_records (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL,
    record_timestamp DATETIME NOT NULL, -- 半小时时间戳
    co2_flux_umol_m2_s REAL NOT NULL,   -- CO2 通量 (umol/(m2*s)) (负值为碳汇吸收，正值为碳排放)
    ch4_flux_nmol_m2_s REAL NOT NULL,   -- CH4 甲烷通量 (nmol/(m2*s))
    h2o_flux_latent_heat_w_m2 REAL NOT NULL, -- 潜热通量 LE (W/m2)
    sensible_heat_w_m2 REAL NOT NULL,   -- 显热通量 H (W/m2)
    friction_velocity_u_star REAL NOT NULL, -- 摩擦风速 u* (m/s)
    qc_flag_mauder_foken INTEGER NOT NULL CHECK(qc_flag_mauder_foken BETWEEN 0 AND 9), -- 0-2 优, 3-6 中, 7-9 差/过滤
    wpl_correction_applied INTEGER DEFAULT 1, -- 是否执行 WPL 修正
    energy_balance_ratio REAL DEFAULT 0.88, -- 能量闭合度 (H+LE)/(Rn-G)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(station_id) REFERENCES njflux_stations(id)
);

-- 5. 仪器自检与低温结霜告警表 (Sensor Health & De-icing Alerts)
CREATE TABLE IF NOT EXISTS njflux_alerts (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK(alert_type IN ('FROST_CONTAMINATION', 'LOW_BATTERY', 'HIGH_SPIKE_RATE', 'SONIC_PATH_BLOCKED')),
    optical_agc_signal_pct REAL NOT NULL, -- 气体分析仪光学透过率信号 (%)
    alert_description TEXT NOT NULL,
    auto_deice_triggered INTEGER DEFAULT 0, -- 是否自动触发加热探头除霜
    status TEXT DEFAULT 'RESOLVED' CHECK(status IN ('ACTIVE', 'HANDLING', 'RESOLVED')),
    alert_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(station_id) REFERENCES njflux_stations(id)
);

-- 6. 信创数据与野外科研地理安全审计日志表 (Security Audit Logs)
CREATE TABLE IF NOT EXISTS njflux_audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT,
    action_name TEXT NOT NULL,
    station_code TEXT,
    ip_address TEXT,
    request_uri TEXT,
    status_code INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 种子数据初始化 (Seed Data)
-- ==============================================================================

-- 注入演示用户
INSERT OR REPLACE INTO njflux_users (id, username, password_hash, full_name, institute_name, role, phone, staff_code) VALUES
('u-01', 'admin', 'e10adc3949ba59abbe56e057f20f883e', '系统超级管理员', '虚拟地理环境教育部重点实验室', 'ROLE_SUPER_ADMIN', '025-85891187', 'NNU-FLUX-001'),
('u-02', 'scientist', 'e10adc3949ba59abbe56e057f20f883e', '任教授', '地理科学学院生态气象组', 'ROLE_FLUX_SCIENTIST', '025-85891188', 'NNU-SCI-1006'),
('u-03', 'operator', 'e10adc3949ba59abbe56e057f20f883e', '张运维', '高寒野外台站观测保障中心', 'ROLE_STATION_OPERATOR', '025-84207240', 'NNU-OPER-2012'),
('u-04', 'leader', 'e10adc3949ba59abbe56e057f20f883e', '南师大院领导', '南京师范大学科研院', 'ROLE_DECISION_MAKER', '025-85891000', 'NNU-LEAD-001');

-- 注入 Feature Flags 与全局配置
INSERT OR REPLACE INTO njflux_system_configs (config_key, config_value, category, description) VALUES
('FEATURE_AUTO_WPL_PIPELINE', 'true', 'FEATURE_FLAG', '是否开启 20Hz 原始数据半小时自动 WPL 密度效应与坐标旋转修正'),
('FEATURE_SM4_GEO_MASKING', 'true', 'SECURITY', '是否启用高寒科研野外观测台站精准经纬度国密 SM4 动态脱敏'),
('USTAR_THRESHOLD_FILTER', '0.15', 'ALGORITHM', '夜间摩擦风速 u* 湍流充分发育临界阈值 (m/s)'),
('AGC_CLEANLINESS_ALERT_THRESHOLD', '80.0', 'MONITOR', '分析仪光学信号透过率触发自动除霜加热阈值 (%)');

-- 注入典型高寒生态台站数据
INSERT OR REPLACE INTO njflux_stations (id, station_code, station_name, ecosystem_type, latitude_masked, longitude_masked, altitude_m, tower_height_m, analyzer_model, sonic_anemometer_model, battery_voltage, ambient_temp_c, rssi_signal_dbm, station_status) VALUES
('st-01', 'QTP-FLUX-01', '青藏高原那曲高寒草甸通量观测站', 'ALPINE_MEADOW', '31.4***° N', '91.9***° E', 4580.0, 3.5, 'LI-7500DS / LI-7700 CH4', 'CSAT3B 3D Sonic', 25.2, -8.6, -75, 'ONLINE'),
('st-02', 'QTP-FLUX-02', '若尔盖高原泥炭沼泽湿地碳水通量站', 'ALPINE_WETLAND', '33.6***° N', '102.8***° E', 3420.0, 4.0, 'EC150 / G2301 Picarro', 'Gill WindMaster Pro', 24.8, -2.4, -68, 'ONLINE'),
('st-03', 'QTP-FLUX-03', '风火山多年冻土活动层水热通量站', 'PERMAFROST_TUNDRA', '34.8***° N', '92.9***° E', 4720.0, 3.0, 'LI-7500DS / LI-7700 CH4', 'CSAT3B 3D Sonic', 23.4, -18.2, -84, 'WARNING_HEATING');

-- 注入半小时通量解算结果样本
INSERT OR REPLACE INTO njflux_records (id, station_id, record_timestamp, co2_flux_umol_m2_s, ch4_flux_nmol_m2_s, h2o_flux_latent_heat_w_m2, sensible_heat_w_m2, friction_velocity_u_star, qc_flag_mauder_foken, wpl_correction_applied, energy_balance_ratio) VALUES
('rec-01', 'st-01', '2026-08-14 12:00:00', -4.85, 22.4, 185.6, 120.4, 0.42, 0, 1, 0.91),
('rec-02', 'st-01', '2026-08-14 12:30:00', -5.12, 24.1, 192.0, 128.5, 0.45, 0, 1, 0.93),
('rec-03', 'st-01', '2026-08-14 00:00:00', 1.85, 14.2, 12.0, -18.4, 0.28, 1, 1, 0.84),
('rec-04', 'st-02', '2026-08-14 12:00:00', -6.30, 95.8, 220.5, 95.2, 0.38, 0, 1, 0.89);

-- 注入传感器健康与结霜预警
INSERT OR REPLACE INTO njflux_alerts (id, station_id, alert_type, optical_agc_signal_pct, alert_description, auto_deice_triggered, status) VALUES
('alt-01', 'st-03', 'FROST_CONTAMINATION', 74.5, '【低温结霜】分析仪光学镜面透过率降至 74.5%（低于80%阈值），已自动启动智能温控加热带除霜。', 1, 'ACTIVE'),
('alt-02', 'st-01', 'LOW_BATTERY', 92.0, '夜间连续阴雪天气导致锂电电压轻微波动至 24.2V，已切入超低功耗模式平稳运行。', 0, 'RESOLVED');

INSERT OR REPLACE INTO njflux_stations (id, station_code, station_name, ecosystem_type, latitude_masked, longitude_masked, altitude_m, tower_height_m, analyzer_model, sonic_anemometer_model, battery_voltage, ambient_temp_c, rssi_signal_dbm, station_status) VALUES
('st-04', 'QTP-FLUX-04', '祁连山高寒森林草原过渡带碳水站', 'FOREST_STEPPE', '38.4***° N', '99.5***° E', 3280.0, 8.0, 'LI-7200RS / LI-7700', 'CSAT3B 3D Sonic', 26.1, 4.8, -62, 'ONLINE');

INSERT OR REPLACE INTO njflux_records (id, station_id, record_timestamp, co2_flux_umol_m2_s, ch4_flux_nmol_m2_s, h2o_flux_latent_heat_w_m2, sensible_heat_w_m2, friction_velocity_u_star, qc_flag_mauder_foken, wpl_correction_applied, energy_balance_ratio) VALUES
('rec-05', 'st-01', '2026-08-14 13:00:00', -5.46, 21.8, 205.4, 132.0, 0.48, 0, 1, 0.92),
('rec-06', 'st-01', '2026-08-14 13:30:00', -4.92, 23.6, 198.2, 118.6, 0.41, 1, 1, 0.90),
('rec-07', 'st-01', '2026-08-14 00:30:00', 2.14, 15.8, 8.4, -22.1, 0.11, 6, 1, 0.71),
('rec-08', 'st-01', '2026-08-14 01:00:00', 1.62, 13.1, 6.2, -16.8, 0.09, 8, 0, 0.62),
('rec-09', 'st-02', '2026-08-14 12:30:00', -6.85, 102.4, 236.0, 88.4, 0.36, 0, 1, 0.87),
('rec-10', 'st-02', '2026-08-14 00:00:00', 0.92, 68.5, 18.4, -6.2, 0.22, 2, 1, 0.81),
('rec-11', 'st-03', '2026-08-14 12:00:00', -1.84, 8.6, 96.4, 154.2, 0.33, 3, 1, 0.78),
('rec-12', 'st-03', '2026-08-14 00:00:00', 0.64, 5.2, 4.1, -28.6, 0.08, 7, 1, 0.58),
('rec-13', 'st-04', '2026-08-14 12:00:00', -7.12, 12.4, 248.6, 142.8, 0.51, 0, 1, 0.94),
('rec-14', 'st-04', '2026-08-14 18:00:00', -1.20, 9.8, 62.4, 38.6, 0.29, 2, 1, 0.86);

INSERT OR REPLACE INTO njflux_alerts (id, station_id, alert_type, optical_agc_signal_pct, alert_description, auto_deice_triggered, status) VALUES
('alt-03', 'st-03', 'SONIC_PATH_BLOCKED', 81.2, '【超声声程】CSAT3B 声程被积雪部分遮挡，三维风速脉动尖峰率升高，建议远程启动除雪加热。', 1, 'HANDLING'),
('alt-04', 'st-02', 'HIGH_SPIKE_RATE', 88.6, '【尖峰率】CH4 开路分析仪瞬时尖峰率 4.8%，已标记 QC=4 并进入频谱衰减复核。', 0, 'RESOLVED');
