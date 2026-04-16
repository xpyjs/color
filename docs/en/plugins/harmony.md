# harmony - Color Schemes

Generate classic color schemes based on color theory. All methods return arrays containing `XColor` instances.

## Install

```ts
import xcolor from '@xpyjs/color'
import harmonyPlugin from '@xpyjs/color/plugins/harmony'

xcolor.use(harmonyPlugin)
```

## Methods

<SvgHarmonySchemes />

### complement()

Complementary colors — two colors 180° apart on the color wheel.

**Returns**: `[XColor, XColor]` (original + complement)

```ts
xcolor('#ff0000').complement().map(c => c.toHex())
// ['#ff0000', '#00ffff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #00ffff"></div>
</div>

### triad()

Triadic scheme — three colors 120° apart on the color wheel.

**Returns**: `XColor[]` (3 colors)

```ts
xcolor('#ff0000').triad().map(c => c.toHex())
// ['#ff0000', '#00ff00', '#0000ff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #00ff00"></div>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
</div>

### tetrad()

Tetradic scheme — four colors 90° apart on the color wheel.

**Returns**: `XColor[]` (4 colors)

```ts
xcolor('#ff0000').tetrad().map(c => c.toHex())
// ['#ff0000', '#80ff00', '#00ffff', '#8000ff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #80ff00"></div>
  <div class="color-demo-swatch" style="background: #00ffff"></div>
  <div class="color-demo-swatch" style="background: #8000ff"></div>
</div>

### splitComplement()

Split-complementary — the original color plus two colors 30° to each side of the complement.

**Returns**: `XColor[]` (3 colors)

```ts
xcolor('#ff0000').splitComplement().map(c => c.toHex())
// ['#ff0000', '#00ff80', '#0080ff']
```

### analogous(results?, slices?)

Analogous colors — adjacent colors on the color wheel.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `results` | `number` | `6` | Number of colors to return |
| `slices` | `number` | `30` | Number of wheel divisions |

**Returns**: `XColor[]`

```ts
xcolor('#ff0000').analogous().map(c => c.toHex())
// 6 colors near red
```

### monochromatic(results?)

Monochromatic scheme — same hue, varying lightness.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `results` | `number` | `6` | Number of colors to return |

**Returns**: `XColor[]`

```ts
xcolor('#ff0000').monochromatic().map(c => c.toHex())
// 6 shades of red from dark to light
```
