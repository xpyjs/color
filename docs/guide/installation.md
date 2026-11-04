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

### 浏览器直接加载插件

直接使用 CDN 原始文件时，通过 import map 将插件依赖的 `@xpyjs/color` 指向同一个核心模块。

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

经典脚本先加载 UMD 核心，再加载 UMD 插件。

```html
<script src="https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@xpyjs/color/dist/plugins/name/index.umd.js"></script>
<script>
  xcolor.use(xcolorPlugins.name)
  console.log(xcolor('red').toHex())
</script>
```

## 构建产物

| 文件路径 | 格式 | 适用场景 |
| --- | --- | --- |
| `dist/index.esm.js` | ES Module | Vite、webpack、Rollup 等 |
| `dist/index.node.js` | ES Module | Node.js `import` |
| `dist/index.cjs` | CommonJS | Node.js `require()` |
| `dist/index.umd.js` | UMD | `<script>` 标签 |
| `dist/types/` | `.d.ts` / `.d.cts` | TypeScript 类型定义 |

## 兼容性

- Node.js 使用端支持 Node 14.0 及以上版本。项目开发和构建使用 Node 20 或 22。
- Web 打包器使用浏览器 ESM 产物。直接通过浏览器加载原生 ESM 插件时，需要支持原生模块和 import map。
- Deno 和 Bun 可使用 npm 包。确定部署基线时，应按实际宿主和加载方式验证。

库无运行时依赖。浏览器加载 JavaScript 和渲染 CSS 颜色是两项独立的能力。输出较新的色彩空间时，请确认浏览器支持对应的 CSS 语法。

## 已验证的加载方式

| 环境 | 消费端测试 |
| --- | --- |
| Node.js 14.0 和 22 | 从同一份 tarball 安装后使用 ESM、CommonJS，以及两种混合加载顺序 |
| Chrome | 打包器、带 import map 的原生模块、经典 UMD 脚本及模块 Worker |
| Deno 与 Bun | npm 包导入、插件注册和服务端主题生成 |
| Electron | 主进程 CommonJS 与 Chromium 渲染进程 |

上表使用本地 tarball 验证。预发布后另有检查从 jsDelivr 加载指定版本。
