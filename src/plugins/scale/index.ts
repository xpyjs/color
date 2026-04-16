// =======================================
// Plugin: scale - Interpolation and color scales
// =======================================

import type { XColorPlugin, XColorInput } from "@xpyjs/color";
import { normalizeSteps, defineMethod } from "@xpyjs/color";

/**
 * Color interpolation space for the scale plugin.
 *
 * - `"rgb"` — Interpolate directly in RGB space (default). Produces a
 *   perceptually even spread but may pass through grey for complementary colors.
 * - `"hsl"` — Interpolate in HSL space with shortest-path hue interpolation.
 *   Tends to produce more vibrant intermediate colors.
 */
type ScaleSpace = "rgb" | "hsl";

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
  /** Number of colors to generate including start and end (default `5`, minimum `2`). */
  steps?: number;
  /** Color space for interpolation (default `"rgb"`). See {@link ScaleSpace}. */
  space?: ScaleSpace;
  /** Easing function for the interpolation factor (default `"linear"`). See {@link ScaleEasing}. */
  easing?: ScaleEasing;
}

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Interpolate to another color and return a color list.
     * @param to - Target color to interpolate towards
     * @param options - Interpolation options
     * @param options.steps - Number of colors to generate (default 5, minimum 2)
     * @param options.space - Color space for interpolation: `"rgb"` (default) or `"hsl"`
     * @param options.easing - Easing function: `"linear"` (default), `"easeIn"`, `"easeOut"`, `"easeInOut"`
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
    defineMethod(cls, 'at', function (this: InstanceType<typeof cls>, to: XColorInput, t: number, options: Omit<ScaleOptions, "steps"> = {}) {
      const target = new cls(to);
      const tt = (easingMap[options.easing || "linear"] || easingMap.linear)(clamp01(t));
      const space = options.space || "rgb";
      const opts = this._opts;

      if (space === "hsl") {
        const start = this.toHsl();
        const end = target.toHsl();

        let dh = end.h - start.h;
        if (dh > 180) dh -= 360;
        if (dh < -180) dh += 360;

        const h = (start.h + dh * tt + 360) % 360;
        const s = start.s + (end.s - start.s) * tt;
        const l = start.l + (end.l - start.l) * tt;
        const a = this.alpha() + (target.alpha() - this.alpha()) * tt;

        return new cls(undefined, opts).hsl(h, s, l, a);
      }

      const r = this.red() + (target.red() - this.red()) * tt;
      const g = this.green() + (target.green() - this.green()) * tt;
      const b = this.blue() + (target.blue() - this.blue()) * tt;
      const a = this.alpha() + (target.alpha() - this.alpha()) * tt;

      return new cls({ r, g, b, a }, opts);
    });

    defineMethod(cls, 'scale', function (this: InstanceType<typeof cls>, to: XColorInput, options: ScaleOptions = {}) {
      const steps = normalizeSteps(options.steps);
      const list: InstanceType<typeof cls>[] = [];

      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        list.push(this.at(to, t, options));
      }

      return list;
    });
  }
};

export type { ScaleSpace, ScaleEasing, ScaleOptions };
export default scale;
