# colorSpace - Unclipped coordinate records

Choose a gradient API: [Two-color RGB steps](./gradient.md) · [Space, easing, and sampling](./scale.md) · [Multiple stops and custom domains](./colorSpace.md#createcolorgradient)

After registration, `xcolor(record)` accepts tagged objects and `colorSpace()` / `colorSpace(record)` provide a getter and chainable setter. HWB records use `[h, w, b]`. Without registration, use the named `fromColorSpace(record, options?)` factory. Creating or updating an `XColor` explicitly enters sRGB and clips; retain records for wide-gamut calculations. Invalid setters leave the instance unchanged, and valid setters keep its precision options.

Input types now match the parsers: HSL/HSV require all three channels, CMYK all four ink channels, and RGB at least one of r/g/b. Alpha is optional. Previously accepted but invalid Partial objects now produce type errors. Untagged Lab/HWB objects are not supported input formats; use tagged records instead.

This module works with `{ space, coordinates, alpha }` records independently of `XColor`. Conversion does not clip through sRGB, mutate input, or round coordinates for display. Records from existing `parseWideColor()` exports are accepted directly.

```ts
import { parseColorSpace, convertColorSpace, inGamut, mapToGamut, formatColorSpace } from '@xpyjs/color/plugins/colorSpace'
const source = parseColorSpace('color(display-p3 1 0 0 / .5)')!
const lab = convertColorSpace(source, 'oklab')
inGamut(source, 'srgb') // false
formatColorSpace(mapToGamut(source, 'srgb', 'oklch-chroma'))
```

Supported spaces: `srgb`, `srgb-linear`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz` (D65 alias), `xyz-d65`, `xyz-d50`, `lab`, `lch`, `oklab`, `oklch`.

RGB channels use the 0–1 scale but may be negative or out of range. Lab/LCH use D50 and 0–100 lightness; OKLab/OKLCh use 0–1 lightness. Polar hue is in degrees. Alpha must be finite and within 0–1.

HWB whiteness/blackness have a zero lower bound and normalize proportionally when their sum exceeds 100%. `hwb(120 200% 100%)` therefore yields `#aaaaaa`, without first clipping each component to 100%. Records and the hwb plugin follow the same rule.

## Perceptual palettes

`generatePerceptualPalette(base, options?)` fixes white=50, base=500 and black=950. Entries are `{ shade, source, color, contrast? }`: source is the OKLCh target; color is sRGB mapped by chroma reduction. Default shades are 50,100,200…900,950. Custom `shades` accepts finite numbers in [50,950], preserving order and duplicates. Subsets never change the color assigned to a shade.

```ts
import { generatePerceptualPalette, parseCssColor } from '@xpyjs/color/plugins/colorSpace'
const palette = generatePerceptualPalette(parseCssColor('red')!)
const textShades = generatePerceptualPalette(parseCssColor('red')!, { shades: [900, 950], contrast: { background: parseCssColor('white')!, target: 4.5 } })
```

Hue is fixed; lightness/chroma vary linearly on each side of the base. Target lightness is monotonic and equal shade intervals within each segment have equal OKLab distances before mapping. Gamut mapping can alter distances; this is not an equal-ΔE guarantee across the entire palette. Base OKLab lightness must be in [0,1]. Alpha is preserved; existing palette-plugin defaults remain unchanged.

Optional contrast constraints validate the **mapped display colors after alpha compositing** against an opaque background. Target defaults to 4.5 (range 1–21); shades can restrict checked levels. Default policy='throw' rejects unmet constraints; policy='report' returns ratio/target/passes per checked entry. Constraints do not silently move the 500 anchor or sacrifice lightness ordering. Use a11y adjustContrast for automatic single-color adjustments.

## Perceptual comparison, sorting and deduplication

`colorDifference(a, b, { metric? })` defaults to CIEDE2000 (D50, kL/kC/kH = 1), with `cie76` and unscaled `oklab` Euclidean distance available. Calculations use full precision without sRGB clipping. The legacy lab plugin `.deltaE()` remains unchanged.

```ts
import { parseCssColor, colorDifference, isColorSimilar, sortColors, deduplicateColors } from '@xpyjs/color/plugins/colorSpace'
const colors = ['red', '#ff0100', 'blue'].map(value => parseCssColor(value)!)
colorDifference(colors[0], colors[1]) // CIEDE2000 distance
isColorSimilar(colors[0], colors[1], { tolerance: 2 }) // Inclusive limit
deduplicateColors(colors) // Keep the first representative
sortColors(colors, { by: 'distance', reference: colors[0] })
```

Coordinate distance ignores alpha and does not measure composited appearance. `isColorSimilar` / `deduplicateColors` also check `alphaTolerance` (default 0, range 0–1). Coordinate `tolerance` defaults to 2 for CIE metrics or .02 for OKLab; any nonnegative finite limit is allowed. Both limits are inclusive. Missing components resolve to zero for comparisons.

`sortColors` defaults to ascending OKLCh lightness; chroma, hue and distance to a required reference are available. `descending` reverses the primary key while ties retain input order. Neutral numerical hue uses the conversion result of zero. Outputs are independent source-space records. Deduplication compares each candidate with retained representatives, worst-case O(n²). Similarity is not transitive, so order may affect representatives; this is not clustering.

CIEDE2000 is verified against all 34 [Sharma/Wu/Dalal reference vectors](https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/), including neutral colors and 180° hue boundaries.

## Multi-stop gradients {#createcolorgradient}

`createColorGradient(stops, options?)` snapshots 2–10000 `{ color: record, position?: number }` stops and defaults to OKLab interpolation. `at(value)` samples the data domain; `colors(count = 5)` samples uniformly, including domain endpoints.

```ts
import { createColorGradient, parseCssColor, formatColorSpace } from '@xpyjs/color/plugins/colorSpace'
const gradient = createColorGradient(['red', 'gold', 'blue'].map(value => ({ color: parseCssColor(value)! })), { space: 'oklch', hue: 'shorter', domain: [0, 100] })
formatColorSpace(gradient.at(50)) // Middle stop
gradient.colors(7) // Seven independent coordinate records
```

Positions are nondecreasing numbers in [0,1]. Omitted first/last positions default to 0/1; intervening positions are evenly distributed between anchors. Duplicate positions form hard stops, selecting the last stop at that position. Outer colors extend to the ends. `domain` is a finite increasing pair, default [0,1]; out-of-domain samples clamp. Counts must be integers from 2 to 10000; invalid options throw.

All record spaces are supported, including Lab/LCH/OKLCh and wide RGB. Output retains the interpolation space without clipping. Polar spaces accept shorter/longer/increasing/decreasing hue paths. Missing components carry forward; alpha premultiplication applies to non-hue coordinates. Input and output arrays are independent. The existing instance `.scale()` keeps its two-color API; this API does not parse CSS gradient strings.

## CSS expressions and explicit context

`resolveCssColor(input, context?)` evaluates literals, two-color `color-mix(in space, color percentage?, color percentage?)`, and relative RGB/HSL/HWB/Lab/LCH/OKLab/OKLCh/`color()` functions. It returns unclipped records or null for invalid/unresolved inputs, without registration.

```ts
import { resolveCssColor, fromColorSpace } from '@xpyjs/color/plugins/colorSpace'
const mixed = resolveCssColor('color-mix(in srgb, var(--brand), currentColor)', { variables: { '--brand': 'red' }, currentColor: 'blue' })!
fromColorSpace(mixed).toHex() // '#800080'
resolveCssColor('oklch(from red calc(l * .8) c h)') // Retains target coordinates
```

Mix weights default to 50/50; one omitted weight complements the other. Totals below 100% reduce alpha; totals above 100% are normalized. Mixing premultiplies non-hue coordinates by alpha. Polar spaces support shorter (default), longer, increasing and decreasing hue paths. Analogous missing components/sets are carried forward and filled, remaining none when both are missing. Neutral hues borrow the chromatic endpoint's hue.

Relative channel keywords use target units: rgb r/g/b use 0–255; `color(... srgb ...)` uses 0–1. Omitted alpha inherits the origin; explicit alpha is clamped to 0–1, while coordinates remain unclipped. The numeric `calc()` subset supports finite numbers, channel keywords, `+ - * /` and parentheses, without JavaScript execution. Percentages/dimensions inside calc and other math functions are unsupported.

Context resolves **whole-color** `var(--name[, fallback])` and currentColor only. Custom property names are case-sensitive; values may be strings or records. No DOM access or channel-level variable substitution occurs. Limits: 16384 characters, 32 nesting levels, 256 color resolutions and 256 calc tokens. Cycles, overflow and division by zero return null. More than two mix colors, weights before colors, CSS comments/escapes, custom profiles, system colors, light-dark and contrast-color are unsupported. This bounded evaluator is not a complete CSS Color 5 implementation.

## Strict CSS literals and missing components

`parseCssColor(input, { syntax: 'strict' })` independently parses complete literals: hex, all CSS named colors, transparent, RGB/HSL/HWB, Lab/LCH/OKLab/OKLCh and the predefined `color()` spaces above. Registration is unnecessary. Modern syntax accepts `none`; comma syntax is limited to RGB/HSL, with consistent number/percentage RGB channels.

```ts
import { parseCssColor, formatColorSpace, convertColorSpace } from '@xpyjs/color/plugins/colorSpace'
const missing = parseCssColor('oklch(.6 .2 none / none)')!
formatColorSpace(missing) // 'oklch(0.6 0.2 none / none)'
convertColorSpace(missing, 'srgb').alpha // 0 (ordinary conversion, not interpolation)
```

The optional `missing` tuple contains four booleans for the coordinates and alpha, with zero numeric placeholders. Serialization retains `none`; ordinary conversion resolves missing components to zero and removes the flags. Interpolation needs a separate carry-forward step, reserved for the gradient API. `parseColorSpace` also retains explicit `none`. See [CSS Color 4 missing components](https://www.w3.org/TR/css-color-4/#missing).

`syntax: 'loose'` tries existing library syntax (such as HSV) after strict parsing fails. Registering colorSpace additionally enables `color(srgb-linear …)` and `none` strings; other strings continue through existing parsers. Instance factories/setters resolve Lab/OKLab lightness endpoints to black/white; pure coordinate conversion keeps the mathematical result.

This is a literal parser, not a complete CSS stylesheet parser: CSS comments/escapes, math functions, relative colors, color-mix, custom profiles, currentColor, var() and system colors return null. Expressions and context resolution belong to a separate expression API; environment values are never guessed.

| Function | Behavior |
| --- | --- |
| `parseColorSpace(string)` | Retains source coordinates; returns null on unsupported syntax. Core formats and registered parsers fall back to an sRGB record |
| `convertColorSpace(record, space)` | Returns independent, unclipped coordinates and preserves alpha |
| `formatColorSpace(record)` | Serializes directly without rounding or gamut mapping |
| `inGamut(record, rgbSpace = 'srgb', epsilon = 1e-7)` | Tests containment in an RGB gamut |
| `mapToGamut(record, rgbSpace = 'srgb', method = 'clip')` | Explicitly maps into an RGB gamut |

`clip` clamps each channel. `oklch-chroma` binary-searches reduced chroma at fixed OKLCh lightness/hue, mapping lightness endpoints to black/white. It is not CSS Local MINDE. Floating-point roundtrips are approximate. Rec.2020 retains this library's existing alpha/beta piecewise transfer curve. Invalid records, targets, or conversion overflow throw.

Pure functions require no plugin registration. To bridge an existing sRGB instance:

Records retain full calculated precision. HSL/HSV records are also supported, using degrees and 0–100 channel scales. `toColorSpace()` reads the stored alpha directly, bypassing the legacy two-decimal object output. Input precision already discarded during instance creation cannot be recovered; fractional RGB inputs should use `useDecimal`.

`formatColorSpace(record, { precision: 4 })` rounds coordinates and alpha only at serialization. The default is `'full'`; numeric precision must be an integer from 0 to 15. Lower precision can change colors or round a tiny alpha to zero. Legacy getters keep their existing defaults. HSV function strings are library notation, not standard CSS.

```ts
import xcolor from '@xpyjs/color'
import colorSpace from '@xpyjs/color/plugins/colorSpace'
xcolor.use(colorSpace)
xcolor('#f00').toColorSpace('lab')
```

Previously clipped coordinates cannot be recovered. Start with `parseColorSpace` for wide input. Record Lab/LCH always use D50, independently of the legacy lab plugin's D65 default. Record-based gradients, differences, and higher-level operations are separate extensions; existing instance operations still use sRGB.
