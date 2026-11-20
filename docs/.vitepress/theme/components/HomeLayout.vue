<template>
  <DefaultTheme.Layout
    :class="{ 'spectrum-home': isHome }"
    v-on="isHome ? { pointermove: tiltFeature } : {}"
  >
    <template #nav-bar-content-after>
      <FixedLangSwitcher />
    </template>
    <template #home-hero-image>
      <HomeSpectrum v-if="isHome" />
    </template>
    <template #home-features-after>
      <HomeHero v-if="isHome" />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'
import HomeHero from './HomeHero.vue'
import HomeSpectrum from './HomeSpectrum.vue'
import FixedLangSwitcher from './FixedLangSwitcher.vue'

const { frontmatter } = useData()
const isHome = computed(() => frontmatter.value?.layout === 'home')

function tiltFeature(event: PointerEvent) {
  if (event.pointerType === 'touch' || !(event.target instanceof Element)) return
  const item = event.target.closest<HTMLElement>('.VPFeatures .item')
  const grid = item?.parentElement
  if (!item || !grid) return

  // Measure the stationary grid cell so the rotating surface can't shift its own hit coordinates.
  const cell = item.getBoundingClientRect()
  const bounds = grid.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - cell.left) / cell.width))
  const y = Math.max(0, Math.min(1, (event.clientY - cell.top) / cell.height))
  const column = (cell.left + cell.width / 2 - bounds.left) / bounds.width - .5
  const row = (cell.top + cell.height / 2 - bounds.top) / bounds.height - .5
  item.style.setProperty('--light-x', `${x * 100}%`)
  item.style.setProperty('--light-y', `${y * 100}%`)
  item.style.setProperty('--pitch', `${(.5 - y) * 11 - row * 6}deg`)
  item.style.setProperty('--yaw', `${(x - .5) * 13 + column * 8}deg`)
}
</script>

<style scoped>
.spectrum-home :deep(.VPHero) { overflow: clip; }
.spectrum-home :deep(.VPHero .container) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: 28px;
}
.spectrum-home :deep(.VPHero .main) { order: 0; width: 100%; min-width: 0; text-align: start; }
.spectrum-home :deep(.VPHero .actions) { justify-content: flex-start; }
.spectrum-home :deep(.VPHero .tagline),
.spectrum-home :deep(.VPHero .heading) { margin-inline: 0; }
.spectrum-home :deep(.VPHero .text) { font-size: clamp(30px, 4vw, 52px); line-height: 1.13; text-wrap: balance; }
.spectrum-home :deep(.VPHero .name) { margin-bottom: 8px; }
.spectrum-home :deep(.VPHero.has-image .name),
.spectrum-home :deep(.VPHero.has-image .text) { margin-inline: 0; }
.spectrum-home :deep(.VPHero .name.clip) {
  background-image: linear-gradient(105deg, #ef6699 8%, #af76ee 42%, #617dec 73%, #30ab93);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.spectrum-home :deep(.VPHero .image) { order: 1; margin: 0; min-height: 0; }
.spectrum-home :deep(.VPHero .image-container) { width: 100%; height: auto; transform: none; }
.spectrum-home :deep(.VPHero .image-bg) { display: none; }
.spectrum-home :deep(.VPFeature) {
  position: relative;
  isolation: isolate;
  border-top: 2px solid transparent;
  background: linear-gradient(var(--vp-c-bg-soft), var(--vp-c-bg-soft)) padding-box,
    linear-gradient(95deg, #ee7996, #8b7cdd 52%, #5cc5b2) border-box;
}
.spectrum-home :deep(.VPFeature::before) {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(ellipse at var(--light-x, 50%) var(--light-y, 50%), #ffc9ef88, transparent 60%),
    linear-gradient(115deg, #f879b54a, #a177ff50 40%, #62bbff50 72%, #4dd5b857);
  opacity: 0;
  transition: opacity .22s ease;
}
@media (hover: hover) and (pointer: fine) {
  .spectrum-home :deep(.VPFeatures .item:hover .VPFeature::before) { opacity: 1; }
  @media (prefers-reduced-motion: no-preference) {
    .spectrum-home :deep(.VPFeature) {
      transition: transform .24s ease-out, box-shadow .24s ease-out;
    }
    .spectrum-home :deep(.VPFeatures .item:hover) { position: relative; z-index: 1; }
    .spectrum-home :deep(.VPFeatures .item:hover .VPFeature) {
      transform: perspective(780px) translateY(-8px) rotateX(var(--pitch, 0deg)) rotateY(var(--yaw, 0deg));
      box-shadow: 0 16px 28px -12px #45336d66, 0 5px 18px -8px #a579d866;
    }
  }
}
@media (min-width: 960px) {
  .spectrum-home :deep(.VPHero .container) {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: clamp(32px, 5vw, 72px);
  }
}
</style>
