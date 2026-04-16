# Output

xcolor provides multiple methods to serialize color instances into different formats.

## Hex

```ts
const c = xcolor('#ff6600')

c.toHex()             // '#ff6600'
c.toHex(true)         // '#f60'        — allows 3-digit short format
c.toHex(false, true)  // '#ff6600ff'   — force include alpha
```

Automatically outputs 8-digit format when alpha channel is present:

```ts
xcolor('rgba(255,0,0,0.5)').toHex()  // '#ff000080'
```

`hex()` is an alias for `toHex()`. Without arguments it returns the hex string; with an argument it acts as a setter (see [Getter / Setter](/en/guide/getter-setter)).

`toHexString()` is also an alias for `toHex()`.

## RGB

```ts
const c = xcolor('#ff6600')

c.toRgb()          // { r: 255, g: 102, b: 0, a: 1 }
c.toRgbString()    // 'rgb(255, 102, 0)'
c.toRgbArray()     // [255, 102, 0, 1]
```

When alpha is not 1, the string format automatically switches to `rgba()`:

```ts
xcolor('#ff6600').alpha(0.5).toRgbString() // 'rgba(255, 102, 0, 0.5)'
```

## HSL

```ts
const c = xcolor('#ff6600')

c.toHsl()          // { h: 24, s: 100, l: 50, a: 1 }
c.toHslString()    // 'hsl(24, 100%, 50%)'
```

## HSV

```ts
const c = xcolor('#ff6600')

c.toHsv()          // { h: 24, s: 100, v: 100, a: 1 }
c.toHsvString()    // 'hsv(24, 100%, 100%)'
```

## Number

Convert to a 24-bit integer (excluding alpha):

```ts
xcolor('#ff0000').toNumber() // 16711680 (i.e. 0xFF0000)
xcolor('#0000ff').toNumber() // 255      (i.e. 0x0000FF)
```

## Object

`toObject()` is an alias for `toRgb()`:

```ts
xcolor('#ff0000').toObject() // { r: 255, g: 0, b: 0, a: 1 }
```

## toString — Universal Formatting

`toString()` is the most flexible output method. Without arguments, opaque colors return hex, and semi-transparent colors return rgba:

```ts
xcolor('#ff0000').toString()                  // '#ff0000'
xcolor('rgba(255,0,0,0.5)').toString()        // 'rgba(255, 0, 0, 0.5)'
```

Pass a format key to specify the output:

```ts
const c = xcolor('#ff0000')

c.toString('hex')   // '#ff0000'
c.toString('hex3')  // '#f00'
c.toString('hex8')  // '#ff0000ff'
c.toString('rgb')   // 'rgb(255, 0, 0)'
c.toString('hsl')   // 'hsl(0, 100%, 50%)'
c.toString('hsv')   // 'hsv(0, 100%, 100%)'
```

`format()` is an alias for `toString()`.

### Plugin Extended Formats

After installing plugins, `toString()` supports additional format keys:

```ts
import cmyk from '@xpyjs/color/plugins/cmyk'
xcolor.use(cmyk)

xcolor('#ff0000').toString('cmyk') // 'cmyk(0%, 100%, 100%, 0%)'
```

Supported plugin format keys include: `cmyk`, `lab`, `lch`, `oklab`, `oklch`, `hwb`, `a98Rgb`, `displayP3`, `proPhotoRgb`, `rec2020`, `xyz`, `percentageRgb`, `name`, etc.

## Built-in Format Keys Reference

| Format Key | Output Example | Description |
| --- | --- | --- |
| `hex` | `#ff0000` | Default 6-digit hex |
| `hex3` | `#f00` | 3-digit short format (only when color is compressible) |
| `hex8` | `#ff0000ff` | 8-digit with alpha |
| `rgb` | `rgb(255, 0, 0)` | CSS rgb/rgba |
| `hsl` | `hsl(0, 100%, 50%)` | CSS hsl/hsla |
| `hsv` | `hsv(0, 100%, 100%)` | HSV format |
