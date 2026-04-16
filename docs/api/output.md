# 颜色输出

将 `XColor` 实例转换为各种格式。所有输出方法均为纯读取操作，不修改实例。

## Hex

### toHex(allow3Char?, forceAlpha?) {#toHex}

返回 hex 字符串。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `allow3Char` | `boolean` | `false` | 允许缩写为 3 位（`#f00`）|
| `forceAlpha` | `boolean` | `false` | 强制输出 8 位（含 alpha）|

```ts
xcolor('#ff0000').toHex()              // '#ff0000'
xcolor('#ff0000').toHex(true)          // '#f00'
xcolor('#ff0000').toHex(false, true)   // '#ff0000ff'
xcolor('rgba(255,0,0,0.5)').toHex()   // '#ff000080'（alpha < 1 自动 8 位）
```

别名：`toHexString()`, `hex()`

## RGB

### toRgb() {#toRgb}

返回 `{ r, g, b, a }` 对象。

```ts
xcolor('#ff0000').toRgb()  // { r: 255, g: 0, b: 0, a: 1 }
```

别名：`toObject()`

### toRgbString() {#toRgbString}

返回 `rgb()` 或 `rgba()` 字符串。alpha < 1 时自动使用 `rgba()`。

```ts
xcolor('#ff0000').toRgbString()             // 'rgb(255, 0, 0)'
xcolor('rgba(255,0,0,0.5)').toRgbString()   // 'rgba(255, 0, 0, 0.5)'
```

### toRgbArray() {#toRgbArray}

返回 `[r, g, b, a]` 数组。

```ts
xcolor('#ff0000').toRgbArray()  // [255, 0, 0, 1]
```

## HSL

### toHsl() {#toHsl}

返回 `{ h, s, l, a }` 对象。

```ts
xcolor('#ff0000').toHsl()  // { h: 0, s: 100, l: 50, a: 1 }
```

### toHslString() {#toHslString}

返回 `hsl()` 或 `hsla()` 字符串。

```ts
xcolor('#ff0000').toHslString()  // 'hsl(0, 100%, 50%)'
```

## HSV

### toHsv() {#toHsv}

返回 `{ h, s, v, a }` 对象。

```ts
xcolor('#ff0000').toHsv()  // { h: 0, s: 100, v: 100, a: 1 }
```

### toHsvString() {#toHsvString}

返回 `hsv()` 字符串。

```ts
xcolor('#ff0000').toHsvString()  // 'hsv(0, 100%, 100%)'
```

## 数字

### toNumber() {#toNumber}

返回 24 位整数。不含 alpha 信息。

```ts
xcolor('#ff0000').toNumber()  // 16711680 (0xff0000)
xcolor('#0000ff').toNumber()  // 255
```

## 通用格式化

### toString(format?) {#toString}

不传参，默认输出：

- 有 alpha（< 1）→ `rgba()` 字符串
- 无 alpha → `hex` 字符串

传入 format 参数输出指定格式：

```ts
xcolor('#ff0000').toString()        // '#ff0000'
xcolor('#ff0000').toString('rgb')   // 'rgb(255, 0, 0)'
xcolor('#ff0000').toString('hsl')   // 'hsl(0, 100%, 50%)'
xcolor('#ff0000').toString('hsv')   // 'hsv(0, 100%, 100%)'
```

别名：`format()`

### 内置 format key

| key | 输出 |
| --- | --- |
| `'hex'` | `#ff0000` |
| `'hex3'` | `#f00`（允许缩写）|
| `'hex8'` | `#ff0000ff`（强制 alpha）|
| `'rgb'` | `rgb(255, 0, 0)` |
| `'hsl'` | `hsl(0, 100%, 50%)` |
| `'hsv'` | `hsv(0, 100%, 100%)` |
| `'number'` | `16711680` |

插件可以扩展更多格式，如注册 `cmyk` 插件后可使用 `toString('cmyk')`。
