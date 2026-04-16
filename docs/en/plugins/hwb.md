# hwb

HWB (Hue-Whiteness-Blackness) color space support. HWB is a color space defined in the CSS Color Level 4 specification that is intuitive for humans — adjusting colors by "adding white" and "adding black".

## Install

```ts
import xcolor from '@xpyjs/color'
import hwbPlugin from '@xpyjs/color/plugins/hwb'

xcolor.use(hwbPlugin)
```

## Methods

### toHwb()

Returns an HWB object.

- `h`: Hue (0–360)
- `w`: Whiteness (0–100)
- `b`: Blackness (0–100)

```ts
xcolor('#ff0000').toHwb()
// { h: 0, w: 0, b: 0 }

xcolor('#ff8080').toHwb()
// { h: 0, w: 50, b: 0 }
```

### toHwbString()

Returns an `hwb()` format string.

```ts
xcolor('#ff0000').toHwbString()
// 'hwb(0 0% 0%)'
```

## Input Parsing

```ts
xcolor('hwb(0 0% 0%)').toHex()      // '#ff0000'
xcolor('hwb(120 20% 10%)').toHex()   // greenish tone
```

## Formatting

```ts
xcolor('#ff0000').toString('hwb')  // 'hwb(0 0% 0%)'
```
