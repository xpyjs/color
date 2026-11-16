# colorSpace - Unclipped coordinate records

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

```ts
import xcolor from '@xpyjs/color'
import colorSpace from '@xpyjs/color/plugins/colorSpace'
xcolor.use(colorSpace)
xcolor('#f00').toColorSpace('lab')
```

Previously clipped coordinates cannot be recovered. Start with `parseColorSpace` for wide input. Record Lab/LCH always use D50, independently of the legacy lab plugin's D65 default. Record-based gradients, differences, and higher-level operations are separate extensions; existing instance operations still use sRGB.
