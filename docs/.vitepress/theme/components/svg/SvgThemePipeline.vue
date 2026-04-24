<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')

const shades = [
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
]

const semantics = [
  { name: 'bg',       shade: '50',  color: '#e6f7ff' },
  { name: 'disabled', shade: '200', color: '#91d5ff' },
  { name: 'border',   shade: '300', color: '#69c0ff' },
  { name: 'hover',    shade: '400', color: '#40a9ff' },
  { name: 'active',   shade: '600', color: '#096dd9' },
  { name: 'text',     shade: '900', color: '#002766' },
]
</script>

<template>
  <svg width="520" height="280" viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '主题生成流程示意图' : 'Theme Generation Pipeline'">
    <defs>
      <marker id="tp-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="currentColor" />
      </marker>
    </defs>

    <!-- Step 1: Base color -->
    <text x="16" y="18" font-size="11" fill="currentColor" font-weight="600">{{ isZh ? '① 基础色' : '① Base Color' }}</text>
    <rect x="16" y="26" width="56" height="56" rx="8" fill="#1890ff" stroke="currentColor" stroke-width="1.5" />
    <text x="44" y="98" font-size="9" fill="currentColor" text-anchor="middle">#1890ff</text>
    <text x="44" y="110" font-size="8" fill="currentColor" text-anchor="middle" opacity="0.6">primary</text>

    <!-- Arrow -->
    <line x1="80" y1="54" x2="112" y2="54" stroke="currentColor" stroke-width="1.5" marker-end="url(#tp-arrow)" />

    <!-- Step 2: Shade palette -->
    <text x="118" y="18" font-size="11" fill="currentColor" font-weight="600">{{ isZh ? '② 色阶面板 (50–900)' : '② Shade Palette (50–900)' }}</text>
    <g v-for="(s, i) in shades" :key="s.label">
      <rect :x="118 + i * 26" y="26" width="24" height="56" :rx="i === 0 ? 4 : i === shades.length - 1 ? 4 : 0" :fill="s.color" stroke="currentColor" stroke-width="0.3" />
      <text :x="118 + i * 26 + 12" y="98" font-size="7" fill="currentColor" text-anchor="middle" opacity="0.7">{{ s.label }}</text>
    </g>
    <!-- Highlight 500 -->
    <rect x="248" y="24" width="28" height="60" rx="0" fill="none" stroke="#34D399" stroke-width="2" />
    <text x="262" y="110" font-size="8" fill="#34D399" text-anchor="middle" font-weight="600">{{ isZh ? '基准色' : 'base' }}</text>

    <!-- Arrow to semantic -->
    <line x1="260" y1="120" x2="260" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#tp-arrow)" />

    <!-- Step 3: Semantic colors -->
    <text x="16" y="158" font-size="11" fill="currentColor" font-weight="600">{{ isZh ? '③ 语义色' : '③ Semantic Colors' }}</text>
    <g v-for="(sem, i) in semantics" :key="sem.name">
      <rect :x="16 + i * 72" y="168" width="64" height="28" rx="4" :fill="sem.color" stroke="currentColor" stroke-width="0.5" />
      <text :x="16 + i * 72 + 32" y="212" font-size="9" fill="currentColor" text-anchor="middle" font-weight="600">{{ sem.name }}</text>
      <text :x="16 + i * 72 + 32" y="224" font-size="7" fill="currentColor" text-anchor="middle" opacity="0.6">← {{ sem.shade }}</text>
    </g>

    <!-- Arrow to CSS -->
    <line x1="260" y1="230" x2="260" y2="248" stroke="currentColor" stroke-width="1.5" marker-end="url(#tp-arrow)" />

    <!-- Step 4: CSS Variables -->
    <text x="16" y="268" font-size="11" fill="currentColor" font-weight="600">{{ isZh ? '④ CSS 变量' : '④ CSS Variables' }}</text>
    <text x="150" y="268" font-size="10" fill="currentColor" font-family="monospace" opacity="0.8">--x-primary-500: #1890ff; --x-primary-hover: #40a9ff; ...</text>
  </svg>
</template>
