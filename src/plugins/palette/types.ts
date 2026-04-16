// =======================================
// Plugin: palette - Type definitions
// =======================================

import type { XColor } from "@xpyjs/color";

/**
 * Shade level for design system palettes.
 *
 * Standard 11-step shade scale covering lightest (50) to darkest (950).
 * The base color maps to shade `500`.
 */
export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/** Default shade levels used when none are specified. */
export const DEFAULT_SHADES: Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Custom palette generator function.
 *
 * Receives the base color and shade levels, returns an array of XColor
 * instances matching those shades (from lightest to darkest).
 *
 * @example
 * ```ts
 * const myGenerator: CustomPaletteGenerator = (base, shades) => {
 *   return shades.map((s) => {
 *     const factor = (s - 500) / 500
 *     return factor < 0
 *       ? xcolor(base.toHex()).lighten(Math.abs(factor) * 50)
 *       : xcolor(base.toHex()).darken(factor * 50)
 *   })
 * }
 * ```
 */
export type CustomPaletteGenerator = (baseColor: XColor, shades: Shade[]) => XColor[];

/**
 * Palette generation type.
 *
 * - `'antd'` — Non-linear HSV curve inspired by Ant Design. Produces
 *   perceptually balanced palettes with hue rotation and saturation variation.
 * - `'linear'` — Simple linear interpolation from white through the base color
 *   to near-black. Even spacing in RGB space.
 * - `CustomPaletteGenerator` — A custom function that generates a palette.
 */
export type PaletteType = "antd" | "linear" | CustomPaletteGenerator;
