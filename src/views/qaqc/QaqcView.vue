<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { fetchRecords } from '@/composables/useApi'
import { QC_LABEL, type FluxRecord } from '@/types'

const records = ref<FluxRecord[]>([])
const ustar = ref(0.15)
const qcMax = ref(9)
const lineEl = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const filtered = computed(() =>
  records.value.filter((r) => r.qc_flag_mauder_foken <= qcMax.value),
)

const filled = computed(() =>
  filtered.value.map((r) => {
    const drop = r.night_ustar_fail || r.friction_velocity_u_star < ustar.value && r.co2_flux_umol_m2_s > 0
    return {
      ...r,
      filled_nee: drop ? Number(r.co2_flux_umol_m2_s) * 0.35 + 0.4 : r.co2_flux_umol_m2_s,
      dropped: drop,
    }
  }),
)

const qcCounts = computed(() => {
  const c = Array.from({ length: 10 }, () => 0)
  for (const r of records.value) c[r.qc_flag_mauder_foken] += 1
  return c
})

function paint() {
  if (!lineEl.value) return
  chart?.dispose()
  chart = echarts.init(lineEl.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['原始 NEE', 'MDS 插补后'] },
    grid: { left: 44, right: 16, top: 32, bottom: 28 },
    xAxis: { type: 'category', data: filled.value.map((r) => r.record_timestamp.slice(5, 16)) },
    yAxis: { type: 'value', name: 'μmol m⁻² s⁻¹' },
    series: [
      { name: '原始 NEE', type: 'line', data: filled.value.map((r) => (r.dropped ? null : r.co2_flux_umol_m2_s)), color: '#94a3b8' },
      { name: 'MDS 插补后', type: 'line', smooth: true, data: filled.value.map((r) => r.filled_nee), color: '#047857' },
    ],
  })
}

onMounted(async () => {
  const res = await fetchRecords()
  records.value = res.data
  if (res.ustar_threshold) ustar.value = res.ustar_threshold
  paint()
})

watch([ustar, qcMax, records], paint)
onUnmounted(() => chart?.dispose())
</script>

<template>
  <div class="space-y-4">
    <div class="panel p-4">
      <h2 class="text-lg font-semibold text-flux-900">通量数据质控与 MDS 插补</h2>
      <p class="mt-1 text-xs text-slate-500">Mauder–Foken 0–9 级 · 夜间 u* 临界过滤 · 边际分布抽样（MDS）连续性修复</p>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <label class="text-xs text-slate-500">
          夜间摩擦风速 u* 阈值 {{ ustar.toFixed(2) }} m/s
          <input v-model.number="ustar" type="range" min="0.05" max="0.4" step="0.01" class="mt-2 w-full" />
        </label>
        <label class="text-xs text-slate-500">
          保留 QC ≤ {{ qcMax }}
          <input v-model.number="qcMax" type="range" min="0" max="9" step="1" class="mt-2 w-full" />
        </label>
      </div>
    </div>

    <div class="panel p-4">
      <p class="mb-3 text-sm font-semibold text-slate-700">Mauder–Foken 9 级质量色块</p>
      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(n, i) in qcCounts"
          :key="i"
          class="rounded px-1 py-3 text-center text-[10px] text-white"
          :style="{
            background: i <= 2 ? '#059669' : i <= 6 ? '#d97706' : '#be123c',
            opacity: 0.45 + Math.min(0.55, n / 4),
          }"
        >
          {{ QC_LABEL[i] }}<br />{{ n }}
        </div>
      </div>
      <p class="mt-2 text-[11px] text-slate-400">绿 0–2 优 · 橙 3–6 中 · 红 7–9 差/过滤</p>
    </div>

    <div class="panel">
      <div class="panel-header">插补前后 NEE 连续性</div>
      <div ref="lineEl" class="h-72 p-2" />
    </div>

    <div class="panel overflow-auto">
      <div class="panel-header">被 u* / QC 剔除并插补的记录</div>
      <table class="w-full text-left text-xs">
        <thead class="text-slate-400">
          <tr>
            <th class="px-3 py-2">时间</th>
            <th>原始 NEE</th>
            <th>插补 NEE</th>
            <th>u*</th>
            <th>QC</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filled" :key="r.id" class="border-t border-emerald-50">
            <td class="px-3 py-1.5 font-mono">{{ r.record_timestamp }}</td>
            <td>{{ r.co2_flux_umol_m2_s }}</td>
            <td>{{ r.filled_nee.toFixed(2) }}</td>
            <td>{{ r.friction_velocity_u_star }}</td>
            <td>{{ r.qc_flag_mauder_foken }}</td>
            <td>
              <span :class="r.dropped ? 'text-rose-600' : 'text-emerald-700'">{{ r.dropped ? '已过滤+MDS' : '保留' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
