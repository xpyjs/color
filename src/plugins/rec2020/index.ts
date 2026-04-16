// =======================================
// Plugin: rec2020 - Rec. 2020 color space
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
    rec2020: true;
  }

  interface XColor {
    /** Convert to Rec2020 (channels 0-1). */
    toRec2020(): WideRGB;
    /** Output as `color(rec2020 r g b)` string. */
    toRec2020String(): string;
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

// ── Rec2020 transfer functions ──

const REC2020_ALPHA = 1.09929682680944;
const REC2020_BETA = 0.018053968510807;

function rec2020ToLinear(c: number): number {
  return c < REC2020_BETA * 4.5
    ? c / 4.5
    : Math.pow((c + REC2020_ALPHA - 1) / REC2020_ALPHA, 1 / 0.45);
}

function linearToRec2020(c: number): number {
  return c >= REC2020_BETA
    ? REC2020_ALPHA * Math.pow(c, 0.45) - (REC2020_ALPHA - 1)
    : 4.5 * c;
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

const REC2020_TO_XYZ: Mat3 = [
  0.6369580484, 0.1446169036, 0.1688809752,
  0.2627002120, 0.6779980715, 0.0593017165,
  0.0000000000, 0.0280726930, 1.0609850577
];

const XYZ_TO_REC2020: Mat3 = [
  1.7166511880, -0.3556707838, -0.2533662814,
  -0.6666843518, 1.6164812366, 0.0157685458,
  0.0176398574, -0.0427706133, 0.9421031212
];

// ── Conversion utilities ──

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function srgbChannelFromLinear(c: number): number {
  return Math.round(clamp(linearToSrgb(c) * 255, 0, 255));
}

const rec2020: XColorPlugin = {
  name: "@xpyjs/color/plugins/rec2020",
  install(_option, cls, _factory) {
    // ── Parser for color(rec2020 r g b [/ a]) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const str = value.trim().toLowerCase();
      if (!str.startsWith("color(") || !str.endsWith(")")) return null;

      const inner = str.slice(6, -1).trim();
      if (!inner.startsWith("rec2020")) return null;

      const rest = inner.slice(7).trim();
      const parts = rest.split("/").map(s => s.trim());
      const channels = parts[0].split(/\s+/).map(Number);
      if (channels.length < 3 || channels.some(isNaN)) return null;

      const rl = rec2020ToLinear(channels[0]);
      const gl = rec2020ToLinear(channels[1]);
      const bl = rec2020ToLinear(channels[2]);

      const [x, y, z] = mat3Mul(REC2020_TO_XYZ, rl, gl, bl);
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
    defineMethod(cls, 'toRec2020', function (this: InstanceType<typeof cls>): WideRGB {
      const rl = srgbToLinear(this.red());
      const gl = srgbToLinear(this.green());
      const bl = srgbToLinear(this.blue());
      const [x, y, z] = mat3Mul(SRGB_TO_XYZ, rl, gl, bl);
      const [rr, rg, rb] = mat3Mul(XYZ_TO_REC2020, x, y, z);
      return {
        r: round4(linearToRec2020(Math.max(0, rr))),
        g: round4(linearToRec2020(Math.max(0, rg))),
        b: round4(linearToRec2020(Math.max(0, rb)))
      };
    });

    defineMethod(cls, 'toRec2020String', function (this: InstanceType<typeof cls>): string {
      const { r, g, b } = this.toRec2020();
      return `color(rec2020 ${r} ${g} ${b})`;
    });

    registerStringFormatter(cls, "rec2020", color => color.toRec2020String());
  }
};

export default rec2020;
