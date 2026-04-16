# TypeScript

xcolor 使用 TypeScript 编写，提供完整的类型声明，无需额外安装 `@types` 包。

## 基本使用

`xcolor()` 的返回类型就是 `XColor` 实例，IDE 会自动提示所有可用方法：

```ts
import xcolor from '@xpyjs/color'

const color = xcolor('#ff0000')
color.lighten(20).toHex()  // 类型推断完整
```

## 类型导入

需要类型标注时，从 `@xpyjs/color` 导入：

```ts
import xcolor, { XColor } from '@xpyjs/color'
import type { RGBA, HSLA, HSVA, XColorInput, XColorOptions } from '@xpyjs/color'
```

### 常用类型

| 类型 | 说明 |
| --- | --- |
| `XColor` | 颜色实例类 |
| `XColorInput` | `xcolor()` 接受的所有输入类型的联合 |
| `XColorOptions` | 配置选项（如 `{ useDecimal: true }`）|
| `RGBA` | `{ r: number, g: number, b: number, a: number }` |
| `HSLA` | `{ h: number, s: number, l: number, a: number }` |
| `HSVA` | `{ h: number, s: number, v: number, a: number }` |

### 函数参数类型标注

```ts
import type { XColorInput } from '@xpyjs/color'
import xcolor from '@xpyjs/color'

function getContrastColor(input: XColorInput): string {
  const c = xcolor(input)
  return c.isLight() ? '#000000' : '#ffffff'
}
```

## 插件类型增强

安装官方插件后，导入即自动获得类型提示——插件内部已包含 `declare module` 声明：

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)

// ✅ TypeScript 已知 toLab() 存在
xcolor('#ff0000').toLab()  // { l: number, a: number, b: number }
```

如果你在开发自定义插件，参考 [自定义插件开发](/guide/custom-plugin) 中的 `declare module` 写法来添加类型声明。

## XColorPlugin 类型

编写插件时使用：

```ts
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin<{ threshold: number }> = {
  name: 'my-plugin',
  install(option, cls, factory) {
    // option 类型为 { threshold: number }
  }
}
```

泛型参数 `T` 定义了 `xcolor.use(plugin, option)` 中 `option` 的类型，默认为 `unknown`。

## 编译配置

xcolor 编译目标为 ES2015。如果你的项目 `tsconfig.json` 设置了 `moduleResolution: "bundler"` 或 `"node16"`，子路径导入（`@xpyjs/color/plugins/*`）会自动解析。

对于 `moduleResolution: "node"`（TypeScript 4.x 默认），可能需要配合 `paths` 映射。推荐升级到 `"bundler"` 以获得最佳体验。
