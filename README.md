<p align="center">
  <img src=".github/assets/logo.png" alt="xcolor logo" width="120" height="120" />
</p>

<h1 align="center">
  <img src=".github/assets/title.svg" alt="@xpyjs/color" width="480" />
</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/@xpyjs/color?color=%2342b883&label=version" alt="version" />
  <img src="https://img.shields.io/bundlephobia/minzip/@xpyjs/color?color=%2342b883" alt="bundle size" />
  <img src="https://img.shields.io/npm/l/@xpyjs/color" alt="license" />
  <img src="https://img.shields.io/github/actions/workflow/status/xpyjs/color/ci.yml?branch=main" alt="CI" />
  <img src="https://codecov.io/gh/xpyjs/color/branch/main/graph/badge.svg" alt="coverage" />
</p>

<p align="center">
  A tiny (<b>~4KB</b> gzipped), fast, and plugin-extensible color manipulation library for JavaScript/TypeScript.
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> | English
</p>

<p align="center">
  <a href="https://docs.xiaopangying.com/color/">📖 Documentation</a>
</p>

---

## ✨ Features

- 🪶 **Tiny** — ~4KB gzipped core, zero dependencies
- 🔌 **Plugin System** — Extend functionality like dayjs, load what you need
- 🎯 **TypeScript First** — Full type definitions and IntelliSense
- ⛓️ **Chainable API** — Fluent interface for all operations
- 🎨 **Multi-format** — Hex, RGB, HSL, HSV, Named colors, Numbers
- 🏷️ **Method Aliases** — Shorthand aliases like `r()`, `g()`, `b()`, `h()`, `s()`, `l()`
- ♿ **Accessibility** — WCAG contrast ratio, readability checks (via plugin)
- 🎭 **Blend Modes** — Photoshop-like blending (via plugin)
- 🧪 **Well Tested** — Near 100% test coverage

## 📦 Installation

```bash
npm install @xpyjs/color
```

```bash
yarn add @xpyjs/color
```

```bash
pnpm add @xpyjs/color
```

**Requirements:** Node.js >= 14.0.0 | Browsers: ES2015+ (ES6)

## 🚀 Quick Start

```typescript
import xcolor from '@xpyjs/color'

// Create from various formats
const red = xcolor('#ff0000')
const blue = xcolor('rgb(0, 0, 255)')
const green = xcolor('hsl(120, 100%, 50%)')
const named = xcolor('coral')
const obj = xcolor({ r: 255, g: 128, b: 0 })
const num = xcolor(0xFF8040)

// Chain operations
const result = xcolor('#ff0000')
  .lighten(20)
  .saturate(10)
  .alpha(0.8)
  .toHex()

// Check properties
xcolor('#fff').isLight() // true
xcolor('#000').isDark()  // true

// Compare colors
xcolor('#000').contrast('#fff') // 21 (max contrast)
```

## 📖 API Reference

### Creating Colors

```typescript
import xcolor from '@xpyjs/color'

// Factory function (recommended)
xcolor('#ff0000')              // Hex
xcolor('#f00')                 // Short hex
xcolor('#ff000080')            // Hex with alpha
xcolor('rgb(255, 0, 0)')      // RGB string
xcolor('rgba(255, 0, 0, 0.5)')// RGBA string
xcolor('rgb(255 0 0 / 0.5)')  // Modern CSS syntax
xcolor('hsl(0, 100%, 50%)')   // HSL string
xcolor('hsla(0, 100%, 50%, 0.5)') // HSLA string
xcolor('hsv(0, 100%, 100%)')  // HSV string
xcolor('red')                  // CSS named color (148 colors)
xcolor({ r: 255, g: 0, b: 0 })// Object
xcolor(0xFF0000)               // Number
xcolor()                       // Default black

// Static methods
xcolor.random()                // Random color
xcolor.isColor(value)          // Type guard

// Options
xcolor('#ff0000', { useDecimal: true }) // Enable fractional RGB values
```

### Channel Access (Get / Set)

All channel methods support dual usage: call without arguments to **get**, with arguments to **set** (chainable).

```typescript
const c = xcolor('#ff8040')

// Get channel values
c.red()        // 255        (alias: c.r())
c.green()      // 128        (alias: c.g())
c.blue()       // 64         (alias: c.b())
c.alpha()      // 1          (alias: c.a(), c.opacity())

// Set channel values (chainable)
c.red(200).green(100).blue(50).alpha(0.8)
// Or use aliases:
c.r(200).g(100).b(50).a(0.8)

// HSL channel access
c.hue()         // Get hue (0-360)        (alias: c.h())
c.hue(180)      // Set hue                (alias: c.h(180))
c.saturation()  // Get saturation (0-100) (alias: c.s())
c.lightness()   // Get lightness (0-100)  (alias: c.l())

// HSV channel access
c.value()       // Get value/brightness (0-100) (alias: c.v())
c.value(80)     // Set value                    (alias: c.v(80))
```

### Output Methods

```typescript
const c = xcolor('#ff8040')

c.toHex()            // '#ff8040'
c.toHex(true)        // '#ff8040' (or '#RGB' if possible)
c.toHex(false, true) // '#ff8040ff' (force alpha)
c.toHexString()      // Alias for toHex()
c.toRgb()            // { r: 255, g: 128, b: 64, a: 1 }
c.toRgbString()      // 'rgb(255, 128, 64)'
c.toRgbArray()       // [255, 128, 64, 1]
c.toHsl()            // { h: 20, s: 100, l: 62.55, a: 1 }
c.toHslString()      // 'hsl(20, 100%, 63%)'
c.toHsv()            // { h: 20, s: 74.9, v: 100, a: 1 }
c.toHsvString()      // 'hsv(20, 75%, 100%)'
c.toNumber()         // 16744512 (0xFF8040)
c.toPercentageRgb()  // { r: '100%', g: '50%', b: '25%', a: 1 }
c.toName()           // CSS name if exact match, or undefined
c.toObject()         // Alias for toRgb()
c.toString()         // Auto-selects best format
c.toString('hex')    // Force format: 'hex' | 'hex3' | 'hex8' | 'rgb' | 'hsl' | 'hsv' | 'name'
                     // Plugins can extend: 'cmyk' | 'percentageRgb'
```

### Color Manipulation

All manipulation methods modify the instance and return `this` for chaining.

```typescript
const c = xcolor('#ff0000')

// Lightness
c.lighten(20)     // Increase HSL lightness by 20
c.darken(20)      // Decrease HSL lightness by 20
c.brighten(20)    // Additive brightening (toward white)

// Saturation
c.saturate(20)    // Increase saturation by 20
c.desaturate(20)  // Decrease saturation by 20
c.grayscale()     // Fully desaturate (alias: greyscale)

// Hue
c.spin(120)       // Rotate hue by 120°
c.rotate(120)     // Alias for spin

// Inversion
c.negate()        // Invert colors (255 - channel)
c.invert()        // Alias for negate

// Alpha / Opacity
c.fade(20)        // Decrease opacity by 20% (alias: fadeOut)
c.opaquer(20)     // Increase opacity by 20% (alias: fadeIn)

// Mixing
c.tint(50)        // Mix 50% with white
c.shade(50)       // Mix 50% with black
c.mix('#0000ff', 50) // Mix 50% with blue
```

### Query Methods

```typescript
const c = xcolor('#ff0000')

c.isLight()           // false
c.isDark()            // true
c.isValid()           // true
c.brightness()        // 76.245 (0-255 YIQ brightness)
c.luminance()         // 0.2126 (WCAG relative luminance)
c.contrast('#ffffff') // 3.99 (WCAG contrast ratio, 1-21)
c.equals('#ff0000')   // true
c.clone()             // New independent instance
```

### Method Aliases Summary

| Full Name       | Alias(es)            | Description            |
| --------------- | -------------------- | ---------------------- |
| `red()`         | `r()`                | Red channel (get/set)  |
| `green()`       | `g()`                | Green channel (get/set)|
| `blue()`        | `b()`                | Blue channel (get/set) |
| `alpha()`       | `a()`, `opacity()`   | Alpha channel (get/set)|
| `hue()`         | `h()`                | Hue (get/set)          |
| `saturation()`  | `s()`                | Saturation (get/set)   |
| `lightness()`   | `l()`                | Lightness (get/set)    |
| `value()`       | `v()`                | HSV value (get/set)    |
| `grayscale()`   | `greyscale()`        | Desaturate completely  |
| `spin()`        | `rotate()`           | Rotate hue             |
| `negate()`      | `invert()`           | Invert color           |
| `fade()`        | `fadeOut()`           | Decrease opacity       |
| `opaquer()`     | `fadeIn()`            | Increase opacity       |
| `toHex()`       | `toHexString()`      | Hex output             |
| `toRgb()`       | `toObject()`         | RGBA object output     |

## 🔌 Plugins

Extend functionality with plugins, inspired by dayjs's architecture.

### Using Plugins

```typescript
import xcolor from '@xpyjs/color'
import harmony from '@xpyjs/color/plugins/harmony'
import a11y from '@xpyjs/color/plugins/a11y'

// Register plugins (chainable)
xcolor.use(harmony).use(a11y)

// Now use the new methods
xcolor('#ff0000').complement()
xcolor('#000').isReadable('#fff')
```

### Available Plugins

#### 🎵 Harmony — Color harmony combinations

```typescript
import harmony from '@xpyjs/color/plugins/harmony'
xcolor.use(harmony)

xcolor('#ff0000').complement()      // Complementary (180°)
xcolor('#ff0000').triad()           // 3 colors, 120° apart
xcolor('#ff0000').tetrad()          // 4 colors, 90° apart
xcolor('#ff0000').splitComplement() // Split-complementary
xcolor('#ff0000').analogous(6, 30)  // Analogous colors
xcolor('#ff0000').monochromatic(6)  // Monochromatic variations
```

#### ♿ A11y — Accessibility utilities

```typescript
import a11y from '@xpyjs/color/plugins/a11y'
xcolor.use(a11y)

xcolor('#000').isReadable('#fff')                        // true
xcolor('#000').isReadable('#fff', { level: 'AAA' })      // true
xcolor('#fff').mostReadable(['#000', '#888', '#fff'])    // black
xcolor('#000').wcagLevel('#fff')
// { level: 'AAA', largeText: 'AAA', ratio: 21 }
```

#### 🎭 Blend — Color blending modes

```typescript
import blend from '@xpyjs/color/plugins/blend'
xcolor.use(blend)

xcolor('#ff0000').blend('#0000ff', 'multiply')
xcolor('#ff0000').blend('#0000ff', 'screen')
xcolor('#ff0000').blend('#0000ff', 'overlay')
// Also: darken, lighten, dodge, burn, hardLight, softLight, difference, exclusion
```

#### 🌈 Gradient — Color gradients and palettes

```typescript
import gradient from '@xpyjs/color/plugins/gradient'
xcolor.use(gradient)

xcolor('#ff0000').gradient('#0000ff', 5) // 5-step gradient array
xcolor('#ff0000').tones(5)               // Shades + original + tints
```

#### 🖨️ CMYK — CMYK color space

```typescript
import cmyk from '@xpyjs/color/plugins/cmyk'
xcolor.use(cmyk)

xcolor('#ff0000').toCmyk()       // { c: 0, m: 100, y: 100, k: 0 }
xcolor('#ff0000').toCmykString() // 'cmyk(0%, 100%, 100%, 0%)'
xcolor('#ff0000').toString('cmyk') // 'cmyk(0%, 100%, 100%, 0%)'
```

#### 🔬 Lab — CIE Lab color space & Delta E

```typescript
import lab from '@xpyjs/color/plugins/lab'
xcolor.use(lab)

xcolor('#ff0000').toLab()          // { l: 53.23, a: 80.11, b: 67.22 }
xcolor('#ff0000').toLabString()    // 'lab(53.23% 80.11 67.22)'
xcolor('#ff0000').deltaE('#fe0000') // Color difference (0-100+)
```

#### 🏷️ Name — Closest color name finder

```typescript
import name from '@xpyjs/color/plugins/name'
xcolor.use(name)

xcolor('#fe0000').closestName()  // 'red'
xcolor('CornflowerBlue')         // color instance for #6495ed
```

#### 📊 PercentageRgb — Percentage-based RGB output

```typescript
import percentageRgb from '@xpyjs/color/plugins/percentageRgb'
xcolor.use(percentageRgb)

xcolor('#ff8000').toPercentageRgb() // { r: '100%', g: '50%', b: '0%', a: 1 }
xcolor('#ff8000').toString('percentageRgb') // 'rgba(100%, 50%, 0%, 1)'
```

> 📚 **20+ plugins available.** See the [full plugin documentation](https://docs.xiaopangying.com/color/plugins/overview) for all plugins including HWB, OKLab, XYZ, Display P3, Rec2020, Scale, Simulate, Temperature, Theme, Palette and more.

### Creating a New Plugin

Use the scaffolding script to quickly create a plugin:

```bash
npm run create:plugin myPlugin
```

This creates:

- `src/plugins/myPlugin/index.ts` — Plugin source with template
- `test/plugins/myPlugin.test.ts` — Test file with template

The plugin is automatically detected by the build system.

#### Manual Plugin Structure

```typescript
import xcolor, { type XColorPlugin } from '@xpyjs/color'

// Declare module augmentation for TypeScript
declare module '@xpyjs/color' {
  interface XColor {
    myMethod(): string
  }
}

const myPlugin: XColorPlugin = {
  name: '@xpyjs/color/plugins/my-plugin',
  install(_option, cls, _factory) {
    const proto: any = cls.prototype
    proto.myMethod = function () {
      return `Color: ${this.toHex()}`
    }
  }
}

xcolor.use(myPlugin)
```

Plugins are registered by `name`. If the same name is used again, the previous registration is overridden with a warning.

If your plugin needs helpers such as `clamp`, `round`, or parser utilities, import them directly from `@xpyjs/color` instead of expecting a `utils` parameter.

## 🔧 Utility Exports

For advanced usage, utility functions are also exported:

```typescript
import {
  clamp, round,
  rgbToHsl, hslToRgb,
  rgbToHsv, hsvToRgb,
  relativeLuminance, contrastRatio
} from '@xpyjs/color'
```

## 🌐 Browser Usage

### CDN (UMD)

```html
<script src="https://unpkg.com/@xpyjs/color/dist/index.umd.js"></script>
<script>
  const c = xcolor('#ff0000')
  console.log(c.toHsl())
</script>
```

### ES Module

```html
<script type="module">
  import xcolor from 'https://unpkg.com/@xpyjs/color/dist/index.esm.js'
  const c = xcolor('#ff0000')
  console.log(c.toHsl())
</script>
```

## 📄 License

[MIT](./LICENSE) © [xpyjs](https://github.com/xpyjs)
