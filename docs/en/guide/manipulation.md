# Manipulation

xcolor provides a series of manipulation methods based on HSL and RGB color spaces. All manipulation methods **modify the instance in place** and return `this`, supporting chaining.

::: tip
If you need to preserve the original color, call `.clone()` first.
:::

## Brightness

<SvgLightenDarken />

### lighten(amount)

Increase HSL lightness. `amount` is the percentage points to add, default `10`, range 0–100.

```ts
xcolor('#ff0000').lighten(20).toHex() // '#ff6666'
xcolor('#ff0000').lighten().toHex()   // '#ff3333' (default +10)
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">lighten(20)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #ff6666"></div>
</div>

### darken(amount)

Decrease HSL lightness. Equivalent to `lighten(-amount)`, default `10`.

```ts
xcolor('#ff0000').darken(20).toHex() // '#990000'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">darken(20)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #990000"></div>
</div>

### brighten(amount)

<SvgBrighten />

Push each RGB channel toward 255 directly in RGB space. Unlike `lighten`, `brighten` does not go through HSL conversion, producing a more "whitened" effect. Default `10`, range 0–100.

```ts
xcolor('#ff0000').brighten(50).toHex() // '#ff8080'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">brighten(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #ff8080"></div>
</div>

## Saturation

<SvgSaturation />

### saturate(amount)

Increase HSL saturation. Default `10`, range 0–100.

```ts
xcolor('#bf4040').saturate(40).toHex() // '#ff0000'
```

### desaturate(amount)

Decrease HSL saturation. Equivalent to `saturate(-amount)`, default `10`.

```ts
xcolor('#ff0000').desaturate(50).toHex() // '#bf4040'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">desaturate(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #bf4040"></div>
</div>

### grayscale()

<SvgGrayscale />

Fully desaturate, equivalent to `desaturate(100)`. Alias: `greyscale()`.

```ts
xcolor('#ff0000').grayscale().toHex() // '#808080'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">grayscale()</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #808080"></div>
</div>

## Hue Rotation

<SvgColorWheel />

### spin(degrees)

Rotate hue on the HSL color wheel. Accepts positive or negative degrees, automatically wraps at 360°. Alias: `rotate()`.

```ts
xcolor('#ff0000').spin(120).toHex()  // '#00ff00' — rotate 120°
xcolor('#ff0000').spin(-120).toHex() // '#0000ff' — rotate -120°
xcolor('#ff0000').spin(180).toHex()  // '#00ffff' — complementary color
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">spin(120)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #00ff00"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">spin(120)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
</div>

## Inversion

<SvgNegate />

### negate()

Invert each RGB channel (`255 - channel`), alpha remains unchanged. Alias: `invert()`.

```ts
xcolor('#ff0000').negate().toHex() // '#00ffff'
xcolor('#ffffff').negate().toHex() // '#000000'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">negate()</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #00ffff"></div>
</div>

## Opacity

<SvgAlpha />

### fade(amount)

Decrease opacity (make more transparent). Alpha reduced by `amount / 100`, default `10`. Alias: `fadeOut()`.

```ts
xcolor('#ff0000').fade(50).alpha()   // 0.5
```

### opaquer(amount)

Increase opacity. Alpha increased by `amount / 100`, default `10`. Alias: `fadeIn()`.

```ts
xcolor('rgba(255,0,0,0.5)').opaquer(30).alpha() // 0.8
```

## Mixing

<SvgMixTintShade />

### mix(color, amount)

Linear interpolation with another color in RGB space. `amount` is the weight of the target color (0–100), default `50`.

- `0` = fully keep current color
- `50` = equal mix
- `100` = fully become target color

```ts
xcolor('#ff0000').mix('#0000ff', 50).toHex() // '#800080' — purple
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">+</span>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">mix(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #800080"></div>
</div>

### tint(amount)

Mix with white. `amount` is white's weight, default `50`.

```ts
xcolor('#ff0000').tint(50).toHex()  // '#ff8080'
xcolor('#ff0000').tint(100).toHex() // '#ffffff'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">tint(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #ff8080"></div>
</div>

### shade(amount)

Mix with black. `amount` is black's weight, default `50`.

```ts
xcolor('#ff0000').shade(50).toHex()  // '#800000'
xcolor('#ff0000').shade(100).toHex() // '#000000'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">shade(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #800000"></div>
</div>

## Quick Reference

| Method | Default | Color Space | Description | Alias |
| --- | --- | --- | --- | --- |
| `lighten(amount)` | 10 | HSL | Increase lightness | — |
| `darken(amount)` | 10 | HSL | Decrease lightness | — |
| `brighten(amount)` | 10 | RGB | Push channels toward 255 | — |
| `saturate(amount)` | 10 | HSL | Increase saturation | — |
| `desaturate(amount)` | 10 | HSL | Decrease saturation | — |
| `grayscale()` | — | HSL | Fully desaturate | `greyscale()` |
| `spin(degrees)` | — | HSL | Rotate hue | `rotate()` |
| `negate()` | — | RGB | Invert | `invert()` |
| `fade(amount)` | 10 | — | Decrease opacity | `fadeOut()` |
| `opaquer(amount)` | 10 | — | Increase opacity | `fadeIn()` |
| `mix(color, amount)` | 50 | RGB | Mix with any color | — |
| `tint(amount)` | 50 | RGB | Mix with white | — |
| `shade(amount)` | 50 | RGB | Mix with black | — |

Want richer color operations? Check out the [Plugin System](/en/guide/plugins) — the blend plugin provides 11 blend modes, and the scale plugin supports color space interpolation with easing functions.
