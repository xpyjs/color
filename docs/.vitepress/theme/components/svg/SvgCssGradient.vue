<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const stops = ['#6366f1', '#8b5cc5', '#b35299', '#db486d', '#ec4899']
</script>

<template>
  <svg width="440" height="100" viewBox="0 0 440 100" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'CSS 渐变背景示例' : 'CSS Gradient Background Example'">
    <defs>
      <linearGradient id="cg-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" :stop-color="stops[0]" />
        <stop offset="25%" :stop-color="stops[1]" />
        <stop offset="50%" :stop-color="stops[2]" />
        <stop offset="75%" :stop-color="stops[3]" />
        <stop offset="100%" :stop-color="stops[4]" />
      </linearGradient>
    </defs>

    <text x="12" y="18" font-size="10" fill="currentColor" font-weight="600">linear-gradient(to right, ...)</text>

    <!-- Gradient bar -->
    <rect x="12" y="26" width="416" height="32" rx="8" fill="url(#cg-grad)" stroke="currentColor" stroke-width="0.5" />

    <!-- Stop markers -->
    <g v-for="(s, i) in stops" :key="i">
      <circle :cx="12 + i * 104" cy="42" r="4" :fill="s" stroke="#fff" stroke-width="1.5" />
      <text :x="12 + i * 104" y="78" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.7">{{ s }}</text>
    </g>

    <text x="228" y="96" font-size="9" fill="currentColor" text-anchor="middle" opacity="0.5">{{ isZh ? '5 步渐变生成连续 CSS 渐变背景' : '5-step gradient → CSS linear-gradient background' }}</text>
  </svg>
</template>
