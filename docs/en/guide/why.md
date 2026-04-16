# Why xcolor

Color manipulation is a common need in frontend development and design tools. While there are many color libraries out there, xcolor aims to strike a balance between **bundle size, API friendliness, and extensibility**.

## Core Features

### Extremely Lightweight

Core library is about **15 KB** min / **5 KB** gzip.

### Chainable + Mutable Instance

All xcolor manipulation methods modify the instance in place and return `this`, supporting fluent chaining:

```ts
xcolor('#3498db')
  .saturate(20)
  .spin(45)
  .lighten(10)
  .toHex() // multiple operations in one line
```

Use `.clone()` when you need to preserve the original value.

### Getter / Setter in One

Unlike many libraries that separate get and set into different methods or properties, xcolor uses the same method name for both roles:

```ts
color.red()      // → 255           getter
color.red(128)   // → this (chain)   setter
```

Short methods are also available: `r()`, `g()`, `b()`, `a()`, `h()`, `s()`, `l()`, `v()`.

### Plugin System

The core only includes the most commonly used features (RGB/HSL/HSV conversion, basic operations, queries). CMYK, Lab, color schemes, color vision simulation, etc. are loaded on demand through official plugins, without adding unnecessary bundle size:

```ts
import xcolor from '@xpyjs/color'
import lab from '@xpyjs/color/plugins/lab'

xcolor.use(lab)
xcolor('#ff0000').toLab() // { l: 53.23, a: 80.11, b: 67.22 }
```

Multiple official plugins are available, covering 10+ color spaces and various utility features. Development templates are also provided, making it easy for users to create and share their own plugins.

### Native TypeScript Support

The library is written in TypeScript with complete built-in type declarations. Plugins extend types via `declare module`, and method signatures take effect automatically after installing a plugin. Methods from uninstalled plugins will correctly report type errors in the editor.

## Use Cases

- **Frontend UI Development** — Dynamic themes, color conversion, contrast checking
- **Design Systems** — Generate color schemes, color scales
- **Data Visualization** — Gradient colors, color interpolation
- **Accessibility Compliance** — WCAG contrast ratio validation
- **Node.js Tools** — Color format conversion, batch processing
