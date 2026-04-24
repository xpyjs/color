<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const rgbStops = ['#ff0000', '#cc0033', '#990066', '#660099', '#3300cc', '#0000ff']
const hslStops = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#0000ff']
</script>

<template>
  <svg width="440" height="140" viewBox="0 0 440 140" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'RGB 与 HSL 插值对比' : 'RGB vs HSL Interpolation Comparison'">
    <defs>
      <linearGradient id="ss-rgb" x1="0" y1="0" x2="1" y2="0">
        <stop v-for="(c, i) in rgbStops" :key="'r' + i" :offset="(i / (rgbStops.length - 1) * 100) + '%'" :stop-color="c" />
      </linearGradient>
      <linearGradient id="ss-hsl" x1="0" y1="0" x2="1" y2="0">
        <stop v-for="(c, i) in hslStops" :key="'h' + i" :offset="(i / (hslStops.length - 1) * 100) + '%'" :stop-color="c" />
      </linearGradient>
    </defs>

    <!-- RGB -->
    <text x="12" y="18" font-size="11" fill="currentColor" font-weight="600">RGB</text>
    <rect x="60" y="6" width="368" height="24" rx="6" fill="url(#ss-rgb)" stroke="currentColor" stroke-width="0.5" />
    <text x="244" y="46" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '中间色是灰暗的紫色' : 'middle color is a muddy purple' }}</text>

    <!-- HSL -->
    <text x="12" y="80" font-size="11" fill="currentColor" font-weight="600">HSL</text>
    <rect x="60" y="68" width="368" height="24" rx="6" fill="url(#ss-hsl)" stroke="currentColor" stroke-width="0.5" />
    <text x="244" y="108" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '中间色经过绿色/青色，沿色轮过渡' : 'middle passes through green/cyan along the color wheel' }}</text>

    <!-- Labels -->
    <text x="60" y="130" font-size="8" fill="#ff0000" font-weight="600">#ff0000</text>
    <text x="428" y="130" font-size="8" fill="#0000ff" font-weight="600" text-anchor="end">#0000ff</text>
  </svg>
</template>
