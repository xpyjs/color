<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const modes = [
  { name: 'normal',     a: '#E74C3C', b: '#3498DB', result: '#3498DB' },
  { name: 'multiply',   a: '#E74C3C', b: '#3498DB', result: '#2F1437' },
  { name: 'screen',     a: '#E74C3C', b: '#3498DB', result: '#F7C8E7' },
  { name: 'overlay',    a: '#E74C3C', b: '#3498DB', result: '#D4296E' },
  { name: 'darken',     a: '#E74C3C', b: '#3498DB', result: '#3418DB' },
  { name: 'lighten',    a: '#E74C3C', b: '#3498DB', result: '#E798DB' },
]
</script>

<template>
  <svg :width="modes.length * 80 + 20" height="100" :viewBox="`0 0 ${modes.length * 80 + 20} 100`" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '混合模式预览' : 'Blend Modes Preview'">
    <g v-for="(m, i) in modes" :key="m.name" :transform="`translate(${i * 80 + 10}, 10)`">
      <text x="28" y="0" font-size="9" fill="currentColor" text-anchor="middle" font-weight="600">{{ m.name }}</text>
      <!-- Two overlapping circles -->
      <circle cx="20" cy="30" r="14" :fill="m.a" opacity="0.85" />
      <circle cx="36" cy="30" r="14" :fill="m.b" opacity="0.85" />
      <!-- Result swatch -->
      <rect x="10" y="52" width="36" height="20" rx="4" :fill="m.result" stroke="currentColor" stroke-width="0.5" />
      <text x="28" y="86" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.7">{{ m.result }}</text>
    </g>
  </svg>
</template>
