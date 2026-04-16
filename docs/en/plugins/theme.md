# theme - Theme & CSS Variables

Design-system-level theme color generator. Automatically generates complete shade palettes, semantic colors, and dark mode from base colors, outputting CSS variables that can be injected into the DOM or used as strings for SSR.

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
  ColorConfig
} from '@xpyjs/color/plugins/theme'
```
