# Color Output

Convert `XColor` instances to various formats. All output methods are read-only operations and do not modify the instance.

## Hex

### toHex(allow3Char?, forceAlpha?) {#toHex}

Returns a hex string.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `allow3Char` | `boolean` | `false` | Allow shorthand 3-digit format (`#f00`) |
| `forceAlpha` | `boolean` | `false` | Force 8-digit output (with alpha) |

```ts
xcolor('#ff0000').toHex()              // '#ff0000'
xcolor('#ff0000').toHex(true)          // '#f00'
xcolor('#ff0000').toHex(false, true)   // '#ff0000ff'
xcolor('rgba(255,0,0,0.5)').toHex()   // '#ff000080' (auto 8-digit when alpha < 1)
```

Aliases: `toHexString()`, `hex()`

## RGB

### toRgb() {#toRgb}

Returns a `{ r, g, b, a }` object.

```ts
xcolor('#ff0000').toRgb()  // { r: 255, g: 0, b: 0, a: 1 }
```

Alias: `toObject()`

### toRgbString() {#toRgbString}

Returns an `rgb()` or `rgba()` string. Automatically uses `rgba()` when alpha < 1.

```ts
xcolor('#ff0000').toRgbString()             // 'rgb(255, 0, 0)'
xcolor('rgba(255,0,0,0.5)').toRgbString()   // 'rgba(255, 0, 0, 0.5)'
```

### toRgbArray() {#toRgbArray}

Returns a `[r, g, b, a]` array.

```ts
xcolor('#ff0000').toRgbArray()  // [255, 0, 0, 1]
```

## HSL

### toHsl() {#toHsl}

Returns a `{ h, s, l, a }` object.

```ts
xcolor('#ff0000').toHsl()  // { h: 0, s: 100, l: 50, a: 1 }
```

### toHslString() {#toHslString}

Returns an `hsl()` or `hsla()` string.

```ts
xcolor('#ff0000').toHslString()  // 'hsl(0, 100%, 50%)'
```

## HSV

### toHsv() {#toHsv}

Returns a `{ h, s, v, a }` object.

```ts
xcolor('#ff0000').toHsv()  // { h: 0, s: 100, v: 100, a: 1 }
```

### toHsvString() {#toHsvString}

Returns an `hsv()` string.

```ts
xcolor('#ff0000').toHsvString()  // 'hsv(0, 100%, 100%)'
```

## Number

### toNumber() {#toNumber}

Returns a 24-bit integer. Does not include alpha information.

```ts
xcolor('#ff0000').toNumber()  // 16711680 (0xff0000)
xcolor('#0000ff').toNumber()  // 255
```

## General Formatting

### toString(format?) {#toString}

Without arguments, the default output is:

- Has alpha (< 1) → `rgba()` string
- No alpha → `hex` string

Pass a format argument to output a specific format:

```ts
xcolor('#ff0000').toString()        // '#ff0000'
xcolor('#ff0000').toString('rgb')   // 'rgb(255, 0, 0)'
xcolor('#ff0000').toString('hsl')   // 'hsl(0, 100%, 50%)'
xcolor('#ff0000').toString('hsv')   // 'hsv(0, 100%, 100%)'
```

Alias: `format()`

### Built-in Format Keys

| Key | Output |
| --- | --- |
| `'hex'` | `#ff0000` |
| `'hex3'` | `#f00` (allows shorthand) |
| `'hex8'` | `#ff0000ff` (forces alpha) |
| `'rgb'` | `rgb(255, 0, 0)` |
| `'hsl'` | `hsl(0, 100%, 50%)` |
| `'hsv'` | `hsv(0, 100%, 100%)` |

Plugins can extend additional formats. For example, after registering the `cmyk` plugin, you can use `toString('cmyk')`.
