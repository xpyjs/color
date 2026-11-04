import { parseCoordinates, type WideColorRecord } from "../wide-color";
export { formatWideColor } from "../wide-color";
import { srgbToLinear, linearToSrgb, type Mat3, mat3Mul, SRGB_TO_XYZ, XYZ_TO_SRGB, D65_TO_D50, D50_TO_D65 } from "../../color-math";
import { alphaSuffix } from "../../tokens";
// =======================================
// Plugin: proPhotoRgb - ProPhoto RGB color space
// =======================================

import type { RGBA, XColorPlugin } from "@xpyjs/color";
import {
  registerStringFormatter,
  registerColorParser,
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

// ── ProPhoto RGB transfer functions (gamma 1.8) ──

function proPhotoToLinear(c: number): number {
  return c <= 16 / 512 ? c / 16 : Math.pow(c, 1.8);
}

function linearToProPhoto(c: number): number {
  return c <= 1 / 512 ? 16 * c : Math.pow(c, 1 / 1.8);
}

// ── Matrices ──

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
  return clamp(linearToSrgb(c) * 255, 0, 255);
}

/** Color data retained in the original coordinate space. */
export type WideColor = WideColorRecord<"prophoto-rgb">;

/**
 * Parse this plugin's CSS color() syntax without clipping its coordinates to sRGB.
 * @param input - Color string
 * @returns A wide-gamut record, or null for invalid syntax or another color space
 */
export function parseWideColor(input: string): WideColor | null {
  return parseCoordinates(input, "prophoto-rgb");
}

/**
 * Explicitly convert to sRGB, clipping out-of-gamut channels.
 * @param color - A wide-gamut record from parseWideColor()
 * @returns RGB channels in 0–255 and alpha in 0–1
 */
export function toSrgb(color: WideColor): RGBA {
  const channels = color.coordinates;
  // Linearize
  const rl = proPhotoToLinear(channels[0]);
  const gl = proPhotoToLinear(channels[1]);
  const bl = proPhotoToLinear(channels[2]);

  // ProPhoto → XYZ D50 → D65 → sRGB
  const [x50, y50, z50] = mat3Mul(PROPHOTO_TO_XYZ_D50, rl, gl, bl);
  const [x, y, z] = mat3Mul(D50_TO_D65, x50, y50, z50);
  const [sr, sg, sb] = mat3Mul(XYZ_TO_SRGB, x, y, z);

  return {
    r: srgbChannelFromLinear(sr),
    g: srgbChannelFromLinear(sg),
    b: srgbChannelFromLinear(sb),
    a: color.alpha
  };
}

const proPhotoRgb: XColorPlugin = {
  name: "@xpyjs/color/plugins/proPhotoRgb",
  install(_option, cls, _factory) {
    // ── Parser for color(prophoto-rgb r g b [/ a]) ──
    registerColorParser((value) => {
      const color = typeof value === "string" ? parseWideColor(value) : null;
      return color ? toSrgb(color) : null;
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
      return `color(prophoto-rgb ${r} ${g} ${b}${alphaSuffix(this.alpha())})`;
    });

    registerStringFormatter(cls, "proPhotoRgb", color => color.toProPhotoRgbString());
  }
};

export default proPhotoRgb;
