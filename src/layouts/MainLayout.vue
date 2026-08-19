<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ChartBarIcon,
  CpuChipIcon,
  BeakerIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { DEMO_USERS, fetchDashboard } from '@/composables/useApi'
import { ALL_ROLES } from '@/types'

const auth = useAuthStore()
const app = useAppStore()
const route = useRoute()
const router = useRouter()
const switching = ref(false)

const navItems = [
  { name: 'dashboard', label: '通量态势大屏', icon: ChartBarIcon, roles: ALL_ROLES },
  {
    name: 'station-iot',
    label: '野外台站物联',
    icon: CpuChipIcon,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_STATION_OPERATOR'],
  },
  {
    name: 'calculation',
    label: 'WPL 解算引擎',
    icon: BeakerIcon,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_FLUX_SCIENTIST'],
  },
  {
    name: 'qaqc',
    label: 'QA/QC 插补',
    icon: ShieldCheckIcon,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_FLUX_SCIENTIST'],
  },
  { name: 'system', label: '系统总控', icon: Cog6ToothIcon, roles: ['ROLE_SUPER_ADMIN'] },
]

const visibleNav = computed(() => navItems.filter((item) => auth.hasRole(item.roles)))

const breadcrumbs = computed(() => {
  const crumbs: { label: string; to: string | null }[] = [{ label: '首页', to: '/' }]
  if (route.name && route.name !== 'dashboard') {
    crumbs.push({ label: (route.meta.title as string) || String(route.name), to: null })
  }
  return crumbs
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

async function switchDemo(username: string) {
  const demo = DEMO_USERS.find((u) => u.username === username)
  if (!demo) return
  switching.value = true
  try {
    await auth.login(demo.username, demo.password)
    if (route.meta.roles && !auth.hasRole(route.meta.roles as string[])) {
      await router.push({ name: 'dashboard' })
    }
  } finally {
    switching.value = false
  }
}

onMounted(async () => {
  void app.loadConfigs()
  try {
    const dash = await fetchDashboard()
    const k = (dash.data.kpis || {}) as Record<string, number>
    app.onlineRate = k.onlineRate ?? app.onlineRate
    app.computeQueue = k.computeQueue ?? app.computeQueue
    app.batteryWarn = k.batteryWarn ?? app.batteryWarn
    app.ticker = `台站在线率 ${app.onlineRate}% · 高频通量计算队列 ${app.computeQueue} · 低功耗电池告警 ${app.batteryWarn}`
  } catch {
    /* ticker already set */
  }
})
</script>

<template>
  <div class="flex min-h-[calc(100vh-40px)]">
    <aside
      :class="[
        'sticky top-0 h-[calc(100vh-40px)] shrink-0 border-r border-emerald-200 bg-white/95 transition-all duration-200',
        app.sidebarCollapsed ? 'w-[72px]' : 'w-60',
      ]"
    >
      <div class="flex h-14 items-center justify-between border-b border-emerald-100 px-3">
        <div v-if="!app.sidebarCollapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold text-flux-800">高寒生态通量测控</p>
          <p class="truncate text-[10px] text-slate-400">JSZC-320000-SNZX-G2026-0117</p>
        </div>
        <button class="btn-ghost !p-1.5" :title="app.sidebarCollapsed ? '展开' : '收起'" @click="app.toggleSidebar()">
          <ChevronRightIcon v-if="app.sidebarCollapsed" class="h-4 w-4" />
          <ChevronLeftIcon v-else class="h-4 w-4" />
        </button>
      </div>

      <nav class="space-y-1 overflow-y-auto p-2" style="max-height: calc(100vh - 220px)">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-flux-900"
          :class="{ 'bg-flux-50 text-flux-900 ring-1 ring-flux-200': route.name === item.name }"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span v-if="!app.sidebarCollapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 border-t border-emerald-100 p-3">
        <div v-if="!app.sidebarCollapsed" class="mb-2 truncate text-xs text-slate-400">
          {{ auth.roleLabel }}
        </div>
        <button class="btn-ghost w-full !justify-start" @click="logout">
          <ArrowRightOnRectangleIcon class="h-4 w-4" />
          <span v-if="!app.sidebarCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="overflow-hidden border-b border-emerald-200 bg-emerald-50 px-4 py-1 text-[11px] text-flux-900">
        <div class="marquee-track flex w-max gap-16 whitespace-nowrap">
          <span>{{ app.ticker }} · 自动 WPL{{ app.flag('FEATURE_AUTO_WPL_PIPELINE') ? '启用' : '关闭' }} · SM4 脱敏{{ app.flag('FEATURE_SM4_GEO_MASKING') ? '启用' : '关闭' }}</span>
          <span>{{ app.ticker }} · 自动 WPL{{ app.flag('FEATURE_AUTO_WPL_PIPELINE') ? '启用' : '关闭' }} · SM4 脱敏{{ app.flag('FEATURE_SM4_GEO_MASKING') ? '启用' : '关闭' }}</span>
        </div>
      </div>
      <header
        class="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-emerald-100 bg-white/85 px-4 backdrop-blur"
      >
        <nav class="flex min-w-0 items-center gap-2 text-sm text-slate-400">
          <template v-for="(c, i) in breadcrumbs" :key="i">
            <RouterLink v-if="c.to" :to="c.to" class="hover:text-flux-800">{{ c.label }}</RouterLink>
            <span v-else class="truncate text-slate-800">{{ c.label }}</span>
            <span v-if="i < breadcrumbs.length - 1" class="text-slate-300">/</span>
          </template>
        </nav>
        <div class="flex items-center gap-3 text-xs">
          <div class="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-flux-900 lg:flex">
            在线率 {{ app.onlineRate }}%
          </div>
          <div class="hidden items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-800 xl:flex">
            解算队列 {{ app.computeQueue }}
          </div>
          <div class="hidden items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-orange-800 xl:flex">
            电池告警 {{ app.batteryWarn }}
          </div>
          <label class="hidden items-center gap-2 xl:flex">
            <span class="text-slate-400">角色</span>
            <select
              class="rounded border-emerald-200 bg-white py-1 text-xs text-slate-700"
              :value="auth.user?.username"
              :disabled="switching"
              @change="switchDemo(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="d in DEMO_USERS" :key="d.username" :value="d.username">
                {{ d.full_name }}
              </option>
            </select>
          </label>
          <div class="text-right">
            <p class="font-medium text-slate-800">{{ auth.displayName }}</p>
            <p class="text-[10px] text-slate-400">{{ auth.user?.institute_name }}</p>
          </div>
        </div>
      </header>
      <main class="flex-1 p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
