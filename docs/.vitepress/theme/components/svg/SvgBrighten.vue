<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="360" height="100" viewBox="0 0 360 100" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'brighten 示意图' : 'brighten diagram'">
    <!-- Original color -->
    <rect x="16" y="20" width="60" height="60" rx="8" fill="rgb(51,102,204)" stroke="currentColor" stroke-width="1" />
    <text x="46" y="94" font-size="10" fill="currentColor" text-anchor="middle">RGB(51,102,204)</text>
    <!-- Arrow -->
    <line x1="86" y1="50" x2="140" y2="50" stroke="currentColor" stroke-width="1.5" marker-end="url(#br-arrow)" />
    <defs>
      <marker id="br-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="currentColor" />
      </marker>
    </defs>
    <text x="113" y="44" font-size="10" fill="#34D399" text-anchor="middle" font-weight="600">+30%</text>
    <!-- Result: each channel moved 30% toward 255 -->
    <rect x="150" y="20" width="60" height="60" rx="8" fill="rgb(112,147,219)" stroke="#34D399" stroke-width="1.5" />
    <text x="180" y="94" font-size="10" fill="currentColor" text-anchor="middle">RGB(112,147,219)</text>
    <!-- Formula -->
    <text x="234" y="40" font-size="11" fill="currentColor">{{ isZh ? '每通道向 255 靠近' : 'Each channel → 255' }}</text>
    <text x="234" y="58" font-size="10" fill="currentColor" font-family="monospace">R = 51 + (255-51)×0.3</text>
    <text x="234" y="72" font-size="10" fill="currentColor" font-family="monospace">= 112.2</text>
  </svg>
</template>
