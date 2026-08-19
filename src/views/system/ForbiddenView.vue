<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="panel mx-auto max-w-lg p-8 text-center">
    <p class="text-lg font-semibold text-flux-900">403 无权访问</p>
    <p class="mt-2 text-sm text-slate-500">当前角色不具备该模块权限，请切换演示账号或返回态势大屏。</p>
    <RouterLink to="/" class="btn-primary mt-6 inline-flex">返回大屏</RouterLink>
  </div>
</template>
