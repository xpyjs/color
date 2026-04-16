<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="340" height="100" viewBox="0 0 340 100" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'Alpha 透明度操作示意图' : 'Alpha / opacity diagram'">
    <!-- Checkerboard pattern -->
    <defs>
      <pattern id="alpha-checker" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill="#ccc" />
        <rect x="4" width="4" height="4" fill="#fff" />
        <rect y="4" width="4" height="4" fill="#fff" />
        <rect x="4" y="4" width="4" height="4" fill="#ccc" />
      </pattern>
    </defs>
    <!-- Alpha bar background (checkerboard) -->
    <rect x="30" y="20" width="280" height="24" rx="12" fill="url(#alpha-checker)" stroke="currentColor" stroke-width="1" />
    <!-- Alpha gradient overlay -->
    <defs>
      <linearGradient id="alpha-bar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="hsl(210,80%,50%)" stop-opacity="0" />
        <stop offset="100%" stop-color="hsl(210,80%,50%)" stop-opacity="1" />
      </linearGradient>
    </defs>
    <rect x="30" y="20" width="280" height="24" rx="12" fill="url(#alpha-bar)" />
    <!-- Labels -->
    <text x="30" y="62" font-size="10" fill="currentColor">α = 0</text>
    <text x="275" y="62" font-size="10" fill="currentColor" text-anchor="end">α = 1</text>
    <!-- Original marker -->
    <circle cx="198" cy="32" r="6" fill="hsla(210,80%,50%,0.6)" stroke="currentColor" stroke-width="1.5" />
    <text x="198" y="78" font-size="10" fill="currentColor" text-anchor="middle">α = 0.6</text>
    <!-- Fade arrow (left) -->
    <line x1="188" y1="32" x2="142" y2="32" stroke="#FB7185" stroke-width="2" marker-end="url(#alpha-arrowL)" />
    <defs>
      <marker id="alpha-arrowL" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
        <path d="M8,0 L0,4 L8,8" fill="#FB7185" />
      </marker>
    </defs>
    <text x="142" y="16" font-size="10" fill="#FB7185" text-anchor="middle" font-weight="600">fade(0.2)</text>
    <!-- Opaquer arrow (right) -->
    <line x1="208" y1="32" x2="254" y2="32" stroke="#34D399" stroke-width="2" marker-end="url(#alpha-arrowR)" />
    <defs>
      <marker id="alpha-arrowR" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="#34D399" />
      </marker>
    </defs>
    <text x="254" y="16" font-size="10" fill="#34D399" text-anchor="middle" font-weight="600">opaquer(0.2)</text>
  </svg>
</template>
