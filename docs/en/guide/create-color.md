# Create Color

The `xcolor()` factory function accepts color input in various formats and returns an operable color instance.

## Hex Strings

The most common input method. Supports 3-digit, 4-digit, 6-digit, and 8-digit formats:

```ts
xcolor('#ff0000')     // 6-digit — red
xcolor('#f00')        // 3-digit — red (equivalent to #ff0000)
xcolor('#ff000080')   // 8-digit — semi-transparent red (alpha = 0x80/0xFF ≈ 0.5)
xcolor('#f008')       // 4-digit — semi-transparent red
```

The `#` prefix is optional; the following are also valid:

```ts
xcolor('ff0000')
xcolor('f00')
```

## RGB / RGBA Strings

CSS standard `rgb()` and `rgba()` function formats:

```ts
xcolor('rgb(255, 0, 0)')           // red
xcolor('rgba(255, 0, 0, 0.5)')     // semi-transparent red
xcolor('rgb(100%, 0%, 0%)')        // percentage notation
```

## HSL / HSLA Strings

```ts
xcolor('hsl(0, 100%, 50%)')            // red
xcolor('hsla(120, 100%, 50%, 0.8)')    // semi-transparent green
```

Parameters: hue (0–360°), saturation (0–100%), lightness (0–100%).

## HSV Strings

```ts
xcolor('hsv(0, 100%, 100%)')           // red
xcolor('hsva(240, 100%, 100%, 0.5)')   // semi-transparent blue
```

Parameters: hue (0–360°), saturation (0–100%), value (0–100%).

## sRGB Strings

CSS Color Level 4 `color(srgb ...)` function:

```ts
xcolor('color(srgb 1 0 0)')           // red
xcolor('srgb(1 0 0)')                 // shorthand form
```

Channel value range is 0–1.

## Object Input

Pass a plain object containing color channels. The parser automatically infers the color space from property names:

```ts
// RGB object
xcolor({ r: 255, g: 0, b: 0 })         // red
xcolor({ r: 255, g: 0, b: 0, a: 0.5 }) // semi-transparent red

// HSL object
xcolor({ h: 120, s: 100, l: 50 })      // green

// HSV object
xcolor({ h: 240, s: 100, v: 100 })     // blue
```

Missing channels use default values (RGB defaults to 0, alpha defaults to 1).

## Number Input

24-bit integer (`0x000000` – `0xFFFFFF`):

```ts
xcolor(0xFF0000)   // red — equivalent to #ff0000
xcolor(0x00FF00)   // green
xcolor(255)        // #0000ff — blue (0x0000FF)
```

Does not include an alpha channel; alpha is always 1.

## XColor Instance

Passing an existing xcolor instance creates a clone:

```ts
const a = xcolor('#ff0000')
const b = xcolor(a) // independent copy

b.lighten(30)
a.toHex()  // '#ff0000' — a is unaffected
```

## Empty / Invalid Input

```ts
xcolor()          // black #000000, isValid() → true
xcolor(null)      // black #000000, isValid() → true
xcolor(undefined) // black #000000, isValid() → true
xcolor('abc123')  // black #000000, isValid() → false
```

Invalid input does not throw an exception. Instead, it creates a black instance and marks `isValid()` as `false`, which can be used for error handling.

## Options Parameter

The factory function accepts an optional second parameter `XColorOptions`:

```ts
xcolor('#ff0000', { useDecimal: true })
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `useDecimal` | `boolean` | `false` | When enabled, RGB channels retain decimal precision (e.g. `127.5`) |

By default, RGB channels are rounded to integers. Enabling `useDecimal` is suitable for high-precision color calculations and CSS Color Level 4 `color()` function scenarios.

Global default options can be set via `xcolor.config()`:

```ts
xcolor.config({ useDecimal: true })

// All subsequently created instances will have decimal precision enabled
// Individual instances can pass parameters to override global settings
```

## Plugin Extended Input

After installing plugins, additional input formats are supported. For example, after installing the `cmyk` plugin you can pass CMYK objects, and after installing the `name` plugin you can use CSS color names:

```ts
import name from '@xpyjs/color/plugins/name'
import cmyk from '@xpyjs/color/plugins/cmyk'

xcolor.use(name)
xcolor.use(cmyk)

xcolor('red')                        // CSS color name
xcolor({ c: 0, m: 100, y: 100, k: 0 }) // CMYK object
```

See [Plugin System](/en/guide/plugins) for details.
