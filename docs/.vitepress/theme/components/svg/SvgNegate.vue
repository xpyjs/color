<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="320" height="100" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '颜色反转示意图' : 'negate / invert diagram'">
    <!-- Original -->
    <rect x="16" y="16" width="56" height="56" rx="8" fill="rgb(50,100,200)" stroke="currentColor" stroke-width="1" />
    <text x="44" y="88" font-size="10" fill="currentColor" text-anchor="middle">RGB(50,100,200)</text>
    <!-- Arrow -->
    <line x1="82" y1="44" x2="130" y2="44" stroke="currentColor" stroke-width="1.5" marker-end="url(#neg-arrow)" />
    <defs>
      <marker id="neg-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="currentColor" />
      </marker>
    </defs>
    <text x="106" y="38" font-size="9" fill="currentColor" text-anchor="middle">255 − c</text>
    <!-- Result -->
    <rect x="140" y="16" width="56" height="56" rx="8" fill="rgb(205,155,55)" stroke="currentColor" stroke-width="1" />
    <text x="168" y="88" font-size="10" fill="currentColor" text-anchor="middle">RGB(205,155,55)</text>
    <!-- Formula -->
    <text x="216" y="32" font-size="10" fill="currentColor" font-family="monospace">R: 255 − 50 = 205</text>
    <text x="216" y="48" font-size="10" fill="currentColor" font-family="monospace">G: 255 − 100 = 155</text>
    <text x="216" y="64" font-size="10" fill="currentColor" font-family="monospace">B: 255 − 200 = 55</text>
  </svg>
</template>
