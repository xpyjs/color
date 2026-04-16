// =======================================
// Plugin: displayP3 - Display P3 color space
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
    displayP3: true;
  }

  interface XColor {
    /** Convert to Display P3 (channels 0-1). */
    toDisplayP3(): WideRGB;
    /** Output as `color(display-p3 r g b)` string. */
    toDisplayP3String(): string;
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

const P3_TO_XYZ: Mat3 = [
  0.4865709486, 0.2656676932, 0.1982172852,
  0.2289745641, 0.6917385218, 0.0792869141,
  0.0000000000, 0.0451133819, 1.0439443689
];

const XYZ_TO_P3: Mat3 = [
  2.4934969119, -0.9313836179, -0.4027107845,
  -0.8294889696, 1.7626640603, 0.0236246858,
  0.0358458302, -0.0761723893, 0.9568845240
];

// ── Conversion utilities ──

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function srgbChannelFromLinear(c: number): number {
  return Math.round(clamp(linearToSrgb(c) * 255, 0, 255));
}

const displayP3: XColorPlugin = {
  name: "@xpyjs/color/plugins/displayP3",
  install(_option, cls, _factory) {
    // ── Parser for color(display-p3 r g b [/ a]) ──
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const str = value.trim().toLowerCase();
      if (!str.startsWith("color(") || !str.endsWith(")")) return null;

      const inner = str.slice(6, -1).trim();
      if (!inner.startsWith("display-p3")) return null;

      const rest = inner.slice(10).trim();
      const parts = rest.split("/").map(s => s.trim());
      const channels = parts[0].split(/\s+/).map(Number);
      if (channels.length < 3 || channels.some(isNaN)) return null;

      // Linearize (Display P3 uses sRGB gamma)
      const rl = channels[0] <= 0.04045 ? channels[0] / 12.92 : ((channels[0] + 0.055) / 1.055) ** 2.4;
      const gl = channels[1] <= 0.04045 ? channels[1] / 12.92 : ((channels[1] + 0.055) / 1.055) ** 2.4;
      const bl = channels[2] <= 0.04045 ? channels[2] / 12.92 : ((channels[2] + 0.055) / 1.055) ** 2.4;

      // P3 → XYZ D65 → sRGB linear → sRGB
      const [x, y, z] = mat3Mul(P3_TO_XYZ, rl, gl, bl);
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
    defineMethod(cls, 'toDisplayP3', function (this: InstanceType<typeof cls>): WideRGB {
      const rl = srgbToLinear(this.red());
      const gl = srgbToLinear(this.green());
      const bl = srgbToLinear(this.blue());
      const [x, y, z] = mat3Mul(SRGB_TO_XYZ, rl, gl, bl);
      const [pr, pg, pb] = mat3Mul(XYZ_TO_P3, x, y, z);
      return {
        r: round4(linearToSrgb(pr)),
        g: round4(linearToSrgb(pg)),
        b: round4(linearToSrgb(pb))
      };
    });

    defineMethod(cls, 'toDisplayP3String', function (this: InstanceType<typeof cls>): string {
      const { r, g, b } = this.toDisplayP3();
      return `color(display-p3 ${r} ${g} ${b})`;
    });

    registerStringFormatter(cls, "displayP3", color => color.toDisplayP3String());
  }
};

export default displayP3;
