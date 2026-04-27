# theme - 主题与 CSS 变量

设计系统级的主题色生成器。从基础色自动生成完整的色阶面板、语义色和暗色模式，并输出为 CSS 变量，可直接注入到页面 DOM 或作为字符串用于 SSR。

::: info 🎨 在线体验
想要直观体验主题配色效果？试试 [配色工坊](/theme-studio) — 输入一个主色即可一键生成完整配色方案。
:::

::: tip 插件依赖
该插件依赖 [palette](/plugins/palette) 插件的色阶生成算法。
:::

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
| `derive` | `boolean \| XColorThemeDeriveOptions` | `false` | 是否从源色自动派生整套语义角色色（secondary、success 等）。详见 [Derive 派生整套语义色](#derive-派生整套语义色) |

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

## Derive 派生整套语义色

在实际项目中，通常只需一个品牌主色（如 `primary`），就希望自动得到 `success`、`warning`、`error`、`info`、`secondary` 等配套色——它们的饱和度、明度与主色保持统一风格，但色相各异。`derive` 选项就是为此设计的。

### 快速开始

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: true
})
```

只需一行 `derive: true`，即可从 `primary` 自动派生 5 个语义角色色，每个角色都会像 `primary` 一样生成完整的色阶面板（50–950）和语义状态色（hover、active 等）。

生成的 CSS 变量（示例）：

```css
:root {
  /* primary — 用户提供 */
  --x-primary-50:  #e6f7ff;
  --x-primary-500: #1890ff;
  --x-primary-900: #002766;
  --x-primary-hover: ...;
  --x-primary-active: ...;
  /* ... 更多 primary 色阶 & 语义色 ... */

  /* secondary — 自动派生（互补色） */
  --x-secondary-50:  #fff7e6;
  --x-secondary-500: #d58a18;
  --x-secondary-900: ...;
  --x-secondary-hover: ...;
  /* ... */

  /* success — 自动派生（绿色系） */
  --x-success-50:  #f0fff4;
  --x-success-500: #00a66b;
  --x-success-900: ...;
  /* ... */

  /* warning — 自动派生（琥珀/橙色系） */
  --x-warning-500: #c1751d;
  /* ... */

  /* error — 自动派生（红色系） */
  --x-error-500: #d56059;
  /* ... */

  /* info — 自动派生（蓝青色系） */
  --x-info-500: #2199d9;
  /* ... */
}
```

> 以上色值仅为示意，实际值取决于源色和算法。

### 派生配置 (XColorThemeDeriveOptions)

当需要更精细的控制时，可传入对象配置：

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    from: 'primary',       // 源色键名
    algorithm: 'oklch',    // 派生算法
    roles: ['success', 'warning', 'error', 'info', 'secondary'],
    hues: { success: 150 },         // 覆盖角色锚点色相
    alias: { warning: 'warn' },   // 重命名输出变量
    chromaScale: 1,        // 色度缩放
    lightnessShift: 0      // 明度偏移
  }
})
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 对象形式时的显式开关 |
| `from` | `string` | `'primary'` | 源色键名。必须是 `colors` 中一个字符串色值或带 `DEFAULT` 的对象 |
| `algorithm` | `'oklch' \| 'hsl'` | `'oklch'` | 派生色彩空间。`oklch` 感知均匀，推荐使用 |
| `roles` | `BuiltinRole[]` | 全 5 个 | 要派生的角色列表。可裁剪为只派生部分角色 |
| `hues` | `Partial<Record<BuiltinRole, number>>` | — | 覆盖角色默认锚点色相（单位：度） |
| `alias` | `Partial<Record<BuiltinRole, string>>` | — | 角色名 → 输出 CSS 变量名段的映射 |
| `chromaScale` | `number` | `1` | 派生色的色度倍率。大于 1 增加饱和度，小于 1 降低 |
| `lightnessShift` | `number` | `0` | 派生色的明度偏移（OKLCh 的 L，范围 0–1）。正值变亮，负值变暗 |

### 默认角色锚点色相

每个角色在 OKLCh 空间中有一个默认色相锚点：

| 角色 | 默认色相 (°) | 色彩区域 | 含义 |
| --- | --- | --- | --- |
| `error` | 27 | 红色 | 错误 / 失败 / 危险 |
| `warning` | 70 | 琥珀 / 橙色 | 警告 / 注意 |
| `success` | 145 | 绿色 | 成功 / 确认 |
| `info` | 235 | 蓝青色 | 信息 / 中性提示 |
| `secondary` | 源色 + 180° | 互补色 | 副色 / 强调色 |

<div style="display:flex;gap:8px;align-items:center;margin:12px 0">
  <div style="width:56px;height:56px;border-radius:8px;background:#1890ff;border:2px solid #333" title="primary（源色）"></div>
  <div style="font-size:20px;color:#888">→</div>
  <div style="width:48px;height:48px;border-radius:8px;background:#d56059" title="error ~27°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#c1751d" title="warning ~70°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#00a66b" title="success ~145°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#2199d9" title="info ~235°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#d58a18" title="secondary（互补）"></div>
</div>

<div style="display:flex;gap:8px;margin:4px 0;font-size:12px;color:#888">
  <div style="width:56px;text-align:center">primary</div>
  <div style="width:20px"></div>
  <div style="width:48px;text-align:center">error</div>
  <div style="width:48px;text-align:center">warning</div>
  <div style="width:48px;text-align:center">success</div>
  <div style="width:48px;text-align:center">info</div>
  <div style="width:48px;text-align:center">secondary</div>
</div>

下图展示了 OKLCh 色相环上各角色的锚点位置。源色 primary（蓝色 209°）的 **明度 L** 和 **色度 C** 保持不变，仅旋转色相 H 至各角色的锚点，从而产出风格统一的配套色：

<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:16px auto;display:block">
  <!-- 底色环 -->
  <circle cx="200" cy="200" r="150" fill="none" stroke="#e8e8e8" stroke-width="24"/>
  <!-- OKLCh 色相环：12 段弧线（每段 30°，颜色取 OKLCh 中点近似值） -->
  <path d="M 350 200 A 150 150 0 0 0 330 125" fill="none" stroke="#e03858" stroke-width="24" opacity="0.45"/>
  <path d="M 330 125 A 150 150 0 0 0 275 70"  fill="none" stroke="#c85838" stroke-width="24" opacity="0.45"/>
  <path d="M 275 70  A 150 150 0 0 0 200 50"  fill="none" stroke="#a07c10" stroke-width="24" opacity="0.45"/>
  <path d="M 200 50  A 150 150 0 0 0 125 70"  fill="none" stroke="#609218" stroke-width="24" opacity="0.45"/>
  <path d="M 125 70  A 150 150 0 0 0 70 125"  fill="none" stroke="#18904c" stroke-width="24" opacity="0.45"/>
  <path d="M 70 125  A 150 150 0 0 0 50 200"  fill="none" stroke="#007c78" stroke-width="24" opacity="0.45"/>
  <path d="M 50 200  A 150 150 0 0 0 70 275"  fill="none" stroke="#10649c" stroke-width="24" opacity="0.45"/>
  <path d="M 70 275  A 150 150 0 0 0 125 330" fill="none" stroke="#3850bc" stroke-width="24" opacity="0.45"/>
  <path d="M 125 330 A 150 150 0 0 0 200 350" fill="none" stroke="#703cbc" stroke-width="24" opacity="0.45"/>
  <path d="M 200 350 A 150 150 0 0 0 275 330" fill="none" stroke="#a82c9c" stroke-width="24" opacity="0.45"/>
  <path d="M 275 330 A 150 150 0 0 0 330 275" fill="none" stroke="#d42870" stroke-width="24" opacity="0.45"/>
  <path d="M 330 275 A 150 150 0 0 0 350 200" fill="none" stroke="#e42c64" stroke-width="24" opacity="0.45"/>
  <!-- 环边线 -->
  <circle cx="200" cy="200" r="162" fill="none" stroke="#ccc" stroke-width="0.5"/>
  <circle cx="200" cy="200" r="138" fill="none" stroke="#ccc" stroke-width="0.5"/>
  <!-- 中心文字 -->
  <text x="200" y="195" text-anchor="middle" font-size="13" fill="#aaa" font-family="sans-serif">OKLCh 色相环</text>
  <text x="200" y="212" text-anchor="middle" font-size="11" fill="#888" font-family="sans-serif">H = 色相角度 (0°–360°)</text>
  <!-- 四个基本角度标记 -->
  <text x="370" y="204" text-anchor="middle" font-size="10" fill="#999">0°</text>
  <text x="200" y="30"  text-anchor="middle" font-size="10" fill="#999">90°</text>
  <text x="30"  y="204" text-anchor="middle" font-size="10" fill="#999">180°</text>
  <text x="200" y="380" text-anchor="middle" font-size="10" fill="#999">270°</text>
  <!-- 连线：center → 各角色锚点 -->
  <line x1="200" y1="200" x2="334" y2="132" stroke="#d56059" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="251" y2="59"  stroke="#c1751d" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="77"  y2="114" stroke="#00a66b" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="69"  y2="273" stroke="#1890ff" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="114" y2="323" stroke="#2199d9" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="305" y2="142" stroke="#d58a18" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <!-- error (27°)  x=200+150cos27≈334  y=200−150sin27≈132 -->
  <circle cx="334" cy="132" r="10" fill="#d56059" stroke="#fff" stroke-width="2"/>
  <text x="349" y="122" text-anchor="start" font-size="10" fill="#d56059" font-family="sans-serif">error 27°</text>
  <!-- warning (70°)  x≈251 y≈59 -->
  <circle cx="251" cy="59" r="10" fill="#c1751d" stroke="#fff" stroke-width="2"/>
  <text x="265" y="49" text-anchor="start" font-size="10" fill="#c1751d" font-family="sans-serif">warning 70°</text>
  <!-- success (145°)  x≈77 y≈114 -->
  <circle cx="77" cy="114" r="10" fill="#00a66b" stroke="#fff" stroke-width="2"/>
  <text x="62" y="102" text-anchor="end" font-size="10" fill="#00a66b" font-family="sans-serif">success 145°</text>
  <!-- primary (209°)  x≈69 y≈273 -->
  <circle cx="69" cy="273" r="12" fill="#1890ff" stroke="#fff" stroke-width="2"/>
  <text x="50" y="264" text-anchor="end" font-size="10" fill="#1890ff" font-weight="bold" font-family="sans-serif">primary</text>
  <text x="50" y="276" text-anchor="end" font-size="9"  fill="#1890ff" font-family="sans-serif">209°</text>
  <!-- info (235°)  x≈114 y≈323 -->
  <circle cx="114" cy="323" r="10" fill="#2199d9" stroke="#fff" stroke-width="2"/>
  <text x="98" y="345" text-anchor="end" font-size="10" fill="#2199d9" font-family="sans-serif">info 235°</text>
  <!-- secondary (29°≈209°+180°, 略向内偏移以避免与 error 重叠) -->
  <circle cx="305" cy="142" r="9" fill="#d58a18" stroke="#fff" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="318" y="152" text-anchor="start" font-size="10" fill="#d58a18" font-family="sans-serif">secondary</text>
  <text x="318" y="164" text-anchor="start" font-size="9"  fill="#d58a18" font-family="sans-serif">(209°+180°=29°)</text>
</svg>

> **原理说明**：OKLCh 是 OKLab 的极坐标形式，L（明度）、C（色度/彩度）、H（色相）三个维度互相独立。派生时**仅旋转 H**（色相角度），保持 L 和 C 不变，确保所有派生色与源色在"亮暗程度"和"饱和程度"上感知一致。这是 OKLCh 相比 HSL 的最大优势——HSL 中相同的 L 值在不同色相下实际亮度差异很大。

### 算法对比

| | OKLCh（推荐） | HSL |
| --- | --- | --- |
| 色彩空间 | OKLCh（感知均匀） | HSL |
| 明度一致性 | ✅ 不同色相间明度感知一致 | ❌ 相同 L 值在不同色相下亮度差异大 |
| 饱和度一致性 | ✅ Chroma 感知均匀 | ❌ 纯色间饱和度差异明显 |
| 适用场景 | 追求视觉统一的设计系统 | 简单场景或浏览器兼容性优先 |

### 用户覆盖优先

用户在 `colors` 中显式提供的颜色始终优先于派生结果：

```ts
xcolor.use(themePlugin, {
  colors: {
    primary: '#1890ff',
    success: '#52c41a'    // 用户自定义 success，不使用派生值
  },
  derive: true
})

const vars = xcolor.getThemeVars()
vars['--x-success-500'] // '#52c41a' — 用户值
vars['--x-error-500']   // 派生值
vars['--x-warning-500'] // 派生值
```

### 角色重命名 (alias)

如果你的项目使用不同的命名约定，可以通过 `alias` 重命名输出变量：

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    alias: {
      warning: 'warn',    // --x-warn-500 而非 --x-warning-500
      error: 'danger'     // --x-danger-500 而非 --x-error-500
    }
  }
})

const vars = xcolor.getThemeVars()
vars['--x-warn-500']    // 存在
vars['--x-danger-500']  // 存在
vars['--x-warning-500'] // undefined
vars['--x-error-500']   // undefined
```

使用别名时，用户覆盖也应使用别名键名：

```ts
xcolor.use(themePlugin, {
  colors: {
    primary: '#1890ff',
    warn: '#faad14'       // 使用别名 'warn' 覆盖
  },
  derive: {
    alias: { warning: 'warn' }
  }
})
```

### 只派生部分角色

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    roles: ['success', 'error']  // 只派生这两个
  }
})

const vars = xcolor.getThemeVars()
vars['--x-success-500'] // 存在
vars['--x-error-500']   // 存在
vars['--x-warning-500'] // undefined — 未请求
vars['--x-info-500']    // undefined — 未请求
```

### 使用自定义源色

```ts
xcolor.use(themePlugin, {
  colors: {
    brand: '#6200ea'  // 使用品牌色作为派生源
  },
  derive: {
    from: 'brand'     // 从 brand 而非 primary 派生
  }
})
```

### 调整色度与明度

```ts
// 派生色稍微降低饱和度，更柔和
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    chromaScale: 0.85,      // 色度降低 15%
    lightnessShift: 0.03    // 稍微提亮
  }
})
```

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
  ColorConfig,
  BuiltinRole,
  ThemeDeriveAlgorithm,
  XColorThemeDeriveOptions
} from '@xpyjs/color/plugins/theme'
```
