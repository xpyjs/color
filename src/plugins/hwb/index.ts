// =======================================
// Plugin: hwb - HWB color space support
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import {
  registerStringFormatter,
  registerColorParser,
  parseFunctionalChannels,
  parseAlphaChannel,
  defineMethod,
  clamp,
  rgbToHsl
} from "@xpyjs/color";

/**
 * HWB (Hue, Whiteness, Blackness) color representation.
 *
 * A more intuitive alternative to HSL for humans:
 * - `h` — Hue: `0–360` degrees (same as HSL hue)
 * - `w` — Whiteness: `0` (pure color) to `100` (white)
 * - `b` — Blackness: `0` (pure color) to `100` (black)
 *
 * When `w + b >= 100`, the color is a shade of grey.
 */
export interface HWB {
  /** Hue angle in degrees — `0–360` */
  h: number;
  /** Whiteness percentage — `0` (no white) to `100` (fully white) */
  w: number;
  /** Blackness percentage — `0` (no black) to `100` (fully black) */
  b: number;
}

declare module "@xpyjs/color" {
  interface XColorStringFormatMap {
    /** HWB functional notation, e.g. `hwb(0 0% 0%)`. */
    hwb: true;
  }

  interface XColor {
    /**
     * Convert to HWB object.
     * @returns HWB object with `h` (0-360), `w` (0-100), `b` (0-100)
     * @example
     * ```ts
     * xcolor('#ff0000').toHwb() // { h: 0, w: 0, b: 0 }
     * xcolor('#ffffff').toHwb() // { h: 0, w: 100, b: 0 }
     * ```
     */
    toHwb(): HWB;
    /**
     * Output as CSS `hwb()` string.
     * @returns e.g. `hwb(0 0% 0%)`
     */
    toHwbString(): string;
  }
}

// ── RGB → HWB ──

function rgbToHwb(r: number, g: number, b: number): HWB {
  const h = rgbToHsl(r, g, b).h;
  const w = Math.min(r, g, b) / 255 * 100;
  const bk = (1 - Math.max(r, g, b) / 255) * 100;
  return {
    h: Math.round(h * 100) / 100,
    w: Math.round(w * 100) / 100,
    b: Math.round(bk * 100) / 100
  };
}

// ── HWB → RGB ──

function hwbToRgb(h: number, w: number, bk: number): { r: number; g: number; b: number } {
  let wn = w / 100;
  let bn = bk / 100;

  // Normalize if w + b > 1
  if (wn + bn > 1) {
    const ratio = 1 / (wn + bn);
    wn *= ratio;
    bn *= ratio;
  }

  // Convert hue to RGB using the same algorithm as HSL with s=100, l=50
  const hh = ((h % 360) + 360) % 360 / 60;
  const i = Math.floor(hh);
  const f = hh - i;
  const v = 1 - bn;

  let r: number, g: number, b: number;

  switch (i) {
    case 0: r = v; g = v * (1 - (1 - f) * (1 - wn / v)); b = wn / v * v; break;
    case 1: r = v * (1 - f * (1 - wn / v)); g = v; b = wn / v * v; break;
    case 2: r = wn / v * v; g = v; b = v * (1 - (1 - f) * (1 - wn / v)); break;
    case 3: r = wn / v * v; g = v * (1 - f * (1 - wn / v)); b = v; break;
    case 4: r = v * (1 - (1 - f) * (1 - wn / v)); g = wn / v * v; b = v; break;
    default: r = v; g = wn / v * v; b = v * (1 - f * (1 - wn / v)); break;
  }

  return {
    r: Math.round(clamp(r * 255, 0, 255)),
    g: Math.round(clamp(g * 255, 0, 255)),
    b: Math.round(clamp(b * 255, 0, 255))
  };
}

const hwb: XColorPlugin = {
  name: "@xpyjs/color/plugins/hwb",
  install(_option, cls, _factory) {
    // ── HWB string parser: hwb(H W B) or hwb(H W B / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "hwb", 3);
      if (!res) return null;
      const h = parseFloat(res.channels[0]);
      const w = parseFloat(res.channels[1]);
      const b = parseFloat(res.channels[2]);
      if (isNaN(h) || isNaN(w) || isNaN(b)) return null;
      const rgb = hwbToRgb(h, w, b);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    defineMethod(cls, 'toHwb', function (this: InstanceType<typeof cls>): HWB {
      return rgbToHwb(this.red(), this.green(), this.blue());
    });

    defineMethod(cls, 'toHwbString', function (this: InstanceType<typeof cls>): string {
      const { h, w, b } = this.toHwb();
      return `hwb(${h} ${w}% ${b}%)`;
    });

    registerStringFormatter(cls, "hwb", color => color.toHwbString());
  }
};

export default hwb;
