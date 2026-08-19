<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { fetchAlerts, fetchStations } from '@/composables/useApi'
import type { Station } from '@/types'

const stations = ref<Station[]>([])
const alerts = ref<Array<Record<string, unknown>>>([])
const masking = ref(true)
const selected = ref<Station | null>(null)
const waveEl = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const online = computed(() => stations.value.filter((s) => s.station_status === 'ONLINE').length)

function renderWave(st: Station) {
  if (!waveEl.value) return
  chart?.dispose()
  chart = echarts.init(waveEl.value)
  const xs = Array.from({ length: 48 }, (_, i) => i)
  const agc = xs.map((i) => Math.round((st.agc_pct || 90) + Math.sin(i / 3) * 3.2 - (st.heating ? 8 : 0)))
  const batt = xs.map((i) => Math.round((st.battery_voltage + Math.sin(i / 7) * 0.25) * 100) / 100)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['光学透过率 AGC %', '蓄电池电压 V'] },
    grid: { left: 40, right: 16, top: 32, bottom: 24 },
    xAxis: { type: 'category', data: xs.map((i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`) },
    yAxis: [{ type: 'value', min: 60, max: 100 }, { type: 'value', min: 20, max: 28 }],
    series: [
      { name: '光学透过率 AGC %', type: 'line', smooth: true, data: agc, color: '#0891b2' },
      { name: '蓄电池电压 V', type: 'line', yAxisIndex: 1, smooth: true, data: batt, color: '#059669' },
    ],
  })
}

onMounted(async () => {
  const res = await fetchStations()
  stations.value = res.data
  masking.value = res.masking
  selected.value = res.data[0] || null
  if (selected.value) renderWave(selected.value)
  const a = await fetchAlerts()
  alerts.value = a.data
})

onUnmounted(() => chart?.dispose())

function pick(st: Station) {
  selected.value = st
  renderWave(st)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold text-flux-900">野外台站多维物联监控</h2>
        <p class="text-xs text-slate-500">
          在线 {{ online }}/{{ stations.length }} · 坐标 {{ masking ? 'SM4 脱敏展示' : '明文(演示)' }} · 太阳能 / 超声加热 / 光学 AGC
        </p>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="s in stations"
        :key="s.id"
        class="panel p-4 text-left transition hover:ring-1 hover:ring-flux-300"
        :class="{ 'ring-1 ring-flux-500': selected?.id === s.id }"
        @click="pick(s)"
      >
        <p class="font-mono text-xs text-cyan-700">{{ s.station_code }}</p>
        <p class="mt-1 text-sm font-medium text-slate-800">{{ s.station_name }}</p>
        <p class="mt-2 text-[11px] text-slate-500">
          {{ s.ecosystem_label || s.ecosystem_type }} · {{ s.altitude_m }} m · 塔高 {{ s.tower_height_m }} m
        </p>
        <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
          <span>电压 {{ s.battery_voltage }} V</span>
          <span>气温 {{ s.ambient_temp_c }} ℃</span>
          <span>RSSI {{ s.rssi_signal_dbm }} dBm</span>
          <span :class="s.station_status === 'ONLINE' ? 'text-emerald-700' : 'text-amber-700'">
            {{ s.status_label || s.station_status }}
          </span>
        </div>
        <p class="mt-2 font-mono text-[11px] text-slate-400">{{ s.latitude_masked }} {{ s.longitude_masked }}</p>
      </button>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="panel lg:col-span-2">
        <div class="panel-header">光学透过率 / 太阳能电压动态波形 · {{ selected?.station_code }}</div>
        <div ref="waveEl" class="h-72 p-2" />
      </div>
      <div class="panel">
        <div class="panel-header">传感器与除霜联动</div>
        <div v-if="selected" class="space-y-3 p-4 text-sm">
          <p>分析仪：{{ selected.analyzer_model }}</p>
          <p>超声风速仪：{{ selected.sonic_anemometer_model }}</p>
          <p>AGC：{{ selected.agc_pct }}% {{ (selected.agc_pct || 100) < 80 ? '· 低于除霜阈值' : '· 清洁' }}</p>
          <p>探头加热：{{ selected.heating ? '运行中' : '待机' }}</p>
          <div class="h-2 overflow-hidden rounded bg-slate-100">
            <div class="h-full bg-cyan-500" :style="{ width: `${selected.agc_pct || 0}%` }" />
          </div>
        </div>
        <ul class="space-y-2 border-t border-emerald-50 p-4 text-xs">
          <li v-for="a in alerts" :key="String(a.id)" class="rounded bg-slate-50 p-2">
            <span class="font-mono text-cyan-700">{{ a.station_code || a.station_id }}</span>
            {{ a.alert_description }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
