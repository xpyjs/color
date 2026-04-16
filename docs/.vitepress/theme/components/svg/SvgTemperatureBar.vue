<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const temps = [
  { k: '1000K', color: '#ff3300' },
  { k: '2700K', color: '#ffaa44' },
  { k: '4000K', color: '#ffcc88' },
  { k: '5500K', color: '#ffeedd' },
  { k: '6500K', color: '#fff5f0' },
  { k: '10000K', color: '#cce0ff' },
  { k: '20000K', color: '#a0c0f0' },
  { k: '40000K', color: '#80a8e8' },
]
</script>

<template>
  <svg width="440" height="80" viewBox="0 0 440 80" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '色温光谱图' : 'Color Temperature Spectrum'">
    <text x="220" y="14" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">{{ isZh ? '色温光谱 (K)' : 'Color Temperature Spectrum (K)' }}</text>
    <g v-for="(t, i) in temps" :key="t.k">
      <rect :x="10 + i * 52" y="22" width="48" height="28" :rx="i === 0 ? '6 0 0 6' : i === temps.length - 1 ? '0 6 6 0' : '0'" :fill="t.color" stroke="currentColor" stroke-width="0.3" />
      <text :x="10 + i * 52 + 24" y="66" font-size="8" fill="currentColor" text-anchor="middle">{{ t.k }}</text>
    </g>
    <!-- Warm/Cool labels -->
    <text x="36" y="78" font-size="9" fill="#FB7185" font-weight="600">{{ isZh ? '暖' : 'Warm' }}</text>
    <text x="400" y="78" font-size="9" fill="#34D399" font-weight="600" text-anchor="end">{{ isZh ? '冷' : 'Cool' }}</text>
  </svg>
</template>
