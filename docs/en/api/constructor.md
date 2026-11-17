# Constructor & Factory

## Strict mode and structured errors

`xcolor(input, { strict: true })` throws `XColorError` for unparseable input, invalid-instance copies and explicit null. Omitted input still creates black. `xcolor.config({ strict: true })` sets the default; instances may override with false. Strict core numeric setters/adjustments reject NaN/Infinity before mutation, while finite out-of-range values retain normal clamping. Clones inherit strict mode; failed hex replacement preserves state and validity.

```ts
import xcolor, { XColorError } from '@xpyjs/color'
try { xcolor('invalid', { strict: true }) } catch (error) {
  if (error instanceof XColorError) console.log(error.code, error.operation)
}
```

Errors expose name='XColorError', code (INVALID_INPUT, INVALID_COLOR or INVALID_ARGUMENT) and optional operation context. Logger.createError returns this type with the existing message prefix. Classify by code, not message text. Strict input validation is not strict CSS grammar; use colorSpace.parseCssColor for that.

Default construction still returns invalid instances detectable through isValid(). Clones and single-color adjustments retain invalidity; successful hex replacement repairs it. Mix, contrast, brightness/luminance and defineMethod-registered plugin computations reject invalid sources; scale/deltaE also reject invalid targets. isReadable and equals still return false for invalid colors. Failed default hex replacement still marks invalid and throws; strict mode preserves validity. Plugins retain their own parameter rules; strict mode cannot automatically validate arbitrary third-party plugin arguments.

## xcolor(input?, options?)

Create an `XColor` instance.

```ts
import xcolor from '@xpyjs/color'

const color = xcolor('#ff0000')
```

### Parameters

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `XColorInput` | — | Color input, supports multiple formats |
| `options` | `XColorOptions` | — | Configuration options |

### Input Formats

#### String

```ts
xcolor('#f00')                // 3-digit hex
xcolor('#ff0000')             // 6-digit hex
xcolor('#ff000080')           // 8-digit hex (with alpha)
xcolor('ff0000')              // without # is also fine
xcolor('rgb(255, 0, 0)')      // rgb()
xcolor('rgba(255, 0, 0, 0.5)')// rgba()
xcolor('hsl(0, 100%, 50%)')   // hsl()
xcolor('hsla(0, 100%, 50%, 0.5)')
xcolor('hsv(0, 100%, 100%)')  // hsv()
xcolor('color(srgb 1 0 0)')   // CSS color()
```

#### Object

```ts
xcolor({ r: 255, g: 0, b: 0 })           // RGB
xcolor({ r: 255, g: 0, b: 0, a: 0.5 })   // RGBA
xcolor({ h: 0, s: 100, l: 50 })           // HSL
xcolor({ h: 0, s: 100, v: 100 })          // HSV
```

Missing channels will use default values (RGB defaults to 0, alpha defaults to 1).

#### Number

```ts
xcolor(0xff0000)  // 24-bit integer
xcolor(16711680)  // same as above
```

#### XColor Instance

```ts
const a = xcolor('#ff0000')
const b = xcolor(a)  // clone, b is independent from a
```

#### null / undefined / Invalid Values

```ts
xcolor()         // black #000000, isValid() = true (default color when omitted)
xcolor(null)     // black #000000, isValid() = true (null uses the default color)
xcolor('nope')   // black #000000, isValid() = false (invalid input)
```

### Configuration Options

```ts
interface XColorOptions {
  useDecimal?: boolean  // when true, preserve fractional RGB channels (range stays 0–255)
}
```

```ts
xcolor({ r: 255, g: 0, b: 0 }, { useDecimal: true })  // equivalent to xcolor('#ff0000')

const c = xcolor('#000000', { useDecimal: true })
c.rgb(127.5, 64.25, 0)
c.rgb()  // { r: 127.5, g: 64.25, b: 0, a: 1 }
```

## new XColor(input?, options?)

Same as the `xcolor()` factory function, but using the `new` keyword. Both behave identically:

```ts
import { XColor } from '@xpyjs/color'

const color = new XColor('#ff0000')
```

Generally, the `xcolor()` factory function is recommended — it's more concise, and static methods are mounted on the factory function.

## clone()

Create an independent copy of the current instance. Subsequent operations on the copy do not affect the original instance.

```ts
const a = xcolor('#ff0000')
const b = a.clone()
b.lighten(20)

a.toHex() // '#ff0000' — unaffected
b.toHex() // '#ff3333'
```

**Returns**: a new `XColor` instance
