<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const types = [
  { name: isZh ? '正常视觉' : 'Normal', swatch: ['#E74C3C', '#27AE60', '#2980B9', '#F39C12'] },
  { name: isZh ? '红色盲 (Protanopia)' : 'Protanopia', swatch: ['#9B8F49', '#9B8F49', '#3966C5', '#D9A720'] },
  { name: isZh ? '绿色盲 (Deuteranopia)' : 'Deuteranopia', swatch: ['#B6912F', '#B6912F', '#3675BE', '#E5A514'] },
  { name: isZh ? '蓝色盲 (Tritanopia)' : 'Tritanopia', swatch: ['#E84F5A', '#2CADB0', '#234F5E', '#F09995'] },
]
</script>

<template>
  <svg width="420" height="160" viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '色觉模拟示意图' : 'Color Vision Simulation'">
    <g v-for="(type, ti) in types" :key="type.name" :transform="`translate(0, ${ti * 38 + 10})`">
      <text x="10" y="14" font-size="10" fill="currentColor" font-weight="600">{{ type.name }}</text>
      <g v-for="(c, ci) in type.swatch" :key="ci">
        <rect :x="160 + ci * 56" y="0" width="48" height="24" rx="4" :fill="c" stroke="currentColor" stroke-width="0.3" />
      </g>
    </g>
  </svg>
</template>
