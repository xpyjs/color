# oklab / oklch

Oklab and Oklch modern perceptual color space support. Oklab is an improved version of Lab with better perceptual uniformity, making it especially suitable for gradients and color interpolation.

## Install

```ts
import xcolor from '@xpyjs/color'
import oklabPlugin from '@xpyjs/color/plugins/oklab'

xcolor.use(oklabPlugin)
```

## Oklab Methods

### toOklab()

Returns an Oklab object.

- `l`: Lightness (0–1)
- `a`: Green-red axis (approximately -0.4 to 0.4)
- `b`: Blue-yellow axis (approximately -0.4 to 0.4)

```ts
xcolor('#ff0000').toOklab()
// { l: 0.63, a: 0.22, b: 0.13 }
```

### toOklabString()

Returns an `oklab()` format string.

```ts
xcolor('#ff0000').toOklabString()
// 'oklab(0.63 0.22 0.13)'
```

## Oklch Methods

### toOklch()

Returns an Oklch object (the polar coordinate form of Oklab).

- `l`: Lightness (0–1)
- `c`: Chroma
- `h`: Hue (0–360)

```ts
xcolor('#ff0000').toOklch()
// { l: 0.63, c: 0.26, h: 29.23 }
```

### toOklchString()

Returns an `oklch()` format string.

```ts
xcolor('#ff0000').toOklchString()
// 'oklch(0.63 0.26 29.23)'
```

## Input Parsing

```ts
xcolor('oklab(0.63 0.22 0.13)').toHex()
xcolor('oklch(0.63 0.26 29.23)').toHex()
```

## Formatting

```ts
xcolor('#ff0000').toString('oklab')  // 'oklab(0.63 0.22 0.13)'
xcolor('#ff0000').toString('oklch')  // 'oklch(0.63 0.26 29.23)'
```
