<script setup lang="ts">
import { ref } from 'vue'

interface ToastItem {
  id: number
  text: string
  bg: string
  fg: string
  leaving: boolean
}

const items = ref<ToastItem[]>([])
let uid = 0

function contrastText(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 140 ? '#1a1a2e' : '#ffffff'
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function normalizeHex(color: string): string {
  let c = color.trim()
  if (!c.startsWith('#')) c = '#' + c
  if (c.length === 4) {
    c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]
  }
  if (c.length === 9) c = c.substring(0, 7)
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c
  return '#F472B6'
}

function show(text: string, color?: string) {
  const hex = normalizeHex(color || '#34D399')
  const bg = hexToRgba(hex, 0.72)
  const fg = contrastText(hex)
  const id = ++uid
  const item: ToastItem = { id, text, bg, fg, leaving: false }
  items.value.push(item)
  setTimeout(() => dismiss(id), 4000)
}

function dismiss(id: number) {
  const item = items.value.find(i => i.id === id)
  if (!item) return
  item.leaving = true
  setTimeout(() => {
    items.value = items.value.filter(i => i.id !== id)
  }, 500)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div class="xc-toast">
      <div
        v-for="item in items"
        :key="item.id"
        class="xc-toast-item"
        :class="{ 'xc-toast-out': item.leaving }"
        :style="{ background: item.bg, color: item.fg }"
      >
        {{ item.text }}
      </div>
    </div>
  </Teleport>
</template>
