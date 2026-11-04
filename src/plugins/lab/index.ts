import { D65_TO_D50, D50_TO_D65, mat3Mul } from "../../color-math";
import { srgbToLinear, linearToSrgb } from "../../color-math";
import { alphaSuffix, hueToken, numericToken } from "../../tokens";
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
 * const red: Lab   = { l: 53.24, a: 80.09, b: 67.2 };
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
    /** CIE Lab functional notation, e.g. `lab(53.24% 80.09 67.2)`. */
    lab: true;
    /** CIE LCH functional notation, e.g. `lch(53.24% 104.55 40)`. */
    lch: true;
  }

  interface XColor {
    /**
     * Convert to CIE Lab object.
     * @returns Lab object with `l` (lightness 0-100), `a` (green-red), `b` (blue-yellow)
     * @example
     * ```ts
     * xcolor('#ff0000').toLab() // { l: 53.24, a: 80.09, b: 67.2 }
     * ```
     */
    toLab(): Lab;
    /**
     * Output as CSS Lab string.
     * @returns Formatted lab string, e.g. `lab(53.24% 80.09 67.2)`
     * @example
     * ```ts
     * xcolor('#ff0000').toLabString() // 'lab(53.24% 80.09 67.2)'
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
     * xcolor('#ff0000').toLch() // { l: 53.24, c: 104.55, h: 40 }
     * ```
     */
    toLch(): LCH;
    /**
     * Output as CSS LCH string.
     * @returns Formatted lch string, e.g. `lch(53.24% 104.55 40)`
     * @example
     * ```ts
     * xcolor('#ff0000').toLchString() // 'lch(53.24% 104.55 40)'
     * ```
     */
    toLchString(): string;
  }
}

export interface LabOptions {
  /** Reference white for Lab and LCH. D50 matches CSS Color 4. Defaults to D65. */
  whitePoint?: "D65" | "D50";
}

const WHITE_D65: [number, number, number] = [0.950489, 1, 1.08884];
const WHITE_D50: [number, number, number] = [0.9642956764, 1, 0.8251046025];

// ── Forward pipeline: RGB → XYZ → Lab ──

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

function xyzToLab([x, y, z]: [number, number, number], [Xn, Yn, Zn]: [number, number, number]): Lab {
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

function labToXyz(l: number, a: number, b: number, [Xn, Yn, Zn]: [number, number, number]): [number, number, number] {
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  return [Xn * labFInv(fx), Yn * labFInv(fy), Zn * labFInv(fz)];
}

function xyzToRgb(x: number, y: number, z: number): { r: number; g: number; b: number } {
  const rl = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const gl = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  const bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  return {
    r: clamp(linearToSrgb(rl) * 255, 0, 255),
    g: clamp(linearToSrgb(gl) * 255, 0, 255),
    b: clamp(linearToSrgb(bl) * 255, 0, 255)
  };
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

const lab: XColorPlugin<LabOptions> = {
  name: "@xpyjs/color/plugins/lab",
  install(option, cls, _factory) {
    const d50 = option?.whitePoint === "D50";
    const white = d50 ? WHITE_D50 : WHITE_D65;

    function labToRgb(l: number, a: number, b: number) {
      const xyz = labToXyz(d50 ? clamp(l, 0, 100) : l, a, b, white);
      return xyzToRgb(...(d50 ? mat3Mul(D50_TO_D65, ...xyz) : xyz));
    }
    // ── Lab string parser: lab(L a b) or lab(L a b / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "lab", 3);
      if (!res) return null;
      // L can be percentage (0-100%), a and b are numbers
      const l = numericToken(res.channels[0], 100);
      const a = numericToken(res.channels[1], 125);
      const b = numericToken(res.channels[2], 125);
      if (![l, a, b].every(Number.isFinite)) return null;
      const rgb = labToRgb(l, a, b);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    // ── LCH string parser: lch(L C H) or lch(L C H / alpha) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const res = parseFunctionalChannels(value, "lch", 3);
      if (!res) return null;
      const l = numericToken(res.channels[0], 100);
      const c = numericToken(res.channels[1], 150);
      const h = hueToken(res.channels[2]);
      if (![l, c, h].every(Number.isFinite)) return null;
      const labVal = lchToLab(l, Math.max(0, c), h);
      const rgb = labToRgb(labVal.l, labVal.a, labVal.b);
      return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
    });

    defineMethod(cls, 'toLab', function (this: InstanceType<typeof cls>): Lab {
      const xyz = rgbToXyz(this.red(), this.green(), this.blue());
      return xyzToLab(d50 ? mat3Mul(D65_TO_D50, ...xyz) : xyz, white);
    });

    defineMethod(cls, 'toLabString', function (this: InstanceType<typeof cls>): string {
      const { l, a, b: bVal } = this.toLab();
      return `lab(${l}% ${a} ${bVal}${alphaSuffix(this.alpha())})`;
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
      return `lch(${l}% ${c} ${h}${alphaSuffix(this.alpha())})`;
    });

    registerStringFormatter(cls, "lab", color => color.toLabString());
    registerStringFormatter(cls, "lch", color => color.toLchString());
  }
};

export default lab;
