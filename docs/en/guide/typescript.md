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

Official plugins include `declare module` declarations — types are available automatically after import:

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
