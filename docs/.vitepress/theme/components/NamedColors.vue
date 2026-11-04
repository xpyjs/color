<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { NAMED_COLORS } from '@xpyjs/color/plugins/name'

const { lang } = useData()
const isZh = computed(() => !lang.value || lang.value.startsWith('zh'))

const entries = Object.keys(NAMED_COLORS).map((name) => ({
  name,
  hex: NAMED_COLORS[name]
}))

const query = ref('')
const copied = ref('')
const copyFailed = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return entries
  return entries.filter(
    ({ name, hex }) => name.includes(keyword) || hex.toLowerCase().includes(keyword)
  )
})

const labels = computed(() =>
  isZh.value
    ? {
        search: '搜索名称或色值，例如 red / #ff0000',
        hint: '点击任意卡片复制对应的 name 字段；可直接用于 xcolor(\'...\')。',
        copied: '已复制',
        copyFailed: '复制失败',
        empty: '没有匹配的命名颜色',
        copy: '复制 {name}'
      }
    : {
        search: 'Search by name or hex, e.g. red / #ff0000',
        hint: 'Click any card to copy its name field; use it directly with xcolor(\'...\').',
        copied: 'Copied',
        copyFailed: 'Copy failed',
        empty: 'No matching named colors',
        copy: 'Copy {name}'
      }
)

async function copyName(name: string) {
  let success = false
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(name)
      success = true
    } else {
      success = fallbackCopy(name)
    }
  } catch {
    success = fallbackCopy(name)
  }

  copied.value = success ? name : ''
  copyFailed.value = !success
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = ''
    copyFailed.value = false
  }, 1600)
}

function fallbackCopy(name: string) {
  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')
  try {
    textarea.value = name
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    return typeof document.execCommand === 'function' && document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

function copyLabel(name: string): string {
  return labels.value.copy.replace('{name}', name)
}
</script>

<template>
  <section class="named-colors">
    <div class="nc-toolbar">
      <input
        v-model="query"
        class="nc-search"
        type="search"
        :placeholder="labels.search"
        :aria-label="labels.search"
        spellcheck="false"
        @keydown.esc="query = ''"
      />
      <span class="nc-count" aria-live="polite">
        {{
          copyFailed
            ? labels.copyFailed
            : copied
              ? `${labels.copied}: ${copied}`
              : `${filtered.length} / ${entries.length}`
        }}
      </span>
    </div>

    <p class="nc-hint">{{ labels.hint }}</p>

    <div v-if="filtered.length" class="nc-grid">
      <button
        v-for="entry in filtered"
        :key="entry.name"
        type="button"
        class="nc-card"
        :class="{ 'nc-copied': copied === entry.name }"
        :title="copyLabel(entry.name)"
        :aria-label="copyLabel(entry.name)"
        @click="copyName(entry.name)"
      >
        <span
          class="nc-swatch"
          :class="{ 'nc-checker': entry.name === 'transparent' }"
          :style="entry.name === 'transparent' ? undefined : { background: entry.hex }"
          aria-hidden="true"
        />
        <span class="nc-meta">
          <code>{{ entry.name }}</code>
          <span>{{ entry.hex }}</span>
        </span>
        <span v-if="copied === entry.name" class="nc-check" aria-hidden="true">✓</span>
      </button>
    </div>

    <p v-else class="nc-empty">{{ labels.empty }}</p>
  </section>
</template>

<style scoped>
.named-colors {
  margin: 20px 0 28px;
}

.nc-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.nc-search {
  flex: 1 1 260px;
  min-width: 220px;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
}

.nc-search:focus {
  border-color: var(--vp-c-brand-1);
}

.nc-count {
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  white-space: nowrap;
}

.nc-hint {
  margin: 8px 0 14px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.nc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 10px;
}

.nc-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.nc-card:hover {
  transform: translateY(-1px);
  border-color: var(--vp-c-brand-1);
}

.nc-card:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.nc-copied {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}

.nc-swatch {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border: 1px solid var(--xc-swatch-border);
  border-radius: 8px;
}

.nc-checker {
  background-color: #fff;
  background-image:
    linear-gradient(45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(-45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d0d0d0 75%),
    linear-gradient(-45deg, transparent 75%, #d0d0d0 75%);
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  background-size: 10px 10px;
}

.nc-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nc-meta code {
  color: var(--vp-c-text-1);
  font-size: 12px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.nc-meta span {
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
}

.nc-check {
  margin-left: auto;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.nc-empty {
  margin: 8px 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
