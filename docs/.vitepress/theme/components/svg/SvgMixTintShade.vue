<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="380" height="140" viewBox="0 0 380 140" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'mix / tint / shade 色彩混合示意图' : 'mix / tint / shade diagram'">
    <!-- Mix -->
    <text x="16" y="26" font-size="12" fill="currentColor" font-weight="600">mix</text>
    <rect x="60" y="12" width="28" height="28" rx="4" fill="#E74C3C" />
    <text x="94" y="30" font-size="12" fill="currentColor">+</text>
    <rect x="108" y="12" width="28" height="28" rx="4" fill="#3498DB" />
    <text x="142" y="30" font-size="12" fill="currentColor">=</text>
    <rect x="156" y="12" width="28" height="28" rx="4" fill="#8C6CB8" />
    <text x="194" y="30" font-size="10" fill="currentColor" opacity="0.7">50%{{ isZh ? ' 混合' : ' blend' }}</text>

    <!-- Tint (mix with white) -->
    <text x="16" y="72" font-size="12" fill="currentColor" font-weight="600">tint</text>
    <rect x="60" y="58" width="28" height="28" rx="4" fill="#E74C3C" />
    <text x="94" y="76" font-size="12" fill="currentColor">+</text>
    <rect x="108" y="58" width="28" height="28" rx="4" fill="#ffffff" stroke="currentColor" stroke-width="1" />
    <text x="142" y="76" font-size="12" fill="currentColor">=</text>
    <!-- 5 step tint bar -->
    <rect x="156" y="58" width="28" height="28" rx="4" fill="#ED7A6E" />
    <rect x="188" y="58" width="28" height="28" rx="4" fill="#F3A59E" />
    <rect x="220" y="58" width="28" height="28" rx="4" fill="#F9D2CE" />
    <text x="260" y="76" font-size="10" fill="currentColor" opacity="0.7">{{ isZh ? '与白色混合' : 'mix with white' }}</text>

    <!-- Shade (mix with black) -->
    <text x="16" y="118" font-size="12" fill="currentColor" font-weight="600">shade</text>
    <rect x="60" y="104" width="28" height="28" rx="4" fill="#E74C3C" />
    <text x="94" y="122" font-size="12" fill="currentColor">+</text>
    <rect x="108" y="104" width="28" height="28" rx="4" fill="#000000" stroke="currentColor" stroke-width="1" />
    <text x="142" y="122" font-size="12" fill="currentColor">=</text>
    <!-- 5 step shade bar -->
    <rect x="156" y="104" width="28" height="28" rx="4" fill="#B33C30" />
    <rect x="188" y="104" width="28" height="28" rx="4" fill="#7A2921" />
    <rect x="220" y="104" width="28" height="28" rx="4" fill="#401510" />
    <text x="260" y="122" font-size="10" fill="currentColor" opacity="0.7">{{ isZh ? '与黑色混合' : 'mix with black' }}</text>
  </svg>
</template>
