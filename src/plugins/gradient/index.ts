// =======================================
// Plugin: gradient - Generate color gradients/scales
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import { normalizeSteps, defineMethod } from "@xpyjs/color";

/** Extends {@link XColor} instances with gradient and palette generation methods. */
declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Generate a gradient (array of colors) between this color and another.
     * Interpolates in RGB space.
     * @param to - Target color
     * @param steps - Number of colors to generate including start and end (default 5, minimum 2)
     * @returns Array of new XColor instances forming the gradient
     * @example
     * ```ts
     * const colors = xcolor('#ff0000').gradient('#0000ff', 5);
     * // Returns 5 colors from red to blue
     * colors.map(c => c.toHex());
     * ```
     */
    gradient(to: XColorInput, steps?: number): XColor[];

    /**
     * Generate a palette of tints (lighter) and shades (darker) around this color.
     * @param steps - Number of variations in each direction (default 5, minimum 2)
     * @returns Array of XColor instances: shades (dark→light) + original + tints (light→lighter)
     * @example
     * ```ts
     * const palette = xcolor('#ff0000').palette(3);
     * // Returns shades + original + tints
     * palette.map(c => c.toHex());
     * ```
     */
    palette(steps?: number): XColor[];
  }
}

const gradient: XColorPlugin = {
  name: "@xpyjs/color/plugins/gradient",
  install(_option, cls, _factory) {
    defineMethod(cls, 'gradient', function (this: InstanceType<typeof cls>, to: XColorInput, steps: number = 5) {
      const end = new cls(to);
      const colors: InstanceType<typeof cls>[] = [];
      const total = normalizeSteps(steps);
      const opts = this._opts;

      for (let i = 0; i < total; i++) {
        const factor = i / (total - 1);
        const r = Math.round(this.red() + (end.red() - this.red()) * factor);
        const g = Math.round(this.green() + (end.green() - this.green()) * factor);
        const b = Math.round(this.blue() + (end.blue() - this.blue()) * factor);
        const a = this.alpha() + (end.alpha() - this.alpha()) * factor;
        colors.push(new cls({ r, g, b, a }, opts));
      }

      return colors;
    });

    defineMethod(cls, 'palette', function (this: InstanceType<typeof cls>, steps: number = 5) {
      const colors: InstanceType<typeof cls>[] = [];
      const total = normalizeSteps(steps);

      // Shades (darker)
      for (let i = total; i > 0; i--) {
        colors.push(this.clone().shade((i / total) * 100));
      }

      // Original color
      colors.push(this.clone());

      // Tints (lighter)
      for (let i = 1; i <= total; i++) {
        colors.push(this.clone().tint((i / total) * 100));
      }

      return colors;
    });
  }
};

export default gradient;
