<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="400" height="180" viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'HWB 色彩模型示意图' : 'HWB Color Model Diagram'">
    <defs>
      <!-- Hue ring gradient simulation -->
      <linearGradient id="hwb-w" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="hsl(210,100%,50%)" />
        <stop offset="100%" stop-color="#ffffff" />
      </linearGradient>
      <linearGradient id="hwb-b" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="hsl(210,100%,50%)" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>
      <marker id="hwb-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="currentColor" />
      </marker>
    </defs>

    <!-- Hue color wheel (simplified) -->
    <text x="60" y="18" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">{{ isZh ? '色相 H' : 'Hue H' }}</text>
    <g transform="translate(60, 80)">
      <circle cx="0" cy="0" r="44" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <circle cx="0" cy="-38" r="7" fill="hsl(0,100%,50%)" />
      <circle cx="33" cy="-19" r="7" fill="hsl(60,100%,50%)" />
      <circle cx="33" cy="19" r="7" fill="hsl(120,100%,50%)" />
      <circle cx="0" cy="38" r="7" fill="hsl(180,100%,50%)" />
      <circle cx="-33" cy="19" r="7" fill="hsl(240,100%,50%)" />
      <circle cx="-33" cy="-19" r="7" fill="hsl(300,100%,50%)" />
      <text x="0" y="4" font-size="9" fill="currentColor" text-anchor="middle">0°–360°</text>
    </g>

    <!-- Whiteness bar -->
    <text x="240" y="18" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">{{ isZh ? '白度 W' : 'Whiteness W' }}</text>
    <rect x="160" y="28" width="160" height="20" rx="4" fill="url(#hwb-w)" stroke="currentColor" stroke-width="0.5" />
    <text x="160" y="62" font-size="9" fill="currentColor">0%</text>
    <text x="312" y="62" font-size="9" fill="currentColor" text-anchor="end">100%</text>
    <text x="240" y="76" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '白度越高，颜色越浅' : 'Higher W → lighter color' }}</text>

    <!-- Blackness bar -->
    <text x="240" y="100" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">{{ isZh ? '黑度 B' : 'Blackness B' }}</text>
    <rect x="160" y="108" width="160" height="20" rx="4" fill="url(#hwb-b)" stroke="currentColor" stroke-width="0.5" />
    <text x="160" y="142" font-size="9" fill="currentColor">0%</text>
    <text x="312" y="142" font-size="9" fill="currentColor" text-anchor="end">100%</text>
    <text x="240" y="156" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '黑度越高，颜色越深' : 'Higher B → darker color' }}</text>

    <text x="240" y="176" font-size="9" fill="currentColor" text-anchor="middle" opacity="0.5">hwb(H, W%, B%) — {{ isZh ? 'CSS Color Level 4' : 'CSS Color Level 4' }}</text>
  </svg>
</template>
