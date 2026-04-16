<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

// ─── Dev / Prod detection ───────────────────────────────
// dev  → embed local dist files into sandpack virtual node_modules (instant, offline)
// prod → sandpack fetches @xpyjs/color from npm CDN at runtime
const isDev = import.meta.env.DEV

// Sandpack component (browser-only, loaded in onMounted)
const SandpackComp = shallowRef<any>(null)

// Local dist contents — only populated in dev mode
const localDist = ref<{
  core: string
  harmony: string
  gradient: string
  a11y: string
  blend: string
} | null>(null)

// true once the init logic (sandpack + optional dist loading) finishes
const distAttempted = ref(!isDev) // in prod, nothing to load

const strip = (code: string) =>
  code.replace(/\/\/# sourceMappingURL=.+$/m, '').trim()

onMounted(async () => {
  const mod = await import('sandpack-vue3')
  SandpackComp.value = mod.Sandpack

  if (isDev) {
    try {
      // Dynamic import keeps these out of the production bundle entirely
      // (Vite dead-code-eliminates the whole branch when DEV === false)
      const [core, harmony, gradient, a11y, blend] = await Promise.all([
        import('../../../../dist/index.esm.js?raw'),
        import('../../../../dist/plugins/harmony/index.js?raw'),
        import('../../../../dist/plugins/gradient/index.js?raw'),
        import('../../../../dist/plugins/a11y/index.js?raw'),
        import('../../../../dist/plugins/blend/index.js?raw'),
      ])
      localDist.value = {
        core: strip(core.default),
        harmony: strip(harmony.default),
        gradient: strip(gradient.default),
        a11y: strip(a11y.default),
        blend: strip(blend.default),
      }
    } catch (e) {
      console.warn(
        '[Playground] 无法加载本地 dist 文件，请先运行 `npm run build`。\n' +
          '将回退到从 npm 在线加载（需要已发包）。',
        e,
      )
    } finally {
      distAttempted.value = true
    }
  }
})

const ready = computed(() => !!SandpackComp.value && distAttempted.value)

// ─── Default demo code ─────────────────────────────────
const indexTs = `import './styles.css'
import xcolor from '@xpyjs/color'
import harmony from '@xpyjs/color/plugins/harmony'
import gradient from '@xpyjs/color/plugins/gradient'
import a11y from '@xpyjs/color/plugins/a11y'
import blend from '@xpyjs/color/plugins/blend'

xcolor.use(harmony)
xcolor.use(gradient)
xcolor.use(a11y)
xcolor.use(blend)

const app = document.getElementById('app')!

// ─── Helpers ───
function createSection(title: string): HTMLElement {
  const section = document.createElement('div')
  section.className = 'section'
  const h = document.createElement('h2')
  h.textContent = title
  section.appendChild(h)
  app.appendChild(section)
  return section
}

function addSwatchRow(parent: HTMLElement, colors: { label: string; hex: string }[]) {
  const row = document.createElement('div')
  row.className = 'swatch-row'
  colors.forEach(({ label, hex }) => {
    const item = document.createElement('div')
    item.className = 'swatch-item'
    item.innerHTML = \`
      <div class="swatch" style="background:\${hex}"></div>
      <span class="swatch-label">\${label}</span>
      <code class="swatch-hex">\${hex}</code>
    \`
    row.appendChild(item)
  })
  parent.appendChild(row)
}

function addGradientBar(parent: HTMLElement, colors: string[], label?: string) {
  if (label) {
    const p = document.createElement('p')
    p.className = 'bar-label'
    p.textContent = label
    parent.appendChild(p)
  }
  const bar = document.createElement('div')
  bar.className = 'gradient-bar'
  colors.forEach(hex => {
    const stop = document.createElement('div')
    stop.className = 'gradient-stop'
    stop.style.background = hex
    stop.title = hex
    bar.appendChild(stop)
  })
  parent.appendChild(bar)
}

// ━━━ Section 1: Basic & Chain ━━━
const s1 = createSection('🎨 Basic & Chain Operations')
const base = xcolor('#3b82f6')
addSwatchRow(s1, [
  { label: 'Original', hex: base.toHex() },
  { label: '.lighten(20)', hex: base.clone().lighten(20).toHex() },
  { label: '.darken(20)', hex: base.clone().darken(20).toHex() },
  { label: '.saturate(30)', hex: base.clone().saturate(30).toHex() },
  { label: '.desaturate(30)', hex: base.clone().desaturate(30).toHex() },
  { label: '.spin(90)', hex: base.clone().spin(90).toHex() },
])

const chained = xcolor('#e74c3c').lighten(10).saturate(20).spin(30)
addSwatchRow(s1, [
  { label: 'Chain: #e74c3c', hex: '#e74c3c' },
  { label: '.lighten(10).saturate(20).spin(30)', hex: chained.toHex() },
])

// ━━━ Section 2: Harmony Schemes ━━━
const s2 = createSection('🎼 Harmony Color Schemes')
const primary = xcolor('#8b5cf6')
const schemes: [string, any[]][] = [
  ['Complement', [primary.clone().complement()]],
  ['Triad', primary.clone().triad()],
  ['Analogous', primary.clone().analogous()],
  ['Split Complement', primary.clone().splitComplement()],
  ['Monochromatic', primary.clone().monochromatic()],
]
schemes.forEach(([name, colors]) => {
  const label = document.createElement('p')
  label.className = 'bar-label'
  label.textContent = name
  s2.appendChild(label)
  addSwatchRow(s2, colors.map((c: any, i: number) => ({
    label: i === 0 && name === 'Complement' ? 'Complement' : \`\${i + 1}\`,
    hex: c.toHex(),
  })))
})

// ━━━ Section 3: Gradient ━━━
const s3 = createSection('🌈 Gradient Generation')
addGradientBar(s3,
  xcolor('#ff6b6b').gradient('#4ecdc4', 9).map((c: any) => c.toHex()),
  '#ff6b6b → #4ecdc4 (9 steps)'
)
addGradientBar(s3,
  xcolor('#667eea').gradient('#764ba2', 9).map((c: any) => c.toHex()),
  '#667eea → #764ba2 (9 steps)'
)
addGradientBar(s3,
  xcolor('#f093fb').gradient('#f5576c', 9).map((c: any) => c.toHex()),
  '#f093fb → #f5576c (9 steps)'
)

// ━━━ Section 4: Blend Modes ━━━
const s4 = createSection('🔀 Blend Modes')
const blendBase = xcolor('#3498db')
const blendWith = xcolor('#e74c3c')
const modes = ['multiply', 'screen', 'overlay', 'dodge', 'burn', 'softLight', 'difference'] as const
addSwatchRow(s4, [
  { label: 'Base', hex: blendBase.toHex() },
  { label: 'Blend with', hex: blendWith.toHex() },
])
addSwatchRow(s4, modes.map(mode => ({
  label: mode,
  hex: blendBase.clone().blend(blendWith.toHex(), mode).toHex(),
})))

// ━━━ Section 5: Accessibility ━━━
const s5 = createSection('♿ Accessibility (a11y)')
const testColors = ['#1a1a2e', '#3b82f6', '#f59e0b', '#10b981', '#ef4444']
const bgWhite = '#ffffff'
const a11yGrid = document.createElement('div')
a11yGrid.className = 'a11y-grid'
testColors.forEach(hex => {
  const c = xcolor(hex)
  const info = c.wcagLevel(bgWhite)
  const card = document.createElement('div')
  card.className = 'a11y-card'
  card.innerHTML = \`
    <div class="swatch" style="background:\${hex}"></div>
    <div class="a11y-info">
      <code>\${hex}</code>
      <span class="a11y-badge \${info.level === 'FAIL' ? 'fail' : 'pass'}">\${info.level} Normal</span>
      <span class="a11y-badge \${info.largeText === 'FAIL' ? 'fail' : 'pass'}">\${info.largeText} Large</span>
      <span class="a11y-ratio">\${typeof info.ratio === 'number' ? info.ratio.toFixed(2) : info.ratio}:1</span>
    </div>
  \`
  a11yGrid.appendChild(card)
})
s5.appendChild(a11yGrid)

// ━━━ Section 6: Random Colors ━━━
const s6 = createSection('🎲 Random Colors')
addSwatchRow(s6, Array.from({ length: 8 }, (_, i) => {
  const c = xcolor.random()
  return { label: \`Random \${i + 1}\`, hex: c.toHex() }
}))

console.log('🎨 xcolor playground loaded!')
console.log('Formats:', base.toHex(), base.toRgbString(), base.toHslString())
`

const stylesCss = `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  margin: 0;
  background: #f8f9fb;
  color: #1a1a2e;
}
#app { max-width: 100%; }

.section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
h2 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, #F472B6, #F97316) 1;
}
.bar-label {
  font-size: 12px;
  color: #666;
  margin: 8px 0 4px;
  font-weight: 600;
}
.swatch-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.swatch-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 56px;
}
.swatch {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: transform 0.15s;
}
.swatch:hover { transform: scale(1.1); }
.swatch-label {
  font-size: 10px;
  color: #888;
  text-align: center;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.swatch-hex {
  font-size: 9px;
  color: #aaa;
  font-family: monospace;
}
.gradient-bar {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  height: 36px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.gradient-stop {
  flex: 1;
  transition: transform 0.15s;
}
.gradient-stop:hover { transform: scaleY(1.15); }
.a11y-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.a11y-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fb;
  border-radius: 8px;
  border: 1px solid #e2e4e8;
}
.a11y-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.a11y-info code {
  font-size: 11px;
  color: #555;
}
.a11y-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}
.a11y-badge.pass { background: #dcfce7; color: #16a34a; }
.a11y-badge.fail { background: #fee2e2; color: #dc2626; }
.a11y-ratio {
  font-size: 10px;
  color: #888;
  font-weight: 600;
  font-family: monospace;
}
`

const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@xpyjs/color Playground</title>
</head>
<body>
  <div style="width: 100%">
    <div id="app"></div>
  </div>
  <script type="module" src="/index.ts"><\/script>
</body>
</html>
`

// ─── Sandpack files (reactive) ─────────────────────────
const files = computed(() => {
  const f: Record<string, any> = {
    '/index.html': { code: indexHtml },
    '/index.ts': { code: indexTs, active: true },
    '/styles.css': { code: stylesCss },
  }

  if (localDist.value) {
    // Dev mode: inject local build into sandpack's virtual node_modules
    f['/node_modules/@xpyjs/color/package.json'] = {
      code: JSON.stringify({
        name: '@xpyjs/color',
        version: '1.0.0',
        main: 'index.js',
        module: 'index.js',
      }),
      hidden: true,
    }
    f['/node_modules/@xpyjs/color/index.js'] = {
      code: localDist.value.core,
      hidden: true,
    }
    f['/node_modules/@xpyjs/color/plugins/harmony.js'] = {
      code: localDist.value.harmony,
      hidden: true,
    }
    f['/node_modules/@xpyjs/color/plugins/gradient.js'] = {
      code: localDist.value.gradient,
      hidden: true,
    }
    f['/node_modules/@xpyjs/color/plugins/a11y.js'] = {
      code: localDist.value.a11y,
      hidden: true,
    }
    f['/node_modules/@xpyjs/color/plugins/blend.js'] = {
      code: localDist.value.blend,
      hidden: true,
    }
  }

  return f
})

// ─── customSetup: only needed in prod (or when local dist failed) ──
const customSetup = computed(() => {
  if (localDist.value) return undefined
  // Production / fallback: let sandpack resolve from npm CDN
  return {
    dependencies: {
      '@xpyjs/color': 'latest',
    },
  }
})

const options = {
  showConsole: true,
  showConsoleButton: true,
  showLineNumbers: true,
  showTabs: true,
  editorHeight: 600,
  resizablePanels: true,
}
</script>

<template>
  <div class="playground-container">
    <div v-if="!ready" class="loading-placeholder">
      Loading Playground...
    </div>
    <component
      v-else
      :is="SandpackComp"
      template="vanilla-ts"
      :theme="isDark ? 'dark' : 'light'"
      :files="files"
      :custom-setup="customSetup"
      :options="options"
    />
  </div>
</template>

<style scoped>
.playground-container {
  margin: 16px 0;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 14px;
}

/* Override Sandpack's default border radius to match VitePress style */
.playground-container :deep(.sp-wrapper) {
  border-radius: 8px;
}
</style>
