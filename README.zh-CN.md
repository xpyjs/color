<p align="center">
  <img src=".github/assets/logo.png" alt="xcolor logo" width="120" height="120" />
</p>

<h1 align="center">
  <img src=".github/assets/title.svg" alt="@xpyjs/color" width="480" />
</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/@xpyjs/color?color=%2342b883&label=version" alt="版本" />
  <img src="https://img.shields.io/bundlephobia/minzip/@xpyjs/color?color=%2342b883" alt="包大小" />
  <img src="https://img.shields.io/npm/l/@xpyjs/color" alt="许可证" />
  <img src="https://img.shields.io/github/actions/workflow/status/xpyjs/color/ci.yml?branch=main" alt="CI" />
  <img src="https://codecov.io/gh/xpyjs/color/branch/main/graph/badge.svg" alt="覆盖率" />
</p>

<p align="center">
  一个极小（gzip 后约 <b>4KB</b>）、快速、支持插件扩展的 JavaScript/TypeScript 颜色操作库。
</p>

<p align="center">
  简体中文 | <a href="./README.md">English</a>
</p>

<p align="center">
  <a href="https://docs.xiaopangying.com/color/">📖 文档</a>
</p>

---

## ✨ 特性

- 🪶 **极小体积** — 核心约 4KB（gzip），零依赖
- 🔌 **插件系统** — 类似 dayjs 的扩展机制，按需加载
- 🎯 **TypeScript 优先** — 完整的类型定义和智能提示
- ⛓️ **链式 API** — 所有操作支持流畅的链式调用
- 🎨 **多格式支持**  — Hex、RGB、HSL、HSV、CSS 颜色名、数字
- 🏷️ **方法别名** — 简写别名如 `r()`、`g()`、`b()`、`h()`、`s()`、`l()`
- ♿ **无障碍**  — WCAG 对比度、可读性检查（通过插件）
- 🎭 **混合模式** — 类似 Photoshop 的颜色混合（通过插件）
- 🧪 **测试完善** — 接近 100% 的测试覆盖率

## 📦 安装

```bash
npm install @xpyjs/color
```

```bash
yarn add @xpyjs/color
```

```bash
pnpm add @xpyjs/color
```

**环境要求：** Node.js >= 14.0.0 | 浏览器：ES2015+（ES6）

## 🚀 快速开始

```typescript
import xcolor from '@xpyjs/color'

// 从多种格式创建
const red = xcolor('#ff0000')
const blue = xcolor('rgb(0, 0, 255)')
const green = xcolor('hsl(120, 100%, 50%)')
const named = xcolor('coral')
const obj = xcolor({ r: 255, g: 128, b: 0 })
const num = xcolor(0xFF8040)

// 链式操作
const result = xcolor('#ff0000')
  .lighten(20)
  .saturate(10)
  .alpha(0.8)
  .toHex()

// 查询属性
xcolor('#fff').isLight() // true
xcolor('#000').isDark()  // true

// 颜色对比
xcolor('#000').contrast('#fff') // 21（最大对比度）
```

## 📖 API 参考

### 创建颜色

```typescript
import xcolor from '@xpyjs/color'

// 工厂函数（推荐）
xcolor('#ff0000')              // Hex
xcolor('#f00')                 // 简写 Hex
xcolor('#ff000080')            // 带透明度的 Hex
xcolor('rgb(255, 0, 0)')      // RGB 字符串
xcolor('rgba(255, 0, 0, 0.5)')// RGBA 字符串
xcolor('rgb(255 0 0 / 0.5)')  // 现代 CSS 语法
xcolor('hsl(0, 100%, 50%)')   // HSL 字符串
xcolor('hsla(0, 100%, 50%, 0.5)') // HSLA 字符串
xcolor('hsv(0, 100%, 100%)')  // HSV 字符串
xcolor('red')                  // CSS 颜色名（148种）
xcolor({ r: 255, g: 0, b: 0 })// 对象
xcolor(0xFF0000)               // 数字
xcolor()                       // 默认黑色

// 静态方法
xcolor.random()                // 随机颜色
xcolor.isColor(value)          // 类型守卫
```

### 通道访问（获取/设置）

所有通道方法都支持双重用法：无参调用为**获取**，传参为**设置**（可链式调用）。

```typescript
const c = xcolor('#ff8040')

// 获取通道值
c.red()        // 255        （别名：c.r()）
c.green()      // 128        （别名：c.g()）
c.blue()       // 64         （别名：c.b()）
c.alpha()      // 1          （别名：c.opacity()）

// 设置通道值（支持链式调用）
c.red(200).green(100).blue(50).alpha(0.8)
// 或使用别名：
c.r(200).g(100).b(50).opacity(0.8)

// HSL 通道访问
c.hue()         // 获取色相 (0-360)        （别名：c.h()）
c.hue(180)      // 设置色相                 （别名：c.h(180)）
c.saturation()  // 获取饱和度 (0-100)       （别名：c.s()）
c.lightness()   // 获取/设置亮度 (0-100)    （别名：c.l()）
```

### 输出方法

```typescript
const c = xcolor('#ff8040')

c.toHex()            // '#ff8040'
c.toHex(true)        // '#ff8040'（若可能则输出 #RGB）
c.toHex(false, true) // '#ff8040ff'（强制包含透明度）
c.toHexString()      // toHex() 的别名
c.toRgb()            // { r: 255, g: 128, b: 64, a: 1 }
c.toRgbString()      // 'rgb(255, 128, 64)'
c.toRgbArray()       // [255, 128, 64, 1]
c.toHsl()            // { h: 20, s: 100, l: 62.55, a: 1 }
c.toHslString()      // 'hsl(20, 100%, 63%)'
c.toHsv()            // { h: 20, s: 74.9, v: 100, a: 1 }
c.toHsvString()      // 'hsv(20, 75%, 100%)'
c.toNumber()         // 16744512 (0xFF8040)
c.toPercentageRgb()  // { r: '100%', g: '50%', b: '25%', a: 1 }
c.toName()           // 精确匹配返回 CSS 颜色名，否则 undefined
c.toObject()         // toRgb() 的别名
c.toString()         // 自动选择最佳格式
c.toString('hex')    // 强制格式：'hex' | 'hex3' | 'hex8' | 'rgb' | 'hsl' | 'hsv' | 'name'
                     // 插件可扩展：'cmyk' | 'percentageRgb'
```

### 颜色操作

所有操作方法会修改实例并返回 `this`，支持链式调用。

```typescript
const c = xcolor('#ff0000')

// 亮度
c.lighten(20)     // HSL 亮度增加 20
c.darken(20)      // HSL 亮度降低 20
c.brighten(20)    // 加性增亮（趋向白色）

// 饱和度
c.saturate(20)    // 饱和度增加 20
c.desaturate(20)  // 饱和度降低 20
c.grayscale()     // 完全去饱和（别名：greyscale）

// 色相
c.spin(120)       // 色相旋转 120°
c.rotate(120)     // spin 的别名

// 反转
c.negate()        // 反转颜色 (255 - 通道值）
c.invert()        // negate 的别名

// 透明度
c.fade(20)        // 透明度降低 20%（别名：fadeOut）
c.opaquer(20)     // 透明度增加 20%（别名：fadeIn）

// 混合
c.tint(50)        // 与白色混合 50%
c.shade(50)       // 与黑色混合 50%
c.mix('#0000ff', 50) // 与蓝色混合 50%
```

### 查询方法

```typescript
const c = xcolor('#ff0000')

c.isLight()           // false
c.isDark()            // true
c.isValid()           // true
c.brightness()        // 76.245（YIQ 亮度，0-255）
c.luminance()         // 0.2126（WCAG 相对亮度）
c.contrast('#ffffff') // 3.99（WCAG 对比度，1-21）
c.equals('#ff0000')   // true
c.clone()             // 创建独立副本
```

### 方法别名一览

| 完整名称         | 别名                 | 说明               |
| ---------------- | -------------------- | ------------------ |
| `red()`          | `r()`                | 红色通道（获取/设置）|
| `green()`        | `g()`                | 绿色通道（获取/设置）|
| `blue()`         | `b()`                | 蓝色通道（获取/设置）|
| `alpha()`        | `a()`、`opacity()`   | 透明度（获取/设置）|
| `hue()`          | `h()`                | 色相（获取/设置）  |
| `saturation()`   | `s()`                | 饱和度（获取/设置）|
| `lightness()`    | `l()`                | 亮度（获取/设置）  |
| `value()`        | `v()`                | HSV 明度（获取/设置）|
| `grayscale()`    | `greyscale()`        | 完全去饱和        |
| `spin()`         | `rotate()`           | 旋转色相           |
| `negate()`       | `invert()`           | 反转颜色           |
| `fade()`         | `fadeOut()`           | 降低透明度        |
| `opaquer()`      | `fadeIn()`            | 增加透明度        |
| `toHex()`        | `toHexString()`      | Hex 输出           |
| `toRgb()`        | `toObject()`         | RGBA 对象输出      |

## 🔌 插件

通过插件扩展功能，灵感来自 dayjs 的架构设计。

### 使用插件

```typescript
import xcolor from '@xpyjs/color'
import harmony from '@xpyjs/color/plugins/harmony'
import a11y from '@xpyjs/color/plugins/a11y'

// 注册插件（可链式调用）
xcolor.use(harmony).use(a11y)

// 使用新方法
xcolor('#ff0000').complement()
xcolor('#000').isReadable('#fff')
```

### 可用插件

#### 🎵 Harmony — 色彩和谐组合

```typescript
import harmony from '@xpyjs/color/plugins/harmony'
xcolor.use(harmony)

xcolor('#ff0000').complement()      // 互补色（180°）
xcolor('#ff0000').triad()           // 三色组，间隔 120°
xcolor('#ff0000').tetrad()          // 四色组，间隔 90°
xcolor('#ff0000').splitComplement() // 分裂互补色
xcolor('#ff0000').analogous(6, 30)  // 类似色
xcolor('#ff0000').monochromatic(6)  // 单色系变化
```

#### ♿ A11y — 无障碍工具

```typescript
import a11y from '@xpyjs/color/plugins/a11y'
xcolor.use(a11y)

xcolor('#000').isReadable('#fff')                     // true
xcolor('#000').isReadable('#fff', { level: 'AAA' })   // true
xcolor('#fff').mostReadable(['#000', '#888', '#fff']) // 返回黑色
xcolor('#000').wcagLevel('#fff')
// { level: 'AAA', largeText: 'AAA', ratio: 21 }
```

#### 🎭 Blend — 颜色混合模式

```typescript
import blend from '@xpyjs/color/plugins/blend'
xcolor.use(blend)

xcolor('#ff0000').blend('#0000ff', 'multiply')
xcolor('#ff0000').blend('#0000ff', 'screen')
// 还支持： overlay, darken, lighten, dodge, burn, hardLight, softLight, difference, exclusion
```

#### 🌈 Gradient — 颜色渐变和色板

```typescript
import gradient from '@xpyjs/color/plugins/gradient'
xcolor.use(gradient)

xcolor('#ff0000').gradient('#0000ff', 5) // 5 步渐变数组
xcolor('#ff0000').tones(5)               // 暗色 + 原色 + 亮色
```

#### 🖨️ CMYK — CMYK 色彩空间

```typescript
import cmyk from '@xpyjs/color/plugins/cmyk'
xcolor.use(cmyk)

xcolor('#ff0000').toCmyk()       // { c: 0, m: 100, y: 100, k: 0 }
xcolor('#ff0000').toCmykString() // 'cmyk(0%, 100%, 100%, 0%)'
xcolor('#ff0000').toString('cmyk') // 'cmyk(0%, 100%, 100%, 0%)'
```

#### 🔬 Lab — CIE Lab 色彩空间和色差

```typescript
import lab from '@xpyjs/color/plugins/lab'
xcolor.use(lab)

xcolor('#ff0000').toLab()           // { l: 53.23, a: 80.11, b: 67.22 }
xcolor('#ff0000').toLabString()     // 'lab(53.23% 80.11 67.22)'
xcolor('#ff0000').deltaE('#fe0000') // 色差（(0-100+)
```

#### 🏷️ Name — 最接近颜色名称查找

```typescript
import name from '@xpyjs/color/plugins/name'
xcolor.use(name)

xcolor('#fe0000').closestName()  // 'red'
xcolor('#f1f2f3').closestName()  // 最接近的 CSS 颜色名
xcolor('red')                    // 创建 #ff0000 对应的颜色实例
xcolor('CornflowerBlue')         // 创建 #6495ed 对应的颜色实例
```

#### 📊 PercentageRgb — 百分比 RGB 输出

```typescript
import percentageRgb from '@xpyjs/color/plugins/percentageRgb'
xcolor.use(percentageRgb)

xcolor('#ff8000').toPercentageRgb() // { r: '100%', g: '50%', b: '0%', a: 1 }
xcolor('#ff8000').toString('percentageRgb') // 'rgba(100%, 50%, 0%, 1)'
```

> 📚 **提供 20+ 个插件。** 查看[完整插件文档](https://docs.xiaopangying.com/color/plugins/overview)了解所有可用插件，包括 HWB、OKLab、XYZ、Display P3、Rec2020、Scale、Simulate、Temperature、Theme、Palette 等。

### 创建新插件

使用脚手架脚本快速创建插件：

```bash
npm run create:plugin myPlugin
```

会自动创建：

- `src/plugins/myPlugin/index.ts` — 包含模板的插件源码
- `test/plugins/myPlugin.test.ts` — 包含模板的测试文件

插件会被构建系统自动检测并打包。

#### 手动创建插件

```typescript
import xcolor, { type XColorPlugin } from '@xpyjs/color'

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
      return `颜色: ${this.toHex()}`
    }
  }
}

xcolor.use(myPlugin)
```

插件通过 `name` 注册。如果同名插件再次注册，旧的注册将被覆盖并输出警告。

如果插件需要 `clamp`、`round` 或 parser 工具等能力，请直接从 `@xpyjs/color` 导入，不要依赖额外的 `utils` 参数。

## 🔧 工具函数导出

高级用法可以直接导入工具函数：

```typescript
import {
  clamp, round,
  rgbToHsl, hslToRgb,
  rgbToHsv, hsvToRgb,
  relativeLuminance, contrastRatio
} from '@xpyjs/color'
```

## 🌐 浏览器使用

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

## 📄 许可证

[MIT](./LICENSE) © [xpyjs](https://github.com/xpyjs)
