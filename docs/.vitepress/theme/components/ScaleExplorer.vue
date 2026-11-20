<template>
  <section class="explorer">
    <div class="controls">
      <label>{{ zh ? '起点' : 'From' }} <input v-model="from" type="color"></label>
      <label>{{ zh ? '终点' : 'To' }} <input v-model="to" type="color"></label>
      <label>{{ zh ? '透明起点' : 'Transparent start' }} <input v-model="transparent" type="checkbox"></label>
      <label>{{ zh ? '透明度预乘' : 'Premultiply alpha' }} <input v-model="premultiply" type="checkbox"></label>
      <label>{{ zh ? '步数' : 'Steps' }} {{ steps }} <input v-model.number="steps" type="range" min="2" max="20"></label>
      <label>{{ zh ? '采样位置' : 'Position' }} {{ position.toFixed(2) }} <input v-model.number="position" type="range" min="0" max="1" step=".01"></label>
    </div>
    <div v-for="row in rows" :key="row.space" class="row">
      <button :aria-pressed="selected === row.space" @click="selected = row.space">{{ row.space }}</button>
      <div class="swatches"><span v-for="(color, i) in row.colors" :key="i" :style="{ background: color }" :title="color"></span></div>
      <div class="sample" :style="{ background: row.sample }"></div><code>{{ row.sample }}</code>
    </div>
    <pre>{{ code }}</pre>
    <button @click="copy">{{ status || (zh ? '复制当前代码' : 'Copy current code') }}</button>
    <p role="status">{{ status }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import xcolor from '@xpyjs/color'
import scale from '@xpyjs/color/plugins/scale'
xcolor.use(scale)
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
const from = ref('#ff0000'), to = ref('#0000ff')
const steps = ref(6), position = ref(.5)
const transparent = ref(false), premultiply = ref(false)
const spaces = ['rgb', 'hsl', 'srgb-linear', 'oklab'] as const
const selected = ref<typeof spaces[number]>('rgb')
const status = ref('')
const source = computed(() => xcolor(from.value).alpha(transparent.value ? 0 : 1).toRgbString())
const rows = computed(() => spaces.map(space => {
  const options = { space, premultiplyAlpha: premultiply.value }
  return {
    space,
    colors: xcolor(source.value).scale(to.value, { ...options, steps: steps.value }).map(c => c.toRgbString()),
    sample: xcolor(source.value).at(to.value, position.value, options).toString()
  }
}))
const code = computed(() => `import xcolor from '@xpyjs/color'
import scalePlugin from '@xpyjs/color/plugins/scale'
xcolor.use(scalePlugin)
const options = { space: '${selected.value}' as const, premultiplyAlpha: ${premultiply.value} }
xcolor('${source.value}').at('${to.value}', ${position.value}, options).toString()
xcolor('${source.value}').scale('${to.value}', { ...options, steps: ${steps.value} }).map(c => c.toString())`)
async function copy() {
  try {
    await navigator.clipboard.writeText(code.value)
    status.value = zh.value ? '已复制' : 'Copied'
  } catch {
    status.value = zh.value ? '请从代码框选择并复制' : 'Select and copy the code above'
  }
}
</script>

<style scoped>
.explorer { padding: 20px; border: 1px solid var(--vp-c-divider); border-radius: 12px; }
.controls { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
label { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.row { display: grid; grid-template-columns: 100px 1fr 32px; gap: 10px; align-items: center; margin: 16px 0; }
.row code { grid-column: 2 / -1; font-size: 12px; }
button { border: 1px solid var(--vp-c-divider); border-radius: 6px; padding: 5px 8px; }
button[aria-pressed="true"] { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.swatches { display: flex; min-width: 0; background: repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 12px 12px; }
.swatches span { flex: 1; height: 40px; }
.sample { width: 32px; height: 40px; border: 1px solid var(--vp-c-divider); }
pre { overflow: auto; font-size: 12px; padding: 12px; background: var(--vp-c-bg-soft); }
</style>
