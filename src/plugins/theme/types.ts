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
