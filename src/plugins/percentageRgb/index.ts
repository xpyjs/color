// =======================================
// Plugin: percentageRgb - Support percentage values in RGB functions
// =======================================
import { round, registerStringFormatter, defineMethod } from "@xpyjs/color";
import type { XColorPlugin } from "@xpyjs/color";

/** Extends {@link XColor} with percentage-based RGB output methods and adds `'percentageRgb'` as a valid string format. */
declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Output as percentage-based RGB object.
     * @returns Object with r, g, b as percentage strings and a as number
     * @example
     * ```ts
     * xcolor('#ff8000').toPercentageRgb()
     * // { r: '100%', g: '50%', b: '0%', a: 1 }
     * ```
     */
    toPercentageRgb(): { r: string; g: string; b: string; a: number };
    /**
     * Output as percentage-based rgba() string.
     * @returns Formatted string, e.g. `rgba(100%, 50%, 0%, 1)`
     * @example
     * ```ts
     * xcolor('#ff8000').toPercentageRgbString()
     * // 'rgba(100%, 50%, 0%, 1)'
     * ```
     */
    toPercentageRgbString(): string;
  }

  /** Adds `'percentageRgb'` as a valid {@link XColorStringFormat} key. */
  interface XColorStringFormatMap {
    /** Percentage-based RGB functional notation, e.g. `rgba(100%, 50%, 0%, 1)`. */
    percentageRgb: true;
  }
}

const percentageRgb: XColorPlugin = {
  name: "@xpyjs/color/plugins/percentageRgb",
  install(_option, cls, _factory) {
    defineMethod(cls, 'toPercentageRgb', function (this: InstanceType<typeof cls>) {
      return {
        r: round((this.red() / 255) * 100) + "%",
        g: round((this.green() / 255) * 100) + "%",
        b: round((this.blue() / 255) * 100) + "%",
        a: round(this.alpha(), 2)
      };
    });

    defineMethod(cls, 'toPercentageRgbString', function (this: InstanceType<typeof cls>) {
      const { r, g, b, a } = this.toPercentageRgb();
      return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
    });

    registerStringFormatter(cls, "percentageRgb", color => color.toPercentageRgbString());
  }
};

export default percentageRgb;
