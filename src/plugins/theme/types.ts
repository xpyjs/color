// =======================================
// Plugin: theme - Type definitions
// =======================================

import type { XColor } from "@xpyjs/color";
import type { Shade, PaletteType } from "@xpyjs/color/plugins/palette";
export { DEFAULT_SHADES } from "@xpyjs/color/plugins/palette";
export type { Shade };

/**
 * Color configuration for a single color entry.
 *
 * - `string` — A color value (e.g. `'#1890ff'`). Used as the base color to
 *   auto-generate a full shade palette and semantic colors.
 * - `object` with `DEFAULT` — The `DEFAULT` key is the base color for
 *   auto-generation; other keys override or extend the generated palette.
 * - `object` without `DEFAULT` — Pure custom nesting. No palette is generated;
 *   keys are flattened into CSS variable names.
 *
 * @example
 * ```ts
 * // String shorthand — auto-generate everything
 * { primary: '#1890ff' }
 *
 * // Object with DEFAULT — auto-generate + override hover
 * { success: { DEFAULT: '#52c41a', hover: '#73d13d' } }
 *
 * // Pure custom nesting — no auto-generation
 * { brand: { logo: '#ff6600', accent: { light: '#ce93d8', dark: '#7b1fa2' } } }
 * ```
 */
export type ColorConfig = string | {
  DEFAULT: string;
  [key: string]: string | ColorConfig;
} | {
  [key: string]: string | ColorConfig;
};

/**
 * Palette generation type.
 *
 * - `'antd'` — Non-linear HSV curve inspired by Ant Design. Produces
 *   perceptually balanced palettes with hue rotation and saturation variation.
 * - `'linear'` — Simple linear interpolation from white through the base color
 *   to near-black. Even spacing in RGB space.
 * - `CustomPaletteGenerator` — A custom function that generates a palette.
 */
export type ThemePaletteType = PaletteType;

/**
 * Output format for CSS variable values.
 *
 * - `'hex'` — `#1890ff` (default)
 * - `'rgb'` — `rgb(24, 144, 255)`
 * - `'hsl'` — `hsl(209, 100%, 55%)`
 */
export type ThemeCssFormat = "hex" | "rgb" | "hsl";

/**
 * Configuration object for the theme plugin.
 *
 * This is the unified configuration structure shared between the built-in
 * runtime plugin (`xcolor.use(ThemePlugin, options)`) and future build-tool
 * integrations (unplugin).
 *
 * @example
 * ```ts
 * import xcolor from '@xpyjs/color'
 * import ThemePlugin from '@xpyjs/color/plugins/theme'
 *
 * xcolor.use(ThemePlugin, {
 *   prefix: '--x',
 *   colors: {
 *     primary: '#1890ff',
 *     success: { DEFAULT: '#52c41a', hover: '#73d13d' },
 *   },
 *   darkMode: 'class',
 * })
 * ```
 */
export interface XColorThemeOptions {
  /**
   * CSS variable name prefix.
   * @default '--x'
   * @example '--color' → `--color-primary-500`
   */
  prefix?: string;

  /**
   * Palette generation type.
   *
   * Built-in types: `'antd'` (default) | `'linear'`.
   * You can also pass a custom function `(baseColor, shades) => XColor[]`.
   * @default 'antd'
   */
  type?: ThemePaletteType;

  /**
   * Shade levels to generate for each color with a base (DEFAULT) value.
   * @default [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
   */
  shades?: Shade[];

  /**
   * Color definitions. Keys become CSS variable name segments.
   *
   * Each entry can be:
   * - A color string (auto-generates full palette + semantic colors)
   * - An object with `DEFAULT` (auto-generates + allows overrides)
   * - An object without `DEFAULT` (pure custom nesting)
   */
  colors: Record<string, string | ColorConfig>;

  /**
   * Whether to auto-generate semantic color variants (hover, active,
   * disabled, border, bg, text) for colors that have a base value.
   * @default true
   */
  semantic?: boolean;

  /**
   * Dark mode strategy.
   * - `'class'` — Dark variables are wrapped in `darkSelector` (e.g. `.dark { ... }`)
   * - `'media'` — Dark variables use `@media (prefers-color-scheme: dark) { ... }`
   * - `false` — No dark mode generated
   * @default false
   */
  darkMode?: "class" | "media" | false;

  /**
   * CSS selector for dark mode when `darkMode` is `'class'`.
   * @default '.dark'
   */
  darkSelector?: string;

  /**
   * CSS selector for light/default mode variables.
   * @default ':root'
   */
  cssSelector?: string;

  /**
   * Output format for CSS variable values.
   * @default 'hex'
   */
  format?: ThemeCssFormat;

  /**
   * Automatically derive a full set of semantic role colors from a single
   * source color (e.g. `primary`).
   *
   * When enabled, the plugin generates `secondary`, `success`, `warning`,
   * `error`, and `info` colors that share a unified visual style with the
   * source. Colors explicitly provided in `colors` take priority over
   * derived colors.
   *
   * - `false` (default) — No derivation; only colors in `colors` are generated.
   * - `true` — Derive all 5 roles from `primary` using OKLCh algorithm.
   * - `XColorThemeDeriveOptions` — Fine-grained control over derivation.
   *
   * @default false
   * @example
   * ```ts
   * // Quick: derive everything from primary
   * xcolor.use(themePlugin, {
   *   colors: { primary: '#1890ff' },
   *   derive: true
   * })
   *
   * // Advanced: customize roles, alias, and hue anchors
   * xcolor.use(themePlugin, {
   *   colors: { primary: '#1890ff' },
   *   derive: {
   *     algorithm: 'oklch',
   *     roles: ['success', 'warning', 'error'],
   *     alias: { warning: 'warn' },
   *     hues: { success: 150 }
   *   }
   * })
   * ```
   */
  derive?: boolean | XColorThemeDeriveOptions;
}

/**
 * Result of theme generation, containing CSS output and structured data.
 */
export interface ThemeResult {
  /** Complete CSS string ready for injection or file output. */
  css: string;
  /** Flat map of CSS variable names to color values. */
  vars: Record<string, string>;
  /** Generated color palettes keyed by color name. Only includes colors with a base value. */
  colors: Record<string, XColor[]>;
}

// =======================================
// Derive: auto-generate a full set of
// semantic role colors from a single
// primary (or other source) color.
// =======================================

/**
 * Built-in semantic role names that can be auto-derived from a source color.
 *
 * - `'secondary'` — Complementary / accent color
 * - `'success'` — Positive / confirmation
 * - `'warning'` — Cautionary / attention
 * - `'error'` — Negative / destructive
 * - `'info'` — Informational / neutral
 */
export type BuiltinRole = "secondary" | "success" | "warning" | "error" | "info";

/**
 * Algorithm used to derive role colors from the source color.
 *
 * - `'oklch'` — OKLCh perceptual color space (recommended). Produces
 *   visually uniform results by preserving lightness and chroma while
 *   rotating hue to each role's anchor point.
 * - `'hsl'` — HSL color space fallback. Simpler but less perceptually
 *   uniform — hue rotation in HSL can produce uneven brightness.
 *
 * @default 'oklch'
 */
export type ThemeDeriveAlgorithm = "oklch" | "hsl";

/**
 * Configuration for the automatic role-color derivation feature.
 *
 * When enabled, a single source color (e.g. `primary`) is used to
 * generate a full set of semantic role colors (`secondary`, `success`,
 * `warning`, `error`, `info`) with a unified visual style.
 *
 * @example
 * ```ts
 * // Enable with defaults — derive all 5 roles from primary
 * xcolor.use(themePlugin, {
 *   colors: { primary: '#1890ff' },
 *   derive: true
 * })
 *
 * // Fine-tune derivation
 * xcolor.use(themePlugin, {
 *   colors: { primary: '#1890ff' },
 *   derive: {
 *     from: 'primary',
 *     algorithm: 'oklch',
 *     roles: ['success', 'warning', 'error'],
 *     hues: { success: 150 },
 *     alias: { warning: 'warn' }
 *   }
 * })
 * ```
 */
export interface XColorThemeDeriveOptions {
  /**
   * Explicitly enable or disable derivation when using the object form.
   * @default true
   */
  enabled?: boolean;

  /**
   * The key in `colors` to use as the source color for derivation.
   *
   * Must reference a color that resolves to a base value — either a
   * string color or an object with a `DEFAULT` key.
   *
   * @default 'primary'
   * @example
   * ```ts
   * { from: 'brand' }  // derive from colors.brand
   * ```
   */
  from?: string;

  /**
   * Algorithm for deriving role colors from the source.
   *
   * - `'oklch'` (default) — Perceptually uniform; recommended for
   *   visually consistent palettes.
   * - `'hsl'` — HSL-based hue rotation; simpler but less uniform.
   *
   * @default 'oklch'
   */
  algorithm?: ThemeDeriveAlgorithm;

  /**
   * Which built-in roles to derive. Omit to derive all 5 default roles.
   *
   * @default ['secondary', 'success', 'warning', 'error', 'info']
   * @example
   * ```ts
   * // Only derive success and error
   * { roles: ['success', 'error'] }
   * ```
   */
  roles?: BuiltinRole[];

  /**
   * Override the default hue anchor (in degrees) for specific roles.
   *
   * Default hue anchors (OKLCh space):
   * - `error`: 27° (red)
   * - `warning`: 70° (amber / orange)
   * - `success`: 145° (green)
   * - `info`: 235° (blue-cyan)
   * - `secondary`: source hue + 180° (complementary)
   *
   * @example
   * ```ts
   * { hues: { success: 160, warning: 60 } }
   * ```
   */
  hues?: Partial<Record<BuiltinRole, number>>;

  /**
   * Rename the output variable segment for a role.
   *
   * By default, role names are used as-is in CSS variable names (e.g.
   * `--x-warning-500`). Use `alias` to change the output name while
   * keeping the role identity. User overrides should use the alias name
   * in `colors` (e.g. `colors.warn` instead of `colors.warning`).
   *
   * @example
   * ```ts
   * // Output: --x-warn-500 instead of --x-warning-500
   * { alias: { warning: 'warn' } }
   * ```
   */
  alias?: Partial<Record<BuiltinRole, string>>;

  /**
   * Chroma scale factor applied to the source color's chroma when
   * deriving role colors. Values > 1 increase saturation; < 1 decrease.
   *
   * @default 1
   * @example
   * ```ts
   * { chromaScale: 0.8 }  // slightly less saturated
   * ```
   */
  chromaScale?: number;

  /**
   * Lightness offset applied to derived colors (OKLCh `L`, range 0-1).
   * Positive values lighten; negative values darken.
   *
   * @default 0
   * @example
   * ```ts
   * { lightnessShift: -0.05 }  // slightly darker
   * ```
   */
  lightnessShift?: number;
}
