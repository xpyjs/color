# gradient - Gradient

Generate gradient color sequences between two colors, or generate a tonal range from a single color.

## Install

```ts
import xcolor from '@xpyjs/color'
import gradientPlugin from '@xpyjs/color/plugins/gradient'

xcolor.use(gradientPlugin)
```

## Methods

<SvgGradientBar />

### gradient(to, steps?)

Generate a gradient sequence between the current color and the target color.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `to` | `XColorInput` | — | Target color |
| `steps` | `number` | `5` | Number of steps (≥ 2) |

**Returns**: `XColor[]`

```ts
xcolor('#ff0000').gradient('#0000ff', 5).map(c => c.toHex())
// ['#ff0000', '#bf0040', '#800080', '#4000bf', '#0000ff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #bf0040"></div>
  <div class="color-demo-swatch" style="background: #800080"></div>
  <div class="color-demo-swatch" style="background: #4000bf"></div>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
</div>

### tones(steps?)

Generate a tonal range of shades and tints centered on the current color.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `number` | `5` | Number of steps (≥ 2) |

**Returns**: `XColor[]`

```ts
xcolor('#3b82f6').tones(5).map(c => c.toHex())
// 5-step variation from dark to light
```

<SvgTonesBar />

## Practical Scenarios

### CSS Gradient Background

```ts
const stops = xcolor('#6366f1')
  .gradient('#ec4899', 5)
  .map(c => c.toHex())
  .join(', ')

const css = `linear-gradient(to right, ${stops})`
```

<SvgCssGradient />

### Chart Color Scheme

```ts
const chartColors = xcolor('#3b82f6')
  .gradient('#10b981', 8)
  .map(c => c.toHex())
```

<SvgChartColors />
