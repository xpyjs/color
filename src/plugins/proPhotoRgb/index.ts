// =======================================
// Plugin: proPhotoRgb - ProPhoto RGB color space
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
    proPhotoRgb: true;
  }

  interface XColor {
    /** Convert to ProPhoto RGB (channels 0-1). */
    toProPhotoRgb(): WideRGB;
    /** Output as `color(prophoto-rgb r g b)` string. */
    toProPhotoRgbString(): string;
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

// ── ProPhoto RGB transfer functions (gamma 1.8) ──

function proPhotoToLinear(c: number): number {
  return c <= 16 / 512 ? c / 16 : Math.pow(c, 1.8);
}

function linearToProPhoto(c: number): number {
  return c <= 1 / 512 ? 16 * c : Math.pow(c, 1 / 1.8);
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

const XYZ_TO_SRGB: Mat3 = [
  3.2409699419, -1.5373831776, -0.4986107603,
  -0.9692436363, 1.8759675015, 0.0415550574,
  0.0556300797, -0.2039769589, 1.0569715142
];

const D65_TO_D50: Mat3 = [
  1.0479298208, 0.0228474276, -0.0501922295,
  0.0296278156, 0.9904344267, -0.0170738250,
  -0.0092430581, 0.0150551448, 0.7521316354
];

const D50_TO_D65: Mat3 = [
  0.9554734528, -0.0230985369, 0.0632593086,
  -0.0283697069, 1.0099954580, 0.0210077073,
  0.0123140016, -0.0205076964, 1.3303659366
];

const PROPHOTO_TO_XYZ_D50: Mat3 = [
  0.7977604896, 0.1351917082, 0.0313493495,
  0.2880711282, 0.7118432178, 0.0000856540,
  0.0000000000, 0.0000000000, 0.8251046026
];

const XYZ_D50_TO_PROPHOTO: Mat3 = [
  1.3457989731, -0.2555809497, -0.0511118865,
  -0.5446224940, 1.5082327413, 0.0205274474,
  0.0000000000, 0.0000000000, 1.2118127757
];

// ── Conversion utilities ──

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function srgbChannelFromLinear(c: number): number {
  return Math.round(clamp(linearToSrgb(c) * 255, 0, 255));
}

const proPhotoRgb: XColorPlugin = {
  name: "@xpyjs/color/plugins/proPhotoRgb",
  install(_option, cls, _factory) {
    // ── Parser for color(prophoto-rgb r g b [/ a]) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const str = value.trim().toLowerCase();
      if (!str.startsWith("color(") || !str.endsWith(")")) return null;

      const inner = str.slice(6, -1).trim();
      if (!inner.startsWith("prophoto-rgb")) return null;

      const rest = inner.slice(12).trim();
      const parts = rest.split("/").map(s => s.trim());
      const channels = parts[0].split(/\s+/).map(Number);
      if (channels.length < 3 || channels.some(isNaN)) return null;

      // Linearize
      const rl = proPhotoToLinear(channels[0]);
      const gl = proPhotoToLinear(channels[1]);
      const bl = proPhotoToLinear(channels[2]);

      // ProPhoto → XYZ D50 → D65 → sRGB
      const [x50, y50, z50] = mat3Mul(PROPHOTO_TO_XYZ_D50, rl, gl, bl);
      const [x, y, z] = mat3Mul(D50_TO_D65, x50, y50, z50);
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
    defineMethod(cls, 'toProPhotoRgb', function (this: InstanceType<typeof cls>): WideRGB {
      const rl = srgbToLinear(this.red());
      const gl = srgbToLinear(this.green());
      const bl = srgbToLinear(this.blue());
      const [x, y, z] = mat3Mul(SRGB_TO_XYZ, rl, gl, bl);
      // sRGB XYZ (D65) → D50
      const [x50, y50, z50] = mat3Mul(D65_TO_D50, x, y, z);
      const [pr, pg, pb] = mat3Mul(XYZ_D50_TO_PROPHOTO, x50, y50, z50);
      return {
        r: round4(linearToProPhoto(Math.max(0, pr))),
        g: round4(linearToProPhoto(Math.max(0, pg))),
        b: round4(linearToProPhoto(Math.max(0, pb)))
      };
    });

    defineMethod(cls, 'toProPhotoRgbString', function (this: InstanceType<typeof cls>): string {
      const { r, g, b } = this.toProPhotoRgb();
      return `color(prophoto-rgb ${r} ${g} ${b})`;
    });

    registerStringFormatter(cls, "proPhotoRgb", color => color.toProPhotoRgbString());
  }
};

export default proPhotoRgb;
