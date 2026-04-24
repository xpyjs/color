<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const colors = ['#3b82f6', '#3a90e3', '#399dd0', '#38abbe', '#36b8ab', '#35c698', '#34d386', '#33e073', '#32ee60', '#10b981']
</script>

<template>
  <svg width="440" height="80" viewBox="0 0 440 80" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '图表配色示例' : 'Chart Color Scheme Example'">
    <text x="12" y="16" font-size="10" fill="currentColor" font-weight="600">{{ isZh ? '图表配色（8 步渐变）' : 'Chart Colors (8-step gradient)' }}</text>

    <!-- Color swatches -->
    <g v-for="(c, i) in colors.slice(0, 8)" :key="i">
      <rect :x="12 + i * 52" y="24" width="44" height="32" :rx="i === 0 ? 6 : i === 7 ? 6 : 0" :fill="c" stroke="currentColor" stroke-width="0.3" />
      <text :x="12 + i * 52 + 22" y="72" font-size="7" fill="currentColor" text-anchor="middle" opacity="0.6">{{ c }}</text>
    </g>
  </svg>
</template>
