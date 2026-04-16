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

缺失的通道会使用默认值（RGB 默认 0，alpha 默认 1）。

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
xcolor('abc123')  // 黑色 #000000，isValid() → false
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
