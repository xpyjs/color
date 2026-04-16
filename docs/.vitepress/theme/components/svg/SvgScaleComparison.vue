<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

// Simplified demonstration of scale interpolation:
// RGB interpolation (linear in sRGB) vs Lab interpolation (perceptually uniform)
const rgbSteps = ['#E74C3C', '#C26660', '#9D8084', '#789BA8', '#53B5CB', '#2ECFEF']
const labSteps = ['#E74C3C', '#D06452', '#B87C6D', '#9F9489', '#84ACA8', '#65C5C8']
</script>

<template>
  <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '色彩空间插值对比' : 'Color Space Interpolation Comparison'">
    <!-- RGB row -->
    <text x="10" y="24" font-size="11" fill="currentColor" font-weight="600">RGB</text>
    <g v-for="(c, i) in rgbSteps" :key="'rgb' + i">
      <rect :x="60 + i * 52" y="10" width="48" height="24" :rx="i === 0 ? 6 : i === rgbSteps.length - 1 ? 6 : 0" :fill="c" stroke="currentColor" stroke-width="0.3" />
    </g>

    <!-- Lab row -->
    <text x="10" y="70" font-size="11" fill="currentColor" font-weight="600">Lab</text>
    <g v-for="(c, i) in labSteps" :key="'lab' + i">
      <rect :x="60 + i * 52" y="56" width="48" height="24" :rx="i === 0 ? 6 : i === labSteps.length - 1 ? 6 : 0" :fill="c" stroke="currentColor" stroke-width="0.3" />
    </g>

    <!-- Note -->
    <text x="60" y="104" font-size="10" fill="currentColor" opacity="0.7">{{ isZh ? 'Lab 插值在感知上更均匀，RGB 中间会出现"灰泥色"' : 'Lab gives perceptually uniform steps; RGB may produce muddy midtones' }}</text>
  </svg>
</template>
