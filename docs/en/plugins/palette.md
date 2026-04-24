# palette - Shade Palette Generation

Generate design system shade palettes from any color. Supports Ant Design HSV curves, linear interpolation, and custom generator functions.

## Install

```ts
import xcolor from '@xpyjs/color'
import palettePlugin from '@xpyjs/color/plugins/palette'

xcolor.use(palettePlugin)
```

## Instance Methods

### palette(options?)

Generate a design system shade palette from the current color. The base color maps to shade 500, with lighter shades below and darker shades above.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `options.type` | `PaletteType` | `'antd'` | Palette generation type |
| `options.shades` | `Shade[]` | `[50,...,950]` | Shade levels |

**Return value**: `XColor[]`

```ts
xcolor('#1890ff').palette()
// → XColor[], 11 shades (50–950)

xcolor('#1890ff').palette({ type: 'linear' })
// → linear interpolation palette

xcolor('#ff0000').palette({ shades: [100, 500, 900] })
// → 3 shades
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #e6f7ff"></div>
  <div class="color-demo-swatch" style="background: #bae7ff"></div>
  <div class="color-demo-swatch" style="background: #91d5ff"></div>
  <div class="color-demo-swatch" style="background: #69c0ff"></div>
  <div class="color-demo-swatch" style="background: #40a9ff"></div>
  <div class="color-demo-swatch" style="background: #1890ff; border: 2px solid #333"></div>
  <div class="color-demo-swatch" style="background: #096dd9"></div>
  <div class="color-demo-swatch" style="background: #0050b3"></div>
  <div class="color-demo-swatch" style="background: #003a8c"></div>
  <div class="color-demo-swatch" style="background: #002766"></div>
</div>

### Palette Type (PaletteType)

<SvgPaletteTypes />

| Value | Description |
| --- | --- |
| `'antd'` | Ant Design HSV curve algorithm. Non-linear hue rotation + saturation/value adjustment for perceptually uniform palettes |
| `'linear'` | Linear RGB interpolation. Even transition from white through base color to black |
| `(baseColor, shades) => XColor[]` | Custom function. Receives the base color and shade levels, returns corresponding `XColor[]` |

```ts
// Custom function example
const result = xcolor('#1890ff').palette({
  type: (baseColor, shades) => {
    return shades.map((s) => {
      const factor = (s - 500) / 500
      return factor < 0
        ? xcolor(baseColor.toHex()).lighten(Math.abs(factor) * 50)
        : xcolor(baseColor.toHex()).darken(factor * 50)
    })
  }
})
```

### Shade Levels (Shade)

By default, 11 shade levels are generated: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`.

The base color maps to `500`. Shades below 500 are lighter; shades above 500 are darker.
