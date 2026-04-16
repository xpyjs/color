# 快速开始

`@xpyjs/color`（简称 **xcolor**）是一个轻量、快速、零依赖的 JavaScript / TypeScript 颜色操作库。核心体积约 4 KB（gzip），支持链式调用、Getter/Setter 合一设计，以及灵活的插件系统。

## 环境要求

- **Node.js** ≥ 14.0（支持 ES2015）
- 所有现代浏览器（Chrome、Firefox、Safari、Edge 等）
- Deno、Bun 等运行时也可直接使用

xcolor 不依赖任何第三方包，可以在任何支持 ES2015 的 JavaScript 环境中运行。

## 安装

::: code-group

```sh [npm]
npm install @xpyjs/color
```

```sh [pnpm]
pnpm add @xpyjs/color
```

```sh [yarn]
yarn add @xpyjs/color
```

```sh [bun]
bun add @xpyjs/color
```

:::

更多安装方式（CDN、UMD、Deno 等）参见 [安装](/guide/installation)。

## 第一个示例

```ts
import xcolor from '@xpyjs/color'

// 创建一个颜色
const color = xcolor('#3498db')

// 获取不同格式
color.toHex()       // '#3498db'
color.toRgbString() // 'rgb(52, 152, 219)'
color.toHslString() // 'hsl(204, 70%, 53%)'

// 链式操作
color.lighten(20).saturate(10).toHex()
```

`xcolor()` 是工厂函数，直接传入颜色值即可创建实例，无需 `new`。所有操作方法返回当前实例，可以自然地链式调用。

## 三个核心设计

### 可变实例

所有操作方法**原地修改**当前实例。需要保留原始颜色时，先调用 `.clone()`：

```ts
const original = xcolor('#ff0000')
const copy = original.clone()

copy.lighten(30)
original.toHex() // '#ff0000' — 不变
copy.toHex()     // '#ff9999'
```

### Getter / Setter 合一

同一个方法，无参读取、有参写入：

```ts
const c = xcolor('#ff0000')
c.red()      // 255   — 读
c.red(128)   // this  — 写，返回实例可继续链式
```

### 插件按需加载

核心库保持精简，进阶功能通过插件扩展：

```ts
import xcolor from '@xpyjs/color'
import harmony from '@xpyjs/color/plugins/harmony'

xcolor.use(harmony)
xcolor('#ff6600').triad() // 三色配色方案
```

官方内置多种插件，涵盖色彩空间转换、配色方案、色觉模拟等功能。详见 [插件系统](/guide/plugins)。

## 下一步

- [安装](/guide/installation) — 完整的安装方式与兼容性说明
- [创建颜色](/guide/create-color) — 所有支持的输入格式
- [颜色操作](/guide/manipulation) — lighten、darken、mix 等可视化演示
- [插件系统](/guide/plugins) — 按需加载进阶功能
