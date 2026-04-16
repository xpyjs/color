<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="320" height="200" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'HSV 色彩空间示意图' : 'HSV Color Space Diagram'">
    <!-- Simplified HSV cone as a triangle side view -->
    <defs>
      <linearGradient id="hsv-v" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#000" />
        <stop offset="100%" stop-color="hsl(0,100%,50%)" />
      </linearGradient>
    </defs>
    <!-- Cone shape (inverted triangle) -->
    <polygon points="80,20 160,20 120,170" fill="url(#hsv-v)" stroke="currentColor" stroke-width="1" opacity="0.8" />
    <!-- Hue ring at top -->
    <line x1="80" y1="20" x2="160" y2="20" stroke="currentColor" stroke-width="1" />
    <!-- Labels on cone -->
    <text x="120" y="14" font-size="10" fill="currentColor" text-anchor="middle">V = 100%</text>
    <text x="120" y="186" font-size="10" fill="currentColor" text-anchor="middle">V = 0%</text>
    <!-- S dimension -->
    <line x1="82" y1="46" x2="120" y2="46" stroke="#34D399" stroke-width="1.5" marker-end="url(#hsv-arrowR)" />
    <defs>
      <marker id="hsv-arrowR" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="#34D399" />
      </marker>
    </defs>
    <text x="80" y="42" font-size="9" fill="#34D399" text-anchor="end">S</text>

    <!-- Right side: value bar -->
    <defs>
      <linearGradient id="hsv-vbar" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#000" />
        <stop offset="100%" stop-color="hsl(210,80%,50%)" />
      </linearGradient>
    </defs>
    <rect x="200" y="40" width="20" height="120" rx="4" fill="url(#hsv-vbar)" stroke="currentColor" stroke-width="0.5" />
    <text x="210" y="34" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">{{ isZh ? '明度 V' : 'Value V' }}</text>
    <text x="228" y="48" font-size="9" fill="currentColor">100%</text>
    <text x="228" y="164" font-size="9" fill="currentColor">0%</text>

    <!-- Difference note -->
    <text x="260" y="90" font-size="10" fill="currentColor" font-weight="600">HSV vs HSL</text>
    <text x="260" y="108" font-size="9" fill="currentColor" opacity="0.8">{{ isZh ? 'V=100% 对应纯色' : 'V=100% → pure color' }}</text>
    <text x="260" y="122" font-size="9" fill="currentColor" opacity="0.8">{{ isZh ? 'L=50% 对应纯色' : 'L=50% → pure color' }}</text>
  </svg>
</template>
