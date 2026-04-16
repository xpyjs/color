<script setup lang="ts">
import { useData } from 'vitepress'
const { lang } = useData()
const isZh = lang.value?.startsWith('zh')
</script>

<template>
  <svg width="520" height="120" viewBox="0 0 520 120" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh ? '链式调用流程图' : 'Chaining Flow Diagram'">
    <defs>
      <marker id="chain-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="currentColor" />
      </marker>
      <marker id="chain-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="#34D399" />
      </marker>
    </defs>
    <!-- Main flow -->
    <rect x="10" y="40" width="80" height="32" rx="6" fill="var(--xc-brand, #34D399)" opacity="0.15" stroke="var(--xc-brand, #34D399)" stroke-width="1.5" />
    <text x="50" y="60" font-size="11" fill="currentColor" text-anchor="middle" font-weight="600">xcolor()</text>

    <line x1="94" y1="56" x2="124" y2="56" stroke="currentColor" stroke-width="1.2" marker-end="url(#chain-arrow)" />

    <rect x="128" y="40" width="76" height="32" rx="6" fill="var(--xc-bg-soft, #f8f9fb)" stroke="currentColor" stroke-width="1" />
    <text x="166" y="60" font-size="10" fill="currentColor" text-anchor="middle">.lighten()</text>

    <line x1="208" y1="56" x2="238" y2="56" stroke="currentColor" stroke-width="1.2" marker-end="url(#chain-arrow)" />

    <rect x="242" y="40" width="76" height="32" rx="6" fill="var(--xc-bg-soft, #f8f9fb)" stroke="currentColor" stroke-width="1" />
    <text x="280" y="60" font-size="10" fill="currentColor" text-anchor="middle">.spin(45)</text>

    <line x1="322" y1="56" x2="352" y2="56" stroke="currentColor" stroke-width="1.2" marker-end="url(#chain-arrow)" />

    <rect x="356" y="40" width="76" height="32" rx="6" fill="var(--xc-bg-soft, #f8f9fb)" stroke="currentColor" stroke-width="1" />
    <text x="394" y="60" font-size="10" fill="currentColor" text-anchor="middle">.toHex()</text>

    <line x1="436" y1="56" x2="466" y2="56" stroke="currentColor" stroke-width="1.2" marker-end="url(#chain-arrow)" />

    <rect x="470" y="42" width="44" height="28" rx="4" fill="#34D399" opacity="0.2" stroke="#34D399" stroke-width="1" />
    <text x="492" y="60" font-size="10" fill="currentColor" text-anchor="middle" font-weight="600">"#..."</text>

    <!-- Clone branch -->
    <text x="166" y="30" font-size="9" fill="#34D399" text-anchor="middle">.clone()</text>
    <line x1="166" y1="40" x2="166" y2="16" stroke="#34D399" stroke-width="1" stroke-dasharray="4 2" />
    <line x1="166" y1="16" x2="250" y2="16" stroke="#34D399" stroke-width="1" stroke-dasharray="4 2" marker-end="url(#chain-arrow-green)" />
    <text x="258" y="20" font-size="9" fill="#34D399">{{ isZh ? '→ 新实例，独立操作' : '→ new instance' }}</text>

    <!-- Returns this annotation -->
    <text x="280" y="90" font-size="9" fill="currentColor" text-anchor="middle" opacity="0.6">{{ isZh ? '每个 Setter 返回 this，支持无限链' : 'Each setter returns this — infinite chaining' }}</text>
  </svg>
</template>
