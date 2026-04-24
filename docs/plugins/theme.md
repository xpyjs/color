# theme - 主题与 CSS 变量

设计系统级的主题色生成器。从基础色自动生成完整的色阶面板、语义色和暗色模式，并输出为 CSS 变量，可直接注入到页面 DOM 或作为字符串用于 SSR。

## 安装

```ts
import xcolor from '@xpyjs/color'
import themePlugin from '@xpyjs/color/plugins/theme'

xcolor.use(themePlugin, {
  colors: {
    primary: '#1890ff'
  }
})
```

> **注意**：`colors` 为必填项。

<SvgThemePipeline />

## 配置选项

`xcolor.use(themePlugin, options)` 的 `options` 参数类型为 `XColorThemeOptions`：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `colors` | `Record<string, ColorConfig>` | — | **必填**。颜色定义，键名作为 CSS 变量名的一部分 |
| `prefix` | `string` | `'--x'` | CSS 变量名前缀 |
| `type` | `ThemePaletteType` | `'antd'` | 色阶生成类型 |
| `shades` | `Shade[]` | `[50,100,...,950]` | 要生成的色阶级别 |
| `semantic` | `boolean` | `true` | 是否自动生成语义色（hover、active 等） |
| `darkMode` | `'class' \| 'media' \| false` | `false` | 暗色模式策略 |
| `darkSelector` | `string` | `'.dark'` | 暗色模式 CSS 选择器（`darkMode: 'class'` 时） |
| `cssSelector` | `string` | `':root'` | 浅色模式 CSS 选择器 |
| `format` | `ThemeCssFormat` | `'hex'` | CSS 变量值的输出格式 |

### 颜色定义 (ColorConfig)

每个颜色条目支持三种写法：

```ts
xcolor.use(themePlugin, {
  colors: {
    // ① 字符串简写 — 自动生成完整色阶 + 语义色
    primary: '#1890ff',

    // ② 带 DEFAULT 的对象 — 自动生成 + 覆盖某些值
    success: {
      DEFAULT: '#52c41a',
      hover: '#73d13d'
    },

    // ③ 不含 DEFAULT 的对象 — 纯自定义，不生成色阶
    brand: {
      logo: '#ff6600',
      accent: { light: '#ce93d8', dark: '#7b1fa2' }
    }
  }
})
```

> 想快速看到效果？参考 [完整示例](#完整示例) 查看生成的 CSS 输出。

::: warning DEFAULT 是保留键名
`DEFAULT` 是一个特殊保留键名，用于标识颜色条目的**基础色**。当检测到 `DEFAULT` 时，插件会将其作为色阶生成的基准色（对应 shade 500），并自动生成完整的色阶面板和语义色。`DEFAULT` 本身不会出现在生成的 CSS 变量名中。

请勿将 `DEFAULT` 用于其他用途，它在任何嵌套层级中都具有特殊含义。
:::

### 色阶

色阶使用了 `palette` 插件的算法进行生成，支持多种预设类型，也可以传入自定义函数。更多细节请参考 [palette 插件文档](/plugins/palette)。

```ts
// 使用线性插值
xcolor.use(themePlugin, {
  type: 'linear',
  colors: { primary: '#1890ff' }
})

// 使用自定义函数
xcolor.use(themePlugin, {
  type: (baseColor, shades) => {
    return shades.map((s) => {
      const factor = (s - 500) / 500
      return factor < 0
        ? xcolor(baseColor.toHex()).lighten(Math.abs(factor) * 50)
        : xcolor(baseColor.toHex()).darken(factor * 50)
    })
  },
  colors: { primary: '#1890ff' }
})
```

### 语义色

开启 `semantic: true`（默认）时，自动生成以下语义色变量：

| 语义名 | 对应色阶 | 用途 |
| --- | --- | --- |
| `hover` | 400 | 悬停状态 |
| `active` | 600 | 激活/按下状态 |
| `disabled` | 200 | 禁用状态 |
| `border` | 300 | 边框颜色 |
| `bg` | 50 | 背景色 |
| `text` | 900 | 文本颜色 |

```ts
const vars = xcolor.getThemeVars()
vars['--x-primary-hover']    // 色阶 400 对应的颜色
vars['--x-primary-active']   // 色阶 600 对应的颜色
vars['--x-primary-bg']       // 色阶 50 对应的颜色
```

可通过对象写法覆盖自动生成的语义色：

```ts
xcolor.use(themePlugin, {
  colors: {
    primary: {
      DEFAULT: '#1890ff',
      hover: '#40a9ff'   // 覆盖自动生成的 hover 色
    }
  }
})
```

### 暗色模式

<SvgThemeDarkMode />

```ts
// CSS class 策略
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  darkMode: 'class',
  darkSelector: '.dark'  // 默认值
})
// 生成：.dark { --x-primary-500: ...; }

// CSS media 策略
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  darkMode: 'media'
})
// 生成：@media (prefers-color-scheme: dark) { :root { --x-primary-500: ...; } }
```

暗色模式会自动反转色阶顺序，并降低饱和度和明度以适应暗色背景。

### 输出格式

| 值 | 示例 |
| --- | --- |
| `'hex'` | `#1890ff` |
| `'rgb'` | `rgb(24, 144, 255)` |
| `'hsl'` | `hsl(209, 100%, 55%)` |

## 静态方法

以下方法注册在 `xcolor` 工厂上，在调用 `xcolor.use(themePlugin, options)` 后可用。

### injectTheme()

将生成的主题 CSS 注入到 `<head>` 中，创建或更新 `<style id="xcolor-theme">` 标签。

在非浏览器环境（Node.js / SSR）中，此方法仅返回 CSS 字符串，不操作 DOM。

**返回值**：`string`（CSS 字符串）

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff', success: '#52c41a' }
})
xcolor.injectTheme()
// → <style id="xcolor-theme">:root { --x-primary-500: #1890ff; ... }</style>
```

### getThemeCss()

获取完整的 CSS 字符串，不注入 DOM。

**返回值**：`string`

```ts
const css = xcolor.getThemeCss()
// ':root {\n  --x-primary-500: #1890ff;\n  ...\n}\n'
```

### getThemeVars()

获取扁平的 CSS 变量映射表。

**返回值**：`Record<string, string>`

```ts
const vars = xcolor.getThemeVars()
// { '--x-primary-500': '#1890ff', '--x-primary-hover': '#40a9ff', ... }
```

### updateTheme(options, deep?)

更新主题配置。默认使用深合并，只需传入要修改的字段，其余保持不变。传入 `false` 作为第二个参数可切换为浅合并（直接替换顶层键）。如果之前已注入了 `<style>` 标签，DOM 会自动更新。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` | `Partial<XColorThemeOptions>` | — | 要合并的部分配置 |
| `deep` | `boolean` | `true` | 是否深合并。`false` 时使用浅合并 |

```ts
// 深合并（默认）— 只修改主色调，其他保留
 xcolor.updateTheme({ colors: { primary: '#722ed1' } })

// 浅合并 — 替换整个 colors 对象
xcolor.updateTheme({ colors: { primary: '#722ed1' } }, false)

// 切换到暗色模式
xcolor.updateTheme({ darkMode: 'class' })

// 同时修改多个选项
xcolor.updateTheme({
  prefix: '--color',
  format: 'rgb',
  colors: { primary: '#1890ff', danger: '#ff4d4f' }
})
```

### removeTheme()

移除注入的 `<style>` 标签并清除缓存。

```ts
xcolor.removeTheme()
```

## 完整示例

### 基础用法

```ts
import xcolor from '@xpyjs/color'
import themePlugin from '@xpyjs/color/plugins/theme'

xcolor.use(themePlugin, {
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f'
  }
})

// 注入到页面
xcolor.injectTheme()
```

生成的 CSS：

```css
:root {
  --x-primary-50: #e6f7ff;
  --x-primary-100: #bae7ff;
  /* ... 更多色阶 ... */
  --x-primary-500: #1890ff;
  /* ... */
  --x-primary-900: #002766;
  --x-primary-hover: #40a9ff;
  --x-primary-active: #096dd9;
  --x-primary-disabled: #91d5ff;
  --x-primary-border: #69c0ff;
  --x-primary-bg: #e6f7ff;
  --x-primary-text: #002766;
  /* success, warning, danger 同理 ... */
}
```

### 带暗色模式的完整配置

```ts
xcolor.use(themePlugin, {
  prefix: '--app',
  type: 'antd',
  colors: {
    primary: '#1890ff',
    success: { DEFAULT: '#52c41a', hover: '#73d13d' },
    brand: { logo: '#ff6600' }
  },
  darkMode: 'class',
  darkSelector: '[data-theme="dark"]',
  format: 'hex'
})

// 获取 CSS 用于 SSR
const css = xcolor.getThemeCss()
```

### 动态切换主题色

```ts
// 用户选择新的主题色
function onColorChange(newColor: string) {
  xcolor.updateTheme({
    colors: { primary: newColor }
  })
  // 如果之前调用过 injectTheme()，DOM 会自动更新
}
```

## 类型导出

```ts
import type {
  XColorThemeOptions,
  ThemeResult,
  ThemeCssFormat,
  ColorConfig
} from '@xpyjs/color/plugins/theme'
```
