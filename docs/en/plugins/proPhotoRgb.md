# proPhotoRgb

ProPhoto RGB wide gamut color space support. ProPhoto RGB has an extremely large gamut range, covering approximately 90% of human-visible colors, and is widely used in professional photography post-processing.

Inputs are converted to sRGB and clipped to its gamut. Values outside sRGB lose information during a round trip.

## Install

```ts
import xcolor from '@xpyjs/color'
import proPhotoRgbPlugin from '@xpyjs/color/plugins/proPhotoRgb'

xcolor.use(proPhotoRgbPlugin)
```

## Methods

### toProPhotoRgb()

Returns a ProPhoto RGB object. Each channel value ranges from 0–1.

```ts
xcolor('#ff0000').toProPhotoRgb()
// { r: 0.7022, g: 0.2757, b: 0.1036 }
```

### toProPhotoRgbString()

Returns a `color(prophoto-rgb ...)` format string.

```ts
xcolor('#ff0000').toProPhotoRgbString()
// 'color(prophoto-rgb 0.7022 0.2757 0.1036)'
```

## Input Parsing

```ts
xcolor('color(prophoto-rgb 0.70 0.28 0.10)').toHex()
```

## Formatting

```ts
xcolor('#ff0000').toString('proPhotoRgb')  // 'color(prophoto-rgb 0.7022 0.2757 0.1036)'
```

## Preserve the original coordinates

Use the plugin's named exports for a wide-gamut value that stays in its original space. `parseWideColor(input)` returns `{ space, coordinates, alpha }` or `null`. `formatWideColor(record)` serializes those coordinates, and `toSrgb(record)` explicitly converts and clips them. Calling these functions needs no plugin registration.
