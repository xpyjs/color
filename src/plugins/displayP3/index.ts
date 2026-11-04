import { parseCoordinates, type WideColorRecord } from "../wide-color";
export { formatWideColor } from "../wide-color";
import { srgbToLinear, linearToSrgb, type Mat3, mat3Mul, SRGB_TO_XYZ, XYZ_TO_SRGB } from "../../color-math";
import { alphaSuffix } from "../../tokens";
// =======================================
// Plugin: displayP3 - Display P3 color space
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
    displayP3: true;
  }

  interface XColor {
    /** Convert to Display P3 (channels 0-1). */
    toDisplayP3(): WideRGB;
    /** Output as `color(display-p3 r g b)` string. */
    toDisplayP3String(): string;
  }
}

// ── Matrices ──

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
  return clamp(linearToSrgb(c) * 255, 0, 255);
}

/** Color data retained in the original coordinate space. */
export type WideColor = WideColorRecord<"display-p3">;

/**
 * Parse this plugin's CSS color() syntax without clipping its coordinates to sRGB.
 * @param input - Color string
 * @returns A wide-gamut record, or null for invalid syntax or another color space
 */
export function parseWideColor(input: string): WideColor | null {
  return parseCoordinates(input, "display-p3");
}

/**
 * Explicitly convert to sRGB, clipping out-of-gamut channels.
 * @param color - A wide-gamut record from parseWideColor()
 * @returns RGB channels in 0–255 and alpha in 0–1
 */
export function toSrgb(color: WideColor): RGBA {
  const channels = color.coordinates;
  // Linearize (Display P3 uses sRGB gamma)
  const rl = channels[0] <= 0.04045 ? channels[0] / 12.92 : ((channels[0] + 0.055) / 1.055) ** 2.4;
  const gl = channels[1] <= 0.04045 ? channels[1] / 12.92 : ((channels[1] + 0.055) / 1.055) ** 2.4;
  const bl = channels[2] <= 0.04045 ? channels[2] / 12.92 : ((channels[2] + 0.055) / 1.055) ** 2.4;

  // P3 → XYZ D65 → sRGB linear → sRGB
  const [x, y, z] = mat3Mul(P3_TO_XYZ, rl, gl, bl);
  const [sr, sg, sb] = mat3Mul(XYZ_TO_SRGB, x, y, z);

  return {
    r: srgbChannelFromLinear(sr),
    g: srgbChannelFromLinear(sg),
    b: srgbChannelFromLinear(sb),
    a: color.alpha
  };
}

const displayP3: XColorPlugin = {
  name: "@xpyjs/color/plugins/displayP3",
  install(_option, cls, _factory) {
    // ── Parser for color(display-p3 r g b [/ a]) ──
    registerColorParser((value) => {
      const color = typeof value === "string" ? parseWideColor(value) : null;
      return color ? toSrgb(color) : null;
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
      return `color(display-p3 ${r} ${g} ${b}${alphaSuffix(this.alpha())})`;
    });

    registerStringFormatter(cls, "displayP3", color => color.toDisplayP3String());
  }
};

export default displayP3;
