# lab / lch

CIE Lab and CIE LCH perceptual color space support. Lab is designed based on human visual perception and is commonly used for color difference calculations.

## Install

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
```

## Lab Methods

### toLab()

Returns a Lab object.

- `l`: Lightness (0–100)
- `a`: Green-red axis (approximately -128 to 127)
- `b`: Blue-yellow axis (approximately -128 to 127)

```ts
xcolor('#ff0000').toLab()
// { l: 53.23, a: 80.11, b: 67.22 }
```

### toLabString()

Returns a `lab()` format string.

```ts
xcolor('#ff0000').toLabString()
// 'lab(53.23 80.11 67.22)'
```

## LCH Methods

### toLch()

Returns an LCH object. LCH is the polar coordinate form of Lab.

- `l`: Lightness (0–100)
- `c`: Chroma
- `h`: Hue (0–360)

```ts
xcolor('#ff0000').toLch()
// { l: 53.23, c: 104.55, h: 40.0 }
```

### toLchString()

Returns an `lch()` format string.

```ts
xcolor('#ff0000').toLchString()
// 'lch(53.23 104.55 40.0)'
```

## Color Difference

### deltaE(other)

Calculates the CIE76 color difference (Euclidean distance) between the current color and another color. Smaller values indicate closer colors.

| Parameter | Type | Description |
| --- | --- | --- |
| `other` | `XColorInput` | Target color for comparison |

```ts
xcolor('#ff0000').deltaE('#ff0100')  // ≈ 0.5 (nearly identical)
xcolor('#ff0000').deltaE('#0000ff')  // ≈ 176 (vastly different)
```

::: tip Color Difference Reference

| ΔE Range | Perceived Difference |
| --- | --- |
| 0–1 | Nearly imperceptible |
| 1–2 | Distinguishable upon close observation |
| 2–10 | Noticeable at a glance |
| 11–49 | Similar colors |
| 50+ | Completely different |
:::

## Input Parsing

```ts
xcolor('lab(53.23 80.11 67.22)').toHex()   // '#ff0000'
xcolor('lch(53.23 104.55 40.0)').toHex()   // '#ff0000'
```

## Formatting

```ts
xcolor('#ff0000').toString('lab')  // 'lab(53.23 80.11 67.22)'
xcolor('#ff0000').toString('lch')  // 'lch(53.23 104.55 40.0)'
```
