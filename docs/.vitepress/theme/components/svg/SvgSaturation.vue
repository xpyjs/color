<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="360" height="120" viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '饱和度操作示意图' : 'saturation diagram'">
    <defs>
      <linearGradient id="sat-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="hsl(210, 0%, 50%)" />
        <stop offset="100%" stop-color="hsl(210, 100%, 50%)" />
      </linearGradient>
      <marker id="sat-arrowR" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <path d="M1,1 L9,5 L1,9" fill="#34D399" />
      </marker>
      <marker id="sat-arrowL" markerWidth="10" markerHeight="10" refX="1" refY="5" orient="auto">
        <path d="M9,1 L1,5 L9,9" fill="#FB7185" />
      </marker>
    </defs>
    <!-- Saturation bar -->
    <rect x="30" y="30" width="300" height="24" rx="12" fill="url(#sat-grad)" stroke="currentColor" stroke-width="1" opacity="0.9" />
    <!-- Labels -->
    <text x="30" y="74" font-size="10" fill="currentColor">S = 0%</text>
    <text x="295" y="74" font-size="10" fill="currentColor" text-anchor="end">S = 100%</text>
    <!-- Original marker at S=50% -->
    <circle cx="180" cy="42" r="6" fill="hsl(210,50%,50%)" stroke="currentColor" stroke-width="1.5" />
    <text x="180" y="90" font-size="11" fill="currentColor" text-anchor="middle">{{ isZh ? '原色 S=50%' : 'Original S=50%' }}</text>
    <!-- Saturate arrow (right, from original circle edge to target circle edge) -->
    <line x1="188" y1="42" x2="234" y2="42" stroke="#34D399" stroke-width="2" marker-end="url(#sat-arrowR)" />
    <circle cx="240" cy="42" r="4" fill="hsl(210,70%,50%)" stroke="#34D399" stroke-width="1.5" />
    <text x="248" y="38" font-size="10" fill="#34D399" font-weight="600">saturate(20)</text>
    <!-- Desaturate arrow (left, from original circle edge to target circle edge) -->
    <line x1="172" y1="42" x2="126" y2="42" stroke="#FB7185" stroke-width="2" marker-end="url(#sat-arrowL)" />
    <circle cx="120" cy="42" r="4" fill="hsl(210,30%,50%)" stroke="#FB7185" stroke-width="1.5" />
    <text x="40" y="110" font-size="10" fill="#FB7185" font-weight="600">desaturate(20)</text>
  </svg>
</template>
