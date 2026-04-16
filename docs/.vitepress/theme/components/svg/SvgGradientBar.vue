<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const steps = ['#E74C3C', '#C96B5E', '#AB927F', '#8DB9A0', '#6FE0C2', '#3498DB']
</script>

<template>
  <svg width="400" height="80" viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '渐变条示意图' : 'Gradient Bar Diagram'">
    <!-- From label -->
    <text x="16" y="18" font-size="10" fill="currentColor">{{ isZh ? '起始色' : 'From' }}</text>
    <!-- Step blocks -->
    <g v-for="(color, i) in steps" :key="i">
      <rect :x="16 + i * 60" y="26" width="54" height="28" :rx="i === 0 ? '6 0 0 6' : i === steps.length - 1 ? '0 6 6 0' : '0'" :fill="color" stroke="currentColor" stroke-width="0.5" />
      <text :x="16 + i * 60 + 27" y="70" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.7">{{ i }}</text>
    </g>
    <!-- To label -->
    <text x="376" y="18" font-size="10" fill="currentColor" text-anchor="end">{{ isZh ? '目标色' : 'To' }}</text>
    <!-- Step count -->
    <text x="200" y="18" font-size="10" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '6 步渐变' : '6 steps' }}</text>
  </svg>
</template>
