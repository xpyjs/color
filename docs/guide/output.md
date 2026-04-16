# 颜色输出

xcolor 提供多种方法将颜色实例序列化为不同格式。

## Hex

```ts
const c = xcolor('#ff6600')

c.toHex()             // '#ff6600'
c.toHex(true)         // '#f60'        — 允许 3 位短格式
c.toHex(false, true)  // '#ff6600ff'   — 强制包含 alpha
```

带 alpha 通道时自动输出 8 位格式：

```ts
xcolor('rgba(255,0,0,0.5)').toHex()  // '#ff000080'
```

`hex()` 是 `toHex()` 的别名，无参时返回 hex 字符串，有参时作为 setter（详见 [Getter / Setter](/guide/getter-setter)）。

`toHexString()` 也是 `toHex()` 的别名。

## RGB

```ts
const c = xcolor('#ff6600')

c.toRgb()          // { r: 255, g: 102, b: 0, a: 1 }
c.toRgbString()    // 'rgb(255, 102, 0)'
c.toRgbArray()     // [255, 102, 0, 1]
```

alpha 不为 1 时，字符串格式自动切换为 `rgba()`：

```ts
xcolor('#ff6600').alpha(0.5).toRgbString() // 'rgba(255, 102, 0, 0.5)'
```

## HSL

```ts
const c = xcolor('#ff6600')

c.toHsl()          // { h: 24, s: 100, l: 50, a: 1 }
c.toHslString()    // 'hsl(24, 100%, 50%)'
```

## HSV

```ts
const c = xcolor('#ff6600')

c.toHsv()          // { h: 24, s: 100, v: 100, a: 1 }
c.toHsvString()    // 'hsv(24, 100%, 100%)'
```

## 数字

转换为 24 位整数（不含 alpha）：

```ts
xcolor('#ff0000').toNumber() // 16711680 (即 0xFF0000)
xcolor('#0000ff').toNumber() // 255      (即 0x0000FF)
```

## 对象

`toObject()` 是 `toRgb()` 的别名：

```ts
xcolor('#ff0000').toObject() // { r: 255, g: 0, b: 0, a: 1 }
```

## toString — 通用格式化

`toString()` 是最灵活的输出方法。不传参数时，opaque 颜色返回 hex，半透明颜色返回 rgba：

```ts
xcolor('#ff0000').toString()                  // '#ff0000'
xcolor('rgba(255,0,0,0.5)').toString()        // 'rgba(255, 0, 0, 0.5)'
```

传入格式键可以指定输出：

```ts
const c = xcolor('#ff0000')

c.toString('hex')   // '#ff0000'
c.toString('hex3')  // '#f00'
c.toString('hex8')  // '#ff0000ff'
c.toString('rgb')   // 'rgb(255, 0, 0)'
c.toString('hsl')   // 'hsl(0, 100%, 50%)'
c.toString('hsv')   // 'hsv(0, 100%, 100%)'
```

`format()` 是 `toString()` 的别名。

### 插件扩展格式

安装插件后，`toString()` 支持更多格式键：

```ts
import cmyk from '@xpyjs/color/plugins/cmyk'
xcolor.use(cmyk)

xcolor('#ff0000').toString('cmyk') // 'cmyk(0%, 100%, 100%, 0%)'
```

支持的插件格式键包括：`cmyk`、`lab`、`lch`、`oklab`、`oklch`、`hwb`、`a98Rgb`、`displayP3`、`proPhotoRgb`、`rec2020`、`xyz`、`percentageRgb`、`name` 等。

## 内置格式键一览

| 格式键 | 输出示例 | 说明 |
| --- | --- | --- |
| `hex` | `#ff0000` | 默认 6 位 hex |
| `hex3` | `#f00` | 3 位短格式（仅在颜色可压缩时） |
| `hex8` | `#ff0000ff` | 8 位含 alpha |
| `rgb` | `rgb(255, 0, 0)` | CSS rgb/rgba |
| `hsl` | `hsl(0, 100%, 50%)` | CSS hsl/hsla |
| `hsv` | `hsv(0, 100%, 100%)` | HSV 格式 |
