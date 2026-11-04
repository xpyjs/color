// =======================================
// Plugin: blend - Color blending modes
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import { Logger, defineMethod } from "@xpyjs/color";

/**
 * Photoshop-compatible layer blend modes.
 *
 * Each mode defines how two colors interact when composited:
 * - `"multiply"`   — Multiplies the channels; always darker. `A * B / 255`
 * - `"screen"`     — Inverse multiply; always lighter. `A + B - A*B/255`
 * - `"overlay"`    — Combines multiply and screen based on base brightness.
 * - `"darken"`     — Keeps the darker of the two channels. `min(A, B)`
 * - `"lighten"`    — Keeps the lighter of the two channels. `max(A, B)`
 * - `"dodge"`      — Brightens the base by reflecting the blend. `A*255/(255-B)`
 * - `"burn"`       — Darkens the base by reflecting the blend. `255-(255-A)*255/B`
 * - `"hardLight"`  — Like overlay but layer roles are swapped.
 * - `"softLight"`  — Softer version of hard light (W3C compositing formula).
 * - `"difference"` — Absolute difference. `|A - B|`
 * - `"exclusion"`  — Similar to difference but lower contrast. `A+B-2*A*B/255`
 *
 * @example
 * ```ts
 * xcolor.use(blendPlugin)
 *
 * const result = xcolor('#ff0000').blend('#0000ff', 'multiply')
 * result.toHex()   // '#000000'
 * ```
 */
type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "dodge"
  | "burn"
  | "hardLight"
  | "softLight"
  | "difference"
  | "exclusion";

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Blend with another color using a specific blend mode.
     * @param color - The color to blend with
     * @param mode - The blend mode to use
     * @returns A new XColor instance with the blended result (does not modify the original)
     * @example
     * ```ts
     * const c1 = xcolor('#ff0000');
     * const c2 = xcolor('#0000ff');
     * const blended = c1.blend(c2, 'multiply');
     * console.log(blended.toHex()); // '#000000'
     * ```
     */
    blend(color: XColorInput, mode: BlendMode): XColor;
  }
}

const blendFunctions: Record<BlendMode, (a: number, b: number) => number> = {
  normal: (_a, b) => b,
  multiply: (a, b) => (a * b) / 255,
  screen: (a, b) => a + b - (a * b) / 255,
  overlay: (a, b) =>
    a < 128 ? (2 * a * b) / 255 : 255 - (2 * (255 - a) * (255 - b)) / 255,
  darken: (a, b) => Math.min(a, b),
  lighten: (a, b) => Math.max(a, b),
  dodge: (a, b) => (a === 0 ? 0 : b === 255 ? 255 : Math.min(255, (a * 255) / (255 - b))),
  burn: (a, b) => (a === 255 ? 255 : b === 0 ? 0 : Math.max(0, 255 - ((255 - a) * 255) / b)),
  hardLight: (a, b) =>
    b < 128 ? (2 * a * b) / 255 : 255 - (2 * (255 - a) * (255 - b)) / 255,
  softLight: (a, b) => {
    // W3C Compositing standard formula
    const A = a / 255, B = b / 255;
    const D = A <= 0.25 ? ((16 * A - 12) * A + 4) * A : Math.sqrt(A);
    const R = B <= 0.5
      ? A - (1 - 2 * B) * A * (1 - A)
      : A + (2 * B - 1) * (D - A);
    return R * 255;
  },
  difference: (a, b) => Math.abs(a - b),
  exclusion: (a, b) => a + b - (2 * a * b) / 255
};

const blend: XColorPlugin = {
  name: "@xpyjs/color/plugins/blend",
  install(_option, cls, _factory) {
    defineMethod(cls, 'blend', function (this: InstanceType<typeof cls>, color: XColorInput, mode: BlendMode) {
      const other = new cls(color, color instanceof cls ? undefined : this._opts);
      const fn = blendFunctions[mode];

      if (!Object.prototype.hasOwnProperty.call(blendFunctions, mode)) {
        throw Logger.createError(`Unknown blend mode: ${mode}`);
      }

      const result = this.clone();
      const baseAlpha = this.alpha();
      const srcAlpha = other.alpha();
      if (srcAlpha === 0) return result;

      const baseWeight = baseAlpha * (1 - srcAlpha);
      const outAlpha = srcAlpha + baseWeight;
      const blendChannel = (base: number, src: number) => {
        const mixedSource = (1 - baseAlpha) * src + baseAlpha * fn(base, src);
        return (srcAlpha * mixedSource + baseWeight * base) / outAlpha;
      };

      return result.rgb(
        blendChannel(this.red(), other.red()),
        blendChannel(this.green(), other.green()),
        blendChannel(this.blue(), other.blue()),
        outAlpha
      );
    });
  }
};

export type { BlendMode };

export default blend;
