# displayP3

Display P3 wide gamut color space support. P3 is a color gamut widely supported by Apple devices and modern displays, approximately 25% larger than sRGB.

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
// { r: 0.92, g: 0.20, b: 0.14 }
```

### toDisplayP3String()

Returns a `color(display-p3 ...)` format string.

```ts
xcolor('#ff0000').toDisplayP3String()
// 'color(display-p3 0.92 0.20 0.14)'
```

## Input Parsing

```ts
xcolor('color(display-p3 0.92 0.20 0.14)').toHex()
```

## Formatting

```ts
xcolor('#ff0000').toString('displayP3')  // 'color(display-p3 0.92 0.20 0.14)'
```
