<script lang="ts" setup>
import { useData, withBase } from 'vitepress'
import { computed, ref } from 'vue'

const { site, localeIndex, page, hash } = useData()

const open = ref(false)

const allLocaleLinks = computed(() => {
  const locales = site.value.locales
  const entries = Object.entries(locales)

  // Fixed order: root (zh-CN) first, en second
  entries.sort(([keyA], [keyB]) => {
    if (keyA === 'root') return -1
    if (keyB === 'root') return 1
    return keyA.localeCompare(keyB)
  })

  const currentLocale = locales[localeIndex.value]
  const currentLink =
    currentLocale?.link ||
    (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`)

  return entries.map(([key, value]) => {
    const link = value.link || (key === 'root' ? '/' : `/${key}/`)
    const isCurrent = value.label === currentLocale?.label

    let targetLink = link
    if (!isCurrent) {
      const relativePath = page.value.relativePath.slice(
        currentLink.length - 1
      )
      targetLink =
        link.replace(/\/$/, '') +
        '/' +
        relativePath
          .replace(/(^|\/)index\.md$/, '$1')
          .replace(/\.md$/, site.value.cleanUrls ? '' : '.html')
      targetLink += hash.value
    }

    return {
      text: value.label!,
      link: withBase(targetLink),
      isCurrent
    }
  })
})
</script>

<template>
  <div
    class="fixed-lang-switcher"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <button
      type="button"
      class="trigger"
      aria-haspopup="true"
      :aria-expanded="open"
      aria-label="Change language"
      @click="open = !open"
    >
      <span class="vpi-languages icon" />
      <span class="vpi-chevron-down chevron" />
    </button>

    <div class="flyout-menu" :class="{ open }">
      <div class="flyout-content">
        <template v-for="locale in allLocaleLinks" :key="locale.text">
          <p v-if="locale.isCurrent" class="locale-item current">
            {{ locale.text }}
          </p>
          <a v-else class="locale-item link" :href="locale.link">
            {{ locale.text }}
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
/* NOT scoped — so parent selectors in custom.css can target .fixed-lang-switcher */
.fixed-lang-switcher {
  position: relative;
  display: none;
}

@media (min-width: 768px) {
  .fixed-lang-switcher {
    display: flex;
    align-items: center;
  }
}

.fixed-lang-switcher .trigger {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: var(--vp-nav-height);
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.fixed-lang-switcher .trigger:hover {
  color: var(--vp-c-text-2);
}

.fixed-lang-switcher .icon {
  font-size: 16px;
}

.fixed-lang-switcher .chevron {
  margin-left: 4px;
  font-size: 14px;
}

.fixed-lang-switcher .flyout-menu {
  position: absolute;
  top: calc(var(--vp-nav-height) / 2 + 20px);
  right: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
  z-index: 100;
}

.fixed-lang-switcher .flyout-menu.open {
  opacity: 1;
  visibility: visible;
}

.fixed-lang-switcher .flyout-content {
  border-radius: 12px;
  padding: 12px 0;
  min-width: 128px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
}

.fixed-lang-switcher .locale-item {
  display: block;
  padding: 0 24px 0 12px;
  line-height: 32px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.fixed-lang-switcher .locale-item.current {
  font-weight: 700;
}

.fixed-lang-switcher .locale-item.link {
  text-decoration: none;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}

.fixed-lang-switcher .locale-item.link:hover {
  color: var(--vp-c-brand-1);
}
</style>
