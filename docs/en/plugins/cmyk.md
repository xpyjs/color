# cmyk

CMYK print color space support. Provides CMYK output methods, string format registration, and CMYK input parsing.

## Install

```ts
import xcolor from '@xpyjs/color'
import cmykPlugin from '@xpyjs/color/plugins/cmyk'

xcolor.use(cmykPlugin)
```

## Methods

### toCmyk()

Returns a CMYK object. Each channel value ranges from 0–100.

```ts
xcolor('#ff0000').toCmyk()
// { c: 0, m: 100, y: 100, k: 0 }

xcolor('#336699').toCmyk()
// { c: 67, m: 33, y: 0, k: 40 }
```

### toCmykString()

Returns a `cmyk()` format string.

```ts
xcolor('#ff0000').toCmykString()
// 'cmyk(0%, 100%, 100%, 0%)'
```

## Input Parsing

After registration, you can create colors using CMYK objects or strings:

```ts
// Object input
xcolor({ c: 0, m: 100, y: 100, k: 0 }).toHex()  // '#ff0000'

// String input
xcolor('cmyk(0%, 100%, 100%, 0%)').toHex()  // '#ff0000'
```

## Formatting

```ts
xcolor('#ff0000').toString('cmyk')  // 'cmyk(0%, 100%, 100%, 0%)'
xcolor('#ff0000').format('cmyk')    // same as above
```
