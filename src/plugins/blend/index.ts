// =======================================
// Plugin: blend - Color blending modes
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import { Logger, defineMethod } from "@xpyjs/color";
import { nonseparable, type NonseparableMode } from "./nonseparable";

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
  | "exclusion"
  | NonseparableMode;

/** Single-pixel Porter–Duff operators; lighter adds and clamps premultiplied channels/alpha. */
export type XColorCompositeOperator = "clear" | "copy" | "destination" | "source-over" | "destination-over"
  | "source-in" | "destination-in" | "source-out" | "destination-out" | "source-atop" | "destination-atop" | "xor" | "lighter";

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
    blend(color: XColorInput, mode?: BlendMode): XColor;
    /**
     * Composite a source color over this destination using Porter–Duff coverage factors.
     * @param color - Source RGBA color
     * @param operator - Default source-over; operates in encoded sRGB without a blend function
     * @returns Independent result retaining destination precision options; zero alpha yields transparent black
     * @throws For invalid colors or an unknown operator
     * @see https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators
     */
    composite(color: XColorInput, operator?: XColorCompositeOperator): XColor;
  }
}

const blendFunctions: Record<Exclude<BlendMode,NonseparableMode>, (a: number, b: number) => number> = {
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
    defineMethod(cls, 'blend', function (this: InstanceType<typeof cls>, color: XColorInput, mode: BlendMode = "normal") {
      const other = new cls(color, color instanceof cls ? undefined : this._opts);
      if (!this.isValid() || !other.isValid()) throw Logger.createError("Invalid blend color");
      const nonseparableMode = ["hue","saturation","color","luminosity"].includes(mode);

      if (!nonseparableMode && !Object.prototype.hasOwnProperty.call(blendFunctions, mode)) {
        throw Logger.createError(`Unknown blend mode: ${mode}`);
      }

      const result = this.clone();
      const baseAlpha = this.alpha();
      const srcAlpha = other.alpha();
      if (srcAlpha === 0) return result;

      const baseWeight = baseAlpha * (1 - srcAlpha);
      const outAlpha = srcAlpha + baseWeight;
      const mixed = nonseparableMode ? nonseparable([this.red()/255,this.green()/255,this.blue()/255],[other.red()/255,other.green()/255,other.blue()/255],mode as NonseparableMode).map(v=>v*255) : null;
      const fn = blendFunctions[mode as Exclude<BlendMode,NonseparableMode>];
      const blendChannel = (base: number, src: number, index:number) => {
        const mixedSource = (1 - baseAlpha) * src + baseAlpha * (mixed ? mixed[index] : fn(base, src));
        return (srcAlpha * mixedSource + baseWeight * base) / outAlpha;
      };

      return result.rgb(
        blendChannel(this.red(), other.red(),0),
        blendChannel(this.green(), other.green(),1),
        blendChannel(this.blue(), other.blue(),2),
        outAlpha
      );
    });
    defineMethod(cls, "composite", function (this:InstanceType<typeof cls>, color:XColorInput, operator:XColorCompositeOperator = "source-over") {
      const source = new cls(color,color instanceof cls ? undefined : this._opts);
      if (!this.isValid() || !source.isValid()) throw Logger.createError("Invalid composite color");
      const sa = source.alpha(), da = this.alpha();
      const factors:Record<XColorCompositeOperator,[number,number]> = {
        clear:[0,0],copy:[1,0],destination:[0,1],"source-over":[1,1-sa],"destination-over":[1-da,1],
        "source-in":[da,0],"destination-in":[0,sa],"source-out":[1-da,0],"destination-out":[0,1-sa],
        "source-atop":[da,1-sa],"destination-atop":[1-da,sa],xor:[1-da,1-sa],lighter:[1,1]
      };
      if (!Object.prototype.hasOwnProperty.call(factors,operator)) throw Logger.createError("Unknown composite operator");
      const [sf,df] = factors[operator];
      const alpha = Math.min(1,sa*sf+da*df);
      const channel = (s:number,d:number) => alpha === 0 ? 0 : Math.min(255,s*sa*sf+d*da*df)/alpha;
      return this.clone().rgb(channel(source.red(),this.red()),channel(source.green(),this.green()),channel(source.blue(),this.blue()),alpha);
    });
  }
};

export type { BlendMode };

export default blend;
