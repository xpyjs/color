# theme - Theme & CSS Variables

Design-system-level theme color generator. Automatically generates complete shade palettes, semantic colors, and dark mode from base colors, outputting CSS variables that can be injected into the DOM or used as strings for SSR.

::: tip Plugin Dependencies
This plugin depends on the [palette](/en/plugins/palette) plugin for shade palette generation.
:::

## Install

```ts
import xcolor from '@xpyjs/color'
import themePlugin from '@xpyjs/color/plugins/theme'

xcolor.use(themePlugin, {
  colors: {
    primary: '#1890ff'
  }
})
```

> **Note**: `colors` is required.

<SvgThemePipeline />

## Configuration Options

The `options` parameter of `xcolor.use(themePlugin, options)` has the type `XColorThemeOptions`:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `colors` | `Record<string, ColorConfig>` | — | **Required**. Color definitions; keys become part of CSS variable names |
| `prefix` | `string` | `'--x'` | CSS variable name prefix |
| `type` | `ThemePaletteType` | `'antd'` | Palette generation type |
| `shades` | `Shade[]` | `[50,100,...,950]` | Shade levels to generate |
| `semantic` | `boolean` | `true` | Whether to auto-generate semantic colors (hover, active, etc.) |
| `darkMode` | `'class' \| 'media' \| false` | `false` | Dark mode strategy |
| `darkSelector` | `string` | `'.dark'` | Dark mode CSS selector (when `darkMode: 'class'`) |
| `cssSelector` | `string` | `':root'` | Light mode CSS selector |
| `format` | `ThemeCssFormat` | `'hex'` | Output format for CSS variable values |
| `derive` | `boolean \| XColorThemeDeriveOptions` | `false` | Auto-derive a full set of semantic role colors (secondary, success, etc.) from a source color. See [Derive Role Colors](#derive-role-colors) |

### Color Definition (ColorConfig)

Each color entry supports three formats:

```ts
xcolor.use(themePlugin, {
  colors: {
    // ① String shorthand — auto-generate full palette + semantic colors
    primary: '#1890ff',

    // ② Object with DEFAULT — auto-generate + override specific values
    success: {
      DEFAULT: '#52c41a',
      hover: '#73d13d'
    },

    // ③ Object without DEFAULT — pure custom, no palette generation
    brand: {
      logo: '#ff6600',
      accent: { light: '#ce93d8', dark: '#7b1fa2' }
    }
  }
})
```

> Want to see the output quickly? Check the [Full Examples](#full-examples) for generated CSS.

::: warning DEFAULT is a Reserved Key
`DEFAULT` is a special reserved key that identifies the **base color** of a color entry. When detected, the plugin uses it as the reference color for palette generation (mapped to shade 500) and automatically generates the full shade palette and semantic colors. `DEFAULT` itself does not appear in the generated CSS variable names.

Do not use `DEFAULT` for any other purpose — it has special meaning at any nesting level.
:::

### Palette

The palette uses the algorithm from the `palette` plugin to generate shades, supporting multiple preset types or a custom function. For more details, refer to the [palette plugin documentation](/en/plugins/palette).

```ts
// Use linear interpolation
xcolor.use(themePlugin, {
  type: 'linear',
  colors: { primary: '#1890ff' }
})

// Use custom function
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

### Semantic Colors

When `semantic: true` (default), the following semantic color variables are auto-generated:

| Semantic Name | Shade | Purpose |
| --- | --- | --- |
| `hover` | 400 | Hover state |
| `active` | 600 | Active/pressed state |
| `disabled` | 200 | Disabled state |
| `border` | 300 | Border color |
| `bg` | 50 | Background color |
| `text` | 900 | Text color |

```ts
const vars = xcolor.getThemeVars()
vars['--x-primary-hover']    // color at shade 400
vars['--x-primary-active']   // color at shade 600
vars['--x-primary-bg']       // color at shade 50
```

You can override auto-generated semantic colors using the object format:

```ts
xcolor.use(themePlugin, {
  colors: {
    primary: {
      DEFAULT: '#1890ff',
      hover: '#40a9ff'   // override the auto-generated hover color
    }
  }
})
```

### Dark Mode

<SvgThemeDarkMode />

```ts
// CSS class strategy
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  darkMode: 'class',
  darkSelector: '.dark'  // default
})
// Generates: .dark { --x-primary-500: ...; }

// CSS media query strategy
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  darkMode: 'media'
})
// Generates: @media (prefers-color-scheme: dark) { :root { --x-primary-500: ...; } }
```

Dark mode automatically reverses the shade order and reduces saturation and brightness to suit dark backgrounds.

### Output Format

| Value | Example |
| --- | --- |
| `'hex'` | `#1890ff` |
| `'rgb'` | `rgb(24, 144, 255)` |
| `'hsl'` | `hsl(209, 100%, 55%)` |

## Derive Role Colors

In real-world projects, you often only have a single brand color (e.g. `primary`) and want to automatically generate `success`, `warning`, `error`, `info`, and `secondary` colors that share a unified visual style — same saturation and brightness feel, but different hues. The `derive` option is designed for exactly this.

### Quick Start

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: true
})
```

With just `derive: true`, the plugin derives 5 semantic role colors from `primary`. Each role gets the same full shade palette (50–950) and semantic state colors (hover, active, etc.) as any manually-provided color.

Generated CSS variables (example):

```css
:root {
  /* primary — user-provided */
  --x-primary-50:  #e6f7ff;
  --x-primary-500: #1890ff;
  --x-primary-900: #002766;
  --x-primary-hover: ...;
  --x-primary-active: ...;
  /* ... more primary shades & semantic colors ... */

  /* secondary — auto-derived (complementary) */
  --x-secondary-50:  #fff7e6;
  --x-secondary-500: #d58a18;
  --x-secondary-900: ...;
  --x-secondary-hover: ...;
  /* ... */

  /* success — auto-derived (green region) */
  --x-success-50:  #f0fff4;
  --x-success-500: #00a66b;
  --x-success-900: ...;
  /* ... */

  /* warning — auto-derived (amber/orange) */
  --x-warning-500: #c1751d;
  /* ... */

  /* error — auto-derived (red) */
  --x-error-500: #d56059;
  /* ... */

  /* info — auto-derived (blue-cyan) */
  --x-info-500: #2199d9;
  /* ... */
}
```

> Color values above are illustrative; actual values depend on the source color and algorithm.

### Derive Options (XColorThemeDeriveOptions)

For fine-grained control, pass an options object:

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    from: 'primary',       // source color key
    algorithm: 'oklch',    // derivation algorithm
    roles: ['success', 'warning', 'error', 'info', 'secondary'],
    hues: { success: 150 },         // override role hue anchor
    alias: { warning: 'warn' },   // rename output variables
    chromaScale: 1,        // chroma scaling
    lightnessShift: 0      // lightness offset
  }
})
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Explicit toggle when using the object form |
| `from` | `string` | `'primary'` | Source color key. Must be a string color or an object with `DEFAULT` in `colors` |
| `algorithm` | `'oklch' \| 'hsl'` | `'oklch'` | Derivation color space. `oklch` is perceptually uniform (recommended) |
| `roles` | `BuiltinRole[]` | all 5 | Roles to derive. Can be trimmed to derive only some |
| `hues` | `Partial<Record<BuiltinRole, number>>` | — | Override default hue anchors (degrees) |
| `alias` | `Partial<Record<BuiltinRole, string>>` | — | Role name → CSS variable name segment mapping |
| `chromaScale` | `number` | `1` | Chroma multiplier for derived colors. >1 increases saturation, <1 decreases |
| `lightnessShift` | `number` | `0` | Lightness offset for derived colors (OKLCh L, range 0–1). Positive = lighter, negative = darker |

### Default Role Hue Anchors

Each role has a default hue anchor in OKLCh space:

| Role | Default Hue (°) | Color Region | Meaning |
| --- | --- | --- | --- |
| `error` | 27 | Red | Error / failure / danger |
| `warning` | 70 | Amber / Orange | Warning / caution |
| `success` | 145 | Green | Success / confirmation |
| `info` | 235 | Blue-cyan | Informational / neutral |
| `secondary` | source + 180° | Complementary | Accent / secondary |

<div style="display:flex;gap:8px;align-items:center;margin:12px 0">
  <div style="width:56px;height:56px;border-radius:8px;background:#1890ff;border:2px solid #333" title="primary (source)"></div>
  <div style="font-size:20px;color:#888">→</div>
  <div style="width:48px;height:48px;border-radius:8px;background:#d56059" title="error ~27°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#c1751d" title="warning ~70°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#00a66b" title="success ~145°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#2199d9" title="info ~235°"></div>
  <div style="width:48px;height:48px;border-radius:8px;background:#d58a18" title="secondary (complementary)"></div>
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

The diagram below illustrates the OKLCh hue wheel with each role's anchor position. The source color "primary" (blue, 209°) keeps its **lightness L** and **chroma C** unchanged — only the **hue H** is rotated to each role's anchor, producing visually harmonious companion colors:

<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:16px auto;display:block">
  <!-- Base ring -->
  <circle cx="200" cy="200" r="150" fill="none" stroke="#e8e8e8" stroke-width="24"/>
  <!-- OKLCh hue wheel: 12 arcs (30° each, approximate OKLCh midpoint colors) -->
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
  <!-- Ring borders -->
  <circle cx="200" cy="200" r="162" fill="none" stroke="#ccc" stroke-width="0.5"/>
  <circle cx="200" cy="200" r="138" fill="none" stroke="#ccc" stroke-width="0.5"/>
  <!-- Center text -->
  <text x="200" y="195" text-anchor="middle" font-size="13" fill="#aaa" font-family="sans-serif">OKLCh Hue Wheel</text>
  <text x="200" y="212" text-anchor="middle" font-size="11" fill="#888" font-family="sans-serif">H = hue angle (0°–360°)</text>
  <!-- Compass labels -->
  <text x="370" y="204" text-anchor="middle" font-size="10" fill="#999">0°</text>
  <text x="200" y="30"  text-anchor="middle" font-size="10" fill="#999">90°</text>
  <text x="30"  y="204" text-anchor="middle" font-size="10" fill="#999">180°</text>
  <text x="200" y="380" text-anchor="middle" font-size="10" fill="#999">270°</text>
  <!-- Radial lines -->
  <line x1="200" y1="200" x2="334" y2="132" stroke="#d56059" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="251" y2="59"  stroke="#c1751d" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="77"  y2="114" stroke="#00a66b" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="69"  y2="273" stroke="#1890ff" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="114" y2="323" stroke="#2199d9" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="200" y1="200" x2="305" y2="142" stroke="#d58a18" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <!-- error (27°) -->
  <circle cx="334" cy="132" r="10" fill="#d56059" stroke="#fff" stroke-width="2"/>
  <text x="349" y="122" text-anchor="start" font-size="10" fill="#d56059" font-family="sans-serif">error 27°</text>
  <!-- warning (70°) -->
  <circle cx="251" cy="59" r="10" fill="#c1751d" stroke="#fff" stroke-width="2"/>
  <text x="265" y="49" text-anchor="start" font-size="10" fill="#c1751d" font-family="sans-serif">warning 70°</text>
  <!-- success (145°) -->
  <circle cx="77" cy="114" r="10" fill="#00a66b" stroke="#fff" stroke-width="2"/>
  <text x="62" y="102" text-anchor="end" font-size="10" fill="#00a66b" font-family="sans-serif">success 145°</text>
  <!-- primary (209°) -->
  <circle cx="69" cy="273" r="12" fill="#1890ff" stroke="#fff" stroke-width="2"/>
  <text x="50" y="264" text-anchor="end" font-size="10" fill="#1890ff" font-weight="bold" font-family="sans-serif">primary</text>
  <text x="50" y="276" text-anchor="end" font-size="9"  fill="#1890ff" font-family="sans-serif">209°</text>
  <!-- info (235°) -->
  <circle cx="114" cy="323" r="10" fill="#2199d9" stroke="#fff" stroke-width="2"/>
  <text x="98" y="345" text-anchor="end" font-size="10" fill="#2199d9" font-family="sans-serif">info 235°</text>
  <!-- secondary (29°) -->
  <circle cx="305" cy="142" r="9" fill="#d58a18" stroke="#fff" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="318" y="152" text-anchor="start" font-size="10" fill="#d58a18" font-family="sans-serif">secondary</text>
  <text x="318" y="164" text-anchor="start" font-size="9"  fill="#d58a18" font-family="sans-serif">(209°+180°=29°)</text>
</svg>

> **How it works**: OKLCh is the polar form of OKLab with three independent dimensions — L (lightness), C (chroma), and H (hue). Derivation **only rotates H** to the target anchor while keeping L and C unchanged, ensuring all derived colors match the source in perceived brightness and saturation. This is the key advantage over HSL, where the same L value produces visibly different brightness at different hues.

### Algorithm Comparison

| | OKLCh (recommended) | HSL |
| --- | --- | --- |
| Color space | OKLCh (perceptually uniform) | HSL |
| Lightness consistency | ✅ Perceived brightness uniform across hues | ❌ Same L value looks different at different hues |
| Saturation consistency | ✅ Chroma is perceptually uniform | ❌ Notable saturation differences between pure hues |
| Best for | Design systems seeking visual consistency | Simple use cases or legacy browser needs |

### User Override Priority

Colors explicitly provided in `colors` always take priority over derived values:

```ts
xcolor.use(themePlugin, {
  colors: {
    primary: '#1890ff',
    success: '#52c41a'    // user-defined success, derivation skipped
  },
  derive: true
})

const vars = xcolor.getThemeVars()
vars['--x-success-500'] // '#52c41a' — user value
vars['--x-error-500']   // derived value
vars['--x-warning-500'] // derived value
```

### Renaming Roles (alias)

If your project uses different naming conventions, rename the output variables via `alias`:

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    alias: {
      warning: 'warn',    // --x-warn-500 instead of --x-warning-500
      error: 'danger'     // --x-danger-500 instead of --x-error-500
    }
  }
})

const vars = xcolor.getThemeVars()
vars['--x-warn-500']    // exists
vars['--x-danger-500']  // exists
vars['--x-warning-500'] // undefined
vars['--x-error-500']   // undefined
```

When using alias, user overrides should also use the alias key:

```ts
xcolor.use(themePlugin, {
  colors: {
    primary: '#1890ff',
    warn: '#faad14'       // override using alias 'warn'
  },
  derive: {
    alias: { warning: 'warn' }
  }
})
```

### Deriving Only Some Roles

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    roles: ['success', 'error']  // only these two
  }
})

const vars = xcolor.getThemeVars()
vars['--x-success-500'] // exists
vars['--x-error-500']   // exists
vars['--x-warning-500'] // undefined — not requested
vars['--x-info-500']    // undefined — not requested
```

### Using a Custom Source Color

```ts
xcolor.use(themePlugin, {
  colors: {
    brand: '#6200ea'  // use brand color as derivation source
  },
  derive: {
    from: 'brand'     // derive from brand instead of primary
  }
})
```

### Adjusting Chroma & Lightness

```ts
// Derived colors with slightly lower saturation — softer look
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff' },
  derive: {
    chromaScale: 0.85,      // reduce chroma by 15%
    lightnessShift: 0.03    // slightly brighter
  }
})
```

## Static Methods

The following methods are registered on the `xcolor` factory and are available after calling `xcolor.use(themePlugin, options)`.

### injectTheme()

Inject the generated theme CSS into `<head>`, creating or updating a `<style id="xcolor-theme">` element.

In non-browser environments (Node.js / SSR), this method only returns the CSS string without DOM manipulation.

**Return value**: `string` (CSS string)

```ts
xcolor.use(themePlugin, {
  colors: { primary: '#1890ff', success: '#52c41a' }
})
xcolor.injectTheme()
// → <style id="xcolor-theme">:root { --x-primary-500: #1890ff; ... }</style>
```

### getThemeCss()

Get the complete CSS string without injecting into the DOM.

**Return value**: `string`

```ts
const css = xcolor.getThemeCss()
// ':root {\n  --x-primary-500: #1890ff;\n  ...\n}\n'
```

### getThemeVars()

Get a flat map of CSS variable names to values.

**Return value**: `Record<string, string>`

```ts
const vars = xcolor.getThemeVars()
// { '--x-primary-500': '#1890ff', '--x-primary-hover': '#40a9ff', ... }
```

### updateTheme(options, deep?)

Update the theme configuration. By default, uses deep merge — only pass the fields you want to change; everything else is preserved. Pass `false` as the second argument to use shallow merge (replaces top-level keys entirely). If a `<style>` tag was previously injected, the DOM is automatically updated.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `Partial<XColorThemeOptions>` | — | Partial configuration to merge |
| `deep` | `boolean` | `true` | Whether to deep merge. `false` uses shallow merge |

```ts
// Deep merge (default) — only the primary color changes
xcolor.updateTheme({ colors: { primary: '#722ed1' } })

// Shallow merge — replaces the entire colors object
xcolor.updateTheme({ colors: { primary: '#722ed1' } }, false)

// Switch to dark mode
xcolor.updateTheme({ darkMode: 'class' })

// Modify multiple options at once
xcolor.updateTheme({
  prefix: '--color',
  format: 'rgb',
  colors: { primary: '#1890ff', danger: '#ff4d4f' }
})
```

### removeTheme()

Remove the injected `<style>` tag and clear the cached theme result.

```ts
xcolor.removeTheme()
```

## Full Examples

### Basic Usage

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

// Inject into the page
xcolor.injectTheme()
```

Generated CSS:

```css
:root {
  --x-primary-50: #e6f7ff;
  --x-primary-100: #bae7ff;
  /* ... more shades ... */
  --x-primary-500: #1890ff;
  /* ... */
  --x-primary-900: #002766;
  --x-primary-hover: #40a9ff;
  --x-primary-active: #096dd9;
  --x-primary-disabled: #91d5ff;
  --x-primary-border: #69c0ff;
  --x-primary-bg: #e6f7ff;
  --x-primary-text: #002766;
  /* success, warning, danger likewise ... */
}
```

### Full Configuration with Dark Mode

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

// Get CSS for SSR
const css = xcolor.getThemeCss()
```

### Dynamic Theme Switching

```ts
// User selects a new theme color
function onColorChange(newColor: string) {
  xcolor.updateTheme({
    colors: { primary: newColor }
  })
  // If injectTheme() was called before, the DOM updates automatically
}
```

## Type Exports

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
