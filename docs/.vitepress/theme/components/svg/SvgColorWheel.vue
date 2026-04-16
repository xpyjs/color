<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? 'HSL 色环（spin 色相旋转）' : 'HSL Color Wheel (spin hue rotation)'">
    <defs>
      <clipPath id="cw-clip"><circle cx="100" cy="100" r="70" /></clipPath>
    </defs>
    <!-- Hue wheel via conic gradient emulation (12 stops) -->
    <g clip-path="url(#cw-clip)">
      <path d="M100,100 L100,30 A70,70 0 0,1 160.6,65 Z" fill="hsl(0,100%,50%)" />
      <path d="M100,100 L160.6,65 A70,70 0 0,1 170,100 Z" fill="hsl(30,100%,50%)" />
      <path d="M100,100 L170,100 A70,70 0 0,1 160.6,135 Z" fill="hsl(60,100%,50%)" />
      <path d="M100,100 L160.6,135 A70,70 0 0,1 135,160.6 Z" fill="hsl(90,100%,50%)" />
      <path d="M100,100 L135,160.6 A70,70 0 0,1 100,170 Z" fill="hsl(120,100%,50%)" />
      <path d="M100,100 L100,170 A70,70 0 0,1 65,160.6 Z" fill="hsl(150,100%,50%)" />
      <path d="M100,100 L65,160.6 A70,70 0 0,1 30,135 Z" fill="hsl(180,100%,50%)" />
      <path d="M100,100 L30,135 A70,70 0 0,1 30,100 Z" fill="hsl(210,100%,50%)" />
      <path d="M100,100 L30,100 A70,70 0 0,1 39.4,65 Z" fill="hsl(240,100%,50%)" />
      <path d="M100,100 L39.4,65 A70,70 0 0,1 65,39.4 Z" fill="hsl(270,100%,50%)" />
      <path d="M100,100 L65,39.4 A70,70 0 0,1 100,30 Z" fill="hsl(330,100%,50%)" />
      <path d="M100,100 L100,30 A70,70 0 0,0 65,39.4 Z" fill="hsl(345,100%,50%)" />
    </g>
    <!-- Inner white overlay for ring effect -->
    <circle cx="100" cy="100" r="46" fill="var(--xc-bg, #fff)" />
    <!-- Current hue marker (0°=top=red) -->
    <circle cx="100" cy="42" r="7" fill="hsl(0,80%,50%)" stroke="currentColor" stroke-width="2" />
    <!-- Spin arrow (clockwise 90°) -->
    <path d="M108,38 A62,62 0 0,1 158,100" fill="none" stroke="#34D399" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#cw-spin-arrow)" />
    <defs>
      <marker id="cw-spin-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="#34D399" />
      </marker>
    </defs>
    <!-- Destination marker -->
    <circle cx="158" cy="100" r="7" fill="hsl(90,80%,50%)" stroke="#34D399" stroke-width="2" />
    <!-- Labels -->
    <text x="100" y="106" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">spin(90)</text>
    <text x="100" y="120" font-size="9" fill="currentColor" text-anchor="middle" opacity="0.7">H: 0° → 90°</text>
  </svg>
</template>
