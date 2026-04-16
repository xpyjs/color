# 安装

## 包管理器

xcolor 发布在 npm 上，可通过任意主流包管理器安装：

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

安装完成后，在项目中以 ES Module 方式导入即可：

```ts
import xcolor from '@xpyjs/color'

const c = xcolor('#ff0000')
```

## CDN 引入

如果你不使用构建工具，可以通过 CDN 直接在 HTML 中引入。

### ES Module（推荐）

```html
<script type="module">
  import xcolor from 'https://esm.sh/@xpyjs/color'

  console.log(xcolor('#ff0000').toRgbString())
</script>
```

也可以使用 unpkg 或 jsDelivr：

```
https://unpkg.com/@xpyjs/color/dist/index.esm.js
https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/index.esm.js
```

### UMD（全局变量）

```html
<script src="https://unpkg.com/@xpyjs/color/dist/index.umd.js"></script>
<script>
  // UMD 方式会在 window 上挂载 xcolor
  const c = xcolor('#ff0000')
  console.log(c.toHex())
</script>
```

UMD 版本将 `xcolor` 挂载为 `window.xcolor` 全局变量，可直接使用。

## Deno

Deno 可以通过 npm: 协议或 esm.sh 引入：

```ts
// npm: 协议（Deno ≥ 1.28）
import xcolor from 'npm:@xpyjs/color'

// 或使用 esm.sh
import xcolor from 'https://esm.sh/@xpyjs/color'
```

## Node.js CommonJS

如果项目使用 CommonJS 模块系统：

```js
const xcolor = require('@xpyjs/color').default
// 或
const { xcolor } = require('@xpyjs/color')
```

## 插件安装

xcolor 的官方插件以子路径方式提供，无需额外安装：

```ts
import harmony from '@xpyjs/color/plugins/harmony'
import gradient from '@xpyjs/color/plugins/gradient'

xcolor.use(harmony)
xcolor.use(gradient)
```

在 CDN 场景下，从对应子路径引入：

```html
<script type="module">
  import xcolor from 'https://esm.sh/@xpyjs/color'
  import harmony from 'https://esm.sh/@xpyjs/color/plugins/harmony'

  xcolor.use(harmony)
</script>
```

## 构建产物

| 文件路径 | 格式 | 适用场景 |
| --- | --- | --- |
| `dist/index.esm.js` | ES Module | Vite、webpack、Rollup 等 |
| `dist/index.cjs` | CommonJS | Node.js `require()` |
| `dist/index.umd.js` | UMD | `<script>` 标签 |
| `dist/types/` | `.d.ts` | TypeScript 类型定义 |

## 兼容性

| 环境 | 最低版本 |
| --- | --- |
| Node.js | 14.0+ |
| Chrome | 51+ |
| Firefox | 54+ |
| Safari | 10+ |
| Edge | 15+ |
| Deno | 1.0+ |
| Bun | 1.0+ |

编译目标为 **ES2015 (ES6)**，不使用更新的语法特性，保证了广泛的兼容性。库本身零依赖，不包含 polyfill。
