// =======================================
// Plugin: lab - CIE Lab & LCH color space support
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
 * CIE L\*a\*b\* (CIELAB) color representation.
 *
 * A perceptually uniform color space designed so that equal numerical distances
 * correspond to equal perceived color differences:
 * - `l` — Lightness: `0` (black) to `100` (diffuse white)
 * - `a` — Green–Red axis: negative values towards green, positive towards red
 * - `b` — Blue–Yellow axis: negative values towards blue, positive towards yellow
 *
 * The `a` and `b` axes have no fixed range in the standard, but typical sRGB
 * colors map to roughly `−128`–`+127`.
 *
 * @example
 * ```ts
 * const red: Lab   = { l: 53.23, a: 80.11, b: 67.22 };
 * const white: Lab = { l: 100,   a: 0,     b: 0 };
 * const black: Lab = { l: 0,     a: 0,     b: 0 };
 * ```
 */
export interface Lab {
  /** Lightness — `0` (black) to `100` (white) */
  l: number;
  /** Green–Red chrominance axis — negative = green, positive = red */
  a: number;
  /** Blue–Yellow chrominance axis — negative = blue, positive = yellow */
  b: number;
}

/**
 * CIE LCH (Lightness, Chroma, Hue) color representation.
 * The polar (cylindrical) form of CIE Lab.
 *
 * - `l` — Lightness: `0` (black) to `100` (white) — same as Lab L
 * - `c` — Chroma: `0` (achromatic) and up — distance from the neutral axis
 * - `h` — Hue angle in degrees: `0–360`
 */
export interface LCH {
  /** Lightness — `0` (black) to `100` (white) */
  l: number;
  /** Chroma — `0` (neutral) and up */
  c: number;
  /** Hue angle in degrees — `0–360` */
  h: number;
}

declare module "@xpyjs/color" {
  /** Adds `'lab'` and `'lch'` as valid {@link XColorStringFormat} keys. */
  interface XColorStringFormatMap {
    /** CIE Lab functional notation, e.g. `lab(53.23% 80.11 67.22)`. */
    lab: true;
    /** CIE LCH functional notation, e.g. `lch(53.23% 104.55 40)`. */
    lch: true;
  }

  interface XColor {
    /**
     * Convert to CIE Lab object.
     * @returns Lab object with `l` (lightness 0-100), `a` (green-red), `b` (blue-yellow)
     * @example
     * ```ts
     * xcolor('#ff0000').toLab() // { l: 53.23, a: 80.11, b: 67.22 }
     * ```
     */
    toLab(): Lab;
    /**
     * Output as CSS Lab string.
     * @returns Formatted lab string, e.g. `lab(53.23% 80.11 67.22)`
     * @example
     * ```ts
     * xcolor('#ff0000').toLabString() // 'lab(53.23% 80.11 67.22)'
     * ```
     */
    toLabString(): string;
    /**
     * Calculate CIE76 color difference (Delta E).
     * Values: 0 = identical, < 1 = imperceptible, 1-2 = noticeable at close look,
     * 2-10 = at a glance, 11-49 = closely related, 100 = opposite.
     * @param other - The color to compare against
     * @returns Delta E value (0 = identical, higher = more different)
     * @example
     * ```ts
     * xcolor('#ff0000').deltaE('#ff0000') // 0
     * xcolor('#ff0000').deltaE('#00ff00') // ~86.6
     * ```
     */
    deltaE(other: XColorInput): number;
    /**
     * Convert to CIE LCH object (polar form of Lab).
     * @returns LCH object with `l` (lightness 0-100), `c` (chroma), `h` (hue 0-360)
     * @example
     * ```ts
     * xcolor('#ff0000').toLch() // { l: 53.23, c: 104.55, h: 40.0 }
     * ```
     */
    toLch(): LCH;
    /**
     * Output as CSS LCH string.
     * @returns Formatted lch string, e.g. `lch(53.23% 104.55 40)`
     * @example
     * ```ts
     * xcolor('#ff0000').toLchString() // 'lch(53.23% 104.55 40)'
     * ```
     */
    toLchString(): string;
  }
}

// D65 reference white
const Xn = 0.950489;
const Yn = 1.0;
const Zn = 1.08884;

// ── Forward pipeline: RGB → XYZ → Lab ──

function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl;
  const y = 0.2126729 * rl + 0.7151522 * gl + 0.0721750 * bl;
  const z = 0.0193339 * rl + 0.1191920 * gl + 0.9503041 * bl;

  return [x, y, z];
}

function labF(t: number): number {
  const delta = 6 / 29;
  return t > delta ** 3
    ? t ** (1 / 3)
    : t / (3 * delta * delta) + 4 / 29;
}

function xyzToLab(x: number, y: number, z: number): Lab {
  const fx = labF(x / Xn);
  const fy = labF(y / Yn);
  const fz = labF(z / Zn);

  return {
    l: Math.round((116 * fy - 16) * 100) / 100,
    a: Math.round(500 * (fx - fy) * 100) / 100,
    b: Math.round(200 * (fy - fz) * 100) / 100
  };
}

// ── Reverse pipeline: Lab → XYZ → RGB ──

function labFInv(t: number): number {
  const delta = 6 / 29;
  return t > delta
    ? t * t * t
    : 3 * delta * delta * (t - 4 / 29);
}

function labToXyz(l: number, a: number, b: number): [number, number, number] {
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  return [Xn * labFInv(fx), Yn * labFInv(fy), Zn * labFInv(fz)];
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308
    ? c * 12.92
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function xyzToRgb(x: number, y: number, z: number): { r: number; g: number; b: number } {
  const rl = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const gl = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  const bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  return {
    r: Math.round(clamp(linearToSrgb(rl) * 255, 0, 255)),
    g: Math.round(clamp(linearToSrgb(gl) * 255, 0, 255)),
    b: Math.round(clamp(linearToSrgb(bl) * 255, 0, 255))
  };
}

function labToRgb(l: number, a: number, b: number): { r: number; g: number; b: number } {
  const [x, y, z] = labToXyz(l, a, b);
  return xyzToRgb(x, y, z);
}

// ── LCH ↔ Lab conversions ──

function labToLch(l: number, a: number, b: number): LCH {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return {
    l: Math.round(l * 100) / 100,
    c: Math.round(c * 100) / 100,
    h: Math.round(h * 100) / 100
  };
}

function lchToLab(l: number, c: number, h: number): Lab {
  const hRad = h * Math.PI / 180;
  return {
    l,
    a: Math.round(c * Math.cos(hRad) * 100) / 100,
    b: Math.round(c * Math.sin(hRad) * 100) / 100
  };
}

function lchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  const labVal = lchToLab(l, c, h);
  return labToRgb(labVal.l, labVal.a, labVal.b);
}

const lab: XColorPlugin = {
  name: "@xpyjs/color/plugins/lab",
  install(_option, cls, _factory) {
    // ── Lab string parser: lab(L a b) or lab(L a b / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "lab", 3);
      if (!res) return null;
      // L can be percentage (0-100%), a and b are numbers
      let l = parseFloat(res.channels[0]);
      if (res.channels[0].endsWith("%")) l = parseFloat(res.channels[0]);
      const a = parseFloat(res.channels[1]);
      const b = parseFloat(res.channels[2]);
      if (isNaN(l) || isNaN(a) || isNaN(b)) return null;
      const rgb = labToRgb(l, a, b);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    // ── LCH string parser: lch(L C H) or lch(L C H / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "lch", 3);
      if (!res) return null;
      const l = parseFloat(res.channels[0]);
      const c = parseFloat(res.channels[1]);
      const h = parseFloat(res.channels[2]);
      if (isNaN(l) || isNaN(c) || isNaN(h)) return null;
      const rgb = lchToRgb(l, c, h);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    defineMethod(cls, 'toLab', function (this: InstanceType<typeof cls>): Lab {
      const [x, y, z] = rgbToXyz(this.red(), this.green(), this.blue());
      return xyzToLab(x, y, z);
    });

    defineMethod(cls, 'toLabString', function (this: InstanceType<typeof cls>): string {
      const { l, a, b: bVal } = this.toLab();
      return `lab(${l}% ${a} ${bVal})`;
    });

    defineMethod(cls, 'deltaE', function (this: InstanceType<typeof cls>, other: XColorInput): number {
      const otherColor = new cls(other);
      const lab1 = this.toLab();
      const lab2 = otherColor.toLab();

      const dL = lab1.l - lab2.l;
      const da = lab1.a - lab2.a;
      const db = lab1.b - lab2.b;

      return Math.round(Math.sqrt(dL * dL + da * da + db * db) * 100) / 100;
    });

    defineMethod(cls, 'toLch', function (this: InstanceType<typeof cls>): LCH {
      const labVal = this.toLab();
      return labToLch(labVal.l, labVal.a, labVal.b);
    });

    defineMethod(cls, 'toLchString', function (this: InstanceType<typeof cls>): string {
      const { l, c, h } = this.toLch();
      return `lch(${l}% ${c} ${h})`;
    });

    registerStringFormatter(cls, "lab", color => color.toLabString());
    registerStringFormatter(cls, "lch", color => color.toLchString());
  }
};

export default lab;
