<template>
  <section class="interactive-color-demo">
    <div class="demo-controls">
      <label>{{ zh ? '示例' : 'Preset' }}
        <select v-model="preset" @change="loadPreset">
          <option value="text">{{ zh ? '正文' : 'Body text' }}</option>
          <option value="button">{{ zh ? '按钮' : 'Button' }}</option>
          <option value="alpha">{{ zh ? '半透明背景' : 'Translucent background' }}</option>
        </select>
      </label>
      <label>{{ zh ? '前景' : 'Foreground' }} <input v-model.trim="foreground" size="13"></label>
      <label>{{ zh ? '背景' : 'Background' }} <input v-model.trim="background" size="13"></label>
      <label>{{ zh ? '底色' : 'Backdrop' }} <input v-model.trim="backdrop" size="13" placeholder="#ffffff"></label>
      <label>{{ zh ? '目标比值' : 'Target ratio' }}
        <input v-model.number="target" type="range" min="1" max="21" step="0.1"> {{ target }}:1
      </label>
    </div>
    <div v-if="result" class="demo-results">
      <article v-for="sample in result.samples" :key="sample.label">
        <strong>{{ sample.label }}</strong>
        <div class="preview" :style="{ background: result.backdrop }">
          <div class="preview-text" :style="{ color: sample.color, background: result.background }">
            <div>{{ zh ? '正文预览' : 'Body text' }}</div>
            <div class="large-text">{{ zh ? '大字预览' : 'Large text' }}</div>
          </div>
        </div>
        <code>{{ sample.color }}</code>
        <div>{{ sample.ratio.toFixed(2) }}:1</div>
        <div>{{ zh ? '正文' : 'Body' }} {{ rating(sample.ratio, 4.5, 7) }} · {{ zh ? '大字' : 'Large' }} {{ rating(sample.ratio, 3, 4.5) }}</div>
      </article>
    </div>
    <p v-if="result" role="status">{{ result.met ? (zh ? '达到目标' : 'Target reached') : (zh ? '当前透明度下无法达到目标' : 'Target unreachable at the current opacity') }}</p>
    <p v-else role="status">{{ needsBackdrop ? (zh ? '半透明背景需要合法的不透明底色。' : 'A translucent background requires a valid opaque backdrop.') : (zh ? '请输入合法的前景色和背景色。' : 'Enter valid foreground and background colors.') }}</p>
    <DemoCode v-if="result" :code="code" :zh="zh" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import xcolor from '@xpyjs/color'
import { adjustContrast } from '@xpyjs/color/plugins/a11y'
import DemoCode from './DemoCode.vue'

const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
const presets = {
  text: ['#777777', '#ffffff', ''],
  button: ['#ffffff', '#6366f1', ''],
  alpha: ['#33333380', '#33669980', '#ffffff'],
} as const
const preset = ref<keyof typeof presets>('text')
const foreground = ref<string>(presets.text[0])
const background = ref<string>(presets.text[1])
const backdrop = ref('')
const target = ref(4.5)

function loadPreset() {
  const [fg, bg, base] = presets[preset.value]
  foreground.value = fg
  background.value = bg
  backdrop.value = base
}

const bg = computed(() => xcolor(background.value, { useDecimal: true }))
const base = computed(() => xcolor(backdrop.value, { useDecimal: true }))
const needsBackdrop = computed(() => bg.value.isValid() && bg.value.alpha() < 1 &&
  (!base.value.isValid() || base.value.alpha() !== 1))
const result = computed(() => {
  const fg = xcolor(foreground.value)
  if (!fg.isValid() || !bg.value.isValid() || needsBackdrop.value) return
  const options = bg.value.alpha() < 1 ? { backdrop: backdrop.value } : {}
  const original = adjustContrast(foreground.value, background.value, { ...options, target: 1 })
  const adjusted = adjustContrast(foreground.value, background.value, { ...options, target: target.value })
  return {
    met: adjusted.met,
    backdrop: options.backdrop ? base.value.toRgbString() : undefined,
    background: bg.value.toRgbString(),
    samples: [
      { label: zh.value ? '原始颜色' : 'Original', color: original.color.toRgbString(), ratio: original.ratio },
      { label: zh.value ? '调整结果' : 'Adjusted', color: adjusted.color.toRgbString(), ratio: adjusted.ratio },
    ],
  }
})
function rating(ratio: number, aa: number, aaa: number) {
  if (ratio >= aaa) return 'AAA'
  if (ratio >= aa) return 'AA'
  return zh.value ? '未达标' : 'Below AA'
}
const code = computed(() => {
  const options = { target: target.value, backdrop: bg.value.alpha() < 1 ? backdrop.value : undefined }
  return `import { adjustContrast } from '@xpyjs/color/plugins/a11y'\n\nadjustContrast(${JSON.stringify(foreground.value)}, ${JSON.stringify(background.value)}, ${JSON.stringify(options)})`
})
</script>

<style scoped src="./color-demo.css"></style>
<style scoped>
.preview { margin-block: 8px; border-radius: 6px; overflow: hidden; }
.preview-text { padding: 12px; font-size: 14px; line-height: 1.5; }
.large-text { font-size: 24px; }
.interactive-color-demo > p { margin: 0; }
</style>
