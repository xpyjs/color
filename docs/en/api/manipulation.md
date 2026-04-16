# Color Manipulation

All manipulation methods **modify the instance in place** and return `this`, supporting method chaining. If you need to preserve the original color, call `.clone()` first.

## Brightness

### lighten(amount?) {#lighten}

Increase HSL lightness. `amount` is in percentage points (0–100), default `10`.

```ts
xcolor('#ff0000').lighten(20).toHex()  // '#ff6666'
```

### darken(amount?) {#darken}

Decrease HSL lightness. Default `10`.

```ts
xcolor('#ff0000').darken(20).toHex()  // '#990000'
```

### brighten(amount?) {#brighten}

Push each channel toward 255 in RGB space. Default `10`, range 0–100.

```ts
xcolor('#ff0000').brighten(50).toHex()  // '#ff8080'
```

## Saturation

### saturate(amount?) {#saturate}

Increase HSL saturation. Default `10`, range 0–100.

```ts
xcolor('#bf4040').saturate(40).toHex()  // '#ff0000'
```

### desaturate(amount?) {#desaturate}

Decrease HSL saturation. Default `10`.

```ts
xcolor('#ff0000').desaturate(50).toHex()  // '#bf4040'
```

### grayscale() {#grayscale}

Fully desaturate, equivalent to `desaturate(100)`.

Alias: `greyscale()`

```ts
xcolor('#ff0000').grayscale().toHex()  // '#808080'
```

## Hue

### spin(degrees) {#spin}

Rotate the hue on the HSL color wheel. Supports positive and negative values, automatically wraps at 360°.

Alias: `rotate()`

```ts
xcolor('#ff0000').spin(120).toHex()   // '#00ff00'
xcolor('#ff0000').spin(-120).toHex()  // '#0000ff'
```

## Inversion

### negate() {#negate}

Invert each RGB channel (`255 - channel`), alpha remains unchanged.

Alias: `invert()`

```ts
xcolor('#ff0000').negate().toHex()  // '#00ffff'
```

## Opacity

### fade(amount?) {#fade}

Decrease opacity. Alpha is reduced by `amount / 100`, default `10`.

Alias: `fadeOut()`

```ts
xcolor('#ff0000').fade(50).alpha()  // 0.5
```

### opaquer(amount?) {#opaquer}

Increase opacity. Alpha is increased by `amount / 100`, default `10`.

Alias: `fadeIn()`

```ts
xcolor('rgba(255,0,0,0.5)').opaquer(30).alpha()  // 0.8
```

## Mixing

### mix(color, amount?) {#mix}

Linearly mix with another color in RGB space. `amount` is the weight of the target color (0–100), default `50`.

```ts
xcolor('#ff0000').mix('#0000ff', 50).toHex()  // '#800080'
```

### tint(amount?) {#tint}

Mix with white. `amount` is the weight of white (0–100), default `50`.

```ts
xcolor('#ff0000').tint(50).toHex()  // '#ff8080'
```

### shade(amount?) {#shade}

Mix with black. `amount` is the weight of black (0–100), default `50`.

```ts
xcolor('#ff0000').shade(50).toHex()  // '#800000'
```

## Method Signature Summary

| Method | Param | Default | Returns | Alias |
| --- | --- | --- | --- | --- |
| `lighten(amount?)` | 0–100 | 10 | `this` | — |
| `darken(amount?)` | 0–100 | 10 | `this` | — |
| `brighten(amount?)` | 0–100 | 10 | `this` | — |
| `saturate(amount?)` | 0–100 | 10 | `this` | — |
| `desaturate(amount?)` | 0–100 | 10 | `this` | — |
| `grayscale()` | — | — | `this` | `greyscale()` |
| `spin(degrees)` | any number | — | `this` | `rotate()` |
| `negate()` | — | — | `this` | `invert()` |
| `fade(amount?)` | 0–100 | 10 | `this` | `fadeOut()` |
| `opaquer(amount?)` | 0–100 | 10 | `this` | `fadeIn()` |
| `mix(color, amount?)` | 0–100 | 50 | `this` | — |
| `tint(amount?)` | 0–100 | 50 | `this` | — |
| `shade(amount?)` | 0–100 | 50 | `this` | — |
