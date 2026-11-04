import { parseCoordinates, type WideColorRecord } from "../wide-color";
export { formatWideColor } from "../wide-color";
import { srgbToLinear, linearToSrgb, type Mat3, mat3Mul, SRGB_TO_XYZ, XYZ_TO_SRGB } from "../../color-math";
import { alphaSuffix } from "../../tokens";
// =======================================
// Plugin: rec2020 - Rec. 2020 color space
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
    rec2020: true;
  }

  interface XColor {
    /** Convert to Rec2020 (channels 0-1). */
    toRec2020(): WideRGB;
    /** Output as `color(rec2020 r g b)` string. */
    toRec2020String(): string;
  }
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

// ── Matrices ──

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
  return clamp(linearToSrgb(c) * 255, 0, 255);
}

/** Color data retained in the original coordinate space. */
export type WideColor = WideColorRecord<"rec2020">;

/**
 * Parse this plugin's CSS color() syntax without clipping its coordinates to sRGB.
 * @param input - Color string
 * @returns A wide-gamut record, or null for invalid syntax or another color space
 */
export function parseWideColor(input: string): WideColor | null {
  return parseCoordinates(input, "rec2020");
}

/**
 * Explicitly convert to sRGB, clipping out-of-gamut channels.
 * @param color - A wide-gamut record from parseWideColor()
 * @returns RGB channels in 0–255 and alpha in 0–1
 */
export function toSrgb(color: WideColor): RGBA {
  const channels = color.coordinates;
  const rl = rec2020ToLinear(channels[0]);
  const gl = rec2020ToLinear(channels[1]);
  const bl = rec2020ToLinear(channels[2]);

  const [x, y, z] = mat3Mul(REC2020_TO_XYZ, rl, gl, bl);
  const [sr, sg, sb] = mat3Mul(XYZ_TO_SRGB, x, y, z);

  return {
    r: srgbChannelFromLinear(sr),
    g: srgbChannelFromLinear(sg),
    b: srgbChannelFromLinear(sb),
    a: color.alpha
  };
}

const rec2020: XColorPlugin = {
  name: "@xpyjs/color/plugins/rec2020",
  install(_option, cls, _factory) {
    // ── Parser for color(rec2020 r g b [/ a]) ──
    registerColorParser((value) => {
      const color = typeof value === "string" ? parseWideColor(value) : null;
      return color ? toSrgb(color) : null;
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
      return `color(rec2020 ${r} ${g} ${b}${alphaSuffix(this.alpha())})`;
    });

    registerStringFormatter(cls, "rec2020", color => color.toRec2020String());
  }
};

export default rec2020;
