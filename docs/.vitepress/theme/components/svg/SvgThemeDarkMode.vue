<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const lightShades = [
  { label: '50',  color: '#e6f7ff' },
  { label: '100', color: '#bae7ff' },
  { label: '200', color: '#91d5ff' },
  { label: '300', color: '#69c0ff' },
  { label: '400', color: '#40a9ff' },
  { label: '500', color: '#1890ff' },
  { label: '600', color: '#096dd9' },
  { label: '700', color: '#0050b3' },
  { label: '800', color: '#003a8c' },
  { label: '900', color: '#002766' },
]

const darkShades = [
  { label: '50',  color: '#111d2c' },
  { label: '100', color: '#112a45' },
  { label: '200', color: '#15395b' },
  { label: '300', color: '#164c7e' },
  { label: '400', color: '#1765ad' },
  { label: '500', color: '#177ddc' },
  { label: '600', color: '#3c9ae8' },
  { label: '700', color: '#65b7f3' },
  { label: '800', color: '#8dcff8' },
  { label: '900', color: '#b7e3fa' },
]
</script>

<template>
  <svg width="460" height="160" viewBox="0 0 460 160" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '浅色/暗色模式色阶对比' : 'Light / Dark Mode Palette Comparison'">
    <!-- Light mode -->
    <text x="12" y="18" font-size="11" fill="currentColor" font-weight="600">☀️ {{ isZh ? '浅色模式' : 'Light Mode' }}</text>
    <g v-for="(s, i) in lightShades" :key="'l' + s.label">
      <rect :x="12 + i * 44" y="26" width="40" height="28" :rx="i === 0 ? 4 : i === lightShades.length - 1 ? 4 : 0" :fill="s.color" stroke="currentColor" stroke-width="0.3" />
      <text :x="12 + i * 44 + 20" y="68" font-size="7" fill="currentColor" text-anchor="middle" opacity="0.7">{{ s.label }}</text>
    </g>

    <!-- Dark mode -->
    <text x="12" y="96" font-size="11" fill="currentColor" font-weight="600">🌙 {{ isZh ? '暗色模式' : 'Dark Mode' }}</text>
    <rect x="8" y="102" width="444" height="36" rx="4" fill="#141414" />
    <g v-for="(s, i) in darkShades" :key="'d' + s.label">
      <rect :x="12 + i * 44" y="106" width="40" height="28" :rx="i === 0 ? 4 : i === darkShades.length - 1 ? 4 : 0" :fill="s.color" stroke="#333" stroke-width="0.5" />
    </g>

    <text x="230" y="155" font-size="9" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '暗色模式自动反转色阶顺序，降低饱和度和明度' : 'Dark mode reverses shade order, reduces saturation & brightness' }}</text>
  </svg>
</template>
