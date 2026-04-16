<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="300" height="120" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'RGB 通道示意图' : 'RGB Channels Diagram'">
    <!-- Red channel -->
    <defs>
      <linearGradient id="rgb-r" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgb(0,0,0)" />
        <stop offset="100%" stop-color="rgb(255,0,0)" />
      </linearGradient>
      <linearGradient id="rgb-g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgb(0,0,0)" />
        <stop offset="100%" stop-color="rgb(0,255,0)" />
      </linearGradient>
      <linearGradient id="rgb-b" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgb(0,0,0)" />
        <stop offset="100%" stop-color="rgb(0,0,255)" />
      </linearGradient>
    </defs>
    <!-- R -->
    <text x="16" y="26" font-size="13" fill="#EF4444" font-weight="700">R</text>
    <rect x="36" y="14" width="200" height="16" rx="8" fill="url(#rgb-r)" stroke="currentColor" stroke-width="0.5" />
    <text x="244" y="26" font-size="9" fill="currentColor">0 – 255</text>
    <!-- G -->
    <text x="16" y="60" font-size="13" fill="#22C55E" font-weight="700">G</text>
    <rect x="36" y="48" width="200" height="16" rx="8" fill="url(#rgb-g)" stroke="currentColor" stroke-width="0.5" />
    <text x="244" y="60" font-size="9" fill="currentColor">0 – 255</text>
    <!-- B -->
    <text x="16" y="94" font-size="13" fill="#3B82F6" font-weight="700">B</text>
    <rect x="36" y="82" width="200" height="16" rx="8" fill="url(#rgb-b)" stroke="currentColor" stroke-width="0.5" />
    <text x="244" y="94" font-size="9" fill="currentColor">0 – 255</text>
    <!-- Bottom label -->
    <text x="136" y="114" font-size="10" fill="currentColor" text-anchor="middle" opacity="0.7">rgb(R, G, B) — {{ isZh ? '三通道各自 0–255' : 'Each channel 0–255' }}</text>
  </svg>
</template>
