# proPhotoRgb

ProPhoto RGB wide gamut color space support. ProPhoto RGB has an extremely large gamut range, covering approximately 90% of human-visible colors, and is widely used in professional photography post-processing.

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
// { r: 0.70, g: 0.28, b: 0.10 }
```

### toProPhotoRgbString()

Returns a `color(prophoto-rgb ...)` format string.

```ts
xcolor('#ff0000').toProPhotoRgbString()
// 'color(prophoto-rgb 0.70 0.28 0.10)'
```

## Input Parsing

```ts
xcolor('color(prophoto-rgb 0.70 0.28 0.10)').toHex()
```

## Formatting

```ts
xcolor('#ff0000').toString('proPhotoRgb')  // 'color(prophoto-rgb 0.70 0.28 0.10)'
```
