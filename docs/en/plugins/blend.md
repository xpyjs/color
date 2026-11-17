# blend - Blend Modes

Simulate Photoshop/CSS layer blend modes, blending two colors using a specified algorithm.

## Nonseparable blending and compositing

`blend(source, mode = 'normal')` also supports hue, saturation, color and luminosity using the [W3C nonseparable formulas](https://www.w3.org/TR/compositing-1/#blendingnonseparable). Lum/Sat/ClipColor operations are not HSL component replacement or WCAG relative luminance.

```ts
xcolor('#ff0000').blend('#0000ff', 'color')
xcolor('#0000ff').composite('#ff0080', 'source-over')
```

`destination.composite(source, operator = 'source-over')` computes a single encoded-sRGB RGBA pixel. Operators: clear, copy, destination, source-over, destination-over, source-in, destination-in, source-out, destination-out, source-atop, destination-atop, xor and lighter. Lighter adds and clamps premultiplied channels/alpha; it differs from the component-wise lighten blend mode.

Both operations return independent instances retaining destination precision options. Zero-coverage composition yields transparent black. Invalid colors/operators throw. Shape coverage, layer-group isolation and Canvas drawing regions are outside this pixel API.

## Install

```ts
import xcolor from '@xpyjs/color'
import blendPlugin from '@xpyjs/color/plugins/blend'

xcolor.use(blendPlugin)
```

## Methods

<SvgBlendModes />

### blend(color, mode)

Blend the current color (base layer) with another color (top layer) using the specified mode. Returns a new color instance.

| Parameter | Type | Description |
| --- | --- | --- |
| `color` | `XColorInput` | Top layer color |
| `mode` | `BlendMode` | Blend mode |

**Return value**: `XColor`

```ts
xcolor('#ff0000').blend('#0000ff', 'multiply').toHex()
xcolor('#ff0000').blend('#0000ff', 'screen').toHex()
```

## Blend Modes

| Mode | Description |
| --- | --- |
| `'normal'` | Source-over compositing without a blend transform |
| `'multiply'` | Multiply — darkening effect |
| `'screen'` | Screen — lightening effect |
| `'overlay'` | Overlay — contrast enhancement |
| `'darken'` | Darken — takes the darker value per channel |
| `'lighten'` | Lighten — takes the lighter value per channel |
| `'dodge'` | Color dodge |
| `'burn'` | Color burn |
| `'hardLight'` | Hard light |
| `'softLight'` | Soft light |
| `'difference'` | Difference |
| `'exclusion'` | Exclusion |

## Examples

```ts
const base = xcolor('#3b82f6')

// Various blend effects
base.blend('#ff6600', 'multiply').toHex()
base.blend('#ff6600', 'screen').toHex()
base.blend('#ff6600', 'overlay').toHex()
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #3b82f6"></div>
  <span class="color-demo-arrow">×</span>
  <div class="color-demo-swatch" style="background: #ff6600"></div>
  <span class="color-demo-label">multiply</span>
</div>
