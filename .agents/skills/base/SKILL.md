---
name: base
description: 涉及到整个库的核心设计原则、命名规范、API 设计原则、文档规范、测试规范等内容，所有开发者都必须遵守这些规范进行开发和文档编写。
---

# @xpyjs/color — 开发规范与标准

本文档汇总了 `@xpyjs/color` 库的所有规范、所有 API 设计原则和文档标准，都需要遵循这些规范进行开发、文档编写和测试。

---

## 1. 命名规范

注意区分 `xcolor` 与 `XColor`：

- `xcolor`：工厂函数，UMD 全局变量、默认引入变量名等，所有面向用户的使用方式。默认情况下所有使用规则都是围绕 `xcolor` 进行的。
- `XColor`：内部类名，作为整个库的核心类型，其应当是一个底层核心类，用户一般情况下不需要直接使用。

### 库标识符

| 上下文 | 名称 | 示例 |
| --- | --- | --- |
| npm 包名 | `@xpyjs/color` | `npm install @xpyjs/color` |
| 用户面向的导入名 | `xcolor` | `import xcolor from '@xpyjs/color'` |
| UMD 全局变量 | `xcolor` | `window.xcolor` |
| 内部工厂函数（源码） | `xcolor` | `export const xcolor = (...)` |
| 内部类名（源码） | `XColor` | `export class XColor { ... }` |
| 文档/README 中引用 | `xcolor` | `xcolor('#ff0000')` |

> **重要**：所有面向用户的文档、README、示例代码中，一律使用 `xcolor` 作为导入名和调用名。内部源码类名为 `XColor`，工厂函数为 `xcolor`。

### 前缀规则

- 库所有公开标识符以 `x` 为前缀（x 代表 xpyjs 生态），比如此库应为 `xcolor`
- 类型：核心类 `XColor`、其附属的一些类型名均用此开头，比如 `XColorInput`、`XColorOptions` 等
- 插件应当以 `XColorPlugin` 开头，表示当前库的某个插件类型。
- 一些特殊的，具有普遍性，公共性的类型，可以不用 `X`、`XColor`、`XColorPlugin` 等前缀，比如 `RGB`、`CMYK`、`Lab` 等，这点需要区分。

---

## 2. API 设计原则

### 函数式优先（Function-first）

- **推荐**：`xcolor('#ff0000')` — 工厂函数，无需 `new`
- **不推荐**：`new XColor('#ff0000')` — 类构造函数。用户不应该直接使用 `XColor`，也不应该在文档中出现 `new` 关键字
- 所有文档、README 中**永远不出现** `new` 关键字
- 用户应通过 `import xcolor from '@xpyjs/color'` 获取工厂函数
- 工厂函数支持第二个参数 `XColorOptions`：`xcolor(input, { useDecimal: true })`

### Getter / Setter 合一

> **重要**：所有 Setter 方法都应该具有 Getter 对应的方法，这是本库的核心设计原则之一，确保 API 的一致性和易用性。

- 单个方法同时支持 Getter（无参）和 Setter（有参）：

  ```ts
  color.red()     // Getter → number
  color.red(128)  // Setter → this
  ```

- 复合方法（`rgb()`, `hsl()`, `hsv()`, `hex()`）等都同理
- 还有一些可扩展的方法，如 `alpha()`（别名 `opacity()`）也遵循此原则
- 插件方法也应尽量遵循此原则，如 `cmyk()`、`lab()` 等

### 链式调用

> **重要**：所有修改方法（Setter）必须返回 `this`，以支持链式调用。这是本库的核心设计原则之一，确保用户能够流畅地进行多步颜色操作。

- 所有修改方法（Setter）返回 `this`，支持链式调用
- 核心修改方法**原地修改**当前实例。配色、混合模式和模拟插件可以提供返回新实例的操作
- 如需保留原始值，用户应主动调用 `.clone()`

### 获取颜色数据

获取某些色值数据可以有很多种方式。本库需要遵循以下原则：

- 默认使用 to 前缀的方法，这是标准方法，如 `toHex()`、`toRgbString()`、`toHslArray()` 等
- 有一些直接取单色值的情况，比如 `red()`、`green()`、`blue()`、`alpha()` 等，直接使用属性名作为方法名，这些方法没有 to 方法，直接在原方法中区分 Getter/Setter 行为
- Setter 方法如果有对应带 to 前缀的 Getter 方法，则直接在原方法中返回该 to 前缀的方法，并需要在 jsDoc 中写明为 toXXX 的别名。比如 `hex()` 返回 `this.toHex()`，并在 jsDoc 中注明 `@alias toHex`，这样用户在调用 `color.hex()` 后可以直接得到 hex 字符串结果。

### 方法默认值

所有操作方法都必须有合理的默认值，确保无参调用也能工作。

- 色值 0-255 / 0-100（根据通道类型）
- 百分比数值均为 0-100
- 角度数值均为 0-360
- 特殊情况：透明度 0-1

### 方法别名

提供 简写/别名 以降低迁移成本和减少输入：

| 全称 | 别名 | 说明 |
| --- | --- | --- |
| `red()` | `r()` | 红色通道 |
| `green()` | `g()` | 绿色通道 |
| `blue()` | `b()` | 蓝色通道 |
| `alpha()` | `a()` | 透明度 |
| `alpha()` | `opacity()` | 透明度（另一别名） |
| `hue()` | `h()` | 色相 |
| `saturation()` | `s()` | 饱和度 |
| `lightness()` | `l()` | 亮度 |
| `value()` | `v()` | 明度（HSV） |
| `spin()` | `rotate()` | 旋转色相 |
| `negate()` | `invert()` | 反转颜色 |
| `grayscale()` | `greyscale()` | 灰度化 |
| `fade()` | `fadeOut()` | 减少不透明度 |
| `opaquer()` | `fadeIn()` | 增加不透明度 |

> 表中内容可能不全，需要注意与源码确认。

### 插件注册

- 推荐使用 `xcolor.use(plugin)` 注册插件（`use` 是 `extend` 的别名）
- `xcolor.use()` 等同于 `xcolor.extend()`
- 支持链式：`xcolor.use(a).use(b).use(c)`
- 在注册插件前，其内容是不能被使用的，确保插件的惰性计算和独立性

---

## 3. 竞品对齐

### 与 tinycolor2 保持一致

- 常用操作方法名与 tinycolor2 类似，lighten/darken/saturate/desaturate 默认值为 10
- 配色方案方法签名一致：`complement()`、`triad()`、`tetrad()`、`analogous(6, 30)`、`monochromatic(6)`、`splitComplement()`
- **区别**：`toHex()` 始终返回带 `#` 的字符串（tinycolor2 的 `toHex()` 不带 `#`）

### 与 chroma.js 的差异

- chroma.js 使用 Lab 空间操作，默认值为 1；我们使用 HSL 空间，默认值为 10
- chroma.js 核心 40KB min / 16KB gzip；我们核心 ~17KB min / ~5.5KB gzip
- Lab 功能通过可选的 lab 插件提供

### 与 color 的差异

- xcolor 的 `lighten(20)` 沿 HSL 亮度到白色的剩余距离移动 20%。`darken(20)` 沿当前亮度到黑色的距离移动 20%。
- color 是不可变的（Object.freeze）；我们是可变的（原地修改 + 链式调用）

---

## 4. 构建与输出

### 构建产物

| 文件 | 格式 | 用途 |
| --- | --- | --- |
| `dist/index.esm.js` | ES Module | 现代打包工具 (Vite, webpack, Rollup) |
| `dist/index.cjs` | CommonJS | Node.js `require()` |
| `dist/index.umd.js` | UMD | 浏览器 `<script>` 标签 |
| `dist/types/` | `.d.ts` / `.d.cts` | TypeScript 类型定义 |

### 支持的导入环境

- Node.js (ESM / CJS)
- 浏览器 ES Module (`<script type="module">`)
- 浏览器 UMD (`<script>` + 全局变量 `xcolor`)
- esm.sh (`https://esm.sh/@xpyjs/color`)
- unpkg / jsDelivr CDN
- Deno (`npm:@xpyjs/color` 或 esm.sh)
- Bun (原生支持)

> **重要**：挂载 window 中的全局变量为 `xcolor`，不使用大写 `XColor` 以保持一致性。

### 编译目标

- ES2015 (ES6)
- Node.js >= 14.0.0
- 所有现代浏览器

> **重要**：确保编译后的语法兼容上述环境，且不使用过新的特性。

---

## 5. 文档规范

### jsDoc 注释

所有公开方法必须有完整的 jsDoc 注释，包括：

- 方法描述
- 参数说明（类型、默认值、描述）
- 返回值说明（类型、描述）
- 任何别名或相关方法的说明
- 示例代码（如果适用），且示例代码必须可运行
- 如果有相关规范的，应当有一个链接到相关规范（如 WCAG 2.0）或算法描述（如相对亮度计算），尤其是面向使用者的注释文档

doc 文档中的内容必须与源码中的 jsDoc 注释保持一致。jsDoc 注释的内容应当是该方法的最简洁描述。文档的相关说明应当是基于 jsDoc 注释内容的扩展和示例。

### 代码示例

- 所有示例使用 `xcolor` 作为导入名，**注意为全小写的**
- **永不**在示例中出现 `new` 关键字
- 示例应展示链式调用和默认值使用
- 示例应简短，一行或三行以内
- 示例结果应当以注释形式展示描述或者直接输出的结果

```ts
// ✅ 正确
import xcolor from '@xpyjs/color'
xcolor('#ff0000').lighten(20).toHex() // => '#ff3333'

// ❌ 错误。推荐写法应当保持生态前缀，但不强制
import Color from '@xpyjs/color'
new Color('#ff0000').lighten(20).toHex()

// ❌ 错误。没有展示结果值的注释
import xcolor from '@xpyjs/color'
xcolor('#ff0000').lighten(20).toHex()
```

### 颜色可视化

- 在涉及颜色操作的文档页面中，使用 HTML/SVG 内联色块展示效果
- 色块使用 `border-radius: 8px`，尺寸 `48×48px`（普通）或 `56×56px`（高亮/原色）
- 原色色块加 `border: 2px solid #333` 以区分
- 配色方案使用色块行排列，不使用 ASCII 图表

### 竞品对比

- 体积数据使用 minified 和 gzip 两个维度
- 对比表中用 ✅/❌ 标记，不使用模糊描述

---

## 6. 测试规范

### 命名约定

- 测试文件中类引用使用 `XColor`
- 工厂函数引用使用 `xcolor`
- 静态方法通过 `xcolor.extend` / `xcolor.isColor` / `xcolor.random` 调用
- describe 块使用 `"xcolor"` 前缀描述功能分组

### 覆盖要求

- 核心方法 100% 覆盖
- 每个插件独立测试文件
- 所有默认值行为都需有测试用例
- 所有别名方法都需验证与原方法等价

---

## 7. 插件开发规范

### 插件函数签名

```ts
const myPlugin: XColorPluginFunc = (option, ColorClass, factory) => {
  // ColorClass = XColor 类（用于修改原型）
  // factory = xcolor 工厂函数
}
```

### 规则

1. 不覆盖核心方法
2. Setter 类方法返回 `this`
3. 惰性计算（注册时不执行重计算）
4. 提供完整的 TypeScript 声明合并
5. 独立性（不依赖其他插件，除非显式声明）
6. 插件不应在 `declare module` 中重复声明基类已有的方法签名（如 `toString`）
7. 插件扩展 `toString()` 时，使用“保存原始→分发→回退”模式，确保多插件可以共存

---

## 8. Git 提交规范

- feat: 新功能
- fix: Bug 修复
- docs: 文档更新
- refactor: 代码重构
- test: 测试相关
- chore: 构建/CI 变更
- perf: 性能优化

## 参考标准

- CSS 颜色规范：<https://www.w3.org/TR/css-color-4/>
- JavaScript 代码风格指南：<https://airbnb.io/javascript/>
- TypeScript 编码规范：<https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html>
- JSDoc 注释规范：<https://jsdoc.app/>
- 测试规范：<https://vitest.dev/guide/>
- 版本控制规范：<https://semver.org/>
- 发布流程规范：<https://docs.npmjs.com/cli/v7/commands/npm-publish>
- 竞品库参考：
  - Colord：<https://github.com/omgovich/colord>
  - TinyColor：<https://github.com/bgrins/TinyColor>
  - Color.js：<https://github.com/Qix-/color>
  - Chroma.js：<https://github.com/gka/chroma.js>
