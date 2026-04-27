<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import Toast from './Toast.vue'

const { isDark, lang } = useData()
const toastRef = ref<InstanceType<typeof Toast> | null>(null)

const isZh = computed(() => !lang.value || lang.value.startsWith('zh'))

const t = computed(() =>
  isZh.value
    ? {
        primaryColor: '主色',
        generate: '生成配色',
        algorithm: '派生算法',
        roles: '角色选择',
        chromaScale: '色度缩放',
        lightnessShift: '明度偏移',
        paletteType: '色阶算法',
        darkMode: '暗色模式',
        cssFormat: 'CSS 格式',
        semantic: '语义色',
        semanticColors: '语义色变体',
        baseVar: '主色变量',
        shades: '色阶',
        darkVariants: '暗色变体',
        customHues: '自定义色相',
        copyCss: '复制完整 CSS',
        copied: '已复制',
        copiedCss: 'CSS 已复制到剪贴板',
        clickToCopy: '点击色块复制颜色值',
        hint: '调整参数后点击「生成配色」查看效果',
        on: '开启',
        off: '关闭',
        default: '默认',
        prefix: 'CSS 前缀',
        options: '参数设置',
        collapse: '收起',
        expand: '展开'
      }
    : {
        primaryColor: 'Primary Color',
        generate: 'Generate',
        algorithm: 'Algorithm',
        roles: 'Roles',
        chromaScale: 'Chroma Scale',
        lightnessShift: 'Lightness Shift',
        paletteType: 'Palette Type',
        darkMode: 'Dark Mode',
        cssFormat: 'CSS Format',
        semantic: 'Semantic',
        semanticColors: 'Semantic Variants',
        baseVar: 'Base Variable',
        shades: 'Shades',
        darkVariants: 'Dark Variants',
        customHues: 'Custom Hues',
        copyCss: 'Copy Full CSS',
        copied: 'Copied',
        copiedCss: 'CSS copied to clipboard',
        clickToCopy: 'Click swatch to copy color value',
        hint: 'Adjust options and click "Generate" to preview',
        on: 'On',
        off: 'Off',
        default: 'Default',
        prefix: 'CSS Prefix',
        options: 'Options',
        collapse: 'Collapse',
        expand: 'Expand'
      }
)

// --- xcolor lazy load ---
let xcolor: any = null
let XColorCls: any = null
let themePlugin: any = null
const loaded = ref(false)

onMounted(async () => {
  try {
    const core = await import('@xpyjs/color')
    xcolor = core.xcolor || core.default
    XColorCls = core.XColor || core.default

    const themeMod = await import('@xpyjs/color/plugins/theme')
    themePlugin = themeMod.default

    XColorCls.extend(themePlugin, { colors: { primary: '#1890ff' } })
    loaded.value = true
  } catch (e) {
    console.error('Failed to load xcolor:', e)
  }
})

// --- Input state ---
const colorInput = ref('#1890ff')
const pickerColor = ref('#1890ff')

function syncFromText() {
  const v = colorInput.value.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(v) || /^(rgb|hsl)/i.test(v)) {
    pickerColor.value = normalizeToHex(v)
  }
}

function syncFromPicker() {
  colorInput.value = pickerColor.value
}

function normalizeToHex(v: string): string {
  if (!xcolor) return v
  try { return xcolor(v).toHex() } catch { return '#000000' }
}

// --- Options ---
const algorithm = ref<'oklch' | 'hsl'>('oklch')
const allRoles = ['secondary', 'success', 'warning', 'error', 'info'] as const
const selectedRoles = ref<string[]>([...allRoles])
const chromaScale = ref(1.0)
const lightnessShift = ref(0)
const paletteType = ref<'antd' | 'linear'>('antd')
const darkModeEnabled = ref(false)
const cssFormat = ref<'hex' | 'rgb' | 'hsl'>('hex')
const semanticEnabled = ref(true)
const cssPrefix = ref('x')
const optionsCollapsed = ref(false)

// Custom hue overrides
const defaultHues: Record<string, number> = {
  error: 27, warning: 70, success: 145, info: 235, secondary: 180
}
const customHueEnabled = ref(false)
const customHues = ref<Record<string, number>>({
  error: 27, warning: 70, success: 145, info: 235, secondary: 180
})

function toggleRole(role: string) {
  const idx = selectedRoles.value.indexOf(role)
  if (idx >= 0) selectedRoles.value.splice(idx, 1)
  else selectedRoles.value.push(role)
}

/**
 * Normalize prefix: only lowercase + hyphen, strip leading non-alpha, prepend --.
 */
function normalizedPrefix(): string {
  const raw = cssPrefix.value || ''
  let cleaned = raw.toLowerCase().replace(/[^a-z-]/g, '').replace(/^-+/, '').replace(/^[^a-z]+/, '')
  return cleaned ? `--${cleaned}` : '--x'
}

/**
 * Build a hue-wheel gradient that matches the current derive algorithm.
 *
 * OKLCh: inline RGB→OKLab→OKLCh to get primary's L/C, then sweep hue 0→360
 * and convert each stop back via OKLCh→OKLab→linear sRGB→gamma sRGB→hex.
 *
 * HSL: use primary's S/L, sweep hue with CSS hsl().
 */
function hueGradient(): string {
  if (!xcolor) {
    return hslFallbackGradient()
  }

  try {
    const primary = xcolor(colorInput.value)
    const r = primary.red()
    const g = primary.green()
    const b = primary.blue()
    const stepCount = 24
    const stops: string[] = []

    if (algorithm.value === 'oklch') {
      // RGB → OKLab → OKLCh (inline, no oklab plugin needed)
      const ok = _rgbToOklab(r, g, b)
      const lch = _oklabToOklch(ok.l, ok.a, ok.b)
      const cVal = Math.min(lch.c * chromaScale.value, 0.4)
      const lVal = Math.max(0, Math.min(1, lch.l + lightnessShift.value))

      for (let i = 0; i <= stepCount; i++) {
        const h = (i / stepCount) * 360
        const hex = _oklchToHex(lVal, cVal, h)
        stops.push(`${hex} ${(i / stepCount) * 100}%`)
      }
    } else {
      // HSL mode
      const hsl = primary.toHslArray() as [number, number, number]
      const s = Math.min(100, hsl[1] * chromaScale.value)
      const l = Math.max(0, Math.min(100, hsl[2] + lightnessShift.value * 100))

      for (let i = 0; i <= stepCount; i++) {
        const h = (i / stepCount) * 360
        stops.push(`hsl(${h}, ${s}%, ${l}%) ${(i / stepCount) * 100}%`)
      }
    }

    return `linear-gradient(to right, ${stops.join(', ')})`
  } catch {
    return hslFallbackGradient()
  }
}

function hslFallbackGradient(): string {
  const stops: string[] = []
  for (let h = 0; h <= 360; h += 30) {
    stops.push(`hsl(${h}, 90%, 55%) ${(h / 360) * 100}%`)
  }
  return `linear-gradient(to right, ${stops.join(', ')})`
}

// --- Inline OKLCh math (mirrors derive.ts, no plugin dependency) ---

function _srgbToLinear(c: number): number {
  c = c / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function _linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function _rgbToOklab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const rl = _srgbToLinear(r)
  const gl = _srgbToLinear(g)
  const bl = _srgbToLinear(b)

  const l_ = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl)
  const m_ = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl)
  const s_ = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl)

  return {
    l: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  }
}

function _oklabToOklch(l: number, a: number, b: number): { l: number; c: number; h: number } {
  const c = Math.sqrt(a * a + b * b)
  let h = Math.atan2(b, a) * 180 / Math.PI
  if (h < 0) h += 360
  return { l, c, h }
}

function _oklchToHex(l: number, c: number, h: number): string {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  // OKLab → linear sRGB
  const l1 = l + 0.3963377774 * a + 0.2158037573 * b
  const m1 = l - 0.1055613458 * a - 0.0638541728 * b
  const s1 = l - 0.0894841775 * a - 1.2914855480 * b

  const ll = l1 * l1 * l1
  const mm = m1 * m1 * m1
  const ss = s1 * s1 * s1

  // linear sRGB → gamma sRGB → 0-255
  const rv = Math.round(Math.max(0, Math.min(1, _linearToSrgb(+4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss))) * 255)
  const gv = Math.round(Math.max(0, Math.min(1, _linearToSrgb(-1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss))) * 255)
  const bv = Math.round(Math.max(0, Math.min(1, _linearToSrgb(-0.0041960863 * ll - 0.7034186147 * mm + 1.7076147010 * ss))) * 255)

  return '#' + ((1 << 24) | (rv << 16) | (gv << 8) | bv).toString(16).slice(1)
}

// --- Generation ---
const generated = ref(false)
const themeVars = ref<Record<string, string>>({})
const themeCss = ref('')

interface SwatchItem { label: string; varName: string; value: string }
interface ColorGroup {
  name: string
  baseVar: SwatchItem | null
  shades: SwatchItem[]
  semantics: SwatchItem[]
  darkBase: SwatchItem | null
  darkShades: SwatchItem[]
  darkSemantics: SwatchItem[]
}
const colorGroups = ref<ColorGroup[]>([])

function generate() {
  if (!loaded.value || !xcolor) return

  const colors: Record<string, string> = { primary: colorInput.value }

  // Build hue overrides
  const hues: Record<string, number> = {}
  if (customHueEnabled.value) {
    for (const role of allRoles) {
      if (selectedRoles.value.includes(role)) {
        hues[role] = customHues.value[role]
      }
    }
  }

  const deriveOpts: any = {
    algorithm: algorithm.value,
    roles: selectedRoles.value,
    chromaScale: chromaScale.value,
    lightnessShift: lightnessShift.value,
    ...(Object.keys(hues).length > 0 ? { hues } : {})
  }

  const opts = {
    colors,
    prefix: normalizedPrefix(),
    type: paletteType.value,
    derive: deriveOpts,
    darkMode: darkModeEnabled.value ? ('class' as const) : (false as const),
    format: cssFormat.value,
    semantic: semanticEnabled.value
  }

  try {
    xcolor.updateTheme(opts, false)
  } catch (e) {
    console.error('Failed to update theme:', e)
    return
  }

  const vars = xcolor.getThemeVars()
  const css = xcolor.getThemeCss()

  themeVars.value = vars
  themeCss.value = css

  parseGroups(vars, css)
  generated.value = true
}

function parseGroups(vars: Record<string, string>, css: string) {
  const prefix = normalizedPrefix() + '-'
  const allKeys = Object.keys(vars)
  const semanticNames = ['hover', 'active', 'disabled', 'border', 'bg', 'text']
  const shadeNums = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
  const colorNames = ['primary', ...allRoles.filter(r => selectedRoles.value.includes(r))]

  // Parse dark vars from CSS
  const darkVars: Record<string, string> = {}
  const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/s)
  if (darkMatch) {
    const block = darkMatch[1]
    const re = /(--[\w-]+)\s*:\s*([^;]+)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(block)) !== null) {
      darkVars[m[1].trim()] = m[2].trim()
    }
  }

  const groups: ColorGroup[] = []

  for (const name of colorNames) {
    const keyPrefix = `${prefix}${name}-`
    const bareKey = `${prefix}${name}`
    const shades: SwatchItem[] = []
    const semantics: SwatchItem[] = []
    let baseVar: SwatchItem | null = null
    const darkShades: SwatchItem[] = []
    const darkSemantics: SwatchItem[] = []
    let darkBase: SwatchItem | null = null

    // Bare base variable (--x-primary)
    if (vars[bareKey]) {
      baseVar = { label: name, varName: bareKey, value: vars[bareKey] }
    }
    if (darkVars[bareKey]) {
      darkBase = { label: name, varName: bareKey, value: darkVars[bareKey] }
    }

    for (const key of allKeys) {
      if (!key.startsWith(keyPrefix)) continue
      const suffix = key.slice(keyPrefix.length)

      if (shadeNums.includes(suffix)) {
        shades.push({ label: suffix, varName: key, value: vars[key] })
      } else if (semanticNames.includes(suffix)) {
        semantics.push({ label: suffix, varName: key, value: vars[key] })
      }
    }

    // Dark shades & semantics for this color
    for (const dk of Object.keys(darkVars)) {
      if (!dk.startsWith(keyPrefix)) continue
      const suffix = dk.slice(keyPrefix.length)
      if (shadeNums.includes(suffix)) {
        darkShades.push({ label: suffix, varName: dk, value: darkVars[dk] })
      } else if (semanticNames.includes(suffix)) {
        darkSemantics.push({ label: suffix, varName: dk, value: darkVars[dk] })
      }
    }

    shades.sort((a, b) => Number(a.label) - Number(b.label))
    darkShades.sort((a, b) => Number(a.label) - Number(b.label))

    if (shades.length > 0 || semantics.length > 0) {
      groups.push({ name, baseVar, shades, semantics, darkBase, darkShades, darkSemantics })
    }
  }

  colorGroups.value = groups
}

// --- Copy ---
async function copyColor(hex: string) {
  try {
    await navigator.clipboard.writeText(hex)
    toastRef.value?.show(t.value.copied, hex)
  } catch { /* fallback */ }
}

async function copyCssToClipboard() {
  try {
    await navigator.clipboard.writeText(themeCss.value)
    toastRef.value?.show(t.value.copiedCss, colorInput.value)
  } catch { /* fallback */ }
}

// --- Helpers ---
function textColorFor(bg: string): string {
  if (!xcolor) return '#000'
  try {
    const c = xcolor(bg)
    return c.luminance() > 0.4 ? '#1a1a2e' : '#ffffff'
  } catch {
    return '#000'
  }
}

const roleColorMap: Record<string, string> = {
  primary: '#1890ff',
  secondary: '#d58a18',
  success: '#00a66b',
  warning: '#c1751d',
  error: '#d56059',
  info: '#2199d9'
}
</script>

<template>
  <div class="theme-studio" v-if="loaded">
    <!-- Input area -->
    <div class="ts-input-area">
      <div class="ts-color-input-row">
        <label class="ts-label">{{ t.primaryColor }}</label>
        <div class="ts-color-input-group">
          <div class="ts-color-preview" :style="{ background: colorInput }" />
          <input v-model="colorInput" class="ts-text-input" type="text" @input="syncFromText" placeholder="#1890ff" />
          <input v-model="pickerColor" class="ts-picker-input" type="color" @input="syncFromPicker" />
        </div>
      </div>
    </div>

    <!-- Options panel -->
    <div class="ts-options">
      <div class="ts-options-header" @click="optionsCollapsed = !optionsCollapsed">
        <span class="ts-options-title">⚙️ {{ t.options }}</span>
        <span class="ts-collapse-btn">{{ optionsCollapsed ? t.expand : t.collapse }} {{ optionsCollapsed ? '▼' : '▲' }}</span>
      </div>

      <div class="ts-options-body" v-show="!optionsCollapsed">
      <!-- 2-column grid -->
      <div class="ts-options-grid">
      <!-- Left column -->
      <div class="ts-col">
        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.paletteType }}</span>
          <div class="ts-radio-group">
            <label class="ts-radio" :class="{ active: paletteType === 'antd' }">
              <input type="radio" v-model="paletteType" value="antd" /> Ant Design
            </label>
            <label class="ts-radio" :class="{ active: paletteType === 'linear' }">
              <input type="radio" v-model="paletteType" value="linear" /> Linear
            </label>
          </div>
        </div>

        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.algorithm }}</span>
          <div class="ts-radio-group">
            <label class="ts-radio" :class="{ active: algorithm === 'oklch' }">
              <input type="radio" v-model="algorithm" value="oklch" /> OKLCh
            </label>
            <label class="ts-radio" :class="{ active: algorithm === 'hsl' }">
              <input type="radio" v-model="algorithm" value="hsl" /> HSL
            </label>
          </div>
        </div>

        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.semantic }}</span>
          <div class="ts-radio-group">
            <label class="ts-radio" :class="{ active: semanticEnabled }">
              <input type="radio" :value="true" v-model="semanticEnabled" /> {{ t.on }}
            </label>
            <label class="ts-radio" :class="{ active: !semanticEnabled }">
              <input type="radio" :value="false" v-model="semanticEnabled" /> {{ t.off }}
            </label>
          </div>
        </div>

        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.darkMode }}</span>
          <div class="ts-radio-group">
            <label class="ts-radio" :class="{ active: darkModeEnabled }">
              <input type="radio" :value="true" v-model="darkModeEnabled" /> {{ t.on }}
            </label>
            <label class="ts-radio" :class="{ active: !darkModeEnabled }">
              <input type="radio" :value="false" v-model="darkModeEnabled" /> {{ t.off }}
            </label>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="ts-col">
        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.chromaScale }}</span>
          <div class="ts-slider-row">
            <input type="range" v-model.number="chromaScale" min="0.5" max="1.5" step="0.05" class="ts-slider" />
            <span class="ts-slider-val">{{ chromaScale.toFixed(2) }}</span>
          </div>
        </div>

        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.lightnessShift }}</span>
          <div class="ts-slider-row">
            <input type="range" v-model.number="lightnessShift" min="-0.1" max="0.1" step="0.01" class="ts-slider" />
            <span class="ts-slider-val">{{ lightnessShift.toFixed(2) }}</span>
          </div>
        </div>

        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.cssFormat }}</span>
          <div class="ts-radio-group">
            <label class="ts-radio" :class="{ active: cssFormat === 'hex' }">
              <input type="radio" v-model="cssFormat" value="hex" /> HEX
            </label>
            <label class="ts-radio" :class="{ active: cssFormat === 'rgb' }">
              <input type="radio" v-model="cssFormat" value="rgb" /> RGB
            </label>
            <label class="ts-radio" :class="{ active: cssFormat === 'hsl' }">
              <input type="radio" v-model="cssFormat" value="hsl" /> HSL
            </label>
          </div>
        </div>

        <div class="ts-option-group">
          <span class="ts-opt-label">{{ t.prefix }}</span>
          <div class="ts-prefix-row">
            <span class="ts-prefix-hint">--</span>
            <input v-model="cssPrefix" class="ts-text-input ts-prefix-input" type="text" placeholder="x" />
          </div>
        </div>
      </div>
      </div>

      <!-- Roles: full-width row below -->
      <div class="ts-option-group ts-option-full">
        <div class="ts-roles-header">
          <span class="ts-opt-label">{{ t.roles }}</span>
          <label class="ts-check ts-check-sm" :class="{ active: customHueEnabled }">
            <input type="checkbox" v-model="customHueEnabled" />
            {{ t.customHues }}
          </label>
        </div>
        <div class="ts-roles-list">
          <div v-for="role in allRoles" :key="role" class="ts-role-row">
            <label class="ts-check" :class="{ active: selectedRoles.includes(role) }" @click.prevent="toggleRole(role)">
              <span class="ts-role-dot" :style="{ background: roleColorMap[role] }" />
              {{ role }}
            </label>
            <div class="ts-hue-slider-wrap" v-if="customHueEnabled && selectedRoles.includes(role)">
              <input
                type="range"
                v-model.number="customHues[role]"
                min="0" max="360" step="1"
                class="ts-hue-slider"
                :style="{ background: hueGradient() }"
              />
              <span class="ts-hue-val">{{ customHues[role] }}°</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Generate button -->
    <div class="ts-generate-row">
      <button class="ts-generate-btn" @click="generate">
        🎨 {{ t.generate }}
      </button>
      <span class="ts-hint" v-if="!generated">{{ t.hint }}</span>
      <span class="ts-hint" v-else>{{ t.clickToCopy }}</span>
    </div>

    <!-- Results -->
    <div class="ts-results" v-if="generated">
      <div v-for="group in colorGroups" :key="group.name" class="ts-color-group">
        <h3 class="ts-group-title">
          <span class="ts-title-dot" :style="{ background: group.baseVar?.value || group.shades[5]?.value || roleColorMap[group.name] }" />
          {{ group.name }}
          <span class="ts-base-badge" v-if="group.baseVar" :style="{ background: group.baseVar.value, color: textColorFor(group.baseVar.value) }" @click="copyColor(group.baseVar.value)" :title="group.baseVar.varName">
            {{ group.baseVar.varName }}
          </span>
        </h3>

        <!-- Shades -->
        <div class="ts-swatch-row" v-if="group.shades.length">
          <div class="ts-row-label">{{ t.shades }}</div>
          <div class="ts-swatches">
            <div v-for="s in group.shades" :key="s.varName" class="ts-swatch" :style="{ background: s.value, color: textColorFor(s.value) }" :title="s.varName + ': ' + s.value" @click="copyColor(s.value)">
              <span class="ts-swatch-shade">{{ s.label }}</span>
              <span class="ts-swatch-value">{{ s.value }}</span>
            </div>
          </div>
        </div>

        <!-- Semantic -->
        <div class="ts-swatch-row" v-if="group.semantics.length">
          <div class="ts-row-label">{{ t.semanticColors }}</div>
          <div class="ts-swatches">
            <div v-for="s in group.semantics" :key="s.varName" class="ts-swatch ts-swatch-semantic" :style="{ background: s.value, color: textColorFor(s.value) }" :title="s.varName + ': ' + s.value" @click="copyColor(s.value)">
              <span class="ts-swatch-shade">{{ s.label }}</span>
              <span class="ts-swatch-value">{{ s.value }}</span>
            </div>
          </div>
        </div>

        <!-- Dark variants for this color -->
        <template v-if="group.darkShades.length || group.darkSemantics.length">
          <div class="ts-dark-divider">
            <span>🌙 {{ t.darkVariants }}</span>
          </div>

          <div class="ts-swatch-row" v-if="group.darkBase || group.darkShades.length">
            <div class="ts-row-label">{{ t.shades }}</div>
            <div class="ts-swatches">
              <div v-for="s in group.darkShades" :key="s.varName" class="ts-swatch" :style="{ background: s.value, color: textColorFor(s.value) }" :title="s.varName + ' (dark): ' + s.value" @click="copyColor(s.value)">
                <span class="ts-swatch-shade">{{ s.label }}</span>
                <span class="ts-swatch-value">{{ s.value }}</span>
              </div>
            </div>
          </div>

          <div class="ts-swatch-row" v-if="group.darkSemantics.length">
            <div class="ts-row-label">{{ t.semanticColors }}</div>
            <div class="ts-swatches">
              <div v-for="s in group.darkSemantics" :key="s.varName" class="ts-swatch ts-swatch-semantic" :style="{ background: s.value, color: textColorFor(s.value) }" :title="s.varName + ' (dark): ' + s.value" @click="copyColor(s.value)">
                <span class="ts-swatch-shade">{{ s.label }}</span>
                <span class="ts-swatch-value">{{ s.value }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Copy CSS button -->
      <div class="ts-copy-css-row">
        <button class="ts-copy-css-btn" @click="copyCssToClipboard">
          📋 {{ t.copyCss }}
        </button>
      </div>
    </div>

    <Toast ref="toastRef" />
  </div>

  <!-- Loading state -->
  <div class="ts-loading" v-else>
    <div class="ts-spinner" />
  </div>
</template>

<style scoped>
.theme-studio {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

/* --- Input area --- */
.ts-input-area {
  margin-bottom: 20px;
}

.ts-color-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ts-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--xc-text);
  min-width: 60px;
}

.ts-color-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 240px;
}

.ts-color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--xc-swatch-border);
  flex-shrink: 0;
  transition: background 0.2s;
}

.ts-text-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--xc-border);
  border-radius: 8px;
  font-size: 15px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--xc-bg);
  color: var(--xc-text);
  outline: none;
  transition: border-color 0.2s;
}

.ts-text-input:focus {
  border-color: var(--xc-brand);
}

.ts-prefix-input {
  flex: none;
  width: 100px;
}

.ts-picker-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
  background: transparent;
}

.ts-picker-input::-webkit-color-swatch-wrapper { padding: 0; }
.ts-picker-input::-webkit-color-swatch { border-radius: 6px; border: 1px solid var(--xc-swatch-border); }

/* --- Options panel --- */
.ts-options {
  padding: 20px;
  border: 1px solid var(--xc-border);
  border-radius: 12px;
  background: var(--xc-bg-soft);
  margin-bottom: 20px;
}

.ts-options-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  margin-bottom: 4px;
}

.ts-options-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--xc-text);
}

.ts-collapse-btn {
  font-size: 12px;
  color: var(--xc-text-secondary);
  transition: color 0.15s;
}

.ts-collapse-btn:hover {
  color: var(--xc-brand);
}

.ts-options-body {
  margin-top: 16px;
}

.ts-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  margin-bottom: 18px;
}

.ts-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ts-roles-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.ts-option-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ts-option-full {
  grid-column: 1 / -1;
}

.ts-opt-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--xc-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ts-opt-label-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ts-radio-group, .ts-check-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ts-radio, .ts-check {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--xc-border);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: var(--xc-text-secondary);
  transition: all 0.15s;
  user-select: none;
}

.ts-radio input, .ts-check input {
  display: none;
}

.ts-radio.active, .ts-check.active {
  border-color: var(--xc-brand);
  color: var(--xc-brand);
  background: rgba(244, 114, 182, 0.08);
}

.ts-check-sm {
  padding: 2px 8px;
  font-size: 12px;
}

.ts-role-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ts-slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ts-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--xc-border);
  border-radius: 3px;
  outline: none;
}

.ts-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--xc-brand);
  cursor: pointer;
}

.ts-slider-val {
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--xc-text);
  min-width: 40px;
  text-align: right;
}

/* --- Roles list with inline hue sliders --- */
.ts-roles-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ts-role-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ts-role-row .ts-check {
  min-width: 110px;
  flex-shrink: 0;
}

.ts-hue-slider-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 140px;
}

.ts-hue-slider {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.ts-hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.ts-hue-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.ts-hue-val {
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--xc-text);
  min-width: 36px;
  text-align: right;
}

/* --- Prefix row --- */
.ts-prefix-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ts-prefix-hint {
  font-size: 15px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--xc-text-secondary);
  line-height: 40px;
}

/* --- Generate button --- */
.ts-generate-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.ts-generate-btn {
  padding: 10px 28px;
  border: none;
  border-radius: 10px;
  background: var(--xc-gradient);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  white-space: nowrap;
}

.ts-generate-btn:hover { opacity: 0.9; }
.ts-generate-btn:active { transform: scale(0.97); }

.ts-hint {
  font-size: 13px;
  color: var(--xc-text-secondary);
}

/* --- Results --- */
.ts-results {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ts-color-group {
  border: 1px solid var(--xc-border);
  border-radius: 12px;
  padding: 20px;
  background: var(--xc-bg-soft);
}

.ts-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: var(--xc-text);
  text-transform: capitalize;
}

.ts-title-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.ts-base-badge {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  border: 1px solid var(--xc-swatch-border);
  text-transform: lowercase;
}

.ts-base-badge:hover {
  opacity: 0.8;
}

.ts-swatch-row {
  margin-bottom: 12px;
}

.ts-swatch-row:last-child {
  margin-bottom: 0;
}

.ts-row-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--xc-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.ts-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ts-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 64px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
  border: 1px solid var(--xc-swatch-border);
  position: relative;
  overflow: hidden;
}

.ts-swatch:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.ts-swatch:active { transform: scale(0.95); }

.ts-swatch-shade {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.9;
}

.ts-swatch-value {
  font-size: 9px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  opacity: 0.75;
  margin-top: 2px;
}

.ts-swatch-semantic {
  width: 96px;
}

/* --- Dark divider --- */
.ts-dark-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--xc-text-secondary);
}

.ts-dark-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--xc-border);
}

/* --- Copy CSS --- */
.ts-copy-css-row {
  display: flex;
  justify-content: center;
}

.ts-copy-css-btn {
  padding: 10px 24px;
  border: 1px solid var(--xc-border);
  border-radius: 10px;
  background: var(--xc-bg);
  color: var(--xc-text);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.ts-copy-css-btn:hover {
  border-color: var(--xc-brand);
  background: var(--xc-bg-soft);
}

/* --- Loading --- */
.ts-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.ts-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--xc-border);
  border-top-color: var(--xc-brand);
  border-radius: 50%;
  animation: ts-spin 0.8s linear infinite;
}

@keyframes ts-spin {
  to { transform: rotate(360deg); }
}

/* --- Responsive --- */
@media (max-width: 640px) {
  .theme-studio { padding: 0 12px 40px; }
  .ts-options-grid { grid-template-columns: 1fr; gap: 14px 0; }
  .ts-options { padding: 14px; }
  .ts-swatch { width: 64px; height: 56px; }
  .ts-swatch-semantic { width: 80px; }
  .ts-swatch-value { font-size: 8px; }
}
</style>
