# Installation

## Package Managers

xcolor is published on npm and can be installed via any mainstream package manager:

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

After installation, import it as an ES Module in your project:

```ts
import xcolor from '@xpyjs/color'

const c = xcolor('#ff0000')
```

## CDN

If you don't use a build tool, you can include it directly in HTML via CDN.

### ES Module (Recommended)

```html
<script type="module">
  import xcolor from 'https://esm.sh/@xpyjs/color'

  console.log(xcolor('#ff0000').toRgbString())
</script>
```

You can also use unpkg or jsDelivr:

```
https://unpkg.com/@xpyjs/color/dist/index.esm.js
https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/index.esm.js
```

### UMD (Global Variable)

```html
<script src="https://unpkg.com/@xpyjs/color/dist/index.umd.js"></script>
<script>
  // UMD mounts xcolor on window
  const c = xcolor('#ff0000')
  console.log(c.toHex())
</script>
```

The UMD version mounts `xcolor` as a `window.xcolor` global variable, ready to use directly.

## Deno

Deno can import via the npm: protocol or esm.sh:

```ts
// npm: protocol (Deno ≥ 1.28)
import xcolor from 'npm:@xpyjs/color'

// Or use esm.sh
import xcolor from 'https://esm.sh/@xpyjs/color'
```

## Node.js CommonJS

If your project uses the CommonJS module system:

```js
const xcolor = require('@xpyjs/color').default
// or
const { xcolor } = require('@xpyjs/color')
```

## Plugin Installation

xcolor's official plugins are provided via subpath imports, no additional installation needed:

```ts
import harmony from '@xpyjs/color/plugins/harmony'
import gradient from '@xpyjs/color/plugins/gradient'

xcolor.use(harmony)
xcolor.use(gradient)
```

In CDN scenarios, import from the corresponding subpath:

```html
<script type="module">
  import xcolor from 'https://esm.sh/@xpyjs/color'
  import harmony from 'https://esm.sh/@xpyjs/color/plugins/harmony'

  xcolor.use(harmony)
</script>
```

## Build Artifacts

| File Path | Format | Use Case |
| --- | --- | --- |
| `dist/index.esm.js` | ES Module | Vite, webpack, Rollup, etc. |
| `dist/index.cjs` | CommonJS | Node.js `require()` |
| `dist/index.umd.js` | UMD | `<script>` tag |
| `dist/types/` | `.d.ts` | TypeScript type definitions |

## Compatibility

| Environment | Minimum Version |
| --- | --- |
| Node.js | 14.0+ |
| Chrome | 51+ |
| Firefox | 54+ |
| Safari | 10+ |
| Edge | 15+ |
| Deno | 1.0+ |
| Bun | 1.0+ |

The compilation target is **ES2015 (ES6)**, without using newer syntax features, ensuring broad compatibility. The library itself has zero dependencies and does not include polyfills.
