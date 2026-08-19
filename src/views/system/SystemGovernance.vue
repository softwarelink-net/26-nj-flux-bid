<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchAudit, fetchConfigs, updateConfig } from '@/composables/useApi'
import type { SystemConfig } from '@/types'

const configs = ref<SystemConfig[]>([])
const logs = ref<Array<Record<string, unknown>>>([])
const msg = ref('')

onMounted(async () => {
  const c = await fetchConfigs()
  configs.value = c.data
  try {
    const a = await fetchAudit()
    logs.value = a.data
  } catch {
    logs.value = []
  }
})

async function save(c: SystemConfig) {
  await updateConfig(c.config_key, c.config_value)
  msg.value = `${c.config_key} 已保存`
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="panel">
      <div class="panel-header">系统参数 / Feature Flags / 国密脱敏</div>
      <div class="space-y-4 p-4 text-sm">
        <div v-for="c in configs" :key="c.config_key" class="rounded border border-emerald-100 p-3">
          <p class="font-mono text-xs text-flux-800">{{ c.config_key }}</p>
          <p class="text-xs text-slate-500">{{ c.description }}</p>
          <div class="mt-2 flex gap-2">
            <input v-model="c.config_value" class="input-light !mt-0" />
            <button class="btn-primary !py-1" @click="save(c)">保存</button>
          </div>
        </div>
        <p class="text-xs text-emerald-700">{{ msg }}</p>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">信创防篡改操作审计</div>
      <div class="overflow-auto p-4">
        <table class="w-full text-left text-xs">
          <thead class="text-slate-400">
            <tr>
              <th class="py-1">时间</th>
              <th>用户</th>
              <th>动作</th>
              <th>台站</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in logs" :key="i" class="border-t border-emerald-50">
              <td class="py-1.5 font-mono">{{ l.created_at }}</td>
              <td>{{ l.username }}</td>
              <td>{{ l.action_name }}</td>
              <td>{{ l.station_code || '—' }}</td>
              <td>{{ l.status_code }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!logs.length" class="py-8 text-center text-slate-400">暂无审计记录（登录与解算后将写入 D1）</p>
      </div>
    </div>
  </div>
</template>
