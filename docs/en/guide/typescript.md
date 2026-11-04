# TypeScript

xcolor is written in TypeScript and ships with full type declarations. No `@types` package needed.

## Type Imports

```ts
import xcolor, { XColor } from '@xpyjs/color'
import type { RGBA, HSLA, HSVA, XColorInput, XColorOptions } from '@xpyjs/color'
```

### Common Types

| Type | Description |
| --- | --- |
| `XColor` | Color instance class |
| `XColorInput` | Union of all accepted input types |
| `XColorOptions` | Configuration options |
| `RGBA` | `{ r, g, b, a }` |
| `HSLA` | `{ h, s, l, a }` |
| `HSVA` | `{ h, s, v, a }` |

### Function Parameter Typing

```ts
import type { XColorInput } from '@xpyjs/color'

function getContrastColor(input: XColorInput): string {
  const c = xcolor(input)
  return c.isLight() ? '#000000' : '#ffffff'
}
```

## Plugin Type Augmentation

Importing a plugin exposes its module augmentation to TypeScript. Register it with `xcolor.use()` before calling the methods at runtime.

```ts
import labPlugin from '@xpyjs/color/plugins/lab'
xcolor.use(labPlugin)

xcolor('#ff0000').toLab()  // typed as { l: number, a: number, b: number }
```

## XColorPlugin Type

For plugin authors:

```ts
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin<{ threshold: number }> = {
  name: 'my-plugin',
  install(option, cls, factory) {
    // option is typed as { threshold: number }
  }
}
```

## ESM, CommonJS, and troubleshooting

The CommonJS declaration entry uses `resolution-mode` in an `import type`, so it needs TypeScript 4.7 or later (verified with 4.9 and 5.9).

```ts
// example.mts
import xcolor from '@xpyjs/color'
import lab from '@xpyjs/color/plugins/lab'
xcolor.use(lab)
xcolor('#f00').toLab()
```

```ts
// example.cts
import xcolor = require('@xpyjs/color')
import lab = require('@xpyjs/color/plugins/lab')
xcolor.use(lab)
xcolor('#f00').toLab()
```

Within a Node process, the two entry points share the class and plugin state. Between workers or separate bundle instances, send a color string or channels and reconstruct the instance. If the IDE offers a plugin method but calling it fails at runtime, check that `use()` ran in that runtime. If a native browser module cannot resolve `@xpyjs/color`, use the import map shown in the installation guide.
