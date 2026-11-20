<template>
  <section class="interactive-color-demo">
    <div class="demo-controls">
      <label>{{ zh ? '起点' : 'From' }} <input v-model="from" type="color"></label>
      <label>{{ zh ? '终点' : 'To' }} <input v-model="to" type="color"></label>
      <label>{{ zh ? '透明起点' : 'Transparent start' }} <input v-model="transparent" type="checkbox"></label>
      <label>{{ zh ? '透明度预乘' : 'Premultiply alpha' }} <input v-model="premultiply" type="checkbox"></label>
      <label>{{ zh ? '缓动' : 'Easing' }}
        <select v-model="easing"><option v-for="option in easings" :key="option">{{ option }}</option></select>
      </label>
      <label>{{ zh ? '步数' : 'Steps' }} {{ steps }} <input v-model.number="steps" type="range" min="2" max="20"></label>
      <label>{{ zh ? '采样位置' : 'Position' }} {{ position.toFixed(2) }} <input v-model.number="position" type="range" min="0" max="1" step=".01"></label>
    </div>
    <div v-for="row in rows" :key="row.space" class="row">
      <button type="button" :aria-pressed="selected === row.space" @click="selected = row.space">{{ row.space }}</button>
      <div class="swatches"><span v-for="(color, i) in row.colors" :key="i" :style="{ background: color }" :title="color"></span></div>
      <div class="sample"><span><i :style="{ background: row.sample }"></i></span><code>{{ row.sample }}</code></div>
    </div>
    <DemoCode :code="code" :zh="zh" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import xcolor from '@xpyjs/color'
import scale from '@xpyjs/color/plugins/scale'
import DemoCode from './DemoCode.vue'
xcolor.use(scale)
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
const from = ref('#ff0000'), to = ref('#0000ff')
const steps = ref(6), position = ref(.5)
const transparent = ref(false), premultiply = ref(false)
const spaces = ['rgb', 'hsl', 'srgb-linear', 'oklab'] as const
const selected = ref<typeof spaces[number]>('rgb')
const easings = ['linear', 'easeIn', 'easeOut', 'easeInOut'] as const
const easing = ref<typeof easings[number]>('linear')
const source = computed(() => xcolor(from.value).alpha(transparent.value ? 0 : 1).toRgbString())
const rows = computed(() => spaces.map(space => {
  const options = { space, easing: easing.value, premultiplyAlpha: premultiply.value }
  return {
    space,
    colors: xcolor(source.value).scale(to.value, { ...options, steps: steps.value }).map(c => c.toRgbString()),
    sample: xcolor(source.value).at(to.value, position.value, options).toString()
  }
}))
const code = computed(() => `import xcolor from '@xpyjs/color'
import scalePlugin from '@xpyjs/color/plugins/scale'
xcolor.use(scalePlugin)
const options = { space: '${selected.value}' as const, easing: '${easing.value}' as const, premultiplyAlpha: ${premultiply.value} }
xcolor('${source.value}').at('${to.value}', ${position.value}, options).toString()
xcolor('${source.value}').scale('${to.value}', { ...options, steps: ${steps.value} }).map(c => c.toString())`)
</script>

<style scoped src="./color-demo.css"></style>
<style scoped>
.interactive-color-demo { container-type: inline-size; gap: 10px; }
.row { display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 8px; align-items: center; }
.row button { border: 1px solid var(--vp-c-divider); border-radius: 6px; padding: 4px 8px; }
.row button[aria-pressed="true"] { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.swatches, .sample span { background: repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 12px 12px; }
.swatches { display: flex; overflow: hidden; border-radius: 4px; }
.swatches span { flex: 1; min-width: 0; height: 32px; }
.sample { grid-column: 1 / -1; display: flex; align-items: center; gap: 6px; min-width: 0; }
.sample span { width: 20px; height: 20px; flex: none; border: 1px solid var(--vp-c-divider); border-radius: 4px; }
.sample i { display: block; height: 100%; border-radius: inherit; }
.sample code { overflow-wrap: anywhere; }
@container (min-width: 540px) {
  .row { grid-template-columns: 100px minmax(0, 1fr) minmax(0, 200px); }
  .sample { grid-column: auto; }
}
</style>
