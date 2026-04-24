<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const shades = [
  { label: isZh ? '最深' : 'darkest', color: '#0c2d6b' },
  { label: '', color: '#174ea6' },
  { label: '', color: '#1d6bd4' },
  { label: '', color: '#2d7ee0' },
  { label: '', color: '#3388ea' },
]
const original = { label: isZh ? '原色' : 'base', color: '#3b82f6' }
const tints = [
  { label: '', color: '#6aa3f8' },
  { label: '', color: '#8dbafa' },
  { label: '', color: '#b1d1fc' },
  { label: '', color: '#d5e8fd' },
  { label: isZh ? '最浅' : 'lightest', color: '#eaf4fe' },
]
</script>

<template>
  <svg width="500" height="100" viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'tones 明暗色调序列示意图' : 'tones tonal range diagram'">
    <!-- Shades (darker) -->
    <text x="120" y="14" font-size="10" fill="#FB7185" text-anchor="middle" font-weight="600">← shade</text>
    <g v-for="(s, i) in shades" :key="'s' + i">
      <rect :x="8 + i * 44" y="20" width="40" height="32" :rx="i === 0 ? 6 : 0" :fill="s.color" stroke="currentColor" stroke-width="0.3" />
      <text v-if="s.label" :x="8 + i * 44 + 20" y="68" font-size="7" fill="currentColor" text-anchor="middle" opacity="0.6">{{ s.label }}</text>
    </g>

    <!-- Original (highlighted) -->
    <rect :x="8 + 5 * 44" y="18" width="44" height="36" rx="0" :fill="original.color" stroke="#34D399" stroke-width="2.5" />
    <text :x="8 + 5 * 44 + 22" y="68" font-size="8" fill="#34D399" text-anchor="middle" font-weight="600">{{ original.label }}</text>
    <text :x="8 + 5 * 44 + 22" y="80" font-size="7" fill="currentColor" text-anchor="middle" opacity="0.5">#3b82f6</text>

    <!-- Tints (lighter) -->
    <text x="370" y="14" font-size="10" fill="#34D399" text-anchor="middle" font-weight="600">tint →</text>
    <g v-for="(t, i) in tints" :key="'t' + i">
      <rect :x="8 + (6 + i) * 44" y="20" width="40" height="32" :rx="i === tints.length - 1 ? 6 : 0" :fill="t.color" stroke="currentColor" stroke-width="0.3" />
      <text v-if="t.label" :x="8 + (6 + i) * 44 + 20" y="68" font-size="7" fill="currentColor" text-anchor="middle" opacity="0.6">{{ t.label }}</text>
    </g>

    <text x="250" y="96" font-size="9" fill="currentColor" text-anchor="middle" opacity="0.5">{{ isZh ? 'shades（暗色）+ 原色 + tints（亮色）= 完整色调序列' : 'shades (dark) + original + tints (light) = full tonal range' }}</text>
  </svg>
</template>
