import { parseCoordinates, type WideColorRecord } from "../wide-color";
export { formatWideColor } from "../wide-color";
import { srgbToLinear, linearToSrgb, type Mat3, mat3Mul, SRGB_TO_XYZ, XYZ_TO_SRGB } from "../../color-math";
import { alphaSuffix } from "../../tokens";
// =======================================
// Plugin: a98Rgb - A98-RGB (Adobe RGB 1998) color space
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
    a98Rgb: true;
  }

  interface XColor {
    /** Convert to A98-RGB (channels 0-1). */
    toA98Rgb(): WideRGB;
    /** Output as `color(a98-rgb r g b)` string. */
    toA98RgbString(): string;
  }
}

// ── A98-RGB transfer functions (gamma 563/256 ≈ 2.19921875) ──

function a98ToLinear(c: number): number {
  return Math.sign(c) * Math.pow(Math.abs(c), 563 / 256);
}

function linearToA98(c: number): number {
  return Math.sign(c) * Math.pow(Math.abs(c), 256 / 563);
}

// ── Matrices ──

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

// ── Conversion utilities ──

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function srgbChannelFromLinear(c: number): number {
  return clamp(linearToSrgb(c) * 255, 0, 255);
}

/** Color data retained in the original coordinate space. */
export type WideColor = WideColorRecord<"a98-rgb">;

/**
 * Parse this plugin's CSS color() syntax without clipping its coordinates to sRGB.
 * @param input - Color string
 * @returns A wide-gamut record, or null for invalid syntax or another color space
 */
export function parseWideColor(input: string): WideColor | null {
  return parseCoordinates(input, "a98-rgb");
}

/**
 * Explicitly convert to sRGB, clipping out-of-gamut channels.
 * @param color - A wide-gamut record from parseWideColor()
 * @returns RGB channels in 0–255 and alpha in 0–1
 */
export function toSrgb(color: WideColor): RGBA {
  const channels = color.coordinates;
  const rl = a98ToLinear(channels[0]);
  const gl = a98ToLinear(channels[1]);
  const bl = a98ToLinear(channels[2]);

  const [x, y, z] = mat3Mul(A98_TO_XYZ, rl, gl, bl);
  const [sr, sg, sb] = mat3Mul(XYZ_TO_SRGB, x, y, z);

  return {
    r: srgbChannelFromLinear(sr),
    g: srgbChannelFromLinear(sg),
    b: srgbChannelFromLinear(sb),
    a: color.alpha
  };
}

const a98Rgb: XColorPlugin = {
  name: "@xpyjs/color/plugins/a98Rgb",
  install(_option, cls, _factory) {
    // ── Parser for color(a98-rgb r g b [/ a]) ──
    registerColorParser((value) => {
      const color = typeof value === "string" ? parseWideColor(value) : null;
      return color ? toSrgb(color) : null;
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
      return `color(a98-rgb ${r} ${g} ${b}${alphaSuffix(this.alpha())})`;
    });

    registerStringFormatter(cls, "a98Rgb", color => color.toA98RgbString());
  }
};

export default a98Rgb;
