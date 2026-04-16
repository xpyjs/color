/**
 * RGBA color object.
 *
 * - `r`, `g`, `b` are integers in `0–255`
 * - `a` (alpha) is a float in `0–1`, where `0` = fully transparent, `1` = fully opaque
 *
 * @example
 * ```ts
 * const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
 * const semiBlue: RGBA = { r: 0, g: 0, b: 255, a: 0.5 };
 * ```
 */
export interface RGBA {
  /** Red channel — integer `0` (no red) to `255` (full red) */
  r: number;
  /** Green channel — integer `0` (no green) to `255` (full green) */
  g: number;
  /** Blue channel — integer `0` (no blue) to `255` (full blue) */
  b: number;
  /** Alpha (opacity) — float `0` (fully transparent) to `1` (fully opaque) */
  a: number;
}

/**
 * HSL color object with alpha.
 *
 * - `h` (hue) is in degrees `0–360` on the color wheel
 * - `s` (saturation) and `l` (lightness) are percentages `0–100`
 * - `a` (alpha) is a float `0–1`
 *
 * @example
 * ```ts
 * const red: HSLA = { h: 0, s: 100, l: 50, a: 1 };
 * const semiGreen: HSLA = { h: 120, s: 100, l: 50, a: 0.5 };
 * ```
 */
export interface HSLA {
  /** Hue angle — degrees `0` to `360` on the color wheel */
  h: number;
  /** Saturation — percentage `0` (grey/desaturated) to `100` (fully saturated) */
  s: number;
  /** Lightness — percentage `0` (black) to `100` (white); `50` = pure color tone */
  l: number;
  /** Alpha (opacity) — float `0` (fully transparent) to `1` (fully opaque) */
  a: number;
}

/**
 * HSV (HSB) color object with alpha.
 *
 * - `h` (hue) is in degrees `0–360` on the color wheel
 * - `s` (saturation) and `v` (value/brightness) are percentages `0–100`
 * - `a` (alpha) is a float `0–1`
 *
 * @example
 * ```ts
 * const red: HSVA = { h: 0, s: 100, v: 100, a: 1 };
 * const darkBlue: HSVA = { h: 240, s: 100, v: 50, a: 1 };
 * ```
 */
export interface HSVA {
  /** Hue angle — degrees `0` to `360` on the color wheel */
  h: number;
  /** Saturation — percentage `0` (grey/desaturated) to `100` (fully saturated) */
  s: number;
  /** Value (brightness) — percentage `0` (black) to `100` (full brightness) */
  v: number;
  /** Alpha (opacity) — float `0` (fully transparent) to `1` (fully opaque) */
  a: number;
}

export { type XColorPlugin } from "./plugins/types";
export type { XColorParser } from "./parse";
export type {
  XColorFactory,
  XColorInput,
  XColorInputObjectMap,
  XColorOptions,
  XColorStringFormat,
  XColorStringFormatMap
} from "./core";