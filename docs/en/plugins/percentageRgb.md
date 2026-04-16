# percentageRgb

Percentage RGB output support. Represents RGB channels in percentage form.

## Install

```ts
import xcolor from '@xpyjs/color'
import percentageRgbPlugin from '@xpyjs/color/plugins/percentageRgb'

xcolor.use(percentageRgbPlugin)
```

## Methods

### toPercentageRgb()

Returns an RGB object in percentage form.

```ts
xcolor('#ff8000').toPercentageRgb()
// { r: '100%', g: '50%', b: '0%', a: 1 }
```

### toPercentageRgbString()

Returns a percentage string in `rgb()` / `rgba()` format.

```ts
xcolor('#ff8000').toPercentageRgbString()
// 'rgb(100%, 50%, 0%)'

xcolor('rgba(255,128,0,0.5)').toPercentageRgbString()
// 'rgba(100%, 50%, 0%, 0.5)'
```

## Formatting

```ts
xcolor('#ff8000').toString('percentageRgb')  // 'rgb(100%, 50%, 0%)'
```
