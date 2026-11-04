# xyz

CIE XYZ color space support. XYZ is the foundation of all CIE color spaces and serves as an intermediate bridge for conversions between different color spaces.

Inputs are converted to sRGB and clipped to its gamut. Values outside sRGB lose information during a round trip.

## Install

```ts
import xcolor from '@xpyjs/color'
import xyzPlugin from '@xpyjs/color/plugins/xyz'

xcolor.use(xyzPlugin)
```

## Methods

### toXyz(illuminant?)

Returns an XYZ object. Uses the D65 illuminant by default.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `illuminant` | `'D65'` \| `'D50'` | `'D65'` | Reference illuminant |

```ts
xcolor('#ff0000').toXyz()
// { x: 0.4124, y: 0.2126, z: 0.0193 } (D65)

xcolor('#ff0000').toXyz('D50')
// { x: 0.436, y: 0.2225, z: 0.0139 }
```

### toXyzString(illuminant?)

Returns a `color(xyz ...)` format string.

```ts
xcolor('#ff0000').toXyzString()
// 'color(xyz-d65 0.4124 0.2126 0.0193)'

xcolor('#ff0000').toXyzString('D50')
// 'color(xyz-d50 0.436 0.2225 0.0139)'
```

## Input Parsing

```ts
xcolor('color(xyz 0.4124 0.2126 0.0193)').toHex()
xcolor('color(xyz-d65 0.4124 0.2126 0.0193)').toHex()
xcolor('color(xyz-d50 0.4360 0.2225 0.0139)').toHex()
```

## Formatting

```ts
xcolor('#ff0000').toString('xyz')  // 'color(xyz-d65 0.4124 0.2126 0.0193)'
```

## Preserve the original coordinates

Use the plugin's named exports for a wide-gamut value that stays in its original space. `parseWideColor(input)` returns `{ space, coordinates, alpha }` or `null`. `formatWideColor(record)` serializes those coordinates, and `toSrgb(record)` explicitly converts and clips them. Calling these functions needs no plugin registration.
