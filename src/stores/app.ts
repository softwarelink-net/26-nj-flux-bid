import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchConfigs, updateConfig } from '@/composables/useApi'
import type { SystemConfig } from '@/types'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const configs = ref<SystemConfig[]>([])
  const onlineRate = ref(75)
  const computeQueue = ref(1)
  const batteryWarn = ref(1)
  const ticker = ref('台站在线率 75% · WPL 解算队列 1 · 低电量告警 1')

  const configMap = computed(() => {
    const m: Record<string, string> = {}
    for (const c of configs.value) m[c.config_key] = c.config_value
    return m
  })

  function flag(key: string) {
    return (configMap.value[key] ?? 'true') === 'true'
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  async function loadConfigs() {
    try {
      const res = await fetchConfigs()
      configs.value = res.data || []
    } catch {
      /* keep defaults */
    }
  }

  async function setFlag(key: string, on: boolean) {
    await updateConfig(key, on ? 'true' : 'false')
    await loadConfigs()
  }

  return {
    sidebarCollapsed,
    configs,
    onlineRate,
    computeQueue,
    batteryWarn,
    ticker,
    flag,
    toggleSidebar,
    loadConfigs,
    setFlag,
  }
})
