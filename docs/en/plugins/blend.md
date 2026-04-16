# blend - Blend Modes

Simulate Photoshop/CSS layer blend modes, blending two colors using a specified algorithm.

## Install

```ts
import xcolor from '@xpyjs/color'
import blendPlugin from '@xpyjs/color/plugins/blend'

xcolor.use(blendPlugin)
```

## Methods

<SvgBlendModes />

### blend(color, mode)

Blend the current color (base layer) with another color (top layer) using the specified mode. **Modifies** the instance in place.

| Parameter | Type | Description |
| --- | --- | --- |
| `color` | `XColorInput` | Top layer color |
| `mode` | `BlendMode` | Blend mode |

**Return value**: `this`

```ts
xcolor('#ff0000').blend('#0000ff', 'multiply').toHex()
xcolor('#ff0000').blend('#0000ff', 'screen').toHex()
```

## Blend Modes

| Mode | Description |
| --- | --- |
| `'multiply'` | Multiply — darkening effect |
| `'screen'` | Screen — lightening effect |
| `'overlay'` | Overlay — contrast enhancement |
| `'darken'` | Darken — takes the darker value per channel |
| `'lighten'` | Lighten — takes the lighter value per channel |
| `'colorDodge'` | Color dodge |
| `'colorBurn'` | Color burn |
| `'hardLight'` | Hard light |
| `'softLight'` | Soft light |
| `'difference'` | Difference |
| `'exclusion'` | Exclusion |

## Examples

```ts
const base = xcolor('#3b82f6')

// Various blend effects
base.clone().blend('#ff6600', 'multiply').toHex()
base.clone().blend('#ff6600', 'screen').toHex()
base.clone().blend('#ff6600', 'overlay').toHex()
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #3b82f6"></div>
  <span class="color-demo-arrow">×</span>
  <div class="color-demo-swatch" style="background: #ff6600"></div>
  <span class="color-demo-label">multiply</span>
</div>
