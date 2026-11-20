<template>
  <section class="interactive-color-demo">
    <div class="demo-controls">
      <label>{{ zh ? '原色' : 'Source' }} <input v-model="source" type="color"></label>
      <label>{{ zh ? '半透明' : 'Translucent' }} <input v-model="transparent" type="checkbox"></label>
      <label>{{ zh ? '方向' : 'Direction' }}
        <select v-model="direction">
          <option value="light">{{ zh ? '变亮' : 'Lighter' }}</option>
          <option value="dark">{{ zh ? '变暗' : 'Darker' }}</option>
        </select>
      </label>
      <label>{{ zh ? '强度' : 'Amount' }} {{ amount }}%
        <input v-model.number="amount" type="range" min="0" max="100">
      </label>
    </div>
    <div class="demo-results">
      <article v-for="row in rows" :key="row.method">
        <strong>{{ row.method }}</strong>
        <div class="demo-swatch"><div :style="{ background: row.rgb }"></div></div>
        <div><code>{{ row.rgb }}</code></div>
        <div><code>{{ row.hsl }}</code></div>
      </article>
    </div>
    <DemoCode :code="code" :zh="zh" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import xcolor from '@xpyjs/color'
import DemoCode from './DemoCode.vue'

const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
const source = ref('#336699')
const transparent = ref(false)
const amount = ref(20)
const direction = ref('light')
const original = computed(() => xcolor(source.value).alpha(transparent.value ? 0.5 : 1))
const methods = computed(() => direction.value === 'light'
  ? ['lighten', 'brighten', 'tint'] as const
  : ['darken', 'shade'] as const)
const rows = computed(() => {
  const result = methods.value.map(method => [method, original.value.clone()[method](amount.value)] as const)
  return [[zh.value ? '原色' : 'Source', original.value] as const, ...result]
    .map(([method, color]) => ({ method, rgb: color.toRgbString(), hsl: color.toHslString() }))
})
const code = computed(() => [
  "import xcolor from '@xpyjs/color'",
  `const original = xcolor('${source.value}').alpha(${original.value.alpha()})`,
  ...methods.value.map(method => `original.clone().${method}(${amount.value}).toRgbString()`),
].join('\n'))
</script>

<style scoped src="./color-demo.css"></style>
