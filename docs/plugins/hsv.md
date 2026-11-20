# HSV 插件

HSV（也称 HSB）用色相、饱和度和明度描述颜色。注册插件后，xcolor 可以解析 HSV 输入、读写通道并输出 HSV 格式。

## 安装

```ts
import xcolor from '@xpyjs/color'
import hsvPlugin from '@xpyjs/color/plugins/hsv'

xcolor.use(hsvPlugin)
```

## 方法

### hsv(h?, s?, v?, a?)

无参时返回 `{ h, s, v, a }`。写入时传入完整的 H、S、V，返回当前实例。省略 `a` 时保留透明度。通过 `hsv().s` 读取 HSV 饱和度，`saturation()` 读写 HSL 饱和度。

```ts
xcolor('#ff0000').hsv() // { h: 0, s: 100, v: 100, a: 1 }
xcolor('#ff0000').hsv(120, 100, 100).toHex() // '#00ff00'
```

### value(value?)

无参读取明度，传值修改明度并返回当前实例，保留透明度。明度范围为 0–100，经过 RGB 转换时可能有取整差异。

```ts
xcolor('#008000').value(100).toHex() // '#00ff00'
```

### v(value?)

`value()` 的别名。

```ts
xcolor('#00ff00').v() // 100
```

### toHsv()

返回 `{ h, s, v, a }`，保留实例透明度精度。

```ts
xcolor('#00ff00').toHsv() // { h: 120, s: 100, v: 100, a: 1 }
```

### toHsvArray()

返回 `[h, s, v, a]`，精度与 `toHsv()` 一致。

```ts
xcolor('hsva(120, 100%, 100%, 0.25)').toHsvArray() // [120, 100, 100, 0.25]
```

### toHsvString()

输出 `hsv()` 或带透明度的 `hsva()`，H、S、V 取整。网页样式可使用 `toRgbString()`。

```ts
xcolor('#00ff00').toHsvString() // 'hsv(120, 100%, 100%)'
```

## 输入解析

对象必须提供 `h`、`s`、`v`。色相按 360° 循环，饱和度和明度范围为 0–100。透明度范围为 0–1，省略时默认为 1。

```ts
xcolor('hsv(120, 100%, 100%)').toHex() // '#00ff00'
xcolor('hsva(120 100% 100% / 25%)').alpha() // 0.25
xcolor({ h: 120, s: 100, v: 100, a: 0.25 }).alpha() // 0.25
```

## 格式化

### toString('hsv')

通过通用格式化接口输出 HSV 字符串，结果与 `toHsvString()` 一致。

```ts
xcolor('hsva(120, 100%, 100%, 0.25)').toString('hsv') // 'hsva(120, 100%, 100%, 0.25)'
```

## 类型和独立转换函数

`HSVA` 类型和转换函数都从插件入口导入。转换函数可以独立调用，会返回三个颜色通道。

### rgbToHsv(r, g, b, useDecimal?)

`r`、`g`、`b` 的范围为 0–255，返回 `{ h, s, v }`。

```ts
import { rgbToHsv } from '@xpyjs/color/plugins/hsv'
import type { HSVA } from '@xpyjs/color/plugins/hsv'

const green: HSVA = { ...rgbToHsv(0, 255, 0), a: 1 }
```

### hsvToRgb(h, s, v, useDecimal?)

色相以度为单位，饱和度和明度的范围为 0–100，返回 `{ r, g, b }`。

```ts
import { hsvToRgb } from '@xpyjs/color/plugins/hsv'

hsvToRgb(120, 100, 100) // { r: 0, g: 255, b: 0 }
```
