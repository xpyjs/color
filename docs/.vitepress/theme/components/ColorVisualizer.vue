<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import Toast from './Toast.vue'

const { isDark, lang } = useData()
const toastRef = ref<InstanceType<typeof Toast> | null>(null)

const isZh = computed(() => !lang.value || lang.value.startsWith('zh'))

const t = computed(() =>
  isZh.value
    ? { conversions: '色值转换', manipulation: '颜色操作', reset: '重置', harmony: '配色方案', gradient: '渐变预览', copied: '已复制' }
    : { conversions: 'Conversions', manipulation: 'Manipulation', reset: 'Reset', harmony: 'Harmony', gradient: 'Gradient', copied: 'Copied' }
)

// Lazy-load xcolor and plugins
let xcolor: any = null
let loaded = ref(false)

onMounted(async () => {
  try {
    const core = await import('@xpyjs/color')
    xcolor = core.xcolor || core.default
    const XColor = core.XColor || core.default

    const [harmony, gradient, cmyk, lab] = await Promise.all([
      import('@xpyjs/color/plugins/harmony'),
      import('@xpyjs/color/plugins/gradient'),
      import('@xpyjs/color/plugins/cmyk'),
      import('@xpyjs/color/plugins/lab')
    ])

    XColor.extend(harmony.default)
    XColor.extend(gradient.default)
    XColor.extend(cmyk.default)
    XColor.extend(lab.default)

    loaded.value = true
  } catch (e) {
    console.error('Failed to load xcolor:', e)
  }
})

const colorInput = ref('#3498db')
const lightenVal = ref(0)
const darkenVal = ref(0)
const saturateVal = ref(0)
const desaturateVal = ref(0)
const spinVal = ref(0)

const baseColor = computed(() => {
  if (!loaded.value || !xcolor) return null
  try {
    return xcolor(colorInput.value)
  } catch {
    return null
  }
})

const manipulatedColor = computed(() => {
  if (!baseColor.value) return null
  try {
    let c = baseColor.value.clone()
    if (lightenVal.value) c = c.lighten(lightenVal.value)
    if (darkenVal.value) c = c.darken(darkenVal.value)
    if (saturateVal.value) c = c.saturate(saturateVal.value)
    if (desaturateVal.value) c = c.desaturate(desaturateVal.value)
    if (spinVal.value) c = c.spin(spinVal.value)
    return c
  } catch {
    return null
  }
})

const conversions = computed(() => {
  const c = manipulatedColor.value
  if (!c) return []
  try {
    const list: { label: string; value: string }[] = [
      { label: 'HEX', value: c.toHex() },
      { label: 'RGB', value: c.toRgbString() },
      { label: 'HSL', value: c.toHslString() },
      { label: 'HSV', value: c.toHsvString() }
    ]
    if (c.toCmykString) list.push({ label: 'CMYK', value: c.toCmykString() })
    if (c.toLabString) list.push({ label: 'Lab', value: c.toLabString() })
    if (c.toLchString) list.push({ label: 'LCH', value: c.toLchString() })
    return list
  } catch {
    return []
  }
})

const harmonySchemes = computed(() => {
  const c = manipulatedColor.value
  if (!c || !c.complement) return []
  try {
    return [
      { name: 'Complementary', colors: [c, c.complement()] },
      { name: 'Triad', colors: c.triad() },
      { name: 'Analogous', colors: c.analogous() },
      { name: 'Split Complement', colors: c.splitComplement() }
    ]
  } catch {
    return []
  }
})

const gradientColors = computed(() => {
  const c = manipulatedColor.value
  if (!c || !c.gradient) return []
  try {
    const target = xcolor(c.spin(180).toHex())
    return c.gradient(target, 7).map((g: any) => g.toHex())
  } catch {
    return []
  }
})

const previewBg = computed(() => manipulatedColor.value?.toHex() ?? '#000')
const previewText = computed(() => {
  if (!manipulatedColor.value) return '#fff'
  return manipulatedColor.value.isLight() ? '#000' : '#fff'
})

function resetSliders() {
  lightenVal.value = 0
  darkenVal.value = 0
  saturateVal.value = 0
  desaturateVal.value = 0
  spinVal.value = 0
}

function onPickerChange(e: Event) {
  colorInput.value = (e.target as HTMLInputElement).value
}

async function copyText(text: string, color?: string) {
  try {
    await navigator.clipboard.writeText(text)
    toastRef.value?.show(`${t.value.copied}: ${text}`, color)
  } catch {
    toastRef.value?.show(text, color)
  }
}
</script>

<template>
  <div class="color-visualizer" v-if="loaded">
    <!-- Input Section -->
    <div class="cv-input-section">
      <div class="cv-input-row">
        <input
          v-model="colorInput"
          class="cv-text-input"
          placeholder="#hex / rgb() / hsl() ..."
          spellcheck="false"
        />
        <input
          type="color"
          :value="baseColor?.toHex() ?? '#000000'"
          @input="onPickerChange"
          class="cv-color-picker"
        />
      </div>
    </div>

    <!-- Preview -->
    <div
      class="cv-preview cv-clickable"
      :style="{ background: previewBg, color: previewText }"
      @click="manipulatedColor && copyText(manipulatedColor.toHex(), manipulatedColor.toHex())"
    >
      <span class="cv-preview-hex">{{ manipulatedColor?.toHex() ?? '—' }}</span>
    </div>

    <!-- Conversions -->
    <div class="cv-section" v-if="conversions.length">
      <h3 class="cv-section-title">{{ t.conversions }}</h3>
      <div class="cv-conversions">
        <div v-for="item in conversions" :key="item.label" class="cv-conv-item">
          <span class="cv-conv-label">{{ item.label }}</span>
          <code class="cv-conv-value cv-clickable" @click="copyText(item.value, manipulatedColor?.toHex())">{{ item.value }}</code>
        </div>
      </div>
    </div>

    <!-- Manipulation Sliders -->
    <div class="cv-section">
      <h3 class="cv-section-title">
        {{ t.manipulation }}
        <button class="cv-reset-btn" @click="resetSliders">{{ t.reset }}</button>
      </h3>
      <div class="cv-sliders">
        <label class="cv-slider-row">
          <span>Lighten</span>
          <input type="range" v-model.number="lightenVal" min="0" max="100" />
          <span class="cv-slider-val">{{ lightenVal }}</span>
        </label>
        <label class="cv-slider-row">
          <span>Darken</span>
          <input type="range" v-model.number="darkenVal" min="0" max="100" />
          <span class="cv-slider-val">{{ darkenVal }}</span>
        </label>
        <label class="cv-slider-row">
          <span>Saturate</span>
          <input type="range" v-model.number="saturateVal" min="0" max="100" />
          <span class="cv-slider-val">{{ saturateVal }}</span>
        </label>
        <label class="cv-slider-row">
          <span>Desaturate</span>
          <input type="range" v-model.number="desaturateVal" min="0" max="100" />
          <span class="cv-slider-val">{{ desaturateVal }}</span>
        </label>
        <label class="cv-slider-row">
          <span>Spin</span>
          <input type="range" v-model.number="spinVal" min="-360" max="360" />
          <span class="cv-slider-val">{{ spinVal }}°</span>
        </label>
      </div>
    </div>

    <!-- Harmony -->
    <div class="cv-section" v-if="harmonySchemes.length">
      <h3 class="cv-section-title">{{ t.harmony }}</h3>
      <div v-for="scheme in harmonySchemes" :key="scheme.name" class="cv-harmony-group">
        <span class="cv-harmony-name">{{ scheme.name }}</span>
        <div class="cv-harmony-swatches">
          <div
            v-for="(c, i) in scheme.colors"
            :key="i"
            class="cv-swatch cv-clickable"
            :style="{ background: c.toHex() }"
            :title="c.toHex()"
            @click="copyText(c.toHex(), c.toHex())"
          />
        </div>
      </div>
    </div>

    <!-- Gradient -->
    <div class="cv-section" v-if="gradientColors.length">
      <h3 class="cv-section-title">{{ t.gradient }}</h3>
      <div class="cv-gradient-bar">
        <div
          v-for="(hex, i) in gradientColors"
          :key="i"
          class="cv-gradient-step cv-clickable"
          :style="{ background: hex }"
          :title="hex"
          @click="copyText(hex, hex)"
        />
      </div>
    </div>

    <Toast ref="toastRef" />
  </div>

  <div v-else class="cv-loading">Loading...</div>
</template>

<style scoped>
.color-visualizer {
  border: 1px solid var(--xc-border);
  border-radius: 12px;
  padding: 20px;
  background: var(--xc-bg-soft);
  color: var(--xc-text);
  margin: 16px 0;
}

.cv-input-section {
  margin-bottom: 16px;
}

.cv-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cv-text-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--xc-border);
  border-radius: 8px;
  background: var(--xc-bg);
  color: var(--xc-text);
  font-family: monospace;
  font-size: 14px;
  outline: none;
}

.cv-text-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.cv-color-picker {
  width: 40px;
  height: 40px;
  border: 1px solid var(--xc-border);
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
  background: var(--xc-bg);
}

.cv-preview {
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  font-family: monospace;
  margin-bottom: 16px;
  transition: background 0.15s, color 0.15s;
}

.cv-section {
  margin-bottom: 16px;
}

.cv-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--xc-text-secondary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cv-reset-btn {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--xc-border);
  border-radius: 4px;
  background: var(--xc-bg);
  color: var(--xc-text-secondary);
  cursor: pointer;
}

.cv-reset-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.cv-conversions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 6px;
}

.cv-conv-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.cv-conv-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--xc-text-secondary);
  min-width: 48px;
}

.cv-conv-value {
  font-size: 13px;
  background: var(--xc-code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  word-break: break-all;
}

.cv-sliders {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.cv-slider-row > span:first-child {
  min-width: 72px;
  color: var(--xc-text-secondary);
}

.cv-slider-row input[type="range"] {
  flex: 1;
  accent-color: #3498db;
}

.cv-slider-val {
  min-width: 40px;
  text-align: right;
  font-family: monospace;
  font-size: 12px;
}

.cv-harmony-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.cv-harmony-name {
  font-size: 12px;
  color: var(--xc-text-secondary);
  min-width: 120px;
}

.cv-harmony-swatches {
  display: flex;
  gap: 4px;
}

.cv-swatch {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--xc-border);
  cursor: pointer;
  transition: transform 0.1s;
}

.cv-swatch:hover {
  transform: scale(1.15);
}

.cv-gradient-bar {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  height: 40px;
}

.cv-gradient-step {
  flex: 1;
  transition: background 0.15s;
}

.cv-loading {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.cv-clickable {
  cursor: pointer;
  user-select: none;
}

.cv-preview.cv-clickable:hover {
  opacity: 0.9;
}

.cv-conv-value.cv-clickable:hover {
  background: var(--xc-border);
}

.cv-gradient-step.cv-clickable:hover {
  opacity: 0.8;
}
</style>
