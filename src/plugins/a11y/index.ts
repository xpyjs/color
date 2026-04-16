// =======================================
// Plugin: a11y - Accessibility utilities
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import { defineMethod } from "@xpyjs/color";

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

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Check if color combination is readable (WCAG 2.0).
     * @param background - Background color to check against
     * @param options - WCAG level and text size
     * @returns `true` if the contrast ratio meets the specified WCAG threshold
     * @example
     * ```ts
     * const text = xcolor('#000000');
     * text.isReadable('#ffffff'); // true (contrast ~21:1)
     * text.isReadable('#000000'); // false (contrast 1:1)
     * text.isReadable('#767676', { level: 'AA', size: 'normal' }); // true
     * ```
     */
    isReadable(background: XColorInput, options?: { level?: WCAGLevel; size?: WCAGSize }): boolean;

    /**
     * Find the most readable color from a list of candidates.
     * If no candidate meets the threshold, returns black or white as a fallback.
     * @param colorList - Array of candidate colors to compare
     * @param options - WCAG level and text size
     * @returns A new XColor instance of the most readable candidate (or black/white fallback)
     * @example
     * ```ts
     * const bg = xcolor('#ffffff');
     * const best = bg.mostReadable(['#000000', '#ff0000', '#00ff00']);
     * console.log(best.toHex()); // '#000000'
     * ```
     */
    mostReadable(colorList: XColorInput[], options?: { level?: WCAGLevel; size?: WCAGSize }): XColor;

    /**
     * Get WCAG compliance level for a color combination.
     * @param background - Background color to check against
     * @returns Object with `level` (normal text), `largeText` (large text), and `ratio` (contrast ratio)
     * @example
     * ```ts
     * const result = xcolor('#000000').wcagLevel('#ffffff');
     * // { level: 'AAA', largeText: 'AAA', ratio: 21 }
     * ```
     */
    wcagLevel(background: XColorInput): {
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

const a11y: XColorPlugin = {
  name: "@xpyjs/color/plugins/a11y",
  install(_option, cls, _factory) {
    defineMethod(cls, 'isReadable', function (this: InstanceType<typeof cls>, background: any, options: any = {}) {
      const { level = "AA", size = "normal" } = options;
      const ratio = this.contrast(background);
      const threshold = THRESHOLDS[`${level}-${size}`] || 4.5;
      return ratio >= threshold;
    });

    defineMethod(cls, 'mostReadable', function (this: InstanceType<typeof cls>, colorList: XColorInput[], options: { level?: WCAGLevel; size?: WCAGSize } = {}) {
      const { level = "AA", size = "normal" } = options;
      const threshold = THRESHOLDS[`${level}-${size}`] || 4.5;

      let bestColor: InstanceType<typeof cls> | null = null;
      let bestContrast = 0;

      for (const c of (Array.isArray(colorList) ? colorList : [])) {
        const candidate = new cls(c);
        if (!candidate.isValid()) continue;
        const ratio = this.contrast(candidate);
        if (ratio > bestContrast) {
          bestContrast = ratio;
          bestColor = candidate;
        }
      }

      // If no readable color found, return black or white based on luminance
      if (!bestColor) {
        return this.isLight() ? new cls("#000000") : new cls("#ffffff");
      }

      // If best still doesn't meet threshold, return black or white fallback
      if (bestContrast < threshold) {
        const blackContrast = this.contrast("#000000");
        const whiteContrast = this.contrast("#ffffff");
        return blackContrast > whiteContrast
          ? new cls("#000000")
          : new cls("#ffffff");
      }

      return bestColor;
    });

    defineMethod(cls, 'wcagLevel', function (this: InstanceType<typeof cls>, background: any) {
      const ratio = this.contrast(background);
      return {
        level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "FAIL",
        largeText: ratio >= 4.5 ? "AAA" : ratio >= 3 ? "AA" : "FAIL",
        ratio
      };
    });
  }
};

export type { WCAGLevel, WCAGSize };

export default a11y;
