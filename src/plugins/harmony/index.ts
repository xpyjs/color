// =======================================
// Plugin: harmony - Color harmony combinations
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import { defineMethod } from "@xpyjs/color";

/** Extends {@link XColor} instances with color harmony and relationship methods. */
declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Get the complementary color (180° hue rotation).
     * @returns A new XColor instance with the complementary color
     * @example
     * ```ts
     * xcolor('#ff0000').complement().toHex() // '#00ffff'
     * ```
     */
    complement(): XColor;
    /**
     * Get triadic colors (3 colors, 120° apart on the color wheel).
     * @returns Array of 3 XColor instances: [original, +120°, +240°]
     * @example
     * ```ts
     * xcolor('#ff0000').triad().map(c => c.toHex())
     * // ['#ff0000', '#00ff00', '#0000ff'] (approximate)
     * ```
     */
    triad(): XColor[];
    /**
     * Get tetradic/rectangle colors (4 colors, 90° apart on the color wheel).
     * @returns Array of 4 XColor instances: [original, +90°, +180°, +270°]
     * @example
     * ```ts
     * xcolor('#ff0000').tetrad().map(c => c.toHex())
     * ```
     */
    tetrad(): XColor[];
    /**
     * Get split-complementary colors (original + two colors adjacent to the complement).
     * @returns Array of 3 XColor instances: [original, +150°, +210°]
     * @example
     * ```ts
     * xcolor('#ff0000').splitComplement().map(c => c.toHex())
     * ```
     */
    splitComplement(): XColor[];
    /**
     * Get analogous colors (colors adjacent on the color wheel).
     * @param results - Number of colors to return (default 6, minimum 1)
     * @param slices - Divides the color wheel into N slices; the gap between adjacent colors equals 360/slices degrees (default 30, i.e. 12° gap)
     * @returns Array of XColor instances spaced evenly from the original hue
     * @example
     * ```ts
     * xcolor('#ff0000').analogous(3, 24) // 3 colors, 15° apart
     * ```
     */
    analogous(results?: number, slices?: number): XColor[];
    /**
     * Get monochromatic variations (same hue/saturation, varying lightness).
     * @param results - Number of variations to return (default 6, minimum 1)
     * @returns Array of XColor instances with lightness spread evenly across 0-100%
     * @example
     * ```ts
     * xcolor('#ff0000').monochromatic(5).map(c => c.toHex())
     * ```
     */
    monochromatic(results?: number): XColor[];
  }
}

const harmony: XColorPlugin = {
  name: "@xpyjs/color/plugins/harmony",
  install(_option, cls, _factory) {
    defineMethod(cls, 'complement', function (this: InstanceType<typeof cls>) {
      return this.clone().spin(180);
    });

    defineMethod(cls, 'triad', function (this: InstanceType<typeof cls>) {
      return [
        this.clone(),
        this.clone().spin(120),
        this.clone().spin(240)
      ];
    });

    defineMethod(cls, 'tetrad', function (this: InstanceType<typeof cls>) {
      return [
        this.clone(),
        this.clone().spin(90),
        this.clone().spin(180),
        this.clone().spin(270)
      ];
    });

    defineMethod(cls, 'splitComplement', function (this: InstanceType<typeof cls>) {
      return [
        this.clone(),
        this.clone().spin(150),
        this.clone().spin(210)
      ];
    });

    defineMethod(cls, 'analogous', function (this: InstanceType<typeof cls>, results: number = 6, slices: number = 30) {
      results = Math.max(1, results);
      const colors: InstanceType<typeof cls>[] = [];
      const part = 360 / slices;
      let hueOffset = 0;

      for (let i = 0; i < results; i++) {
        colors.push(this.clone().spin(hueOffset));
        hueOffset += part;
      }
      return colors;
    });

    defineMethod(cls, 'monochromatic', function (this: InstanceType<typeof cls>, results: number = 6) {
      results = Math.max(1, results);
      const colors: InstanceType<typeof cls>[] = [];
      const step = 100 / results;

      for (let i = 0; i < results; i++) {
        const newColor = this.clone();
        newColor.lightness(step * i + step / 2);
        colors.push(newColor);
      }
      return colors;
    });
  }
};

export default harmony;
