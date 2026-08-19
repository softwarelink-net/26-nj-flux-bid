<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { computeFlux, fetchRecords } from '@/composables/useApi'
import type { FluxRecord } from '@/types'

const yaw = ref(2.4)
const pitch = ref(1.1)
const applyWpl = ref(true)
const stationId = ref('st-01')
const loading = ref(false)
const msg = ref('')
const records = ref<FluxRecord[]>([])
const last = ref<Record<string, unknown> | null>(null)
const scatterEl = ref<HTMLDivElement | null>(null)
const ebrEl = ref<HTMLDivElement | null>(null)
let charts: echarts.ECharts[] = []

function bind(el: HTMLDivElement | null, option: echarts.EChartsOption) {
  if (!el) return
  const c = echarts.init(el)
  c.setOption(option)
  charts.push(c)
}

function paint() {
  charts.forEach((c) => c.dispose())
  charts = []
  const before = records.value.map((r) => Number(r.co2_flux_umol_m2_s) / 1.08)
  const after = records.value.map((r) => Number(r.co2_flux_umol_m2_s))
  bind(scatterEl.value, {
    tooltip: { trigger: 'item' },
    xAxis: { name: '修正前 NEE' },
    yAxis: { name: 'WPL 后 NEE' },
    series: [{
      type: 'scatter',
      data: before.map((b, i) => [Math.round(b * 100) / 100, after[i]]),
      itemStyle: { color: '#047857' },
    }],
  })
  bind(ebrEl.value, {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: records.value.map((r) => r.record_timestamp.slice(11, 16)) },
    yAxis: { type: 'value', min: 0.4, max: 1.1, name: 'EBR' },
    series: [{ type: 'bar', data: records.value.map((r) => r.energy_balance_ratio), color: '#0e7490' }],
  })
}

async function load() {
  const res = await fetchRecords({ station_id: stationId.value })
  records.value = res.data
  paint()
}

async function run() {
  loading.value = true
  msg.value = ''
  try {
    const res = await computeFlux({
      station_id: stationId.value,
      yaw_deg: yaw.value,
      pitch_deg: pitch.value,
      apply_wpl: applyWpl.value,
    })
    last.value = res as unknown as Record<string, unknown>
    msg.value = res.message
    await load()
  } catch (e) {
    msg.value = e instanceof Error ? e.message : '解算失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
onUnmounted(() => charts.forEach((c) => c.dispose()))
</script>

<template>
  <div class="space-y-4">
    <div class="panel p-4">
      <h2 class="text-lg font-semibold text-flux-900">通量涡度物理修正流水线</h2>
      <p class="mt-1 text-xs text-slate-500">10/20 Hz 脉动 → 去尖峰 → 2D 坐标旋转 → WPL 密度修正 → 半小时 NEE / LE / H</p>
      <div class="mt-4 grid gap-4 md:grid-cols-4">
        <label class="text-xs text-slate-500">
          台站
          <select v-model="stationId" class="input-light" @change="load">
            <option value="st-01">QTP-FLUX-01 那曲草甸</option>
            <option value="st-02">QTP-FLUX-02 若尔盖湿地</option>
            <option value="st-03">QTP-FLUX-03 风火山冻土</option>
            <option value="st-04">QTP-FLUX-04 祁连过渡带</option>
          </select>
        </label>
        <label class="text-xs text-slate-500">
          偏航 yaw (°) {{ yaw }}
          <input v-model.number="yaw" type="range" min="-8" max="8" step="0.1" class="mt-2 w-full" />
        </label>
        <label class="text-xs text-slate-500">
          俯仰 pitch (°) {{ pitch }}
          <input v-model.number="pitch" type="range" min="-5" max="5" step="0.1" class="mt-2 w-full" />
        </label>
        <label class="flex items-center gap-2 text-xs text-slate-600">
          <input v-model="applyWpl" type="checkbox" class="rounded border-emerald-300 text-flux-700" />
          应用 WPL 密度修正
        </label>
      </div>
      <button class="btn-primary mt-4" :disabled="loading" @click="run">
        {{ loading ? '解算中…' : '触发半小时物理修正' }}
      </button>
      <p v-if="msg" class="mt-2 text-xs text-emerald-700">{{ msg }}</p>
      <p v-if="last" class="mt-1 font-mono text-[11px] text-slate-500">
        流水线 {{ ((last.pipeline as string[]) || []).join(' → ') }}
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="panel">
        <div class="panel-header">WPL 修正前后 CO₂ 通量散点</div>
        <div ref="scatterEl" class="h-64 p-2" />
      </div>
      <div class="panel">
        <div class="panel-header">能量闭合率 (H+LE)/(Rn−G)</div>
        <div ref="ebrEl" class="h-64 p-2" />
      </div>
    </div>

    <div class="panel overflow-auto">
      <div class="panel-header">半小时解算结果</div>
      <table class="w-full text-left text-xs">
        <thead class="text-slate-400">
          <tr>
            <th class="px-3 py-2">时间</th>
            <th>NEE</th>
            <th>CH₄</th>
            <th>LE</th>
            <th>H</th>
            <th>u*</th>
            <th>QC</th>
            <th>WPL</th>
            <th>EBR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in records" :key="r.id" class="border-t border-emerald-50">
            <td class="px-3 py-1.5 font-mono">{{ r.record_timestamp }}</td>
            <td>{{ r.co2_flux_umol_m2_s }}</td>
            <td>{{ r.ch4_flux_nmol_m2_s }}</td>
            <td>{{ r.h2o_flux_latent_heat_w_m2 }}</td>
            <td>{{ r.sensible_heat_w_m2 }}</td>
            <td>{{ r.friction_velocity_u_star }}</td>
            <td>{{ r.qc_flag_mauder_foken }}</td>
            <td>{{ r.wpl_correction_applied ? '是' : '否' }}</td>
            <td>{{ r.energy_balance_ratio }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
