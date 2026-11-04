import { rgbToOklab, oklabToRgb, oklabToOklch, oklchToRgb } from "../../color-math";
import { round } from "@xpyjs/color";
import { alphaSuffix, hueToken, numericToken } from "../../tokens";
// =======================================
// Plugin: oklab - OKLab & OKLCh color space support
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import {
  registerStringFormatter,
  registerColorParser,
  parseFunctionalChannels,
  parseAlphaChannel,
  defineMethod,
  clamp
} from "@xpyjs/color";

/**
 * OKLab color representation (Björn Ottosson, 2020).
 *
 * A perceptually uniform color space that improves on CIE Lab
 * for hue linearity and chroma uniformity:
 * - `l` — Lightness: `0` (black) to `1` (white)
 * - `a` — Green–Red axis (typically −0.4 to +0.4)
 * - `b` — Blue–Yellow axis (typically −0.4 to +0.4)
 */
export interface OKLab {
  /** Lightness — `0` (black) to `1` (white) */
  l: number;
  /** Green–Red chrominance axis */
  a: number;
  /** Blue–Yellow chrominance axis */
  b: number;
}

/**
 * OKLCh color representation — polar form of OKLab.
 *
 * - `l` — Lightness: `0` (black) to `1` (white)
 * - `c` — Chroma: `0` (achromatic) and up
 * - `h` — Hue angle in degrees: `0–360`
 */
export interface OKLCh {
  /** Lightness — `0` (black) to `1` (white) */
  l: number;
  /** Chroma — `0` (neutral) and up */
  c: number;
  /** Hue angle in degrees — `0–360` */
  h: number;
}

declare module "@xpyjs/color" {
  interface XColorStringFormatMap {
    /** OKLab functional notation, e.g. `oklab(0.53 0.08 0.07)`. */
    oklab: true;
    /** OKLCh functional notation, e.g. `oklch(0.53 0.1 40)`. */
    oklch: true;
  }

  interface XColor {
    /**
     * Convert to OKLab object.
     * @returns OKLab object with `l` (0-1), `a`, `b`
     * @example
     * ```ts
     * xcolor('#ff0000').toOklab() // { l: 0.628, a: 0.2249, b: 0.1258 }
     * ```
     */
    toOklab(): OKLab;
    /**
     * Output as CSS `oklab()` string.
     * @returns e.g. `oklab(0.628 0.2249 0.1258)`
     */
    toOklabString(): string;
    /**
     * Convert to OKLCh object (polar form of OKLab).
     * @returns OKLCh object with `l` (0-1), `c` (chroma), `h` (hue 0-360)
     */
    toOklch(): OKLCh;
    /**
     * Output as CSS `oklch()` string.
     * @returns e.g. `oklch(0.628 0.2577 29.22)`
     */
    toOklchString(): string;
  }
}

const oklab: XColorPlugin = {
  name: "@xpyjs/color/plugins/oklab",
  install(_option, cls, _factory) {
    // ── OKLab string parser: oklab(L a b) or oklab(L a b / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "oklab", 3);
      if (!res) return null;
      const l = numericToken(res.channels[0], 1);
      const a = numericToken(res.channels[1], 0.4);
      const b = numericToken(res.channels[2], 0.4);
      if (![l, a, b].every(Number.isFinite)) return null;
      const rgb = oklabToRgb(l, a, b);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    // ── OKLCh string parser: oklch(L C H) or oklch(L C H / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "oklch", 3);
      if (!res) return null;
      const l = numericToken(res.channels[0], 1);
      const c = numericToken(res.channels[1], 0.4);
      const h = hueToken(res.channels[2]);
      if (![l, c, h].every(Number.isFinite)) return null;
      const rgb = oklchToRgb(l, Math.max(0, c), h);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    defineMethod(cls, 'toOklab', function (this: InstanceType<typeof cls>): OKLab {
      const { l, a, b } = rgbToOklab(this.red(), this.green(), this.blue());
      return { l: round(l, 4), a: round(a, 4), b: round(b, 4) };
    });

    defineMethod(cls, 'toOklabString', function (this: InstanceType<typeof cls>): string {
      const { l, a, b } = this.toOklab();
      return `oklab(${l} ${a} ${b}${alphaSuffix(this.alpha())})`;
    });

    defineMethod(cls, 'toOklch', function (this: InstanceType<typeof cls>): OKLCh {
      const ok = this.toOklab();
      const { l, c, h } = oklabToOklch(ok.l, ok.a, ok.b);
      return { l: round(l, 4), c: round(c, 4), h: round(h, 2) };
    });

    defineMethod(cls, 'toOklchString', function (this: InstanceType<typeof cls>): string {
      const { l, c, h } = this.toOklch();
      return `oklch(${l} ${c} ${h}${alphaSuffix(this.alpha())})`;
    });

    registerStringFormatter(cls, "oklab", color => color.toOklabString());
    registerStringFormatter(cls, "oklch", color => color.toOklchString());
  }
};

export default oklab;
