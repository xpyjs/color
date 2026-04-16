# Getting Started

`@xpyjs/color` (abbreviated as **xcolor**) is a lightweight, fast, zero-dependency JavaScript / TypeScript color manipulation library. The core is about 4 KB (gzip), supports chaining, unified Getter/Setter design, and a flexible plugin system.

## Environment Requirements

- **Node.js** ≥ 14.0 (supports ES2015)
- All modern browsers (Chrome, Firefox, Safari, Edge, etc.)
- Deno, Bun, and other runtimes can be used directly

xcolor does not depend on any third-party packages and can run in any JavaScript environment that supports ES2015.

## Installation

::: code-group

```sh [npm]
npm install @xpyjs/color
```

```sh [pnpm]
pnpm add @xpyjs/color
```

```sh [yarn]
yarn add @xpyjs/color
```

```sh [bun]
bun add @xpyjs/color
```

:::

For more installation methods (CDN, UMD, Deno, etc.), see [Installation](/en/guide/installation).

## First Example

```ts
import xcolor from '@xpyjs/color'

// Create a color
const color = xcolor('#3498db')

// Get different formats
color.toHex()       // '#3498db'
color.toRgbString() // 'rgb(52, 152, 219)'
color.toHslString() // 'hsl(204, 70%, 53%)'

// Chain operations
color.lighten(20).saturate(10).toHex()
```

`xcolor()` is a factory function — pass in a color value to create an instance, no `new` needed. All manipulation methods return the current instance, enabling natural chaining.

## Three Core Designs

### Mutable Instances

All manipulation methods **modify the instance in place**. When you need to preserve the original color, call `.clone()` first:

```ts
const original = xcolor('#ff0000')
const copy = original.clone()

copy.lighten(30)
original.toHex() // '#ff0000' — unchanged
copy.toHex()     // '#ff9999'
```

### Getter / Setter in One

The same method reads without arguments and writes with arguments:

```ts
const c = xcolor('#ff0000')
c.red()      // 255   — read
c.red(128)   // this  — write, returns instance for continued chaining
```

### On-demand Plugin Loading

The core library stays lean; advanced features are extended through plugins:

```ts
import xcolor from '@xpyjs/color'
import harmony from '@xpyjs/color/plugins/harmony'

xcolor.use(harmony)
xcolor('#ff6600').triad() // triad color scheme
```

Multiple official plugins are available, covering color space conversions, color schemes, color vision simulation, and more. See [Plugin System](/en/guide/plugins) for details.

## Next Steps

- [Installation](/en/guide/installation) — Complete installation methods and compatibility notes
- [Create Color](/en/guide/create-color) — All supported input formats
- [Manipulation](/en/guide/manipulation) — lighten, darken, mix, and more with visual demos
- [Plugin System](/en/guide/plugins) — On-demand loading of advanced features
