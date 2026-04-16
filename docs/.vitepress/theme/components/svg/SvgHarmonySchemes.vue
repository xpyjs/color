<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

// Small color wheel helper positions (12 hue stops)
const R = 22
const CX = 32
const CY = 32
function huePos(deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) }
}
</script>

<template>
  <svg width="600" height="260" viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '配色方案示意图' : 'Harmony Schemes Diagram'">
    <!-- Complement -->
    <g transform="translate(10, 20)">
      <text :x="CX" y="0" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">complement</text>
      <circle :cx="CX" :cy="CY" :r="R+4" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <circle :cx="huePos(0).x" :cy="huePos(0).y" r="6" fill="hsl(0,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(180).x" :cy="huePos(180).y" r="6" fill="hsl(180,80%,55%)" stroke="currentColor" stroke-width="1" />
      <line :x1="huePos(0).x" :y1="huePos(0).y" :x2="huePos(180).x" :y2="huePos(180).y" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 2" />
    </g>
    <!-- Triad -->
    <g transform="translate(100, 20)">
      <text :x="CX" y="0" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">triad</text>
      <circle :cx="CX" :cy="CY" :r="R+4" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <circle :cx="huePos(0).x" :cy="huePos(0).y" r="6" fill="hsl(0,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(120).x" :cy="huePos(120).y" r="6" fill="hsl(120,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(240).x" :cy="huePos(240).y" r="6" fill="hsl(240,80%,55%)" stroke="currentColor" stroke-width="1" />
      <polygon :points="`${huePos(0).x},${huePos(0).y} ${huePos(120).x},${huePos(120).y} ${huePos(240).x},${huePos(240).y}`" fill="none" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 2" />
    </g>
    <!-- Tetrad -->
    <g transform="translate(190, 20)">
      <text :x="CX" y="0" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">tetrad</text>
      <circle :cx="CX" :cy="CY" :r="R+4" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <circle :cx="huePos(0).x" :cy="huePos(0).y" r="6" fill="hsl(0,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(90).x" :cy="huePos(90).y" r="6" fill="hsl(90,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(180).x" :cy="huePos(180).y" r="6" fill="hsl(180,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(270).x" :cy="huePos(270).y" r="6" fill="hsl(270,80%,55%)" stroke="currentColor" stroke-width="1" />
      <polygon :points="`${huePos(0).x},${huePos(0).y} ${huePos(90).x},${huePos(90).y} ${huePos(180).x},${huePos(180).y} ${huePos(270).x},${huePos(270).y}`" fill="none" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 2" />
    </g>
    <!-- Split Complement -->
    <g transform="translate(280, 20)">
      <text :x="CX" y="0" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">splitComplement</text>
      <circle :cx="CX" :cy="CY" :r="R+4" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <circle :cx="huePos(0).x" :cy="huePos(0).y" r="6" fill="hsl(0,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(150).x" :cy="huePos(150).y" r="6" fill="hsl(150,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(210).x" :cy="huePos(210).y" r="6" fill="hsl(210,80%,55%)" stroke="currentColor" stroke-width="1" />
      <polygon :points="`${huePos(0).x},${huePos(0).y} ${huePos(150).x},${huePos(150).y} ${huePos(210).x},${huePos(210).y}`" fill="none" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 2" />
    </g>
    <!-- Analogous -->
    <g transform="translate(10, 140)">
      <text :x="CX" y="0" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">analogous</text>
      <circle :cx="CX" :cy="CY" :r="R+4" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <circle :cx="huePos(-60).x" :cy="huePos(-60).y" r="5" fill="hsl(300,80%,55%)" stroke="currentColor" stroke-width="0.8" />
      <circle :cx="huePos(-30).x" :cy="huePos(-30).y" r="5" fill="hsl(330,80%,55%)" stroke="currentColor" stroke-width="0.8" />
      <circle :cx="huePos(0).x" :cy="huePos(0).y" r="6" fill="hsl(0,80%,55%)" stroke="currentColor" stroke-width="1" />
      <circle :cx="huePos(30).x" :cy="huePos(30).y" r="5" fill="hsl(30,80%,55%)" stroke="currentColor" stroke-width="0.8" />
      <circle :cx="huePos(60).x" :cy="huePos(60).y" r="5" fill="hsl(60,80%,55%)" stroke="currentColor" stroke-width="0.8" />
      <circle :cx="huePos(90).x" :cy="huePos(90).y" r="5" fill="hsl(90,80%,55%)" stroke="currentColor" stroke-width="0.8" />
    </g>
    <!-- Monochromatic -->
    <g transform="translate(100, 140)">
      <text :x="CX" y="0" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">monochromatic</text>
      <rect x="6" y="14" width="52" height="52" rx="4" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
      <rect x="10" y="18" width="10" height="10" rx="2" fill="hsl(0,80%,15%)" />
      <rect x="24" y="18" width="10" height="10" rx="2" fill="hsl(0,80%,30%)" />
      <rect x="38" y="18" width="10" height="10" rx="2" fill="hsl(0,80%,45%)" />
      <rect x="10" y="32" width="10" height="10" rx="2" fill="hsl(0,80%,55%)" stroke="#34D399" stroke-width="1" />
      <rect x="24" y="32" width="10" height="10" rx="2" fill="hsl(0,80%,70%)" />
      <rect x="38" y="32" width="10" height="10" rx="2" fill="hsl(0,80%,85%)" />
      <text x="32" y="60" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '同色相不同明度' : 'Same hue, varied L' }}</text>
    </g>
    <!-- Legend -->
    <g transform="translate(220, 150)">
      <circle cx="8" cy="8" r="5" fill="hsl(0,80%,55%)" stroke="currentColor" stroke-width="1" />
      <text x="20" y="12" font-size="10" fill="currentColor">{{ isZh ? '= 基准色 (红色 H=0°)' : '= base color (red H=0°)' }}</text>
      <text x="0" y="32" font-size="10" fill="currentColor" opacity="0.7">{{ isZh ? '圆环上的位置 = 色相角度' : 'Position on ring = hue angle' }}</text>
      <text x="0" y="48" font-size="10" fill="currentColor" opacity="0.7">{{ isZh ? '虚线 = 方案中颜色的关系' : 'Dashed line = relationship' }}</text>
    </g>
  </svg>
</template>
