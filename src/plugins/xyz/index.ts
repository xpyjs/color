import { parseCoordinates, type WideColorRecord } from "../wide-color";
export { formatWideColor } from "../wide-color";
import { srgbToLinear, linearToSrgb, type Mat3, mat3Mul, SRGB_TO_XYZ, XYZ_TO_SRGB, D65_TO_D50, D50_TO_D65 } from "../../color-math";
import { alphaSuffix } from "../../tokens";
// =======================================
// Plugin: xyz - CIE XYZ color space (D65 / D50)
// =======================================

import type { RGBA, XColorPlugin } from "@xpyjs/color";
import {
  registerStringFormatter,
  registerColorParser,
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
    /**
     * Convert to CIE XYZ.
     * @param illuminant - Reference illuminant (default `"D65"`)
     */
    toXyz(illuminant?: "D65" | "D50"): XYZ;
    /**
     * Output as `color(xyz-d65 x y z)` or `color(xyz-d50 x y z)`.
     * @param illuminant - Reference illuminant (default `"D65"`)
     */
    toXyzString(illuminant?: "D65" | "D50"): string;
  }
}

// ── Matrices ──

// ── Conversion utilities ──

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function srgbChannelFromLinear(c: number): number {
  return clamp(linearToSrgb(c) * 255, 0, 255);
}

/** Color data retained in the original coordinate space. */
export type WideColor = WideColorRecord<"xyz-d50" | "xyz-d65" | "xyz">;

/**
 * Parse this plugin's CSS color() syntax without clipping its coordinates to sRGB.
 * @param input - Color string
 * @returns A wide-gamut record, or null for invalid syntax or another color space
 */
export function parseWideColor(input: string): WideColor | null {
  return parseCoordinates(input, "xyz-d50") ?? parseCoordinates(input, "xyz-d65") ?? parseCoordinates(input, "xyz");
}

/**
 * Explicitly convert to sRGB, clipping out-of-gamut channels.
 * @param color - A wide-gamut record from parseWideColor()
 * @returns RGB channels in 0–255 and alpha in 0–1
 */
export function toSrgb(color: WideColor): RGBA {
  let [x, y, z] = color.coordinates;
  if (color.space === "xyz-d50") {
    [x, y, z] = mat3Mul(D50_TO_D65, x, y, z);
  }

  const [sr, sg, sb] = mat3Mul(XYZ_TO_SRGB, x, y, z);
  return {
    r: srgbChannelFromLinear(sr),
    g: srgbChannelFromLinear(sg),
    b: srgbChannelFromLinear(sb),
    a: color.alpha
  };
}

const xyz: XColorPlugin = {
  name: "@xpyjs/color/plugins/xyz",
  install(_option, cls, _factory) {
    // ── Parser for color(xyz ...) / color(xyz-d65 ...) / color(xyz-d50 ...) ──
    registerColorParser((value) => {
      const color = typeof value === "string" ? parseWideColor(value) : null;
      return color ? toSrgb(color) : null;
    });

    // ── Output methods ──
    defineMethod(cls, 'toXyz', function (this: InstanceType<typeof cls>, illuminant: "D65" | "D50" = "D65"): XYZ {
      const rl = srgbToLinear(this.red());
      const gl = srgbToLinear(this.green());
      const bl = srgbToLinear(this.blue());
      let [x, y, z] = mat3Mul(SRGB_TO_XYZ, rl, gl, bl);
      if (illuminant === "D50") {
        [x, y, z] = mat3Mul(D65_TO_D50, x, y, z);
      }
      return { x: round4(x), y: round4(y), z: round4(z) };
    });

    defineMethod(cls, 'toXyzString', function (this: InstanceType<typeof cls>, illuminant: "D65" | "D50" = "D65"): string {
      const { x, y, z } = this.toXyz(illuminant);
      return `color(${illuminant === "D50" ? "xyz-d50" : "xyz-d65"} ${x} ${y} ${z}${alphaSuffix(this.alpha())})`;
    });

    registerStringFormatter(cls, "xyz", color => color.toXyzString());
  }
};

export default xyz;
