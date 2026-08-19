<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isTender = computed(() => route.name === 'tender')
</script>

<template>
  <div
    class="relative flex min-h-[calc(100vh-40px)] items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-100 px-4 py-10"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-60"
      style="background: radial-gradient(circle at 18% 18%, #a7f3d0, transparent 42%), radial-gradient(circle at 82% 8%, #a5f3fc, transparent 34%)"
    />
    <div class="relative w-full" :class="isTender ? 'max-w-5xl' : 'max-w-md'">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-flux-400/60 bg-flux-900 text-emerald-100">
          <span class="text-lg font-bold">通量</span>
        </div>
        <h1 class="text-xl font-semibold tracking-wide text-flux-950">南京师范大学 · 虚拟地理环境教育部重点实验室</h1>
        <p class="mt-1 text-sm text-flux-800/80">高寒生态系统 CH4 / CO2 / H2O 通量涡度测量系统 · JSZC-320000-SNZX-G2026-0117</p>
        <div class="mt-3 flex justify-center gap-4 text-xs">
          <RouterLink to="/login" class="text-flux-800 hover:text-flux-950">登录控制台</RouterLink>
          <RouterLink to="/tender" class="text-cyan-700 hover:text-cyan-900">招标公告公示</RouterLink>
        </div>
      </div>
      <RouterView />
    </div>
  </div>
</template>
