// =======================================
// Plugin: a98Rgb - A98-RGB (Adobe RGB 1998) color space
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import {
  registerStringFormatter,
  registerColorParser,
  parseAlphaChannel,
  defineMethod,
  clamp
} from "@xpyjs/color";

/** Generic wide-gamut RGB color (channels 0–1). */
export interface WideRGB {
  r: number;
  g: number;
  b: number;
}

declare module "@xpyjs/color" {
  interface XColorStringFormatMap {
    a98Rgb: true;
  }

  interface XColor {
    /** Convert to A98-RGB (channels 0-1). */
    toA98Rgb(): WideRGB;
    /** Output as `color(a98-rgb r g b)` string. */
    toA98RgbString(): string;
  }
}

// ── sRGB transfer functions ──

function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308
    ? c * 12.92
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ── A98-RGB transfer functions (gamma 563/256 ≈ 2.19921875) ──

function a98ToLinear(c: number): number {
  return Math.sign(c) * Math.pow(Math.abs(c), 563 / 256);
}

function linearToA98(c: number): number {
  return Math.sign(c) * Math.pow(Math.abs(c), 256 / 563);
}

// ── Matrix helpers ──

type Mat3 = [number, number, number, number, number, number, number, number, number];

function mat3Mul(m: Mat3, x: number, y: number, z: number): [number, number, number] {
  return [
    m[0] * x + m[1] * y + m[2] * z,
    m[3] * x + m[4] * y + m[5] * z,
    m[6] * x + m[7] * y + m[8] * z
  ];
}

// ── Matrices ──

const SRGB_TO_XYZ: Mat3 = [
  0.4123907993, 0.3575843394, 0.1804807884,
  0.2126390059, 0.7151686788, 0.0721923154,
  0.0193308187, 0.1191947798, 0.9505321522
];

const A98_TO_XYZ: Mat3 = [
  0.5766690429, 0.1855582379, 0.1882286462,
  0.2973449753, 0.6273635663, 0.0752914585,
  0.0270313614, 0.0706888525, 0.9913375368
];

const XYZ_TO_A98: Mat3 = [
  2.0415879038, -0.5650069743, -0.3473784914,
  -0.9692436363, 1.8759675015, 0.0415550574,
  0.0134442806, -0.1183623923, 1.0151749944
];

const XYZ_TO_SRGB: Mat3 = [
  3.2409699419, -1.5373831776, -0.4986107603,
  -0.9692436363, 1.8759675015, 0.0415550574,
  0.0556300797, -0.2039769589, 1.0569715142
];

// ── Conversion utilities ──

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function srgbChannelFromLinear(c: number): number {
  return Math.round(clamp(linearToSrgb(c) * 255, 0, 255));
}

const a98Rgb: XColorPlugin = {
  name: "@xpyjs/color/plugins/a98Rgb",
  install(_option, cls, _factory) {
    // ── Parser for color(a98-rgb r g b [/ a]) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const str = value.trim().toLowerCase();
      if (!str.startsWith("color(") || !str.endsWith(")")) return null;

      const inner = str.slice(6, -1).trim();
      if (!inner.startsWith("a98-rgb")) return null;

      const rest = inner.slice(7).trim();
      const parts = rest.split("/").map(s => s.trim());
      const channels = parts[0].split(/\s+/).map(Number);
      if (channels.length < 3 || channels.some(isNaN)) return null;

      const rl = a98ToLinear(channels[0]);
      const gl = a98ToLinear(channels[1]);
      const bl = a98ToLinear(channels[2]);

      const [x, y, z] = mat3Mul(A98_TO_XYZ, rl, gl, bl);
      const [sr, sg, sb] = mat3Mul(XYZ_TO_SRGB, x, y, z);

      const alpha = parts[1] !== undefined ? parseAlphaChannel(parts[1].trim()) : 1;
      return {
        r: srgbChannelFromLinear(sr),
        g: srgbChannelFromLinear(sg),
        b: srgbChannelFromLinear(sb),
        a: alpha
      };
    });

    // ── Output methods ──
    defineMethod(cls, 'toA98Rgb', function (this: InstanceType<typeof cls>): WideRGB {
      const rl = srgbToLinear(this.red());
      const gl = srgbToLinear(this.green());
      const bl = srgbToLinear(this.blue());
      const [x, y, z] = mat3Mul(SRGB_TO_XYZ, rl, gl, bl);
      const [ar, ag, ab] = mat3Mul(XYZ_TO_A98, x, y, z);
      return {
        r: round4(linearToA98(ar)),
        g: round4(linearToA98(ag)),
        b: round4(linearToA98(ab))
      };
    });

    defineMethod(cls, 'toA98RgbString', function (this: InstanceType<typeof cls>): string {
      const { r, g, b } = this.toA98Rgb();
      return `color(a98-rgb ${r} ${g} ${b})`;
    });

    registerStringFormatter(cls, "a98Rgb", color => color.toA98RgbString());
  }
};

export default a98Rgb;
