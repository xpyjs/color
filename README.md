<p align="center">
  <img src="https://raw.githubusercontent.com/xpyjs/color/main/.github/assets/logo.png" alt="xcolor logo" width="120" height="120" />
</p>

<h1 align="center">
  <img src="https://raw.githubusercontent.com/xpyjs/color/main/.github/assets/title.svg" alt="@xpyjs/color" width="480" />
</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/@xpyjs/color?color=%2342b883&label=version" alt="version" />
  <img src="https://img.shields.io/bundlephobia/minzip/@xpyjs/color?color=%2342b883" alt="bundle size" />
  <img src="https://img.shields.io/npm/l/@xpyjs/color" alt="license" />
  <img src="https://img.shields.io/github/actions/workflow/status/xpyjs/color/ci.yml?branch=main" alt="CI" />
  <img src="https://codecov.io/gh/xpyjs/color/branch/main/graph/badge.svg" alt="coverage" />
</p>

<p align="center">
  A tiny (<b>~5.5KB</b> gzipped), fast, and plugin-extensible color manipulation library for JavaScript/TypeScript.
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> | English
</p>

<p align="center">
  <a href="https://docs.xiaopangying.com/color/">📖 Documentation</a>
</p>

---

## ✨ Features

- 🪶 **Tiny** — ~5.5KB gzipped core, zero dependencies
- 🔌 **Plugin System** — Extend functionality like dayjs, load what you need
- 🎯 **TypeScript First** — Full type definitions and IntelliSense
- ⛓️ **Chainable API** — Fluent interface for all operations
- 🎨 **Multi-format** — Hex, RGB, HSL, HSV, Numbers (named colors via the `name` plugin)
- 🏷️ **Method Aliases** — Shorthand aliases like `r()`, `g()`, `b()`, `h()`, `s()`, `l()`
- ♿ **Accessibility** — WCAG contrast ratio, readability checks (via plugin)
- 🎭 **Blend Modes** — Photoshop-like blending (via plugin)
- 🧪 **Well Tested** — Coverage thresholds enforced in CI

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

Build the repository with Node 20 or 22. For browser, CDN and TypeScript entry points, see the [installation guide](https://xpyjs.github.io/color/en/guide/installation.html).

## 🚀 Quick Start

```typescript
import xcolor from '@xpyjs/color'
import name from '@xpyjs/color/plugins/name'

xcolor.use(name)

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

## Documentation

- [Install and choose a platform](https://xpyjs.github.io/color/en/guide/installation.html)
- [Color formats and validation](https://xpyjs.github.io/color/en/guide/create-color.html)
- [Core API](https://xpyjs.github.io/color/en/api/constructor.html)
- [Plugins by task](https://xpyjs.github.io/color/en/plugins/overview.html)
- [TypeScript and custom plugins](https://xpyjs.github.io/color/en/guide/typescript.html)

## 📄 License

[MIT](./LICENSE) © [xpyjs](https://github.com/xpyjs)

## Compatibility changes

Malformed color tokens now fail validation. Decimal RGB input retains fractional precision before instance rounding. Functional color strings preserve alpha, and WCAG levels use the unrounded ratio. Node ESM and CommonJS share plugin and configuration state.

Accessibility checks now reject invalid colors. Use `blend(color, "normal")` for ordinary alpha compositing. Node TypeScript users mixing ESM and CommonJS share the same `XColor` type.
