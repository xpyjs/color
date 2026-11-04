# a98Rgb

Adobe RGB (1998) wide gamut color space support. Commonly used in print and photography workflows.

Inputs are converted to sRGB and clipped to its gamut. Values outside sRGB lose information during a round trip.

## Install

```ts
import xcolor from '@xpyjs/color'
import a98RgbPlugin from '@xpyjs/color/plugins/a98Rgb'

xcolor.use(a98RgbPlugin)
```

## Methods

### toA98Rgb()

Returns an A98 RGB object. Each channel value ranges from 0–1.

```ts
xcolor('#ff0000').toA98Rgb()
// { r: 0.8586, g: 0, b: 0 }
```

### toA98RgbString()

Returns a `color(a98-rgb ...)` format string.

```ts
xcolor('#ff0000').toA98RgbString()
// 'color(a98-rgb 0.8586 0 0)'
```

## Input Parsing

```ts
xcolor('color(a98-rgb 0.86 0 0)').toHex()
```

## Formatting

```ts
xcolor('#ff0000').toString('a98Rgb')  // 'color(a98-rgb 0.8586 0 0)'
```

## Preserve the original coordinates

Use the plugin's named exports for a wide-gamut value that stays in its original space. `parseWideColor(input)` returns `{ space, coordinates, alpha }` or `null`. `formatWideColor(record)` serializes those coordinates, and `toSrgb(record)` explicitly converts and clips them. Calling these functions needs no plugin registration.
