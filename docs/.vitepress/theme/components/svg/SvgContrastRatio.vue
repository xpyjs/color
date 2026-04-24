<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const levels = [
  { ratio: '1:1',   bar: 0,    label: '',        pass: '' },
  { ratio: '3:1',   bar: 33,   label: 'AA Large', pass: 'large' },
  { ratio: '4.5:1', bar: 50,   label: 'AA',       pass: 'normal' },
  { ratio: '7:1',   bar: 72,   label: 'AAA',      pass: 'enhanced' },
  { ratio: '21:1',  bar: 100,  label: '',          pass: '' },
]

const examples = [
  { fg: '#ffffff', bg: '#1890ff', ratio: '3.9:1', level: 'AA Large' },
  { fg: '#ffffff', bg: '#0050b3', ratio: '8.6:1', level: 'AAA' },
  { fg: '#002766', bg: '#e6f7ff', ratio: '13.2:1', level: 'AAA' },
  { fg: '#666666', bg: '#ffffff', ratio: '5.7:1', level: 'AA' },
]
</script>

<template>
  <svg width="480" height="200" viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'WCAG 对比度等级示意图' : 'WCAG Contrast Ratio Levels'">
    <defs>
      <linearGradient id="cr-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FB7185" />
        <stop offset="33%" stop-color="#FBBF24" />
        <stop offset="50%" stop-color="#34D399" />
        <stop offset="100%" stop-color="#34D399" />
      </linearGradient>
    </defs>

    <!-- Title -->
    <text x="12" y="18" font-size="11" fill="currentColor" font-weight="600">{{ isZh ? 'WCAG 对比度等级' : 'WCAG Contrast Ratio Levels' }}</text>

    <!-- Gradient bar -->
    <rect x="12" y="28" width="300" height="20" rx="10" fill="url(#cr-grad)" stroke="currentColor" stroke-width="0.5" />

    <!-- Level markers -->
    <line x1="12" y1="52" x2="12" y2="60" stroke="currentColor" stroke-width="1" />
    <text x="12" y="72" font-size="8" fill="currentColor" text-anchor="middle">1:1</text>

    <line x1="111" y1="28" x2="111" y2="60" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" />
    <text x="111" y="72" font-size="9" fill="#FBBF24" text-anchor="middle" font-weight="600">3:1</text>
    <text x="111" y="82" font-size="7" fill="currentColor" text-anchor="middle">AA Large</text>

    <line x1="162" y1="28" x2="162" y2="60" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" />
    <text x="162" y="72" font-size="9" fill="#34D399" text-anchor="middle" font-weight="600">4.5:1</text>
    <text x="162" y="82" font-size="7" fill="currentColor" text-anchor="middle">AA</text>

    <line x1="228" y1="28" x2="228" y2="60" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" />
    <text x="228" y="72" font-size="9" fill="#34D399" text-anchor="middle" font-weight="600">7:1</text>
    <text x="228" y="82" font-size="7" fill="currentColor" text-anchor="middle">AAA</text>

    <line x1="312" y1="52" x2="312" y2="60" stroke="currentColor" stroke-width="1" />
    <text x="312" y="72" font-size="8" fill="currentColor" text-anchor="middle">21:1</text>

    <!-- Examples -->
    <text x="12" y="110" font-size="11" fill="currentColor" font-weight="600">{{ isZh ? '示例' : 'Examples' }}</text>

    <g v-for="(ex, i) in examples" :key="i" :transform="`translate(${i * 116 + 12}, 118)`">
      <rect x="0" y="0" width="108" height="36" rx="6" :fill="ex.bg" stroke="currentColor" stroke-width="0.5" />
      <text x="54" y="16" font-size="11" :fill="ex.fg" text-anchor="middle" font-weight="600">Aa</text>
      <text x="54" y="28" font-size="7" :fill="ex.fg" text-anchor="middle">{{ ex.ratio }}</text>
      <text x="54" y="52" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.7">{{ ex.fg }}</text>
      <text x="54" y="62" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.7">{{ isZh ? '在' : 'on' }} {{ ex.bg }}</text>
      <rect x="28" y="68" width="52" height="14" rx="3" :fill="ex.level === 'AAA' ? '#34D399' : ex.level === 'AA' ? '#34D399' : '#FBBF24'" opacity="0.15" />
      <text x="54" y="79" font-size="8" :fill="ex.level === 'AAA' ? '#34D399' : ex.level === 'AA' ? '#34D399' : '#FBBF24'" text-anchor="middle" font-weight="600">{{ ex.level }}</text>
    </g>
  </svg>
</template>
