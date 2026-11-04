# 创建颜色

`xcolor()` 工厂函数接受多种格式的颜色输入，返回一个可操作的颜色实例。

## Hex 字符串

最常用的输入方式。支持 3 位、4 位、6 位、8 位格式：

```ts
xcolor('#ff0000')     // 6 位 — 红色
xcolor('#f00')        // 3 位 — 红色（等价于 #ff0000）
xcolor('#ff000080')   // 8 位 — 半透明红色（alpha = 0x80/0xFF ≈ 0.5）
xcolor('#f008')       // 4 位 — 半透明红色
```

`#` 前缀可选，以下写法也合法：

```ts
xcolor('ff0000')
xcolor('f00')
```

## RGB / RGBA 字符串

CSS 标准 `rgb()` 和 `rgba()` 函数格式：

```ts
xcolor('rgb(255, 0, 0)')           // 红色
xcolor('rgba(255, 0, 0, 0.5)')     // 半透明红色
xcolor('rgb(100%, 0%, 0%)')        // 百分比写法
```

## HSL / HSLA 字符串

```ts
xcolor('hsl(0, 100%, 50%)')            // 红色
xcolor('hsla(120, 100%, 50%, 0.8)')    // 半透明绿色
```

参数含义：色相 (0–360°)、饱和度 (0–100%)、亮度 (0–100%)。

## HSV 字符串

```ts
xcolor('hsv(0, 100%, 100%)')           // 红色
xcolor('hsva(240, 100%, 100%, 0.5)')   // 半透明蓝色
```

参数含义：色相 (0–360°)、饱和度 (0–100%)、明度 (0–100%)。

## sRGB 字符串

CSS Color Level 4 的 `color(srgb ...)` 函数：

```ts
xcolor('color(srgb 1 0 0)')           // 红色
xcolor('srgb(1 0 0)')                 // 简写形式
```

通道值范围 0–1。

## 对象输入

传入包含颜色通道的普通对象。解析器会根据属性名自动推断色彩空间：

```ts
// RGB 对象
xcolor({ r: 255, g: 0, b: 0 })         // 红色
xcolor({ r: 255, g: 0, b: 0, a: 0.5 }) // 半透明红色

// HSL 对象
xcolor({ h: 120, s: 100, l: 50 })      // 绿色

// HSV 对象
xcolor({ h: 240, s: 100, v: 100 })     // 蓝色
```

RGB 对象可以省略通道（缺省为 0），alpha 始终可省略（默认 1）。HSL 对象必须提供完整的 `h`、`s`、`l`；HSV 对象必须提供完整的 `h`、`s`、`v`。

## 数字输入

24 位整数（`0x000000` – `0xFFFFFF`）：

```ts
xcolor(0xFF0000)   // 红色 — 等价于 #ff0000
xcolor(0x00FF00)   // 绿色
xcolor(255)        // #0000ff — 蓝色（0x0000FF）
```

不包含 alpha 通道，alpha 始终为 1。

## XColor 实例

传入一个已有的 xcolor 实例会创建它的克隆：

```ts
const a = xcolor('#ff0000')
const b = xcolor(a) // 独立副本

b.lighten(30)
a.toHex()  // '#ff0000' — a 不受影响
```

## 空值 / 无效输入

```ts
xcolor()          // 黑色 #000000，isValid() → true
xcolor(null)      // 黑色 #000000，isValid() → true
xcolor(undefined) // 黑色 #000000，isValid() → true
xcolor('#ggg')    // 黑色 #000000，isValid() → false
```

无效输入不会抛出异常，而是创建一个黑色实例并将 `isValid()` 标记为 `false`，可以据此做容错处理。

## 选项参数

工厂函数接受第二个可选参数 `XColorOptions`：

```ts
xcolor('#ff0000', { useDecimal: true })
```

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `useDecimal` | `boolean` | `false` | 启用后 RGB 通道保留小数精度（如 `127.5`） |

默认情况下 RGB 通道会四舍五入为整数。启用 `useDecimal` 适用于高精度色彩计算和 CSS Color Level 4 的 `color()` 函数场景。

全局默认选项可以通过 `xcolor.config()` 设置：

```ts
xcolor.config({ useDecimal: true })

// 此后所有新创建的实例都启用小数精度
// 单个实例可以传入参数覆盖全局设置
```

## 插件扩展输入

安装插件后，可以支持更多输入格式。例如安装 `cmyk` 插件后可以传入 CMYK 对象，安装 `name` 插件后可以传入 CSS 颜色名称：

```ts
import name from '@xpyjs/color/plugins/name'
import cmyk from '@xpyjs/color/plugins/cmyk'

xcolor.use(name)
xcolor.use(cmyk)

xcolor('red')                        // CSS 颜色名称
xcolor({ c: 0, m: 100, y: 100, k: 0 }) // CMYK 对象
```

详见 [插件系统](/guide/plugins)。

## 输入与输出能力表

表中列的是独立色值。插件格式需要先注册对应插件。对象列的「—」表示该模型没有对象输入。

| 模型 | 插件 | 字符串输入与单位 | 对象输入 | Alpha | 格式键与 CSS 输出 |
| --- | --- | --- | --- | --- | --- |
| Hex | 核心 | 3、4、6、8 位十六进制，可省略 `#` | — | 4、8 位格式支持 | `hex`、`hex3`、`hex8` 输出 CSS Hex |
| RGB | 核心 | `rgb()`、`rgba()`，通道用数字或百分比 | `{ r, g, b, a? }`，缺少的 RGB 通道为 0 | 字符串支持数字或百分比 | `rgb` 输出 CSS RGB |
| HSL | 核心 | `hsl()`、`hsla()`，色相支持度数及 `deg`、`grad`、`rad`、`turn`，S/L 为 0–100 | `{ h, s, l, a? }` | 字符串支持数字或百分比 | `hsl` 输出 CSS HSL |
| HSV | 核心 | `hsv()`、`hsva()`，角度同 HSL，S/V 为 0–100 | `{ h, s, v, a? }` | 字符串支持数字或百分比 | `hsv` 是库内写法 |
| sRGB | 核心 | `color(srgb …)` 或 `srgb()`，0–1 或百分比 | — | 支持斜线 alpha | 使用 `rgb` 或 Hex 输出 |
| 命名色 | `name` | CSS 命名色与 `transparent` | — | `transparent` 的 alpha 为 0 | `name` 可输出名称，无法匹配时回退到 Hex |
| HWB | `hwb` | `hwb()`，角度同 HSL，W/B 为 0–100 | — | 支持斜线 alpha | `hwb` 输出 CSS HWB |
| CMYK | `cmyk` | `cmyk()`，0–100 或百分比 | `{ c, m, y, k, a? }` | 支持可选 alpha | `cmyk` 是库内写法 |
| Lab / LCH | `lab` | `lab()`、`lch()`，支持数字和各通道定义的百分比，LCH 色相支持角度单位 | — | 支持斜线 alpha | `lab`、`lch` 在 `whitePoint: 'D50'` 下使用 CSS 坐标 |
| OKLab / OKLCh | `oklab` | `oklab()`、`oklch()`，支持数字和各通道定义的百分比，OKLCh 色相支持角度单位 | — | 支持斜线 alpha | `oklab`、`oklch` 输出 CSS 函数 |
| 广色域 RGB 与 XYZ | `displayP3`、`a98Rgb`、`proPhotoRgb`、`rec2020`、`xyz` | `color()`，坐标为数字或百分比 | — | 支持斜线 alpha | 格式键同插件名，先经 sRGB 转换再输出 CSS `color()` |
| 百分比 RGB | `percentageRgb` | 由核心 RGB 解析 | — | 使用 RGB 的 alpha 规则 | `percentageRgb` 输出百分比通道的 CSS RGB |

对象 alpha 为 0–1。数字输入是 24 位 RGB 整数，alpha 默认为 1。调用方应先解析依赖上下文的 `currentColor` 和 `var(--brand)`，再传入确定的色值。xcolor 支持一部分 CSS 颜色语法，`calc()` 和以 `none` 表示的缺失通道需要另行处理。

输入框可以用 `xcolor.isValidInput(value)` 静默校验。它使用已安装的解析器，空值返回 `false`，已有实例按 `isValid()` 判断。无参调用工厂依然会创建默认黑色。
