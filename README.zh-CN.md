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

仓库使用 Node 20 或 22 构建。浏览器、CDN 和 TypeScript 入口见[安装指南](https://xpyjs.github.io/color/guide/installation.html)。

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

## 文档

- [安装和平台入口](https://xpyjs.github.io/color/guide/installation.html)
- [颜色格式与输入校验](https://xpyjs.github.io/color/guide/create-color.html)
- [核心 API](https://xpyjs.github.io/color/api/constructor.html)
- [按任务选择插件](https://xpyjs.github.io/color/plugins/overview.html)
- [TypeScript 与自定义插件](https://xpyjs.github.io/color/guide/typescript.html)

## 📄 许可证

[MIT](./LICENSE) © [xpyjs](https://github.com/xpyjs)

## 兼容性变更

畸形颜色通道现在会导致解析失败。RGB 小数输入会保留到实例取整阶段。颜色函数字符串保留 alpha，WCAG 等级使用未舍入的比值。Node ESM 与 CommonJS 共享插件和配置状态。

可访问性检查会拒绝无效颜色。普通图层合成使用 `blend(color, "normal")`。Node TypeScript 用户混用 ESM 和 CommonJS 时共享同一个 `XColor` 类型。
