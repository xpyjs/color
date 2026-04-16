<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="320" height="200" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'HSL 色彩空间示意图' : 'HSL Color Space Diagram'">
    <!-- Hue ring (simplified 12 slices) -->
    <g transform="translate(80,100)">
      <circle cx="0" cy="0" r="60" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <circle cx="0" cy="0" r="40" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <!-- Hue color stops as small arcs -->
      <circle cx="0" cy="-50" r="8" fill="hsl(0,80%,55%)" />
      <circle cx="25" cy="-43" r="8" fill="hsl(30,80%,55%)" />
      <circle cx="43" cy="-25" r="8" fill="hsl(60,80%,55%)" />
      <circle cx="50" cy="0" r="8" fill="hsl(90,80%,55%)" />
      <circle cx="43" cy="25" r="8" fill="hsl(120,80%,55%)" />
      <circle cx="25" cy="43" r="8" fill="hsl(150,80%,55%)" />
      <circle cx="0" cy="50" r="8" fill="hsl(180,80%,55%)" />
      <circle cx="-25" cy="43" r="8" fill="hsl(210,80%,55%)" />
      <circle cx="-43" cy="25" r="8" fill="hsl(240,80%,55%)" />
      <circle cx="-50" cy="0" r="8" fill="hsl(270,80%,55%)" />
      <circle cx="-43" cy="-25" r="8" fill="hsl(300,80%,55%)" />
      <circle cx="-25" cy="-43" r="8" fill="hsl(330,80%,55%)" />
      <!-- Center label -->
      <text x="0" y="4" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">H</text>
    </g>
    <!-- Saturation bar -->
    <defs>
      <linearGradient id="hsl-sat" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="hsl(210,0%,50%)" />
        <stop offset="100%" stop-color="hsl(210,100%,50%)" />
      </linearGradient>
    </defs>
    <rect x="170" y="40" width="130" height="20" rx="4" fill="url(#hsl-sat)" stroke="currentColor" stroke-width="0.5" />
    <text x="235" y="36" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">{{ isZh ? '饱和度 S' : 'Saturation S' }}</text>
    <text x="170" y="76" font-size="9" fill="currentColor">0%</text>
    <text x="292" y="76" font-size="9" fill="currentColor" text-anchor="end">100%</text>
    <!-- Lightness bar -->
    <defs>
      <linearGradient id="hsl-lit" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#000" />
        <stop offset="50%" stop-color="hsl(210,80%,50%)" />
        <stop offset="100%" stop-color="#fff" />
      </linearGradient>
    </defs>
    <rect x="170" y="110" width="130" height="20" rx="4" fill="url(#hsl-lit)" stroke="currentColor" stroke-width="0.5" />
    <text x="235" y="106" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">{{ isZh ? '亮度 L' : 'Lightness L' }}</text>
    <text x="170" y="146" font-size="9" fill="currentColor">0%</text>
    <text x="292" y="146" font-size="9" fill="currentColor" text-anchor="end">100%</text>
    <!-- Bottom legend -->
    <text x="160" y="185" font-size="10" fill="currentColor" text-anchor="middle" opacity="0.7">hsl(H, S%, L%) → {{ isZh ? '色相 + 饱和度 + 亮度' : 'Hue + Saturation + Lightness' }}</text>
  </svg>
</template>
