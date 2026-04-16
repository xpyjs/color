# Chaining

<SvgChainFlow />

All manipulation methods in xcolor return the instance itself (`this`), so you can chain multiple operations in sequence:

```ts
import xcolor from '@xpyjs/color'

const result = xcolor('#ff0000')
  .lighten(10)
  .saturate(20)
  .spin(30)
  .fade(15)
  .toHex()

// Multiple steps in one line, no intermediate variables needed
```

## Mutable Design

All manipulation methods in xcolor **modify the instance in place**. This means every step in the chain operates on the same object:

```ts
const color = xcolor('#ff0000')
color.lighten(20)

// color itself has changed — it's not a new object
color.toHex() // '#ff6666', no longer '#ff0000'
```

This design avoids frequent object creation and makes chaining more natural.

## Preserving the Original with clone()

When you want to create multiple variants from the same base color, call `.clone()` before applying operations:

```ts
const brand = xcolor('#6366f1')

// Generate a set of color variants without affecting the original
const light    = brand.clone().lighten(20).toHex()  // '#a5a7f6'
const dark     = brand.clone().darken(20).toHex()   // '#2f3193'
const muted    = brand.clone().desaturate(30).toHex()
const inverted = brand.clone().negate().toHex()

brand.toHex() // '#6366f1' — always unchanged
```

::: tip Rule of Thumb
If you need to branch multiple chains from the same color, `.clone()` at the fork. If you're just processing one color sequentially, no clone is needed.
:::

## Mixing Reads and Operations

Getter methods (such as `toHex()`, `luminance()`, `isLight()`) do not modify the instance and can be safely called at any point in the chain. However, note that they don't return the instance, so they must be placed at the end of the chain:

```ts
// ✅ Getter at the end
xcolor('#ff0000').lighten(20).spin(30).toHex()

// ✅ When you need to read a value mid-chain, use a separate statement
const color = xcolor('#ff0000').lighten(20)
console.log(color.luminance())  // read luminance
color.spin(30)                  // continue operating
```

## Combining Getter/Setter

Channel methods (`red()`, `hue()`, etc.) support both getter and setter modes. In setter mode they also return the instance, so they can be included in a chain:

```ts
xcolor('#ff0000')
  .hue(210)       // setter: set hue to 210°
  .lightness(60)  // setter: set lightness to 60%
  .alpha(0.8)     // setter: set opacity
  .toRgbString()  // 'rgba(77, 136, 230, 0.8)'
```

## Practical Examples

### Generating Button State Colors

```ts
const base = xcolor('#3b82f6')

const states = {
  default: base.toHex(),
  hover:   base.clone().lighten(8).toHex(),
  active:  base.clone().darken(8).toHex(),
  disabled: base.clone().desaturate(60).lighten(20).toHex()
}
```

### Theme Palette

```ts
const primary = xcolor('#6366f1')

const theme = {
  primary:    primary.toHex(),
  onPrimary:  primary.isLight() ? '#000' : '#fff',
  surface:    primary.clone().lighten(40).desaturate(50).toHex(),
  border:     primary.clone().lighten(30).fade(50).toRgbString()
}
```

::: info
Chaining combined with [plugins](/en/guide/plugins) becomes even more powerful. For example, the `gradient` plugin's `.gradient()` and the `harmony` plugin's `.analogous()` return arrays, making them ideal for reading at the end of a chain.
:::
