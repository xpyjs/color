import { interpolate, srgbToLinear, linearToSrgb, rgbToOklab, oklabToRgb } from "../../color-math";
// =======================================
// Plugin: scale - Interpolation and color scales
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import { normalizeSteps, defineMethod } from "@xpyjs/color";

/**
 * Color interpolation space for the scale plugin.
 *
 * - `"rgb"` — Interpolate directly in RGB space (default). Uses equal channel increments and may pass through grey for complementary colors.
 * - `"hsl"` — Interpolate in HSL space with shortest-path hue interpolation.
 *   Tends to produce more vibrant intermediate colors.
 * - `"srgb-linear"` — Interpolate linear-light sRGB channels.
 * - `"oklab"` — Interpolate OKLab coordinates.
 */
type ScaleSpace = "rgb" | "hsl" | "srgb-linear" | "oklab";

/**
 * Easing function applied to the interpolation factor `t ∈ [0, 1]`.
 *
 * - `"linear"`     — Constant rate, `t` passes through unchanged (default).
 * - `"easeIn"`     — Slow start, accelerates: `t²`
 * - `"easeOut"`    — Fast start, decelerates: `1 - (1-t)²`
 * - `"easeInOut"`  — Slow at both ends: `2t²` for `t < 0.5`, else `1 - 2(1-t)²`
 */
type ScaleEasing = "linear" | "easeIn" | "easeOut" | "easeInOut";

/**
 * Options for {@link XColor.scale} and {@link XColor.at}.
 */
interface ScaleOptions {
  /** Number of colors to generate including start and end (default `5`, range `2–10000`). */
  steps?: number;
  /** Color space for interpolation (default `"rgb"`). See {@link ScaleSpace}. */
  space?: ScaleSpace;
  /** Easing function for the interpolation factor (default `"linear"`). See {@link ScaleEasing}. */
  easing?: ScaleEasing;
  /** Weight interpolated coordinates by opacity. Defaults to false. */
  premultiplyAlpha?: boolean;
}

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Interpolate to another color and return a color list.
     * @param to - Target color to interpolate towards
     * @param options - Interpolation options
     * @param options.steps - Number of colors to generate (default 5, range 2-10000)
     * @param options.space - Color space for interpolation (default `"rgb"`)
     * @param options.easing - Easing function: `"linear"` (default), `"easeIn"`, `"easeOut"`, `"easeInOut"`
     * @param options.premultiplyAlpha - Weight coordinates by opacity (default false)
     * @returns Array of new XColor instances
     * @example
     * ```ts
     * xcolor('#ff0000').scale('#0000ff', { steps: 5 })
     * xcolor('#ff0000').scale('#0000ff', { space: 'hsl', easing: 'easeInOut' })
     * ```
     */
    scale(to: XColorInput, options?: ScaleOptions): XColor[];

    /**
     * Interpolate to another color at a specific position.
     * @param to - Target color to interpolate towards
     * @param t - Interpolation factor, clamped to [0, 1]. 0 = this color, 1 = target color
     * @param options - Interpolation options (space and easing)
     * @returns A new XColor instance at the interpolated position
     * @example
     * ```ts
     * xcolor('#ff0000').at('#0000ff', 0.5) // midpoint between red and blue
     * xcolor('#ff0000').at('#00ff00', 0.25, { space: 'hsl' })
     * ```
     */
    at(to: XColorInput, t: number, options?: Omit<ScaleOptions, "steps">): XColor;
  }
}

const easingMap: Record<ScaleEasing, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t))
};

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

const scale: XColorPlugin = {
  name: "@xpyjs/color/plugins/scale",
  install(_option, cls, _factory) {
    function at(this: InstanceType<typeof cls>, target: InstanceType<typeof cls>, t: number, options: Omit<ScaleOptions, "steps">) {
      const position = clamp01(t);
      if (position === 0) return this.clone();
      if (position === 1) return target.clone();

      const easing = options.easing ?? "linear";
      const tt = Object.prototype.hasOwnProperty.call(easingMap, easing)
        ? easingMap[easing](position)
        : position;
      const space = options.space || "rgb";
      const opts = this._opts;
      const alpha = interpolate(this.alpha(), target.alpha(), tt);
      const colorPosition = options.premultiplyAlpha && alpha > 0 ? target.alpha() * tt / alpha : tt;
      const channel = (start: number, end: number) => interpolate(start, end, colorPosition);

      if (space === "hsl") {
        const start = this.toHsl();
        const end = target.toHsl();

        let dh = end.h - start.h;
        if (dh > 180) dh -= 360;
        if (dh < -180) dh += 360;

        const h = (start.h + dh * tt + 360) % 360;
        const s = start.s + (end.s - start.s) * colorPosition;
        const l = start.l + (end.l - start.l) * colorPosition;

        return new cls(undefined, opts).hsl(h, s, l, alpha);
      }

      if (space === "oklab") {
        const start = rgbToOklab(this.red(), this.green(), this.blue());
        const end = rgbToOklab(target.red(), target.green(), target.blue());
        const rgb = oklabToRgb(channel(start.l, end.l), channel(start.a, end.a), channel(start.b, end.b));
        return new cls({ ...rgb, a: alpha }, opts);
      }
      const mix = space === "srgb-linear"
        ? (start: number, end: number) => linearToSrgb(channel(srgbToLinear(start), srgbToLinear(end))) * 255
        : channel;
      return new cls({
        r: mix(this.red(), target.red()),
        g: mix(this.green(), target.green()),
        b: mix(this.blue(), target.blue()),
        a: alpha
      }, opts);
    }

    defineMethod(cls, 'at', function (this: InstanceType<typeof cls>, to: XColorInput, t: number, options: Omit<ScaleOptions, "steps"> = {}) {
      return at.call(this, new cls(to, to instanceof cls ? undefined : this._opts), t, options);
    });

    defineMethod(cls, 'scale', function (this: InstanceType<typeof cls>, to: XColorInput, options: ScaleOptions = {}) {
      const target = new cls(to, to instanceof cls ? undefined : this._opts);
      const steps = normalizeSteps(options.steps);
      const list: InstanceType<typeof cls>[] = [];

      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        list.push(at.call(this, target, t, options));
      }

      return list;
    });
  }
};

export type { ScaleSpace, ScaleEasing, ScaleOptions };
export default scale;
