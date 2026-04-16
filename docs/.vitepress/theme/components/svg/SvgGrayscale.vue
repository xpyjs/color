<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '灰度化示意图' : 'grayscale diagram'">
    <!-- Original -->
    <rect x="16" y="16" width="56" height="56" rx="8" fill="hsl(210,80%,55%)" stroke="currentColor" stroke-width="1" />
    <text x="44" y="88" font-size="10" fill="currentColor" text-anchor="middle">{{ isZh ? '原色' : 'Original' }}</text>
    <!-- Arrow -->
    <line x1="82" y1="44" x2="130" y2="44" stroke="currentColor" stroke-width="1.5" marker-end="url(#gs-arrow)" />
    <defs>
      <marker id="gs-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="currentColor" />
      </marker>
    </defs>
    <text x="106" y="38" font-size="10" fill="currentColor" text-anchor="middle">S → 0</text>
    <!-- Result -->
    <rect x="140" y="16" width="56" height="56" rx="8" fill="hsl(210,0%,55%)" stroke="currentColor" stroke-width="1" />
    <text x="168" y="88" font-size="10" fill="currentColor" text-anchor="middle">{{ isZh ? '灰度' : 'Grayscale' }}</text>
    <!-- Note -->
    <text x="220" y="36" font-size="11" fill="currentColor">{{ isZh ? '保持色相/亮度' : 'Keeps hue & lightness' }}</text>
    <text x="220" y="54" font-size="11" fill="currentColor">{{ isZh ? '仅将饱和度设为 0' : 'Sets saturation to 0' }}</text>
  </svg>
</template>
