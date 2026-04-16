// =======================================
// Plugin: cmyk - CMYK color space support
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import {
  registerColorParser,
  parseFunctionalChannels,
  parseAlphaChannel,
  registerStringFormatter,
  defineMethod
} from "@xpyjs/color";
import { clamp } from "@xpyjs/color";

/**
 * CMYK (Cyan, Magenta, Yellow, Key/Black) color representation.
 *
 * All ink channels (`c`, `m`, `y`, `k`) are percentages in the range `0–100`,
 * where `0` = no ink and `100` = full ink intensity.
 * The optional `a` (alpha) channel follows the standard `0–1` range.
 *
 * @example
 * ```ts
 * const red: CMYK     = { c: 0, m: 100, y: 100, k: 0 };
 * const black: CMYK   = { c: 0, m: 0,   y: 0,   k: 100 };
 * const semiRed: CMYK = { c: 0, m: 100, y: 100, k: 0, a: 0.5 };
 * ```
 */
export interface CMYK {
  /** Cyan ink — percentage `0` (no cyan) to `100` (full cyan) */
  c: number;
  /** Magenta ink — percentage `0` (no magenta) to `100` (full magenta) */
  m: number;
  /** Yellow ink — percentage `0` (no yellow) to `100` (full yellow) */
  y: number;
  /** Key (Black) ink — percentage `0` (no black) to `100` (full black) */
  k: number;
  /** Alpha (opacity) — float `0` (fully transparent) to `1` (fully opaque). Optional. */
  a?: number;
}

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Convert the color to a {@link CMYK} object.
     * All channels (`c`, `m`, `y`, `k`) are integers in `0–100`.
     * Alpha is not included in the CMYK result.
     *
     * @returns CMYK object with channels in percentage `0–100`
     * @example
     * ```ts
     * xcolor('#ff0000').toCmyk()   // { c: 0, m: 100, y: 100, k: 0 }
     * xcolor('#000000').toCmyk()   // { c: 0, m: 0, y: 0, k: 100 }
     * xcolor('#ffffff').toCmyk()   // { c: 0, m: 0, y: 0, k: 0 }
     * ```
     */
    toCmyk(): CMYK;

    /**
     * Serialize the color to a `cmyk(C%, M%, Y%, K%)` string.
     * @returns Formatted CMYK string
     * @example
     * ```ts
     * xcolor('#ff0000').toCmykString()   // 'cmyk(0%, 100%, 100%, 0%)'
     * xcolor('#000000').toCmykString()   // 'cmyk(0%, 0%, 0%, 100%)'
     * ```
     */
    toCmykString(): string;
  }

  /** Adds CMYK object literal as a valid color input. */
  interface XColorInputObjectMap {
    cmyk: Partial<CMYK>;
  }

  /** Adds `'cmyk'` as a valid {@link XColorStringFormat} key. */
  interface XColorStringFormatMap {
    /** CMYK functional notation, e.g. `cmyk(0%, 100%, 100%, 0%)`. */
    cmyk: true;
  }
}

function cmykToRgb(c: number, m: number, y: number, k: number) {
  const cn = clamp(c, 0, 100) / 100;
  const mn = clamp(m, 0, 100) / 100;
  const yn = clamp(y, 0, 100) / 100;
  const kn = clamp(k, 0, 100) / 100;

  return {
    r: Math.round(255 * (1 - cn) * (1 - kn)),
    g: Math.round(255 * (1 - mn) * (1 - kn)),
    b: Math.round(255 * (1 - yn) * (1 - kn))
  };
}

const cmyk: XColorPlugin = {
  name: "@xpyjs/color/plugins/cmyk",
  install(_option, cls, _factory) {
    defineMethod(cls, 'toCmyk', function (this: InstanceType<typeof cls>): CMYK {
      const r = this.red() / 255;
      const g = this.green() / 255;
      const b = this.blue() / 255;

      const k = 1 - Math.max(r, g, b);

      if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
      }

      return {
        c: Math.round(((1 - r - k) / (1 - k)) * 100),
        m: Math.round(((1 - g - k) / (1 - k)) * 100),
        y: Math.round(((1 - b - k) / (1 - k)) * 100),
        k: Math.round(k * 100)
      };
    });

    defineMethod(cls, 'toCmykString', function (this: InstanceType<typeof cls>): string {
      const { c, m, y, k: kk } = this.toCmyk();
      return `cmyk(${c}%, ${m}%, ${y}%, ${kk}%)`;
    });

    registerStringFormatter(cls, "cmyk", color => color.toCmykString());

    registerColorParser((value) => {
      if (value && typeof value === "object") {
        const v = value as any;
        if (v.c !== undefined && v.m !== undefined && v.y !== undefined && v.k !== undefined) {
          const rgb = cmykToRgb(v.c, v.m, v.y, v.k);
          return { ...rgb, a: v.a !== undefined ? parseAlphaChannel(v.a) : 1 };
        }
        return null;
      }

      if (typeof value !== "string") return null;
      const str = value.trim().toLowerCase();
      const parsed = parseFunctionalChannels(str, "cmyk", 4);
      if (!parsed) return null;

      const rgb = cmykToRgb(
        parseFloat(parsed.channels[0]),
        parseFloat(parsed.channels[1]),
        parseFloat(parsed.channels[2]),
        parseFloat(parsed.channels[3])
      );

      return { ...rgb, a: parsed.alpha !== undefined ? parseAlphaChannel(parsed.alpha) : 1 };
    });
  }
};

export default cmyk;
