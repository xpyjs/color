# 自定义插件开发

本页面面向希望扩展 xcolor 能力的开发者。你将了解插件结构、可用的工具函数，以及如何为 TypeScript 用户提供完整的类型提示。

## 插件结构

一个 xcolor 插件是一个实现了 `XColorPlugin` 接口的对象：

```ts
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin = {
  name: 'my-plugin',          // 唯一标识，用于去重
  install(option, cls, factory) {
    // cls       — XColor 类本身
    // factory   — xcolor 工厂函数（可用于在插件内部创建实例）
    // option    — 用户通过 xcolor.use(plugin, option) 传入的配置
  }
}

export default myPlugin
```

`install()` 在 `xcolor.use()` 时被调用，且同名插件只会安装一次。

## 添加实例方法

使用 `defineMethod` 向 `XColor.prototype` 添加方法：

```ts
import { defineMethod } from '@xpyjs/color'
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls) {
    defineMethod(cls, 'brightness255', function () {
      // this 是 XColor 实例
      return Math.round(
        this.red() * 0.299 + this.green() * 0.587 + this.blue() * 0.114
      )
    })
  }
}
```

::: warning
方法实现必须使用 `function` 关键字，不能使用箭头函数——否则 `this` 指向错误。
:::

### 为什么使用 defineMethod

`defineMethod` 内部使用 `Object.defineProperty`，将方法设为 `enumerable: false`。相比直接赋值 `cls.prototype.xxx = fn`，这样做更符合原生方法的行为，不会出现在 `for...in` 循环中。

## 注册字符串格式

如果你的插件输出新的字符串格式，用 `registerStringFormatter` 注册后，用户就可以通过 `toString('myFormat')` 或 `format('myFormat')` 使用：

```ts
import { defineMethod, registerStringFormatter } from '@xpyjs/color'
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls) {
    defineMethod(cls, 'toMyString', function () {
      return `my(${this.red()}, ${this.green()}, ${this.blue()})`
    })

    // 注册格式 key
    registerStringFormatter(cls, 'my', color => color.toMyString())
  }
}
```

注册后：

```ts
xcolor('#ff0000').toString('my')  // 'my(255, 0, 0)'
xcolor('#ff0000').format('my')    // 'my(255, 0, 0)'
```

## 注册颜色解析器

如果你的插件引入新的颜色格式，用 `registerColorParser` 将解析器注册到解析管道中。解析器是一个函数，接收输入值，返回 `{ r, g, b, a }` 或 `null`（表示无法解析，交给下一个解析器）：

```ts
import { registerColorParser } from '@xpyjs/color'
import type { XColorPlugin } from '@xpyjs/color'

const brandPlugin: XColorPlugin = {
  name: 'brand-colors',
  install() {
    registerColorParser((value) => {
      if (value === 'brand-primary') {
        return { r: 99, g: 102, b: 241, a: 1 }
      }
      return null // 无法解析，交给下一个
    })
  }
}
```

注册后：

```ts
xcolor('brand-primary').toHex()  // '#6366f1'
```

### 解析器优先级

默认情况下自定义解析器在内置解析器**之后**运行。如果需要覆盖内置格式，可以设置 `priority: 'before'`：

```ts
registerColorParser(
  (value) => { /* ... */ },
  { priority: 'before' }
)
```

`registerColorParser` 返回一个卸载函数，调用后解析器会被移除：

```ts
const unregister = registerColorParser(myParser)
// 稍后...
unregister()
```

## 使用工厂函数

`install` 的第三个参数 `factory` 是 `xcolor` 工厂函数。当你的插件需要内部创建颜色实例时使用它：

```ts
const plugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls, factory) {
    defineMethod(cls, 'midpoint', function (other: string) {
      // 用 factory 创建另一个颜色
      const target = factory(other)
      return factory({
        r: Math.round((this.red() + target.red()) / 2),
        g: Math.round((this.green() + target.green()) / 2),
        b: Math.round((this.blue() + target.blue()) / 2)
      })
    })
  }
}
```

## TypeScript 类型增强

通过 `declare module` 让 TypeScript 知道你新增的方法和格式：

```ts
import type { XColorPlugin } from '@xpyjs/color'
import { defineMethod, registerStringFormatter } from '@xpyjs/color'

// 类型声明
declare module '@xpyjs/color' {
  interface XColor {
    brightness255(): number
    toMyString(): string
  }

  interface XColorStringFormatMap {
    my: true
  }
}

// 插件实现
const myPlugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls) {
    defineMethod(cls, 'brightness255', function () {
      return Math.round(
        this.red() * 0.299 + this.green() * 0.587 + this.blue() * 0.114
      )
    })

    defineMethod(cls, 'toMyString', function () {
      return `my(${this.red()}, ${this.green()}, ${this.blue()})`
    })

    registerStringFormatter(cls, 'my', color => color.toMyString())
  }
}

export default myPlugin
```

::: tip
`declare module` 写在插件源文件中即可。当用户导入并使用插件后，TypeScript 会自动合并类型声明。
:::

## 可用的工具函数

以下函数从 `@xpyjs/color` 导出，为插件开发提供便利：

### 核心工具

| 函数 | 说明 |
| --- | --- |
| `defineMethod(cls, name, fn)` | 向类原型添加方法（`enumerable: false`）|
| `registerStringFormatter(cls, format, fn)` | 注册 `toString(format)` 格式 |
| `registerColorParser(fn, options?)` | 注册颜色解析器，返回卸载函数 |

### 数学工具

| 函数 | 说明 |
| --- | --- |
| `clamp(value, min, max)` | 限制值在范围内 |
| `round(value, decimals?)` | 四舍五入到指定小数位，默认 0 |
| `clampByte(value)` | 限制到 0–255 并取整 |
| `normalizeSteps(steps, fallback?)` | 规范化步数参数（≥ 2），默认 5 |

### 色彩空间转换

| 函数 | 说明 |
| --- | --- |
| `rgbToHsl(r, g, b)` | RGB → HSL |
| `hslToRgb(h, s, l)` | HSL → RGB |
| `rgbToHsv(r, g, b)` | RGB → HSV |
| `hsvToRgb(h, s, v)` | HSV → RGB |
| `rgbaToHex(r, g, b, a, allow3Char?, forceAlpha?)` | RGBA → hex 字符串 |

### 解析工具

| 函数 | 说明 |
| --- | --- |
| `parseRgbChannel(val)` | 解析 RGB 通道值（支持百分比）|
| `parseAlphaChannel(val)` | 解析透明度值（支持百分比）|
| `parseFunctionalChannels(input, name)` | 解析 CSS 函数语法的通道值 |
| `parseColor(input)` | 完整的颜色解析管道 |

### 日志

| 对象/方法 | 说明 |
| --- | --- |
| `Logger.warn(...args)` | 带 `[X-Color]` 前缀的 console.warn |
| `Logger.error(...args)` | 带 `[X-Color]` 前缀的 console.error |
| `Logger.createError(msg)` | 创建带前缀的 Error 实例 |

## 完整示例

以下是一个功能完整的插件，添加亮度百分比输出和解析：

```ts
import type { XColorPlugin } from '@xpyjs/color'
import {
  defineMethod,
  registerStringFormatter,
  registerColorParser,
  round
} from '@xpyjs/color'

declare module '@xpyjs/color' {
  interface XColor {
    /** 返回感知亮度百分比（0–100） */
    perceivedBrightness(): number
    /** 返回亮度字符串，如 "brightness(72%)" */
    toBrightnessString(): string
  }
  interface XColorStringFormatMap {
    brightness: true
  }
}

const brightnessPlugin: XColorPlugin = {
  name: 'brightness',
  install(_option, cls, factory) {
    defineMethod(cls, 'perceivedBrightness', function () {
      const r = this.red(), g = this.green(), b = this.blue()
      return round(Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b) / 2.55, 1)
    })

    defineMethod(cls, 'toBrightnessString', function () {
      return `brightness(${this.perceivedBrightness()}%)`
    })

    registerStringFormatter(cls, 'brightness', c => c.toBrightnessString())

    // 解析 "brightness(72%)" 格式 → 对应灰度色
    registerColorParser((value) => {
      if (typeof value !== 'string') return null
      const m = value.match(/^brightness\((\d+(?:\.\d+)?)%\)$/i)
      if (!m) return null
      const gray = round(parseFloat(m[1]) * 2.55)
      return { r: gray, g: gray, b: gray, a: 1 }
    })
  }
}

export default brightnessPlugin
```
