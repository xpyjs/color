<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const antdShades = [
  { label: '50',  color: '#e6f7ff' },
  { label: '100', color: '#bae7ff' },
  { label: '200', color: '#91d5ff' },
  { label: '300', color: '#69c0ff' },
  { label: '400', color: '#40a9ff' },
  { label: '500', color: '#1890ff' },
  { label: '600', color: '#096dd9' },
  { label: '700', color: '#0050b3' },
  { label: '800', color: '#003a8c' },
  { label: '900', color: '#002766' },
  { label: '950', color: '#001d66' },
]

const linearShades = [
  { label: '50',  color: '#eaf3ff' },
  { label: '100', color: '#d0e4ff' },
  { label: '200', color: '#a3c9ff' },
  { label: '300', color: '#75adff' },
  { label: '400', color: '#4892ff' },
  { label: '500', color: '#1890ff' },
  { label: '600', color: '#1474cc' },
  { label: '700', color: '#0f5799' },
  { label: '800', color: '#0a3b66' },
  { label: '900', color: '#051e33' },
  { label: '950', color: '#030f1a' },
]

const redAntd = [
  { label: '50',  color: '#fff1f0' },
  { label: '100', color: '#ffccc7' },
  { label: '200', color: '#ffa39e' },
  { label: '300', color: '#ff7875' },
  { label: '400', color: '#ff4d4f' },
  { label: '500', color: '#f5222d' },
  { label: '600', color: '#cf1322' },
  { label: '700', color: '#a8071a' },
  { label: '800', color: '#820014' },
  { label: '900', color: '#5c0011' },
  { label: '950', color: '#42000c' },
]

const redLinear = [
  { label: '50',  color: '#feeaea' },
  { label: '100', color: '#fdd0d0' },
  { label: '200', color: '#fba3a3' },
  { label: '300', color: '#f97575' },
  { label: '400', color: '#f74848' },
  { label: '500', color: '#f5222d' },
  { label: '600', color: '#c41b24' },
  { label: '700', color: '#93141b' },
  { label: '800', color: '#620e12' },
  { label: '900', color: '#310709' },
  { label: '950', color: '#190304' },
]
</script>

<template>
  <svg width="500" height="280" viewBox="0 0 500 280" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'antd 与 linear 色阶类型对比' : 'antd vs linear palette type comparison'">
    <!-- Blue - antd -->
    <text x="12" y="18" font-size="11" fill="currentColor" font-weight="600">antd</text>
    <text x="50" y="18" font-size="9" fill="currentColor" opacity="0.6">{{ isZh ? '— HSV 曲线，感知均匀' : '— HSV curve, perceptually uniform' }}</text>
    <g v-for="(s, i) in antdShades" :key="'a' + s.label">
      <rect :x="12 + i * 44" y="26" width="40" height="24" :rx="i === 0 ? 4 : i === antdShades.length - 1 ? 4 : 0" :fill="s.color" stroke="currentColor" stroke-width="0.3" />
      <text :x="12 + i * 44 + 20" y="62" font-size="6.5" fill="currentColor" text-anchor="middle" opacity="0.6">{{ s.label }}</text>
    </g>

    <!-- Blue - linear -->
    <text x="12" y="84" font-size="11" fill="currentColor" font-weight="600">linear</text>
    <text x="56" y="84" font-size="9" fill="currentColor" opacity="0.6">{{ isZh ? '— RGB 线性插值' : '— linear RGB interpolation' }}</text>
    <g v-for="(s, i) in linearShades" :key="'l' + s.label">
      <rect :x="12 + i * 44" y="92" width="40" height="24" :rx="i === 0 ? 4 : i === linearShades.length - 1 ? 4 : 0" :fill="s.color" stroke="currentColor" stroke-width="0.3" />
    </g>

    <!-- Divider -->
    <line x1="12" y1="130" x2="488" y2="130" stroke="currentColor" stroke-width="0.5" opacity="0.2" />

    <!-- Red - antd -->
    <text x="12" y="148" font-size="11" fill="currentColor" font-weight="600">antd</text>
    <text x="50" y="148" font-size="9" fill="currentColor" opacity="0.6">{{ isZh ? '— 色相旋转更丰富' : '— richer hue rotation' }}</text>
    <g v-for="(s, i) in redAntd" :key="'ra' + s.label">
      <rect :x="12 + i * 44" y="156" width="40" height="24" :rx="i === 0 ? 4 : i === redAntd.length - 1 ? 4 : 0" :fill="s.color" stroke="currentColor" stroke-width="0.3" />
      <text :x="12 + i * 44 + 20" y="192" font-size="6.5" fill="currentColor" text-anchor="middle" opacity="0.6">{{ s.label }}</text>
    </g>

    <!-- Red - linear -->
    <text x="12" y="214" font-size="11" fill="currentColor" font-weight="600">linear</text>
    <text x="56" y="214" font-size="9" fill="currentColor" opacity="0.6">{{ isZh ? '— 过渡更均匀但略单调' : '— even but may feel flat' }}</text>
    <g v-for="(s, i) in redLinear" :key="'rl' + s.label">
      <rect :x="12 + i * 44" y="222" width="40" height="24" :rx="i === 0 ? 4 : i === redLinear.length - 1 ? 4 : 0" :fill="s.color" stroke="currentColor" stroke-width="0.3" />
    </g>

    <text x="250" y="268" font-size="9" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? 'antd 算法通过非线性色相旋转和饱和度调整，生成更具层次感的色阶' : 'antd uses non-linear hue rotation & saturation shifts for richer palettes' }}</text>
  </svg>
</template>
