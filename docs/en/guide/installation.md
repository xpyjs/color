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

### Unbundled browser plugins

Use an import map with the raw CDN files so that each plugin's `@xpyjs/color` dependency resolves to the same URL.

```html
<script type="importmap">
  { "imports": { "@xpyjs/color": "https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/index.esm.js" } }
</script>
<script type="module">
  import xcolor from '@xpyjs/color'
  import name from 'https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/plugins/name/index.js'
  xcolor.use(name)
  console.log(xcolor('red').toHex())
</script>
```

For classic scripts, load the UMD core first, then the UMD plugin.

```html
<script src="https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/plugins/name/index.umd.js"></script>
<script>
  xcolor.use(xcolorPlugins.name)
  console.log(xcolor('red').toHex())
</script>
```

## Build Artifacts

| File Path | Format | Use Case |
| --- | --- | --- |
| `dist/index.esm.js` | ES Module | Vite, webpack, Rollup, etc. |
| `dist/index.node.js` | ES Module | Node.js `import` |
| `dist/index.cjs` | CommonJS | Node.js `require()` |
| `dist/index.umd.js` | UMD | `<script>` tag |
| `dist/types/` | `.d.ts` / `.d.cts` | TypeScript type definitions |

## Compatibility

- Node.js consumers use Node 14.0 or later. The repository uses Node 20 or 22 for development and builds.
- Browser bundlers use the browser ESM build. Use a browser with native modules and import maps for the unbundled plugin example above.
- The package supports npm imports in Deno and Bun. Test the actual host and loading method when choosing a deployment baseline.

The library has zero runtime dependencies. Loading the library and rendering a CSS color are separate capabilities. Check browser support for the emitted CSS syntax if you use newer color spaces.

## Verified entry points

| Host | Consumer test |
| --- | --- |
| Node.js 14.0 and 22 | ESM, CommonJS and both loading orders from one installed tarball |
| Chrome | Bundler, native modules with an import map, classic UMD scripts and a module worker |
| Deno and Bun | npm package imports, plugin registration and server-side theme generation |
| Electron | Main process CommonJS and Chromium renderer |

These tests use a locally installed tarball. A separate prerelease check loads the exact published version from jsDelivr.
