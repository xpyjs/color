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
xcolor()         // 黑色 #000000，isValid() = false
xcolor(null)     // 黑色 #000000，isValid() = false
xcolor('nope')   // 黑色 #000000，isValid() = false
```

### 配置选项

```ts
interface XColorOptions {
  useDecimal?: boolean  // true 时 RGB 通道使用 0–1 范围（默认 0–255）
}
```

```ts
xcolor({ r: 1, g: 0, b: 0 }, { useDecimal: true })
// 等价于 xcolor('#ff0000')
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
b.toHex() // '#ff6666'
```

**返回值**：新的 `XColor` 实例
