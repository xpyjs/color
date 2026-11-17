# colorSpace - Unclipped coordinate records

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
