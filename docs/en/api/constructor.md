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
xcolor()         // black #000000, isValid() = false
xcolor(null)     // black #000000, isValid() = false
xcolor('nope')   // black #000000, isValid() = false
```

### Configuration Options

```ts
interface XColorOptions {
  useDecimal?: boolean  // when true, RGB channels use 0–1 range (default 0–255)
}
```

```ts
xcolor({ r: 1, g: 0, b: 0 }, { useDecimal: true })
// equivalent to xcolor('#ff0000')
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
b.toHex() // '#ff6666'
```

**Returns**: a new `XColor` instance
