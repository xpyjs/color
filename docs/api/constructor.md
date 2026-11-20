# 构造与工厂

## xcolor(input?, options?)

创建一个 `XColor` 实例。

```ts
import xcolor from '@xpyjs/color'

const color = xcolor('#ff0000')
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `input` | `XColorInput` | — | 颜色输入，支持多种格式 |
| `options` | `XColorOptions` | — | 配置选项 |

### 输入格式

#### 字符串

```ts
xcolor('#f00')                // 3 位 hex
xcolor('#ff0000')             // 6 位 hex
xcolor('#ff000080')           // 8 位 hex（含 alpha）
xcolor('ff0000')              // 不带 # 也可以
xcolor('rgb(255, 0, 0)')      // rgb()
xcolor('rgba(255, 0, 0, 0.5)')// rgba()
xcolor('hsl(0, 100%, 50%)')   // hsl()
xcolor('hsla(0, 100%, 50%, 0.5)')
xcolor('color(srgb 1 0 0)')   // CSS color()
```

#### 对象

```ts
xcolor({ r: 255, g: 0, b: 0 })           // RGB
xcolor({ r: 255, g: 0, b: 0, a: 0.5 })   // RGBA
xcolor({ h: 0, s: 100, l: 50 })           // HSL
```

RGB 对象可以省略通道（缺省为 0），alpha 可以省略（默认 1）。HSL 对象必须提供完整的 `h`、`s`、`l`。安装 CMYK 插件后，CMYK 对象必须提供完整的 `c`、`m`、`y`、`k`。

#### 数字

```ts
xcolor(0xff0000)  // 24 位整数
xcolor(16711680)  // 同上
```

#### XColor 实例

```ts
const a = xcolor('#ff0000')
const b = xcolor(a)  // 克隆，b 与 a 独立
```

#### null / undefined / 无效值

```ts
xcolor()         // 黑色 #000000，isValid() = true（省略参数的默认色）
xcolor(null)     // 黑色 #000000，isValid() = true（空值使用默认色）
xcolor('nope')   // 黑色 #000000，isValid() = false（无效输入）
```

### 配置选项

```ts
interface XColorOptions {
  useDecimal?: boolean  // true 时保留 RGB 通道的小数精度（范围仍为 0–255）
  strict?: boolean
}
```

```ts
xcolor({ r: 255, g: 0, b: 0 }, { useDecimal: true })  // 等价于 xcolor('#ff0000')

const c = xcolor('#000000', { useDecimal: true })
c.rgb(127.5, 64.25, 0)
c.rgb()  // { r: 127.5, g: 64.25, b: 0, a: 1 }
```

## XColor 类

`XColor` 类用于类型标注和插件扩展（插件 `install` 会收到类本身），不作为用户的常规构造入口。请始终使用 `xcolor()` 工厂函数创建实例；`xcolor(existing)` 会返回独立克隆。

## clone()

创建当前实例的独立副本。后续对副本的操作不影响原实例。

```ts
const a = xcolor('#ff0000')
const b = a.clone()
b.lighten(20)

a.toHex() // '#ff0000' — 不受影响
b.toHex() // '#ff3333'
```

**返回值**：新的 `XColor` 实例

## 严格模式 {#严格模式与错误}

传入 `{ strict: true }` 后，无效输入会抛出 `XColorError`。可用 `xcolor.config({ strict: true })` 设置新实例的默认值，单个实例可传 `{ strict: false }` 覆盖。克隆会保留原实例的设置。

| 操作 | 默认模式 | 严格模式 |
| --- | --- | --- |
| 用无法解析的字符串创建颜色 | 返回实例，`isValid() === false` | 抛出 `INVALID_INPUT` |
| 无参调用 `xcolor()` | 创建有效的黑色 | 创建有效的黑色 |
| 对有效的红色调用 `hex("invalid")` | 抛错并将实例标记为无效 | 抛错，保留原来的有效红色 |

```ts
import xcolor, { XColorError } from '@xpyjs/color'

try {
  xcolor('invalid', { strict: true })
} catch (error) {
  if (error instanceof XColorError) console.log(error.code) // INVALID_INPUT
}
```

可按 `error.code` 处理错误。错误码包括 `INVALID_INPUT`、`INVALID_COLOR` 和 `INVALID_ARGUMENT`，部分错误还提供 `operation`。

核心数值设置和调整方法遇到 `NaN` 或 `Infinity` 会在修改前抛错。有限值仍按各方法原有规则夹取，插件自行定义参数校验。校验 CSS 颜色字面量时，可使用 [`parseCssColor()`](/plugins/colorSpace)。
