// =======================================
// Plugin: xyz - CIE XYZ color space (D65 / D50)
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import {
  registerStringFormatter,
  registerColorParser,
  parseAlphaChannel,
  defineMethod,
  clamp
} from "@xpyjs/color";

/** CIE XYZ color (D65 illuminant). */
export interface XYZ {
  x: number;
  y: number;
  z: number;
}

declare module "@xpyjs/color" {
  interface XColorStringFormatMap {
    xyz: true;
  }

  interface XColor {
    /** Convert to CIE XYZ D65. */
    toXyz(): XYZ;
    /** Output as `color(xyz-d65 x y z)` string. */
    toXyzString(): string;
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

// ── Conversion utilities ──

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function srgbChannelFromLinear(c: number): number {
  return Math.round(clamp(linearToSrgb(c) * 255, 0, 255));
}

const xyz: XColorPlugin = {
  name: "@xpyjs/color/plugins/xyz",
  install(_option, cls, _factory) {
    // ── Parser for color(xyz ...) / color(xyz-d65 ...) / color(xyz-d50 ...) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const str = value.trim().toLowerCase();
      if (!str.startsWith("color(") || !str.endsWith(")")) return null;

      const inner = str.slice(6, -1).trim();
      if (!inner.startsWith("xyz")) return null;

      let rest: string;
      let isD50 = false;
      if (inner.startsWith("xyz-d50")) {
        rest = inner.slice(7).trim();
        isD50 = true;
      } else if (inner.startsWith("xyz-d65")) {
        rest = inner.slice(7).trim();
      } else if (inner.startsWith("xyz ") || inner.startsWith("xyz/")) {
        rest = inner.slice(3).trim();
      } else {
        return null;
      }

      const parts = rest.split("/").map(s => s.trim());
      const channels = parts[0].split(/\s+/).map(Number);
      if (channels.length < 3 || channels.some(isNaN)) return null;

      let [x, y, z] = channels;
      if (isD50) {
        [x, y, z] = mat3Mul(D50_TO_D65, x, y, z);
      }

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
    defineMethod(cls, 'toXyz', function (this: InstanceType<typeof cls>): XYZ {
      const rl = srgbToLinear(this.red());
      const gl = srgbToLinear(this.green());
      const bl = srgbToLinear(this.blue());
      const [x, y, z] = mat3Mul(SRGB_TO_XYZ, rl, gl, bl);
      return { x: round4(x), y: round4(y), z: round4(z) };
    });

    defineMethod(cls, 'toXyzString', function (this: InstanceType<typeof cls>): string {
      const { x, y, z } = this.toXyz();
      return `color(xyz-d65 ${x} ${y} ${z})`;
    });

    registerStringFormatter(cls, "xyz", color => color.toXyzString());
  }
};

export default xyz;
