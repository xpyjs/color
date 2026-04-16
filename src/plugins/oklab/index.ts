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
     * xcolor('#ff0000').toOklab() // { l: 0.63, a: 0.22, b: 0.13 }
     * ```
     */
    toOklab(): OKLab;
    /**
     * Output as CSS `oklab()` string.
     * @returns e.g. `oklab(0.63 0.22 0.13)`
     */
    toOklabString(): string;
    /**
     * Convert to OKLCh object (polar form of OKLab).
     * @returns OKLCh object with `l` (0-1), `c` (chroma), `h` (hue 0-360)
     */
    toOklch(): OKLCh;
    /**
     * Output as CSS `oklch()` string.
     * @returns e.g. `oklch(0.63 0.26 30.77)`
     */
    toOklchString(): string;
  }
}

// ── Forward pipeline: sRGB → linear RGB → OKLab ──

function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308
    ? c * 12.92
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function rgbToOklab(r: number, g: number, b: number): OKLab {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  // Linear RGB → LMS (using Ottosson's matrix)
  const l_ = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m_ = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s_ = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  // Cube root
  const l1 = Math.cbrt(l_);
  const m1 = Math.cbrt(m_);
  const s1 = Math.cbrt(s_);

  // LMS^(1/3) → OKLab
  return {
    l: Math.round((0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1) * 10000) / 10000,
    a: Math.round((1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1) * 10000) / 10000,
    b: Math.round((0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1) * 10000) / 10000
  };
}

// ── Reverse pipeline: OKLab → linear RGB → sRGB ──

function oklabToRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  // OKLab → LMS^(1/3)
  const l1 = L + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = L - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = L - 0.0894841775 * a - 1.2914855480 * b;

  // Cube
  const l_ = l1 * l1 * l1;
  const m_ = m1 * m1 * m1;
  const s_ = s1 * s1 * s1;

  // LMS → linear RGB
  const rl = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gl = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  return {
    r: Math.round(clamp(linearToSrgb(rl) * 255, 0, 255)),
    g: Math.round(clamp(linearToSrgb(gl) * 255, 0, 255)),
    b: Math.round(clamp(linearToSrgb(bl) * 255, 0, 255))
  };
}

// ── OKLCh ↔ OKLab conversions ──

function oklabToOklch(l: number, a: number, b: number): OKLCh {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return {
    l: Math.round(l * 10000) / 10000,
    c: Math.round(c * 10000) / 10000,
    h: Math.round(h * 100) / 100
  };
}

function oklchToOklab(l: number, c: number, h: number): OKLab {
  const hRad = h * Math.PI / 180;
  return {
    l,
    a: Math.round(c * Math.cos(hRad) * 10000) / 10000,
    b: Math.round(c * Math.sin(hRad) * 10000) / 10000
  };
}

function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  const ok = oklchToOklab(l, c, h);
  return oklabToRgb(ok.l, ok.a, ok.b);
}

const oklab: XColorPlugin = {
  name: "@xpyjs/color/plugins/oklab",
  install(_option, cls, _factory) {
    // ── OKLab string parser: oklab(L a b) or oklab(L a b / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "oklab", 3);
      if (!res) return null;
      const l = parseFloat(res.channels[0]);
      const a = parseFloat(res.channels[1]);
      const b = parseFloat(res.channels[2]);
      if (isNaN(l) || isNaN(a) || isNaN(b)) return null;
      const rgb = oklabToRgb(l, a, b);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    // ── OKLCh string parser: oklch(L C H) or oklch(L C H / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "oklch", 3);
      if (!res) return null;
      const l = parseFloat(res.channels[0]);
      const c = parseFloat(res.channels[1]);
      const h = parseFloat(res.channels[2]);
      if (isNaN(l) || isNaN(c) || isNaN(h)) return null;
      const rgb = oklchToRgb(l, c, h);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    defineMethod(cls, 'toOklab', function (this: InstanceType<typeof cls>): OKLab {
      return rgbToOklab(this.red(), this.green(), this.blue());
    });

    defineMethod(cls, 'toOklabString', function (this: InstanceType<typeof cls>): string {
      const { l, a, b } = this.toOklab();
      return `oklab(${l} ${a} ${b})`;
    });

    defineMethod(cls, 'toOklch', function (this: InstanceType<typeof cls>): OKLCh {
      const ok = this.toOklab();
      return oklabToOklch(ok.l, ok.a, ok.b);
    });

    defineMethod(cls, 'toOklchString', function (this: InstanceType<typeof cls>): string {
      const { l, c, h } = this.toOklch();
      return `oklch(${l} ${c} ${h})`;
    });

    registerStringFormatter(cls, "oklab", color => color.toOklabString());
    registerStringFormatter(cls, "oklch", color => color.toOklchString());
  }
};

export default oklab;
