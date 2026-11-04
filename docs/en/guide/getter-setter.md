# Getter / Setter

Channel methods in xcolor serve as both getter and setter — call without arguments to read, with arguments to set:

```ts
const color = xcolor('#ff6600')

color.red()     // 255 — getter
color.red(200)  // setter, returns this for chaining
color.red()     // 200
```

## RGB Channels

<SvgRgbChannels />

### red() / r()

Get or set the red channel (0–255).

```ts
xcolor('#3b82f6').red()    // 59
xcolor('#3b82f6').red(200) // set red to 200
xcolor('#3b82f6').r()      // 59 — alias
```

### green() / g()

Get or set the green channel (0–255).

```ts
xcolor('#3b82f6').green()    // 130
xcolor('#3b82f6').green(255) // set green to 255
```

### blue() / b()

Get or set the blue channel (0–255).

```ts
xcolor('#3b82f6').blue()   // 246
xcolor('#3b82f6').blue(0)  // set blue to 0
```

### alpha() / a() / opacity()

Get or set the opacity (0–1).

```ts
xcolor('#3b82f6').alpha()    // 1
xcolor('#3b82f6').alpha(0.5) // set to semi-transparent
xcolor('#3b82f680').a()      // ≈ 0.5 — 8-digit hex parses alpha (128 / 255)
```

## HSL Channels

<SvgHslCylinder />

### hue() / h()

Get or set the hue (0–360).

```ts
xcolor('#ff0000').hue()    // 0
xcolor('#ff0000').hue(120) // becomes green
```

### saturation() / s()

Get or set the HSL saturation (0–100).

```ts
xcolor('#ff0000').saturation()   // 100
xcolor('#ff0000').saturation(50) // reduce saturation
```

### lightness() / l()

Get or set the HSL lightness (0–100).

```ts
xcolor('#ff0000').lightness()   // 50
xcolor('#ff0000').lightness(80) // lighten
```

## HSV Channels

<SvgHsvCone />

### value() / v()

Get or set the HSV value/brightness (0–100).

```ts
xcolor('#ff0000').value()   // 100
xcolor('#ff0000').value(50) // reduce brightness
```

::: info
`hue()` is the same angle in HSL and HSV. `saturation()` is the **HSL saturation**; read/write HSV saturation through the `hsv()` object, and use `value()` for HSV brightness.
:::

## Compound Getter / Setter

### rgb(r, g, b)

Without arguments, returns an `{ r, g, b, a }` object. With arguments, sets channels; omitted channels keep their current values:

```ts
xcolor('#ff0000').rgb()           // { r: 255, g: 0, b: 0, a: 1 }
xcolor('#ff0000').rgb(0, 128, 255) // set all three channels
```

### hsl(h, s, l)

Without arguments, returns an `{ h, s, l, a }` object. With arguments, sets channels; omitted channels keep their current values:

```ts
xcolor('#ff0000').hsl()          // { h: 0, s: 100, l: 50, a: 1 }
xcolor('#ff0000').hsl(210, 80, 60)
```

### hsv(h, s, v)

Without arguments, returns an `{ h, s, v, a }` object. With arguments, sets channels; omitted channels keep their current values:

```ts
xcolor('#ff0000').hsv()            // { h: 0, s: 100, v: 100, a: 1 }
xcolor('#ff0000').hsv(120, 100, 80)
```

### hex(value)

Without arguments, returns a hex string: 6 digits when fully opaque, 8 digits when alpha < 1. With an argument, sets the color from a hex string:

```ts
xcolor('#ff0000').hex()        // '#ff0000'
xcolor('#ff0000').hex('#00ff00') // becomes green
```

## Alias Summary

All aliases are fully equivalent to the original methods — use whichever feels more natural to you:

| Method | Alias |
| --- | --- |
| `red()` | `r()` |
| `green()` | `g()` |
| `blue()` | `b()` |
| `alpha()` | `a()`, `opacity()` |
| `hue()` | `h()` |
| `saturation()` | `s()` |
| `lightness()` | `l()` |
| `value()` | `v()` |

## Chaining Example

Getter/setter methods and manipulation methods can be freely combined:

```ts
xcolor('#ff0000')
  .hue(210)           // set hue
  .saturation(80)     // set saturation
  .lighten(10)        // manipulation method
  .alpha(0.9)         // set opacity
  .toRgbString()      // final output
```
