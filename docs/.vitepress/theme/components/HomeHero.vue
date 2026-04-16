<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import Toast from './Toast.vue'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

// ─── State ───────────────────────────────────────
const colorInput = ref('#3b82f6')
const xcolorLib = ref<any>(null)
const pluginModules = ref<Record<string, any>>({})
const activePlugins = ref<Set<string>>(new Set())
const activeTab = ref<'rgb' | 'hsl' | 'hsv' | 'cmyk' | 'lab'>('rgb')

// Toast ref
const toastRef = ref<InstanceType<typeof Toast> | null>(null)

// Dice spin state
const diceSpinning = ref(false)
const diceDirection = ref(1) // 1 = clockwise, -1 = counter-clockwise

// Manipulation sliders
const lightenVal = ref(0)
const darkenVal = ref(0)
const saturateVal = ref(0)
const spinVal = ref(0)

const plugins = [
  { id: 'harmony', label: 'harmony' },
  { id: 'gradient', label: 'gradient' },
  { id: 'cmyk', label: 'cmyk' },
  { id: 'lab', label: 'lab' },
  { id: 'name', label: 'name' },
  { id: 'a11y', label: 'a11y' },
  { id: 'simulate', label: 'simulate' },
  { id: 'temperature', label: 'temperature' },
  { id: 'blend', label: 'blend' },
  { id: 'scale', label: 'scale' },
]

// ─── Lazy load xcolor ─────────────────────────────
onMounted(async () => {
  try {
    const mod = await import('@xpyjs/color')
    xcolorLib.value = mod.default || mod

    // Preload all plugin modules
    const mods = await Promise.all([
      import('@xpyjs/color/plugins/harmony'),
      import('@xpyjs/color/plugins/gradient'),
      import('@xpyjs/color/plugins/cmyk'),
      import('@xpyjs/color/plugins/lab'),
      import('@xpyjs/color/plugins/name'),
      import('@xpyjs/color/plugins/a11y'),
      import('@xpyjs/color/plugins/simulate'),
      import('@xpyjs/color/plugins/temperature'),
      import('@xpyjs/color/plugins/blend'),
      import('@xpyjs/color/plugins/scale'),
    ])
    const names = ['harmony', 'gradient', 'cmyk', 'lab', 'name', 'a11y', 'simulate', 'temperature', 'blend', 'scale']
    names.forEach((n, i) => {
      pluginModules.value[n] = mods[i].default || mods[i]
    })

    // Auto-enable harmony + gradient
    togglePlugin('harmony')
    togglePlugin('gradient')
  } catch (e) {
    console.warn('[HomeHero] Failed to load xcolor:', e)
  }
})

function togglePlugin(id: string) {
  if (!xcolorLib.value || !pluginModules.value[id]) return
  if (activePlugins.value.has(id)) {
    activePlugins.value.delete(id)
  } else {
    activePlugins.value.add(id)
    xcolorLib.value.use(pluginModules.value[id])
  }
  activePlugins.value = new Set(activePlugins.value) // trigger reactivity
}

// ─── Color instance (reactive) ────────────────────
const colorInstance = computed(() => {
  if (!xcolorLib.value) return null
  try {
    const c = xcolorLib.value(colorInput.value)
    if (lightenVal.value > 0) c.lighten(lightenVal.value)
    if (darkenVal.value > 0) c.darken(darkenVal.value)
    if (saturateVal.value > 0) c.saturate(saturateVal.value)
    if (spinVal.value !== 0) c.spin(spinVal.value)
    return c
  } catch { return null }
})

const displayColor = computed(() => {
  if (!colorInstance.value) return colorInput.value
  try { return colorInstance.value.toHex() } catch { return colorInput.value }
})

const contrastFg = computed(() => {
  if (!colorInstance.value) return '#fff'
  try { return colorInstance.value.isLight() ? '#1a1a2e' : '#ffffff' } catch { return '#fff' }
})

// ─── Format values ────────────────────────────────
const formats = computed(() => {
  const c = colorInstance.value
  if (!c) return []
  const ap = activePlugins.value
  const list: { label: string; value: string }[] = [
    { label: 'HEX', value: safe(() => c.toHex()) },
    { label: 'RGB', value: safe(() => c.toRgbString()) },
    { label: 'HSL', value: safe(() => c.toHslString()) },
    { label: 'HSV', value: safe(() => c.toHsvString()) },
  ]
  if (ap.has('cmyk')) list.push({ label: 'CMYK', value: safe(() => c.toCmykString()) })
  if (ap.has('lab')) {
    list.push({ label: 'Lab', value: safe(() => c.toLabString()) })
    list.push({ label: 'LCH', value: safe(() => c.toLchString()) })
  }
  if (ap.has('name')) list.push({ label: 'Name', value: safe(() => c.toName() || '—') })
  if (ap.has('temperature')) list.push({ label: 'Temp', value: safe(() => c.temperature() + 'K') })
  return list
})

function safe(fn: () => string): string {
  try { return fn() } catch { return '—' }
}

// ─── RGB / HSL / HSV sliders ──────────────────────
const rgbSliders = computed(() => {
  const c = colorInstance.value
  if (!c) return { r: 128, g: 128, b: 128 }
  try { const o = c.rgb(); return { r: o.r, g: o.g, b: o.b } } catch { return { r: 128, g: 128, b: 128 } }
})

const hslSliders = computed(() => {
  const c = colorInstance.value
  if (!c) return { h: 0, s: 50, l: 50 }
  try { const o = c.hsl(); return { h: o.h, s: o.s, l: o.l } } catch { return { h: 0, s: 50, l: 50 } }
})

const hsvSliders = computed(() => {
  const c = colorInstance.value
  if (!c) return { h: 0, s: 50, v: 50 }
  try { const o = c.hsv(); return { h: o.h, s: o.s, v: o.v } } catch { return { h: 0, s: 50, v: 50 } }
})

function setRgb(channel: 'r' | 'g' | 'b', val: number) {
  if (!xcolorLib.value) return
  const c = colorInstance.value
  if (!c) return
  const rgb = c.rgb()
  rgb[channel] = val
  colorInput.value = xcolorLib.value(`rgb(${rgb.r},${rgb.g},${rgb.b})`).toHex()
  resetSliders()
}

function setHsl(channel: 'h' | 's' | 'l', val: number) {
  if (!xcolorLib.value) return
  const c = colorInstance.value
  if (!c) return
  const hsl = c.hsl()
  hsl[channel] = val
  colorInput.value = xcolorLib.value(`hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`).toHex()
  resetSliders()
}

function setHsv(channel: 'h' | 's' | 'v', val: number) {
  if (!xcolorLib.value) return
  const c = colorInstance.value
  if (!c) return
  const hsv = c.hsv()
  hsv[channel] = val
  colorInput.value = xcolorLib.value({ h: hsv.h, s: hsv.s, v: hsv.v }).toHex()
  resetSliders()
}

// ─── CMYK sliders ─────────────────────────────────
const cmykSliders = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('cmyk')) return { c: 0, m: 0, y: 0, k: 0 }
  try { const o = c.toCmyk(); return { c: Math.round(o.c), m: Math.round(o.m), y: Math.round(o.y), k: Math.round(o.k) } } catch { return { c: 0, m: 0, y: 0, k: 0 } }
})

function setCmyk(channel: 'c' | 'm' | 'y' | 'k', val: number) {
  if (!xcolorLib.value || !activePlugins.value.has('cmyk')) return
  const c = colorInstance.value
  if (!c) return
  try {
    const cmyk = c.toCmyk()
    cmyk[channel] = val
    colorInput.value = xcolorLib.value({ c: cmyk.c, m: cmyk.m, y: cmyk.y, k: cmyk.k }).toHex()
    resetSliders()
  } catch { /* ignore */ }
}

// ─── Lab sliders ──────────────────────────────────
const labSliders = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('lab')) return { l: 50, a: 0, b: 0 }
  try { const o = c.toLab(); return { l: Math.round(o.l), a: Math.round(o.a), b: Math.round(o.b) } } catch { return { l: 50, a: 0, b: 0 } }
})

function setLab(channel: 'l' | 'a' | 'b', val: number) {
  if (!xcolorLib.value || !activePlugins.value.has('lab')) return
  const c = colorInstance.value
  if (!c) return
  try {
    const lab = c.toLab()
    lab[channel] = val
    colorInput.value = xcolorLib.value(`lab(${lab.l} ${lab.a} ${lab.b})`).toHex()
    resetSliders()
  } catch { /* ignore */ }
}

// ─── Temperature slider ──────────────────────────
const temperatureValue = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('temperature')) return 6500
  try { return c.temperature() } catch { return 6500 }
})

function setTemperature(kelvin: number) {
  if (!xcolorLib.value || !activePlugins.value.has('temperature')) return
  try {
    colorInput.value = xcolorLib.value.temperature(kelvin).toHex()
    resetSliders()
  } catch { /* ignore */ }
}

// ─── Plugin visual: Gradient ─────────────────────
const gradientTarget = ref('#f97316')
const gradientSteps = ref(7)
const gradientColors = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('gradient')) return []
  try { return c.clone().gradient(gradientTarget.value, gradientSteps.value).map((s: any) => s.toHex()) } catch { return [] }
})

// ─── Plugin visual: Blend ────────────────────────
const blendTarget = ref('#3b82f6')
const blendModes = ['multiply', 'screen', 'overlay', 'darken', 'lighten', 'dodge', 'burn', 'hardLight', 'softLight', 'difference', 'exclusion'] as const
const blendResults = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('blend')) return []
  return blendModes.map(mode => {
    try { return { mode, hex: c.clone().blend(blendTarget.value, mode).toHex() } } catch { return { mode, hex: '#000' } }
  })
})

// ─── Plugin visual: Simulate ─────────────────────
const simulateModes = ['protanopia', 'deuteranopia', 'tritanopia', 'grayscale'] as const
const simulateResults = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('simulate')) return []
  return simulateModes.map(mode => {
    try { return { mode, hex: c.clone().simulate(mode).toHex() } } catch { return { mode, hex: '#888' } }
  })
})

// ─── Plugin visual: A11y ─────────────────────────
const a11yBg = ref('#ffffff')
const a11yInfo = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('a11y')) return null
  try {
    const info = c.wcagLevel(a11yBg.value)
    return info
  } catch { return null }
})

// ─── Plugin visual: Scale ────────────────────────
const scaleTarget = ref('#e11d48')
const scaleSteps = ref(7)
const scaleSpace = ref<'rgb' | 'hsl'>('rgb')
const scaleColors = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('scale')) return []
  try { return c.clone().scale(scaleTarget.value, { steps: scaleSteps.value, space: scaleSpace.value }).map((s: any) => s.toHex()) } catch { return [] }
})

// ─── Plugin visual: Harmony (extended) ───────────
const harmonyMode = ref<'complement' | 'triad' | 'tetrad' | 'splitComplement' | 'analogous' | 'monochromatic'>('complement')
const harmonyResult = computed(() => {
  const c = colorInstance.value
  if (!c || !activePlugins.value.has('harmony')) return []
  try {
    const result = c.clone()[harmonyMode.value]()
    if (Array.isArray(result)) return result.map((s: any) => s.toHex())
    return [result.toHex()]
  } catch { return [] }
})

function resetSliders() {
  lightenVal.value = 0
  darkenVal.value = 0
  saturateVal.value = 0
  spinVal.value = 0
}

function randomColor() {
  if (!xcolorLib.value) return
  diceSpinning.value = true
  diceDirection.value = Math.random() > 0.5 ? 1 : -1
  colorInput.value = xcolorLib.value.random().toHex()
  resetSliders()
  setTimeout(() => { diceSpinning.value = false }, 600)
}

// ─── Copy to clipboard ───────────────────────────
async function copyValue(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toastRef.value?.show(
      `${isZh.value ? '已复制' : 'Copied'}: ${text}`,
      displayColor.value
    )
  } catch {
    // fallback
  }
}

// ─── Glow shadow ─────────────────────────────────
const glowShadow = computed(() => {
  const hex = displayColor.value || '#3b82f6'
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `0 0 60px rgba(${r},${g},${b},0.3), 0 0 120px rgba(${r},${g},${b},0.15)`
})
</script>

<template>
  <div id="color-explorer" class="home-hero-wrapper" :style="{ '--hero-accent': displayColor }">
    <div class="home-hero-card" :style="{ boxShadow: glowShadow, borderColor: displayColor }">
      <!-- Left: Color Preview -->
      <div class="hero-left">
        <div class="hero-preview" :style="{ background: displayColor, color: contrastFg }">
          <span class="hero-preview-hex">{{ displayColor }}</span>
        </div>
        <!-- Input row -->
        <div class="hero-input-row">
          <input
            v-model="colorInput"
            type="text"
            class="hero-color-input"
            spellcheck="false"
            placeholder="#3b82f6"
            @change="resetSliders()"
          />
          <input
            type="color"
            :value="displayColor"
            class="hero-color-picker"
            @input="($event: Event) => { colorInput = ($event.target as HTMLInputElement).value; resetSliders() }"
          />
          <button class="hero-btn" @click="randomColor" :title="isZh ? '随机颜色' : 'Random Color'"><span class="dice-icon" :class="{ spinning: diceSpinning }" :style="diceSpinning ? { '--dice-dir': diceDirection } : {}">🎲</span></button>
        </div>

        <!-- Plugin tags -->
        <div class="hero-plugins">
          <span class="hero-plugins-label">{{ isZh ? '插件' : 'Plugins' }}</span>
          <button
            v-for="p in plugins"
            :key="p.id"
            class="hero-plugin-tag"
            :class="{ active: activePlugins.has(p.id) }"
            @click="togglePlugin(p.id)"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Format values (left bottom) -->
        <div class="hero-formats">
          <div
            v-for="f in formats"
            :key="f.label"
            class="hero-format-item"
            @click="copyValue(f.value)"
            :title="isZh ? '点击复制' : 'Click to copy'"
          >
            <span class="hero-format-label">{{ f.label }}</span>
            <span class="hero-format-value">{{ f.value }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Controls & Formats -->
      <div class="hero-right">
        <!-- Manipulation sliders -->
        <div class="hero-sliders">
          <div class="hero-slider-row channel-lighten">
            <label>lighten</label>
            <input type="range" min="0" max="50" v-model.number="lightenVal" />
            <span>{{ lightenVal }}</span>
          </div>
          <div class="hero-slider-row channel-darken">
            <label>darken</label>
            <input type="range" min="0" max="50" v-model.number="darkenVal" />
            <span>{{ darkenVal }}</span>
          </div>
          <div class="hero-slider-row channel-saturate">
            <label>saturate</label>
            <input type="range" min="0" max="50" v-model.number="saturateVal" />
            <span>{{ saturateVal }}</span>
          </div>
          <div class="hero-slider-row channel-spin">
            <label>spin</label>
            <input type="range" min="-180" max="180" v-model.number="spinVal" />
            <span>{{ spinVal }}°</span>
          </div>
        </div>

        <!-- Color space tabs -->
        <div class="hero-tabs">
          <button :class="{ active: activeTab === 'rgb' }" @click="activeTab = 'rgb'">RGB</button>
          <button :class="{ active: activeTab === 'hsl' }" @click="activeTab = 'hsl'">HSL</button>
          <button :class="{ active: activeTab === 'hsv' }" @click="activeTab = 'hsv'">HSV</button>
          <button v-if="activePlugins.has('cmyk')" :class="{ active: activeTab === 'cmyk' }" @click="activeTab = 'cmyk'">CMYK</button>
          <button v-if="activePlugins.has('lab')" :class="{ active: activeTab === 'lab' }" @click="activeTab = 'lab'">Lab</button>
        </div>

        <div v-if="activeTab === 'rgb'" class="hero-channel-sliders">
          <div class="hero-slider-row channel-r">
            <label>R</label>
            <input type="range" min="0" max="255" :value="rgbSliders.r" @input="setRgb('r', +($event.target as HTMLInputElement).value)" />
            <span>{{ rgbSliders.r }}</span>
          </div>
          <div class="hero-slider-row channel-g">
            <label>G</label>
            <input type="range" min="0" max="255" :value="rgbSliders.g" @input="setRgb('g', +($event.target as HTMLInputElement).value)" />
            <span>{{ rgbSliders.g }}</span>
          </div>
          <div class="hero-slider-row channel-b">
            <label>B</label>
            <input type="range" min="0" max="255" :value="rgbSliders.b" @input="setRgb('b', +($event.target as HTMLInputElement).value)" />
            <span>{{ rgbSliders.b }}</span>
          </div>
        </div>

        <div v-if="activeTab === 'hsl'" class="hero-channel-sliders">
          <div class="hero-slider-row channel-hsl-h">
            <label>H</label>
            <input type="range" min="0" max="360" :value="Math.round(hslSliders.h)" @input="setHsl('h', +($event.target as HTMLInputElement).value)" />
            <span>{{ Math.round(hslSliders.h) }}°</span>
          </div>
          <div class="hero-slider-row channel-hsl-s">
            <label>S</label>
            <input type="range" min="0" max="100" :value="Math.round(hslSliders.s)" @input="setHsl('s', +($event.target as HTMLInputElement).value)" />
            <span>{{ Math.round(hslSliders.s) }}%</span>
          </div>
          <div class="hero-slider-row channel-hsl-l">
            <label>L</label>
            <input type="range" min="0" max="100" :value="Math.round(hslSliders.l)" @input="setHsl('l', +($event.target as HTMLInputElement).value)" />
            <span>{{ Math.round(hslSliders.l) }}%</span>
          </div>
        </div>

        <div v-if="activeTab === 'hsv'" class="hero-channel-sliders">
          <div class="hero-slider-row channel-hsv-h">
            <label>H</label>
            <input type="range" min="0" max="360" :value="Math.round(hsvSliders.h)" @input="setHsv('h', +($event.target as HTMLInputElement).value)" />
            <span>{{ Math.round(hsvSliders.h) }}°</span>
          </div>
          <div class="hero-slider-row channel-hsv-s">
            <label>S</label>
            <input type="range" min="0" max="100" :value="Math.round(hsvSliders.s)" @input="setHsv('s', +($event.target as HTMLInputElement).value)" />
            <span>{{ Math.round(hsvSliders.s) }}%</span>
          </div>
          <div class="hero-slider-row channel-hsv-v">
            <label>V</label>
            <input type="range" min="0" max="100" :value="Math.round(hsvSliders.v)" @input="setHsv('v', +($event.target as HTMLInputElement).value)" />
            <span>{{ Math.round(hsvSliders.v) }}%</span>
          </div>
        </div>

        <!-- CMYK channel sliders -->
        <div v-if="activeTab === 'cmyk' && activePlugins.has('cmyk')" class="hero-channel-sliders">
          <div class="hero-slider-row channel-c">
            <label>C</label>
            <input type="range" min="0" max="100" :value="cmykSliders.c" @input="setCmyk('c', +($event.target as HTMLInputElement).value)" />
            <span>{{ cmykSliders.c }}%</span>
          </div>
          <div class="hero-slider-row channel-m">
            <label>M</label>
            <input type="range" min="0" max="100" :value="cmykSliders.m" @input="setCmyk('m', +($event.target as HTMLInputElement).value)" />
            <span>{{ cmykSliders.m }}%</span>
          </div>
          <div class="hero-slider-row channel-y">
            <label>Y</label>
            <input type="range" min="0" max="100" :value="cmykSliders.y" @input="setCmyk('y', +($event.target as HTMLInputElement).value)" />
            <span>{{ cmykSliders.y }}%</span>
          </div>
          <div class="hero-slider-row channel-k">
            <label>K</label>
            <input type="range" min="0" max="100" :value="cmykSliders.k" @input="setCmyk('k', +($event.target as HTMLInputElement).value)" />
            <span>{{ cmykSliders.k }}%</span>
          </div>
        </div>

        <!-- Lab channel sliders -->
        <div v-if="activeTab === 'lab' && activePlugins.has('lab')" class="hero-channel-sliders">
          <div class="hero-slider-row channel-lab-l">
            <label>L</label>
            <input type="range" min="0" max="100" :value="labSliders.l" @input="setLab('l', +($event.target as HTMLInputElement).value)" />
            <span>{{ labSliders.l }}</span>
          </div>
          <div class="hero-slider-row channel-lab-a">
            <label>a</label>
            <input type="range" min="-128" max="128" :value="labSliders.a" @input="setLab('a', +($event.target as HTMLInputElement).value)" />
            <span>{{ labSliders.a }}</span>
          </div>
          <div class="hero-slider-row channel-lab-b">
            <label>b</label>
            <input type="range" min="-128" max="128" :value="labSliders.b" @input="setLab('b', +($event.target as HTMLInputElement).value)" />
            <span>{{ labSliders.b }}</span>
          </div>
        </div>

        <!-- Temperature slider -->
        <div v-if="activePlugins.has('temperature')" class="hero-channel-sliders hero-temperature">
          <div class="hero-slider-row">
            <label>Kelvin</label>
            <input type="range" min="1000" max="40000" step="100" :value="temperatureValue" @input="setTemperature(+($event.target as HTMLInputElement).value)" />
            <span>{{ temperatureValue }}K</span>
          </div>
        </div>

        <!-- Harmony visualization -->
        <div v-if="activePlugins.has('harmony')" class="hero-plugin-section">
          <div class="hero-plugin-section-header">
            <span class="hero-plugin-section-title">{{ isZh ? '配色方案(harmony)' : 'Harmony(harmony)' }}</span>
            <div class="hero-mini-tabs">
              <button v-for="m in (['complement', 'triad', 'tetrad', 'splitComplement', 'analogous', 'monochromatic'] as const)" :key="m" :class="{ active: harmonyMode === m }" @click="harmonyMode = m">{{ m }}</button>
            </div>
          </div>
          <div class="hero-swatch-row">
            <div v-for="c in harmonyResult" :key="c" class="hero-swatch" :style="{ background: c }" :title="c" @click="copyValue(c)" />
          </div>
        </div>

        <!-- Gradient visualization -->
        <div v-if="activePlugins.has('gradient') && gradientColors.length" class="hero-plugin-section">
          <div class="hero-plugin-section-header">
            <span class="hero-plugin-section-title">{{ isZh ? '渐变(gradient)' : 'Gradient(gradient)' }}</span>
            <div class="hero-plugin-controls">
              <label>{{ isZh ? '目标' : 'To' }}</label>
              <input type="color" v-model="gradientTarget" class="hero-mini-picker" />
              <label>{{ isZh ? '步数' : 'Steps' }}</label>
              <input type="range" min="3" max="15" v-model.number="gradientSteps" class="hero-mini-range" />
              <span class="hero-mini-val">{{ gradientSteps }}</span>
            </div>
          </div>
          <div class="hero-gradient-bar">
            <div v-for="(c, i) in gradientColors" :key="i" class="hero-gradient-stop" :style="{ background: c }" :title="c" @click="copyValue(c)" />
          </div>
        </div>

        <!-- Scale visualization -->
        <div v-if="activePlugins.has('scale') && scaleColors.length" class="hero-plugin-section">
          <div class="hero-plugin-section-header">
            <span class="hero-plugin-section-title">{{ isZh ? '色阶(scale)' : 'Scale(scale)' }}</span>
            <div class="hero-plugin-controls">
              <label>{{ isZh ? '目标' : 'To' }}</label>
              <input type="color" v-model="scaleTarget" class="hero-mini-picker" />
              <label>{{ isZh ? '空间' : 'Space' }}</label>
              <div class="hero-mini-tabs">
                <button :class="{ active: scaleSpace === 'rgb' }" @click="scaleSpace = 'rgb'">RGB</button>
                <button :class="{ active: scaleSpace === 'hsl' }" @click="scaleSpace = 'hsl'">HSL</button>
              </div>
            </div>
          </div>
          <div class="hero-gradient-bar">
            <div v-for="(c, i) in scaleColors" :key="i" class="hero-gradient-stop" :style="{ background: c }" :title="c" @click="copyValue(c)" />
          </div>
        </div>

        <!-- Blend visualization -->
        <div v-if="activePlugins.has('blend') && blendResults.length" class="hero-plugin-section">
          <div class="hero-plugin-section-header">
            <span class="hero-plugin-section-title">{{ isZh ? '混合(blend)' : 'Blend(blend)' }}</span>
            <div class="hero-plugin-controls">
              <label>{{ isZh ? '混合色' : 'With' }}</label>
              <input type="color" v-model="blendTarget" class="hero-mini-picker" />
            </div>
          </div>
          <div class="hero-blend-grid">
            <div v-for="b in blendResults" :key="b.mode" class="hero-blend-item" :title="b.mode + ': ' + b.hex" @click="copyValue(b.hex)">
              <div class="hero-blend-swatch" :style="{ background: b.hex }" />
              <span class="hero-blend-label">{{ b.mode }}</span>
            </div>
          </div>
        </div>

        <!-- Simulate visualization -->
        <div v-if="activePlugins.has('simulate') && simulateResults.length" class="hero-plugin-section">
          <div class="hero-plugin-section-header">
            <span class="hero-plugin-section-title">{{ isZh ? '色觉模拟(simulate)' : 'Simulate(simulate)' }}</span>
          </div>
          <div class="hero-simulate-row">
            <div v-for="s in simulateResults" :key="s.mode" class="hero-simulate-item" @click="copyValue(s.hex)">
              <div class="hero-swatch" :style="{ background: s.hex }" :title="s.hex" />
              <span class="hero-simulate-label">{{ s.mode }}</span>
            </div>
          </div>
        </div>

        <!-- A11y visualization -->
        <div v-if="activePlugins.has('a11y') && a11yInfo" class="hero-plugin-section">
          <div class="hero-plugin-section-header">
            <span class="hero-plugin-section-title">{{ isZh ? '无障碍(a11y)' : 'Accessibility(a11y)' }}</span>
            <div class="hero-plugin-controls">
              <label>{{ isZh ? '背景' : 'BG' }}</label>
              <input type="color" v-model="a11yBg" class="hero-mini-picker" />
            </div>
          </div>
          <div class="hero-a11y-preview" :style="{ background: a11yBg, color: displayColor }">
            <span class="hero-a11y-sample">{{ isZh ? '示例文字' : 'Sample Text' }}</span>
            <div class="hero-a11y-badges">
              <span class="hero-a11y-badge" :class="a11yInfo.level === 'FAIL' ? 'fail' : 'pass'">{{ a11yInfo.level }} {{ isZh ? '正文' : 'Normal' }}</span>
              <span class="hero-a11y-badge" :class="a11yInfo.largeText === 'FAIL' ? 'fail' : 'pass'">{{ a11yInfo.largeText }} {{ isZh ? '大字' : 'Large' }}</span>
              <span class="hero-a11y-ratio">{{ typeof a11yInfo.ratio === 'number' ? a11yInfo.ratio.toFixed(2) : a11yInfo.ratio }}:1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<style scoped>
.home-hero-wrapper {
  display: flex;
  justify-content: center;
  padding: 64px 16px 48px;
}

.home-hero-card {
  display: flex;
  gap: 32px;
  max-width: 80vw;
  width: 100%;
  padding: 32px;
  border-radius: 20px;
  background: var(--vp-c-bg);
  border: 2px solid var(--hero-accent, var(--xc-brand));
  transition: box-shadow 0.5s ease, border-color 0.3s ease;
}

@media (max-width: 768px) {
  .home-hero-card {
    flex-direction: column;
    max-width: 95vw;
    padding: 20px;
    gap: 20px;
  }
}

/* ─── Left panel ─── */
.hero-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 240px;
  flex-shrink: 0;
}

.hero-preview {
  width: 100%;
  aspect-ratio: 1.2;
  max-height: 200px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, color 0.3s ease;
  cursor: default;
}

.hero-preview-hex {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  letter-spacing: 0.03em;
}

.hero-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.hero-color-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.hero-color-input:focus {
  border-color: var(--hero-accent, var(--xc-brand));
}

.hero-color-picker {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: none;
}
.hero-color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.hero-color-picker::-webkit-color-swatch { border-radius: 6px; border: 1px solid var(--vp-c-divider); }

.hero-btn {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.15s;
}
.hero-btn:hover { transform: scale(1.1); }

/* Dice icon rotation (icon only, not the button) */
.dice-icon {
  display: inline-block;
  transition: transform 0.15s;
}
.dice-icon.spinning {
  animation: dice-spin 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes dice-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(calc(var(--dice-dir, 1) * 720deg)); }
}

/* ─── Plugin tags ─── */
.hero-plugins {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.hero-plugins-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-weight: 600;
  margin-right: 4px;
}

.hero-plugin-tag {
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.hero-plugin-tag:hover {
  border-color: var(--hero-accent, var(--xc-brand));
  color: var(--hero-accent, var(--xc-brand));
}
.hero-plugin-tag.active {
  background: var(--hero-accent, var(--xc-brand));
  border-color: var(--hero-accent, var(--xc-brand));
  color: #fff;
  transform: scale(1.05);
}

/* ─── Right panel ─── */
.hero-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* Formats grid */
.hero-formats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.hero-format-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}
.hero-format-item:hover {
  border-color: var(--hero-accent, var(--xc-brand));
  transform: translateY(-1px);
}

.hero-format-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--hero-accent, var(--xc-brand));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-format-value {
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  word-break: break-all;
  margin-top: 2px;
}

/* Sliders */
.hero-sliders,
.hero-channel-sliders {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-slider-row label {
  width: 60px;
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.hero-slider-row input[type="range"] {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, var(--xc-brand), var(--xc-brand-accent, #FB7185));
  opacity: 0.7;
  outline: none;
  transition: opacity 0.2s;
}
.hero-slider-row input[type="range"]:hover { opacity: 1; }
.hero-slider-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--hero-accent, var(--xc-brand));
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.hero-slider-row span {
  width: 40px;
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  text-align: right;
  flex-shrink: 0;
}

/* Channel color accents */
.channel-r input[type="range"] { background: linear-gradient(90deg, #000, #f00); }
.channel-g input[type="range"] { background: linear-gradient(90deg, #000, #0f0); }
.channel-b input[type="range"] { background: linear-gradient(90deg, #000, #00f); }

/* CMYK channel accents */
.channel-c input[type="range"] { background: linear-gradient(90deg, #fff, #00bcd4); }
.channel-m input[type="range"] { background: linear-gradient(90deg, #fff, #e91e63); }
.channel-y input[type="range"] { background: linear-gradient(90deg, #fff, #ffeb3b); }
.channel-k input[type="range"] { background: linear-gradient(90deg, #fff, #212121); }

/* HSL channel accents */
.channel-hsl-h input[type="range"] { background: linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
.channel-hsl-s input[type="range"] { background: linear-gradient(90deg, #aaa, var(--hero-accent, var(--xc-brand))); }
.channel-hsl-l input[type="range"] { background: linear-gradient(90deg, #000, #888, #fff); }

/* HSV channel accents */
.channel-hsv-h input[type="range"] { background: linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
.channel-hsv-s input[type="range"] { background: linear-gradient(90deg, #ccc, var(--hero-accent, var(--xc-brand))); }
.channel-hsv-v input[type="range"] { background: linear-gradient(90deg, #000, #fff); }

/* Lab channel accents */
.channel-lab-l input[type="range"] { background: linear-gradient(90deg, #000, #fff); }
.channel-lab-a input[type="range"] { background: linear-gradient(90deg, #00a86b, #888, #dc2626); }
.channel-lab-b input[type="range"] { background: linear-gradient(90deg, #2563eb, #888, #eab308); }

/* Manipulation slider accents */
.channel-lighten input[type="range"] { background: linear-gradient(90deg, var(--hero-accent, var(--xc-brand)), #fff); }
.channel-darken input[type="range"] { background: linear-gradient(90deg, var(--hero-accent, var(--xc-brand)), #000); }
.channel-saturate input[type="range"] { background: linear-gradient(90deg, #aaa, var(--hero-accent, var(--xc-brand))); }
.channel-spin input[type="range"] { background: linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }

/* Temperature slider */
.hero-temperature input[type="range"] {
  background: linear-gradient(90deg, #ff3d00, #ff9100, #ffec8b, #fff, #c5d8ff, #7dacff) !important;
}
.hero-temperature .hero-slider-row span {
  width: 64px;
}

/* Tabs */
.hero-tabs {
  display: flex;
  gap: 4px;
}

.hero-tabs button {
  padding: 4px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.hero-tabs button.active {
  background: var(--hero-accent, var(--xc-brand));
  border-color: var(--hero-accent, var(--xc-brand));
  color: #fff;
}

/* ─── Plugin sections ─── */
.hero-plugin-section {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 12px;
}

.hero-plugin-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.hero-plugin-section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--hero-accent, var(--xc-brand));
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.hero-plugin-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.hero-plugin-controls label {
  font-size: 10px;
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.hero-mini-picker {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background: none;
}
.hero-mini-picker::-webkit-color-swatch-wrapper { padding: 0; }
.hero-mini-picker::-webkit-color-swatch { border-radius: 4px; border: 1px solid var(--vp-c-divider); }

.hero-mini-range {
  width: 60px;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--vp-c-divider);
  border-radius: 2px;
  outline: none;
}
.hero-mini-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--hero-accent, var(--xc-brand));
  cursor: pointer;
}

.hero-mini-val {
  font-size: 10px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  width: 20px;
  text-align: right;
}

.hero-mini-tabs {
  display: flex;
  gap: 2px;
}
.hero-mini-tabs button {
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.hero-mini-tabs button.active {
  background: var(--hero-accent, var(--xc-brand));
  border-color: var(--hero-accent, var(--xc-brand));
  color: #fff;
}

/* Swatch row */
.hero-swatch-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.hero-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: transform 0.15s;
}
.hero-swatch:hover { transform: scale(1.15); }

/* Gradient / Scale bar */
.hero-gradient-bar {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  height: 28px;
}
.hero-gradient-stop {
  flex: 1;
  cursor: pointer;
  transition: transform 0.15s;
}
.hero-gradient-stop:hover {
  transform: scaleY(1.2);
  z-index: 1;
}

/* Blend grid */
.hero-blend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 4px;
}
.hero-blend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}
.hero-blend-swatch {
  width: 100%;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}
.hero-blend-label {
  font-size: 8px;
  color: var(--vp-c-text-2);
  text-align: center;
  word-break: break-all;
}

/* Simulate row */
.hero-simulate-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.hero-simulate-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}
.hero-simulate-label {
  font-size: 9px;
  color: var(--vp-c-text-2);
}

/* A11y */
.hero-a11y-preview {
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--vp-c-divider);
}
.hero-a11y-sample {
  font-size: 16px;
  font-weight: 700;
}
.hero-a11y-badges {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
.hero-a11y-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}
.hero-a11y-badge.pass {
  background: #22c55e;
  color: #fff;
}
.hero-a11y-badge.fail {
  background: #ef4444;
  color: #fff;
}
.hero-a11y-ratio {
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  color: inherit;
}
</style>
