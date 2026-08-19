<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { fetchDashboard } from '@/composables/useApi'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const app = useAppStore()
const auth = useAuthStore()
const loading = ref(true)
const kpis = ref<Record<string, number>>({})
const alerts = ref<Array<{ id: string; time: string; text: string; level: string }>>([])

const lineEl = ref<HTMLDivElement | null>(null)
const barEl = ref<HTMLDivElement | null>(null)
const energyEl = ref<HTMLDivElement | null>(null)
const radarEl = ref<HTMLDivElement | null>(null)
const mapEl = ref<HTMLDivElement | null>(null)
let charts: echarts.ECharts[] = []

function bind(el: HTMLDivElement | null, option: echarts.EChartsOption) {
  if (!el) return
  const c = echarts.init(el)
  c.setOption(option)
  charts.push(c)
}

onMounted(async () => {
  try {
    const res = await fetchDashboard()
    const d = res.data as Record<string, unknown>
    kpis.value = (d.kpis || {}) as Record<string, number>
    alerts.value = (d.alerts || []) as typeof alerts.value
    if (Array.isArray(d.configs)) app.configs = d.configs as typeof app.configs
    const diurnal = (d.diurnal || []) as Array<{ h: string; nee: number; H: number; LE: number; ch4: number; ebr: number }>
    const seasonal = (d.seasonal || []) as Array<{ season: string; nee: number; gpp: number; re: number }>
    const radar = (d.radar || []) as Array<{ name: string; value: number }>
    const mapPoints = (d.mapPoints || []) as Array<{ name: string; value: number[]; status: string }>

    bind(lineEl.value, {
      tooltip: { trigger: 'axis' },
      legend: { data: ['NEE'] },
      grid: { left: 44, right: 16, top: 32, bottom: 28 },
      xAxis: { type: 'category', data: diurnal.map((h) => h.h) },
      yAxis: { type: 'value', name: 'μmol m⁻² s⁻¹' },
      series: [{ name: 'NEE', type: 'line', smooth: true, data: diurnal.map((h) => h.nee), color: '#047857', areaStyle: { opacity: 0.12 } }],
    })
    bind(barEl.value, {
      tooltip: { trigger: 'axis' },
      legend: { data: ['NEE', 'GPP', 'Re'] },
      grid: { left: 40, right: 12, top: 32, bottom: 24 },
      xAxis: { type: 'category', data: seasonal.map((s) => s.season) },
      yAxis: { type: 'value', name: 'gC m⁻²' },
      series: [
        { name: 'NEE', type: 'bar', data: seasonal.map((s) => s.nee), color: '#0f766e' },
        { name: 'GPP', type: 'bar', data: seasonal.map((s) => s.gpp), color: '#10b981' },
        { name: 'Re', type: 'bar', data: seasonal.map((s) => s.re), color: '#f59e0b' },
      ],
    })
    bind(energyEl.value, {
      tooltip: { trigger: 'axis' },
      legend: { data: ['H 显热', 'LE 潜热'] },
      grid: { left: 44, right: 16, top: 32, bottom: 28 },
      xAxis: { type: 'category', data: diurnal.map((h) => h.h) },
      yAxis: { type: 'value', name: 'W m⁻²' },
      series: [
        { name: 'H 显热', type: 'line', smooth: true, data: diurnal.map((h) => h.H), color: '#ea580c' },
        { name: 'LE 潜热', type: 'line', smooth: true, data: diurnal.map((h) => h.LE), color: '#0891b2' },
      ],
    })
    bind(radarEl.value, {
      radar: { indicator: radar.map((r) => ({ name: r.name, max: 100 })) },
      series: [{ type: 'radar', data: [{ value: radar.map((r) => r.value), name: 'CH4/碳汇特征' }], areaStyle: { opacity: 0.2 }, color: '#0e7490' }],
    })
    bind(mapEl.value, {
      tooltip: { formatter: (p: unknown) => {
        const x = p as { name?: string; value?: number[] }
        return `${x.name}<br/>热力 ${x.value?.[2]?.toFixed?.(1) ?? ''}`
      } },
      xAxis: { type: 'value', min: 88, max: 108, name: '经度(脱敏)' },
      yAxis: { type: 'value', min: 28, max: 42, name: '纬度(脱敏)' },
      series: [{
        type: 'scatter',
        symbolSize: (v: number[]) => Math.max(12, (v[2] || 40) / 4),
        data: mapPoints.map((p) => ({ name: p.name, value: p.value, itemStyle: { color: p.status === 'ONLINE' ? '#059669' : '#f59e0b' } })),
      }],
    })
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  charts.forEach((c) => c.dispose())
})

async function toggle(key: string) {
  try {
    await app.setFlag(key, !app.flag(key))
  } catch {
    /* 运维角色只读 */
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="panel p-4">
        <p class="label-muted">平均 NEE（负值=碳汇）</p>
        <p class="stat-value">{{ kpis.meanNEE ?? '—' }}</p>
        <p class="mt-1 text-[11px] text-slate-400">μmol CO₂ m⁻² s⁻¹</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">CH₄ 平均通量</p>
        <p class="stat-value">{{ kpis.meanCH4 ?? '—' }}</p>
        <p class="mt-1 text-[11px] text-slate-400">nmol m⁻² s⁻¹</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">能量闭合率 (H+LE)/(Rn−G)</p>
        <p class="stat-value">{{ kpis.meanEBR ?? '—' }}</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">台站在线 / 除霜中</p>
        <p class="stat-value">{{ kpis.stationOnline ?? '—' }}/{{ kpis.stationTotal ?? '—' }} · {{ kpis.heating ?? 0 }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 text-xs">
      <button class="btn-ghost !py-1" :class="{ '!bg-flux-800 !text-white': app.flag('FEATURE_AUTO_WPL_PIPELINE') }" @click="toggle('FEATURE_AUTO_WPL_PIPELINE')">
        自动 WPL {{ app.flag('FEATURE_AUTO_WPL_PIPELINE') ? '开' : '关' }}
      </button>
      <button class="btn-ghost !py-1" :class="{ '!bg-cyan-800 !text-white': app.flag('FEATURE_SM4_GEO_MASKING') }" @click="toggle('FEATURE_SM4_GEO_MASKING')">
        国密脱敏 {{ app.flag('FEATURE_SM4_GEO_MASKING') ? '开' : '关' }}
      </button>
      <span class="text-slate-400">当前角色 {{ auth.roleLabel }} · QC 优级 {{ kpis.qcGoodPct ?? '—' }}%</span>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <div class="panel">
        <div class="panel-header">日尺度净生态系统碳交换 NEE</div>
        <div ref="lineEl" class="h-64 p-2" />
      </div>
      <div class="panel">
        <div class="panel-header">季尺度 NEE / GPP / Re 累积</div>
        <div ref="barEl" class="h-64 p-2" />
      </div>
      <div class="panel">
        <div class="panel-header">24h 显热 H 与潜热 LE 能量收支</div>
        <div ref="energyEl" class="h-64 p-2" />
      </div>
      <div class="panel">
        <div class="panel-header">CH₄ 脉动释放与碳汇特征雷达</div>
        <div ref="radarEl" class="h-64 p-2" />
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-5">
      <div class="panel lg:col-span-3">
        <div class="panel-header">高寒观测站点时空分布热力（脱敏坐标）</div>
        <div ref="mapEl" class="h-72 p-2" />
      </div>
      <div class="panel lg:col-span-2">
        <div class="panel-header">除霜 / 解算滚动通知</div>
        <ul class="max-h-72 space-y-2 overflow-auto p-3 text-xs">
          <li
            v-for="a in alerts"
            :key="a.id"
            class="rounded border px-2 py-2"
            :class="{
              'border-rose-200 bg-rose-50 text-rose-800': a.level === 'danger',
              'border-amber-200 bg-amber-50 text-amber-800': a.level === 'warn',
              'border-emerald-200 bg-emerald-50 text-emerald-800': a.level === 'ok',
            }"
          >
            <span class="font-mono">{{ a.time }}</span> {{ a.text }}
          </li>
        </ul>
      </div>
    </div>
    <p v-if="loading" class="text-center text-xs text-slate-400">加载科研指标…</p>
  </div>
</template>
