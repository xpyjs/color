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
xcolor('#ggg')    // black #000000, isValid() → false
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

## Input and output by format

The table describes standalone values. Register the listed plugin before parsing or formatting. A dash in the object column means there is no object input for that model.

| Model | Plugin | String input and units | Object input | Alpha | Format key and CSS output |
| --- | --- | --- | --- | --- | --- |
| Hex | Core | 3, 4, 6, or 8 digits, optional `#` | — | 4 or 8 digits | `hex`, `hex3`, `hex8` emit CSS hex |
| RGB | Core | `rgb()`, `rgba()`, numeric or percentage channels | `{ r, g, b, a? }`, omitted RGB channels use 0 | Number or percent in strings | `rgb` emits CSS RGB |
| HSL | Core | `hsl()`, `hsla()`, hue in degrees or with `deg`, `grad`, `rad`, `turn`; S/L in 0–100 | `{ h, s, l, a? }` | Number or percent in strings | `hsl` emits CSS HSL |
| HSV | Core | `hsv()`, `hsva()`, same hue units as HSL; S/V in 0–100 | `{ h, s, v, a? }` | Number or percent in strings | `hsv` is xcolor notation |
| sRGB | Core | `color(srgb …)` or `srgb()`, 0–1 or percent | — | Optional slash alpha | Use the `rgb` or hex output |
| Named colors | `name` | CSS names and `transparent` | — | `transparent` has zero alpha | `name` emits a name when available, with hex fallback |
| HWB | `hwb` | `hwb()`, angle units as in HSL and 0–100 W/B | — | Optional slash alpha | `hwb` emits CSS HWB |
| CMYK | `cmyk` | `cmyk()`, 0–100 or percent | `{ c, m, y, k, a? }` | Optional alpha | `cmyk` is xcolor notation |
| Lab / LCH | `lab` | `lab()` or `lch()`, numbers and model-specific percentages, LCH hue accepts angle units | — | Optional slash alpha | `lab`, `lch` use CSS coordinates with `whitePoint: 'D50'` |
| OKLab / OKLCh | `oklab` | `oklab()` or `oklch()`, numbers and model-specific percentages, OKLCh hue accepts angle units | — | Optional slash alpha | `oklab`, `oklch` emit CSS functions |
| Wide RGB and XYZ | `displayP3`, `a98Rgb`, `proPhotoRgb`, `rec2020`, `xyz` | `color()`, numeric or percentage coordinates | — | Optional slash alpha | Same key as plugin, emits a CSS `color()` value after sRGB conversion |
| Percentage RGB | `percentageRgb` | Parsed by core RGB | — | Standard RGB alpha | `percentageRgb` emits CSS RGB with percentage channels |

Object alpha uses 0–1. The numeric input is a 24-bit RGB integer with implicit alpha 1. Resolve context-dependent values such as `currentColor` and `var(--brand)` in the caller before passing a standalone color to xcolor. The library accepts a subset of CSS color syntax. Expressions such as `calc()` and missing components written as `none` require separate handling.

Use `xcolor.isValidInput(value)` for quiet input validation. It checks the active parsers, returns false for nullish inputs, and reflects `isValid()` for an existing instance. Calling the factory with no input still creates the default black.
