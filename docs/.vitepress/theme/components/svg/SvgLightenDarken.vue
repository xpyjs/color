<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'lighten 与 darken 示意图' : 'lighten and darken diagram'">
    <!-- Lightness bar -->
    <defs>
      <linearGradient id="ld-grad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#000" />
        <stop offset="50%" stop-color="hsl(210,70%,50%)" />
        <stop offset="100%" stop-color="#fff" />
      </linearGradient>
      <marker id="ld-arrowUp" markerWidth="10" markerHeight="10" refX="5" refY="9" orient="auto">
        <path d="M1,9 L5,1 L9,9" fill="none" stroke="#34D399" stroke-width="1.5" />
      </marker>
      <marker id="ld-arrowDown" markerWidth="10" markerHeight="10" refX="5" refY="1" orient="auto">
        <path d="M1,1 L5,9 L9,1" fill="none" stroke="#FB7185" stroke-width="1.5" />
      </marker>
    </defs>
    <rect x="40" y="16" width="40" height="148" rx="6" fill="url(#ld-grad)" stroke="currentColor" stroke-width="1" opacity="0.9" />
    <!-- Marker: original -->
    <circle cx="60" cy="90" r="5" fill="hsl(210,70%,50%)" stroke="currentColor" stroke-width="1.5" />
    <line x1="84" y1="90" x2="110" y2="90" stroke="currentColor" stroke-width="1" stroke-dasharray="4 2" />
    <text x="114" y="94" font-size="12" fill="currentColor">{{ isZh ? '原色 L=50%' : 'Original L=50%' }}</text>
    <!-- Arrow up: lighten (from original circle edge to lighten circle edge) -->
    <line x1="60" y1="84" x2="60" y2="45" stroke="#34D399" stroke-width="2" marker-end="url(#ld-arrowUp)" />
    <circle cx="60" cy="40" r="4" fill="hsl(210,70%,70%)" stroke="#34D399" stroke-width="1.5" />
    <line x1="84" y1="40" x2="110" y2="40" stroke="#34D399" stroke-width="1" stroke-dasharray="4 2" />
    <text x="114" y="44" font-size="12" fill="#34D399" font-weight="600">lighten(20) → L=70%</text>
    <!-- Arrow down: darken (from original circle edge to darken circle edge) -->
    <line x1="60" y1="96" x2="60" y2="135" stroke="#FB7185" stroke-width="2" marker-end="url(#ld-arrowDown)" />
    <circle cx="60" cy="140" r="4" fill="hsl(210,70%,30%)" stroke="#FB7185" stroke-width="1.5" />
    <line x1="84" y1="140" x2="110" y2="140" stroke="#FB7185" stroke-width="1" stroke-dasharray="4 2" />
    <text x="114" y="144" font-size="12" fill="#FB7185" font-weight="600">darken(20) → L=30%</text>
  </svg>
</template>
