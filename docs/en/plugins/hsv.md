# HSV plugin

HSV (also called HSB) describes colors by hue, saturation, and value. Register the plugin to parse HSV inputs, read and write channels, and serialize HSV colors.

## Install

```ts
import xcolor from '@xpyjs/color'
import hsvPlugin from '@xpyjs/color/plugins/hsv'

xcolor.use(hsvPlugin)
```

## Methods

### hsv(h?, s?, v?, a?)

Without arguments, returns `{ h, s, v, a }`. Pass all three HSV channels to update the instance and return it. Omitting `a` preserves alpha. Use `hsv().s` for HSV saturation. The `saturation()` method uses HSL.

```ts
xcolor('#ff0000').hsv() // { h: 0, s: 100, v: 100, a: 1 }
xcolor('#ff0000').hsv(120, 100, 100).toHex() // '#00ff00'
```

### value(value?)

Reads value without arguments. Passing a value updates and returns the instance while preserving alpha. Value ranges from 0 to 100. RGB conversion can introduce rounding differences.

```ts
xcolor('#008000').value(100).toHex() // '#00ff00'
```

### v(value?)

Alias for `value()`.

```ts
xcolor('#00ff00').v() // 100
```

### toHsv()

Returns `{ h, s, v, a }` with the stored alpha precision.

```ts
xcolor('#00ff00').toHsv() // { h: 120, s: 100, v: 100, a: 1 }
```

### toHsvArray()

Returns `[h, s, v, a]` with the same precision as `toHsv()`.

```ts
xcolor('hsva(120, 100%, 100%, 0.25)').toHsvArray() // [120, 100, 100, 0.25]
```

### toHsvString()

Returns `hsv()` or `hsva()`, with H, S, and V rounded to integers. Use `toRgbString()` for CSS colors.

```ts
xcolor('#00ff00').toHsvString() // 'hsv(120, 100%, 100%)'
```

## Input Parsing

Objects require `h`, `s`, and `v`. Hue wraps every 360°, and saturation and value range from 0 to 100. Alpha ranges from 0 to 1 and defaults to 1.

```ts
xcolor('hsv(120, 100%, 100%)').toHex() // '#00ff00'
xcolor('hsva(120 100% 100% / 25%)').alpha() // 0.25
xcolor({ h: 120, s: 100, v: 100, a: 0.25 }).alpha() // 0.25
```

## Formatting

### toString('hsv')

Formats the color through the generic formatter, with the same result as `toHsvString()`.

```ts
xcolor('hsva(120, 100%, 100%, 0.25)').toString('hsv') // 'hsva(120, 100%, 100%, 0.25)'
```

## Types and standalone conversions

Import the `HSVA` type and conversion functions from the plugin entry. The functions can be called independently and return three color channels.

### rgbToHsv(r, g, b, useDecimal?)

Accepts RGB channels from 0 to 255 and returns `{ h, s, v }`.

```ts
import { rgbToHsv } from '@xpyjs/color/plugins/hsv'
import type { HSVA } from '@xpyjs/color/plugins/hsv'

const green: HSVA = { ...rgbToHsv(0, 255, 0), a: 1 }
```

### hsvToRgb(h, s, v, useDecimal?)

Accepts hue in degrees and saturation and value from 0 to 100. Returns `{ r, g, b }`.

```ts
import { hsvToRgb } from '@xpyjs/color/plugins/hsv'

hsvToRgb(120, 100, 100) // { r: 0, g: 255, b: 0 }
```
