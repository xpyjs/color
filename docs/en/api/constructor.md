# Constructor & Factory

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
xcolor('color(srgb 1 0 0)')   // CSS color()
```

#### Object

```ts
xcolor({ r: 255, g: 0, b: 0 })           // RGB
xcolor({ r: 255, g: 0, b: 0, a: 0.5 })   // RGBA
xcolor({ h: 0, s: 100, l: 50 })           // HSL
```

RGB objects may omit channels (default 0), and alpha is optional (default 1). HSL objects require all of `h`, `s`, and `l`. With the CMYK plugin installed, CMYK objects require all of `c`, `m`, `y`, and `k`.

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
  strict?: boolean
}
```

```ts
xcolor({ r: 255, g: 0, b: 0 }, { useDecimal: true })  // equivalent to xcolor('#ff0000')

const c = xcolor('#000000', { useDecimal: true })
c.rgb(127.5, 64.25, 0)
c.rgb()  // { r: 127.5, g: 64.25, b: 0, a: 1 }
```

## XColor Class

The `XColor` class is intended for type annotations and plugin extensions (the plugin `install` callback receives the class itself), not as the normal constructor entry point. Always create instances with `xcolor()`; `xcolor(existing)` returns an independent clone.

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

## Strict mode {#strict-mode-and-structured-errors}

Pass `{ strict: true }` to throw an `XColorError` on invalid input. To set the default for new instances, call `xcolor.config({ strict: true })`. An instance can override it with `{ strict: false }`. Clones keep the original instance’s setting.

| Operation | Default mode | Strict mode |
| --- | --- | --- |
| Create from an unparseable string | Returns an instance with `isValid() === false` | Throws `INVALID_INPUT` |
| Call `xcolor()` with no arguments | Creates valid black | Creates valid black |
| Replace valid red with `hex("invalid")` | Throws and marks the instance invalid | Throws and keeps the original valid red |

```ts
import xcolor, { XColorError } from '@xpyjs/color'

try {
  xcolor('invalid', { strict: true })
} catch (error) {
  if (error instanceof XColorError) console.log(error.code) // INVALID_INPUT
}
```

Use `error.code` to handle errors. Possible codes are `INVALID_INPUT`, `INVALID_COLOR`, and `INVALID_ARGUMENT`. Some errors also include `operation`.

Core numeric setters and adjustments throw before applying `NaN` or `Infinity`. Finite values still follow each method’s normal clamping rules. Plugins define their own validation. To validate CSS color literals, use [`parseCssColor()`](/en/plugins/colorSpace).
