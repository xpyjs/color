# displayP3

Display P3 wide gamut color space support. P3 is a color gamut widely supported by Apple devices and modern displays, approximately 25% larger than sRGB.

Inputs are converted to sRGB and clipped to its gamut. Values outside sRGB lose information during a round trip.

## Install

```ts
import xcolor from '@xpyjs/color'
import displayP3Plugin from '@xpyjs/color/plugins/displayP3'

xcolor.use(displayP3Plugin)
```

## Methods

### toDisplayP3()

Returns a Display P3 object. Each channel value ranges from 0–1.

```ts
xcolor('#ff0000').toDisplayP3()
// { r: 0.9175, g: 0.2003, b: 0.1386 }
```

### toDisplayP3String()

Returns a `color(display-p3 ...)` format string.

```ts
xcolor('#ff0000').toDisplayP3String()
// 'color(display-p3 0.9175 0.2003 0.1386)'
```

## Input Parsing

```ts
xcolor('color(display-p3 0.92 0.20 0.14)').toHex()
```

## Formatting

```ts
xcolor('#ff0000').toString('displayP3')  // 'color(display-p3 0.9175 0.2003 0.1386)'
```

## Preserve the original coordinates

Use the plugin's named exports for a wide-gamut value that stays in its original space. `parseWideColor(input)` returns `{ space, coordinates, alpha }` or `null`. `formatWideColor(record)` serializes those coordinates, and `toSrgb(record)` explicitly converts and clips them. Calling these functions needs no plugin registration.

```ts
import { parseWideColor, formatWideColor, toSrgb } from '@xpyjs/color/plugins/displayP3'

const color = parseWideColor('color(display-p3 1 .4 0 / .3)')
if (color) {
  console.log(formatWideColor(color)) // color(display-p3 1 0.4 0 / 0.3)
  console.log(toSrgb(color))
}
```
