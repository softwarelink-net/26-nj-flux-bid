<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { fetchTender } from '@/composables/useApi'

interface Tender {
  title?: string
  issuer?: string
  project_no?: string
  publish_time?: string
  keywords?: string
  summary?: string
  budget?: number
  deadline?: string
  period?: string
  tech_points?: string[]
  innovation?: string[]
  ca_guide?: string[]
}

const data = ref<Tender>({})
const cd = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })
let timer: number | undefined

onMounted(async () => {
  try {
    const res = await fetchTender()
    data.value = res.data
    Object.assign(cd, (res.data as { countdown?: typeof cd }).countdown || {})
  } catch {
    data.value = {
      title: '高寒生态系统CH4 CO2 H2O通量涡度测量系统公开招标公告',
      issuer: '南京师范大学',
      project_no: 'JSZC-320000-SNZX-G2026-0117',
      publish_time: '2026-08-13 16:42',
      keywords: '南京师范大学, 通量涡度测量系统, 涡度相关系统, 温室气体通量监测, 高寒生态系统, JSZC-320000-SNZX-G2026-0117, 江苏政府采购',
      summary: '预算金额180万元，接受进口产品投标，交货期120天，投标文件递交截止2026年9月3日09:00。',
      budget: 1800000,
      deadline: '2026-09-03 09:00:00',
      tech_points: [],
      innovation: [],
      ca_guide: [],
    }
  }
  timer = window.setInterval(() => {
    const end = new Date((data.value.deadline || '2026-09-03 09:00:00').replace(' ', 'T') + '+08:00').getTime()
    const diff = Math.max(0, end - Date.now())
    cd.days = Math.floor(diff / 86400000)
    cd.hours = Math.floor((diff % 86400000) / 3600000)
    cd.minutes = Math.floor((diff % 3600000) / 60000)
    cd.seconds = Math.floor((diff % 60000) / 1000)
    cd.expired = diff <= 0
  }, 1000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <article class="panel p-6 text-sm leading-7 text-slate-700">
    <header class="border-b border-emerald-100 pb-4">
      <p class="text-xs text-flux-700">江苏政府采购 · 公开招标 · 社会公众免密查阅</p>
      <h2 class="mt-1 text-lg font-semibold text-flux-950">{{ data.title }}</h2>
      <div class="mt-3 flex flex-wrap gap-2 text-xs">
        <span class="rounded bg-emerald-100 px-2 py-0.5">截止倒计时 {{ cd.days }}天 {{ cd.hours }}时 {{ cd.minutes }}分 {{ cd.seconds }}秒</span>
        <span v-if="cd.expired" class="rounded bg-rose-100 px-2 py-0.5 text-rose-700">已截止</span>
      </div>
    </header>

    <ol class="mt-5 space-y-4">
      <li>
        <h3 class="font-semibold text-flux-900">1. 标题</h3>
        <p>{{ data.title }}</p>
      </li>
      <li>
        <h3 class="font-semibold text-flux-900">2. 项目发包方</h3>
        <p>{{ data.issuer }}</p>
      </li>
      <li>
        <h3 class="font-semibold text-flux-900">3. 项目编号</h3>
        <p class="font-mono">{{ data.project_no }}</p>
      </li>
      <li>
        <h3 class="font-semibold text-flux-900">4. 项目发布时间</h3>
        <p>{{ data.publish_time }}</p>
      </li>
      <li>
        <h3 class="font-semibold text-flux-900">5. 关键词</h3>
        <p>{{ data.keywords }}</p>
      </li>
      <li>
        <h3 class="font-semibold text-flux-900">6. 摘要</h3>
        <p>{{ data.summary }}</p>
        <p class="mt-1 text-flux-800">预算金额：¥ {{ (data.budget || 1800000).toLocaleString() }} · 合同履行期限 120 日历天 · 接受进口产品</p>
      </li>
      <li>
        <h3 class="font-semibold text-flux-900">7. 技术要点</h3>
        <ul class="list-disc pl-5">
          <li v-for="(t, i) in data.tech_points" :key="i">{{ t }}</li>
        </ul>
      </li>
      <li>
        <h3 class="font-semibold text-flux-900">8. 技术创新性</h3>
        <ul class="list-disc pl-5">
          <li v-for="(t, i) in data.innovation" :key="i">{{ t }}</li>
        </ul>
      </li>
    </ol>

    <section class="mt-6 rounded-md border border-cyan-200 bg-cyan-50/70 p-4">
      <h3 class="font-semibold text-cyan-900">江苏政府采购「苏采云」系统投标操作指引</h3>
      <ol class="mt-2 list-decimal pl-5 text-xs">
        <li v-for="(g, i) in data.ca_guide" :key="i">{{ g }}</li>
      </ol>
    </section>
  </article>
</template>
