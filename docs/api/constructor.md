# 构造与工厂

## 严格模式与错误

`xcolor(input, { strict: true })` 在输入无法解析、复制无效实例或显式传 null 时抛出 `XColorError`。无参数仍创建黑色。也可通过 `xcolor.config({ strict: true })` 设置默认，实例可显式传 false。严格模式检查核心数值 setter 和调整参数：NaN/Infinity 在修改前抛错；有限越界值仍按原规则夹取。克隆保留 strict 选项，hex 替换失败保留原值与有效状态。

```ts
import xcolor, { XColorError } from '@xpyjs/color'
try { xcolor('invalid', { strict: true }) } catch (error) {
  if (error instanceof XColorError) console.log(error.code, error.operation)
}
```

结构化字段：name='XColorError'，code 为 INVALID_INPUT、INVALID_COLOR 或 INVALID_ARGUMENT；调用点提供上下文时带 operation。旧 Logger.createError 也返回该错误，保留原消息前缀，不应依赖消息文本分类。严格模式检查有效颜色输入，不等同于严格 CSS 语法；CSS 字面量语法请使用 colorSpace.parseCssColor。

默认构造仍返回可用 isValid() 检查的无效实例；克隆和单色调整保持无效标记，成功 hex 替换可修复。mix、contrast、brightness/luminance 及通过 defineMethod 注册的插件计算拒绝无效源；涉及另一颜色的 scale/deltaE 也拒绝无效目标。isReadable 和 equals 对无效颜色仍返回 false。默认 hex 失败仍会标记无效并抛错；只有 strict 模式保留有效状态。插件参数规则由各插件定义，strict 不保证第三方插件自动验证所有参数。

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
xcolor('hsv(0, 100%, 100%)')  // hsv()
xcolor('color(srgb 1 0 0)')   // CSS color()
```

#### 对象

```ts
xcolor({ r: 255, g: 0, b: 0 })           // RGB
xcolor({ r: 255, g: 0, b: 0, a: 0.5 })   // RGBA
xcolor({ h: 0, s: 100, l: 50 })           // HSL
xcolor({ h: 0, s: 100, v: 100 })          // HSV
```

缺少的通道会使用默认值（RGB 默认 0，alpha 默认 1）。

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
}
```

```ts
xcolor({ r: 255, g: 0, b: 0 }, { useDecimal: true })  // 等价于 xcolor('#ff0000')

const c = xcolor('#000000', { useDecimal: true })
c.rgb(127.5, 64.25, 0)
c.rgb()  // { r: 127.5, g: 64.25, b: 0, a: 1 }
```

## new XColor(input?, options?)

同 `xcolor()` 工厂函数，但使用 `new` 关键字。两者行为完全一致：

```ts
import { XColor } from '@xpyjs/color'

const color = new XColor('#ff0000')
```

一般推荐使用 `xcolor()` 工厂函数——更简洁，且静态方法挂载在工厂函数上。

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
