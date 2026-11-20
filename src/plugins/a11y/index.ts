import { compositeRgb, luminanceRatio } from "../../color-math";
// =======================================
// Plugin: a11y - Accessibility utilities
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import { XColor, defineMethod, Logger, relativeLuminance, round } from "@xpyjs/color";

/**
 * WCAG 2.0 conformance level.
 *
 * - `"AA"`  — Minimum acceptable level. Requires contrast ≥ 4.5:1 (normal text) or ≥ 3:1 (large text).
 * - `"AAA"` — Enhanced level. Requires contrast ≥ 7:1 (normal text) or ≥ 4.5:1 (large text).
 *
 * @see https://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast
 */
type WCAGLevel = "AA" | "AAA";

/**
 * Text size category used in WCAG contrast calculations.
 *
 * - `"normal"` — Regular body text (< 18pt or < 14pt bold). Higher contrast required.
 * - `"large"`  — Large text (≥ 18pt or ≥ 14pt bold). Lower contrast threshold applies.
 *
 * @see https://www.w3.org/TR/WCAG20/#larger-scaledef
 */
type WCAGSize = "normal" | "large";

/** Background context for accessibility calculations. */
export interface XColorContrastOptions {
  /** Opaque color behind a translucent background. Required when background alpha is below 1. */
  backdrop?: XColorInput;
}

/** WCAG thresholds and background context. */
export interface XColorReadabilityOptions extends XColorContrastOptions {
  /** Conformance level. @default 'AA' */
  level?: WCAGLevel;
  /** Text size category. @default 'normal' */
  size?: WCAGSize;
}

/** Target contrast and permitted adjustment direction. */
export interface XColorContrastAdjustmentOptions extends XColorContrastOptions {
  /** Required contrast in [1,21], default 4.5. */
  target?: number;
  /** Search toward black, white, or both (default auto). Alpha stays unchanged. */
  direction?: "auto" | "darker" | "lighter";
}

/** Explicit success/failure, including the actual unrounded achieved ratio. */
export interface XColorContrastAdjustment {
  color: XColor;
  ratio: number;
  target: number;
  met: boolean;
  changed: boolean;
}

/** Named theme token pair; both keys must exist in the supplied color map. */
export interface XColorContrastPair {
  foreground: string;
  background: string;
  /** Per-pair target overrides the global target (default 4.5). */
  target?: number;
}

/** One theme-pair audit result. */
export interface XColorContrastPairResult extends XColorContrastPair {
  target: number;
  ratio: number;
  passes: boolean;
}

function contrastTarget(target = 4.5): number {
  if (!Number.isFinite(target) || target < 1 || target > 21) throw Logger.createError("Contrast target must be within [1,21]");
  return target;
}

/**
 * Adjust a foreground toward black/white until it reaches the requested WCAG ratio.
 * @param foreground - Color to adjust; source instances retain their precision options
 * @param background - Background, optionally composited over options.backdrop
 * @param options - Target (default 4.5) and direction (default auto)
 * @returns Independent color and actual ratio. Unreachable targets return met=false and the best endpoint.
 * Alpha is preserved. Auto selects the passing direction with the smallest RGB change.
 * @throws For invalid colors, target/direction, or an unresolved translucent background
 * @see https://www.w3.org/TR/WCAG22/#contrast-minimum
 */
export function adjustContrast(foreground: XColorInput, background: XColorInput, options: XColorContrastAdjustmentOptions = {}): XColorContrastAdjustment {
  const target = contrastTarget(options.target), direction = options.direction ?? "auto";
  if (!["auto","darker","lighter"].includes(direction)) throw Logger.createError("Invalid contrast adjustment direction");
  const source = new XColor(foreground);
  const backdrop = opaqueBackground(new XColor(background,{useDecimal:true}),options,XColor);
  if (!source.isValid() || !backdrop) throw Logger.createError("Contrast adjustment requires valid colors and a resolved background");
  const initial = rawContrast(source,backdrop);
  const result = (color: XColor): XColorContrastAdjustment => {
    const ratio = rawContrast(color,backdrop);
    return {color,ratio,target,met:ratio >= target,changed:color.red() !== source.red() || color.green() !== source.green() || color.blue() !== source.blue()};
  };
  if (initial >= target) return result(source);
  const search = (endpoint: number): XColorContrastAdjustment => {
    const candidate = (t: number) => new XColor({r:source.red()+(endpoint-source.red())*t,g:source.green()+(endpoint-source.green())*t,b:source.blue()+(endpoint-source.blue())*t,a:source.alpha()},source._opts);
    let best = candidate(1);
    if (rawContrast(best,backdrop) < target) return result(best);
    let low = 0, high = 1;
    for (let i = 0; i < 48; i++) {
      const middle = (low+high)/2, color = candidate(middle);
      if (rawContrast(color,backdrop) >= target) { high = middle; best = color; }
      else low = middle;
    }
    return result(best);
  };
  if (direction === "darker") return search(0);
  if (direction === "lighter") return search(255);
  const dark = search(0), light = search(255);
  if (!dark.met && !light.met) return dark.ratio >= light.ratio ? dark : light;
  if (!dark.met) return light;
  if (!light.met) return dark;
  const distance = (color: XColor) => (color.red()-source.red())**2+(color.green()-source.green())**2+(color.blue()-source.blue())**2;
  return distance(dark.color) <= distance(light.color) ? dark : light;
}

/**
 * Audit explicit foreground/background pairs from a flat theme token or CSS-variable map.
 * @param colors - Named concrete colors (e.g. getThemeVars()); unresolved var() values are invalid
 * @param pairs - Token-name pairs and optional per-pair contrast targets
 * @param options - Default target 4.5 and optional opaque backdrop
 * @returns Independent per-pair results with unrounded ratios; never mutates the theme
 * @throws For missing tokens, invalid values/targets, or unresolved translucent backgrounds
 */
export function auditContrastPairs(colors: Readonly<Record<string,XColorInput>>, pairs: readonly XColorContrastPair[], options: XColorContrastOptions & {target?:number} = {}): XColorContrastPairResult[] {
  const defaultTarget = contrastTarget(options.target);
  return pairs.map(pair => {
    if (!Object.prototype.hasOwnProperty.call(colors,pair.foreground) || !Object.prototype.hasOwnProperty.call(colors,pair.background)) throw Logger.createError(`Missing contrast pair token: ${pair.foreground} / ${pair.background}`);
    const target = contrastTarget(pair.target ?? defaultTarget);
    const foreground = new XColor(colors[pair.foreground],{useDecimal:true});
    const background = opaqueBackground(new XColor(colors[pair.background],{useDecimal:true}),options,XColor);
    if (!foreground.isValid() || !background) throw Logger.createError(`Invalid contrast pair: ${pair.foreground} / ${pair.background}`);
    const ratio = rawContrast(foreground,background);
    return {foreground:pair.foreground,background:pair.background,target,ratio,passes:ratio >= target};
  });
}

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Check if color combination is readable (WCAG 2.0).
     * @param background - Background color to check against
     * @param options - WCAG level and text size
     * @param options.backdrop - Opaque bottom layer when background is translucent
     * @returns `true` if the contrast ratio meets the specified WCAG threshold
     * Invalid colors or a translucent background without an opaque backdrop return false.
     * @example
     * ```ts
     * const text = xcolor('#000000');
     * text.isReadable('#ffffff'); // true (contrast ~21:1)
     * text.isReadable('#000000'); // false (contrast 1:1)
     * text.isReadable('#767676', { level: 'AA', size: 'normal' }); // true
     * ```
     */
    isReadable(background: XColorInput, options?: XColorReadabilityOptions): boolean;

    /**
     * Find the most readable color from a list of candidates.
     * If no candidate meets the threshold, returns black or white as a fallback.
     * @param colorList - Array of candidate colors to compare
     * @param options - WCAG level and text size
     * @param options.backdrop - Opaque bottom layer when this background is translucent
     * @returns A new XColor instance of the most readable candidate (or black/white fallback)
     * @throws If this background is invalid or cannot be resolved to an opaque color
     * @example
     * ```ts
     * const bg = xcolor('#ffffff');
     * const best = bg.mostReadable(['#000000', '#ff0000', '#00ff00']);
     * console.log(best.toHex()); // '#000000'
     * ```
     */
    mostReadable(colorList: XColorInput[], options?: XColorReadabilityOptions): XColor;

    /**
     * Get WCAG compliance level for a color combination.
     * @param background - Background color to check against
     * @param options - Optional opaque backdrop for translucent backgrounds
     * @returns Object with `level` (normal text), `largeText` (large text), and `ratio` (contrast ratio)
     * @throws If either color is invalid or the background cannot be resolved to an opaque color
     * @example
     * ```ts
     * const result = xcolor('#000000').wcagLevel('#ffffff');
     * // { level: 'AAA', largeText: 'AAA', ratio: 21 }
     * ```
     */
    wcagLevel(background: XColorInput, options?: XColorContrastOptions): {
      level: "AAA" | "AA" | "FAIL";
      largeText: "AAA" | "AA" | "FAIL";
      ratio: number;
    };
  }
}

const THRESHOLDS: Record<string, number> = {
  "AA-normal": 4.5,
  "AA-large": 3,
  "AAA-normal": 7,
  "AAA-large": 4.5
};

function channels(color: XColor) {
  return { r: color.red(), g: color.green(), b: color.blue() };
}

function opaqueBackground(background: XColor, options: XColorContrastOptions, cls: typeof XColor) {
  if (!background.isValid()) return null;
  if (background.alpha() === 1) return channels(background);
  if (options.backdrop == null) return null;
  const backdrop = new cls(options.backdrop, { useDecimal: true });
  if (!backdrop.isValid() || backdrop.alpha() !== 1) return null;
  return compositeRgb(channels(background), background.alpha(), channels(backdrop));
}

function rawContrast(foreground: XColor, background: { r: number; g: number; b: number }): number {
  const visible = compositeRgb(channels(foreground), foreground.alpha(), background);
  const a = relativeLuminance(visible.r, visible.g, visible.b);
  const b = relativeLuminance(background.r, background.g, background.b);
  return luminanceRatio(a, b);
}

const a11y: XColorPlugin = {
  name: "@xpyjs/color/plugins/a11y",
  install(_option, cls, _factory) {
    defineMethod(cls, 'isReadable', function (this: XColor, background: XColorInput, options: XColorReadabilityOptions = {}) {
      const { level = "AA", size = "normal" } = options;
      const other = opaqueBackground(new cls(background, { useDecimal: true }), options, cls);
      if (!this.isValid() || !other) return false;
      const ratio = rawContrast(this, other);
      const threshold = THRESHOLDS[`${level}-${size}`] || 4.5;
      return ratio >= threshold;
    });

    defineMethod(cls, 'mostReadable', function (this: InstanceType<typeof cls>, colorList: XColorInput[], options: XColorReadabilityOptions = {}) {
      const { level = "AA", size = "normal" } = options;
      const threshold = THRESHOLDS[`${level}-${size}`] || 4.5;

      if (!this.isValid()) throw Logger.createError("Invalid base color for readability");
      const background = opaqueBackground(this, options, cls);
      if (!background) throw Logger.createError("Readability requires an opaque background or an opaque backdrop");
      let bestColor: InstanceType<typeof cls> | null = null;
      let bestContrast = 0;

      for (const c of (Array.isArray(colorList) ? colorList : [])) {
        const candidate = new cls(c, { useDecimal: true });
        if (!candidate.isValid()) continue;
        const ratio = rawContrast(candidate, background);
        if (ratio > bestContrast) {
          bestContrast = ratio;
          bestColor = candidate;
        }
      }

      if (bestColor && bestContrast >= threshold) return bestColor;

      const black = new cls("#000");
      const white = new cls("#fff");
      return rawContrast(black, background) > rawContrast(white, background) ? black : white;
    });

    defineMethod(cls, 'wcagLevel', function (this: InstanceType<typeof cls>, background: XColorInput, options: XColorContrastOptions = {}) {
      const input = new cls(background, { useDecimal: true });
      if (!this.isValid() || !input.isValid()) throw Logger.createError("Invalid color for WCAG contrast");
      const other = opaqueBackground(input, options, cls);
      if (!other) throw Logger.createError("WCAG contrast requires an opaque background or an opaque backdrop");
      const ratio = rawContrast(this, other);
      return {
        level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "FAIL",
        largeText: ratio >= 4.5 ? "AAA" : ratio >= 3 ? "AA" : "FAIL",
        ratio: round(ratio, 2)
      };
    });
  }
};

export type { WCAGLevel, WCAGSize };

export default a11y;
