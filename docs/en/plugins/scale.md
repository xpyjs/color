# scale - Color Scale Interpolation

Perform precise color space interpolation between two colors, with support for multiple color spaces and easing functions. Provides finer control than the gradient plugin.

## Install

```ts
import xcolor from '@xpyjs/color'
import scalePlugin from '@xpyjs/color/plugins/scale'

xcolor.use(scalePlugin)
```

## Methods

<SvgScaleComparison />

### scale(to, options?)

Generate an interpolation sequence from the current color to the target color.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `to` | `XColorInput` | — | Target color |
| `options` | `ScaleOptions` | — | Configuration options |

```ts
interface ScaleOptions {
  steps?: number      // Number of steps, default 5 (≥ 2)
  space?: ScaleSpace  // Interpolation color space
  easing?: ScaleEasing // Easing function
}
```

#### Color Space (ScaleSpace)

| Value | Description |
| --- | --- |
| `'rgb'` | RGB linear interpolation (default) |
| `'hsl'` | HSL interpolation |
| `'hsv'` | HSV interpolation |
| `'lab'` | CIE Lab interpolation (requires lab plugin) |
| `'lch'` | CIE LCH interpolation |

#### Easing Function (ScaleEasing)

| Value | Description |
| --- | --- |
| `'linear'` | Linear (default) |
| `'ease-in'` | Ease in |
| `'ease-out'` | Ease out |
| `'ease-in-out'` | Ease in-out |

**Return value**: `XColor[]`

```ts
xcolor('#ff0000').scale('#0000ff', {
  steps: 7,
  space: 'hsl',
  easing: 'ease-in-out'
}).map(c => c.toHex())
```

### at(to, t, options?)

Get a single interpolated color at a specified position between two colors.

| Parameter | Type | Description |
| --- | --- | --- |
| `to` | `XColorInput` | Target color |
| `t` | `number` | Interpolation position (0–1) |
| `options` | `{ space?, easing? }` | Configuration options |

**Return value**: `XColor`

```ts
xcolor('#ff0000').at('#0000ff', 0.5).toHex()         // '#800080'
xcolor('#ff0000').at('#0000ff', 0.5, { space: 'hsl' }).toHex()  // Interpolated via HSL
```

## RGB vs HSL Interpolation Comparison

RGB interpolation may produce "muddy" intermediate colors, while HSL interpolation transitions along the color wheel:

```ts
// RGB: red→blue, the middle is a grayish purple
xcolor('#ff0000').scale('#0000ff', { space: 'rgb', steps: 5 })

// HSL: red→blue, the middle passes through green
xcolor('#ff0000').scale('#0000ff', { space: 'hsl', steps: 5 })
```

Choose the appropriate interpolation space based on your actual use case.
