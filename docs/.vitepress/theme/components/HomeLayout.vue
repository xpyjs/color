<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'
import HomeHero from './HomeHero.vue'
import FixedLangSwitcher from './FixedLangSwitcher.vue'

const { frontmatter } = useData()
const isHome = computed(() => frontmatter.value?.layout === 'home')
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <FixedLangSwitcher />
    </template>
    <template #home-features-after>
      <HomeHero v-if="isHome" />
    </template>
  </DefaultTheme.Layout>
</template>
