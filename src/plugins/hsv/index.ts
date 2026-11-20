import { XColor, clamp, round, Logger, defineMethod, registerColorParser, registerStringFormatter, parseFunctionalChannels } from "@xpyjs/color";
import { rgbToHsv, hsvToRgb } from "../../utils";
import type { XColorPlugin } from "@xpyjs/color";
import { hueToken, numericToken } from "../../tokens";

/**
 * HSV (HSB) color object with alpha.
 *
 * - `h` (hue) is in degrees `0–360` on the color wheel
 * - `s` (saturation) and `v` (value/brightness) are percentages `0–100`
 * - `a` (alpha) is a float `0–1`
 *
 * @example
 * ```ts
 * const red: HSVA = { h: 0, s: 100, v: 100, a: 1 };
 * const darkBlue: HSVA = { h: 240, s: 100, v: 50, a: 1 };
 * ```
 */
export interface HSVA {
  /** Hue angle — degrees `0` to `360` on the color wheel */
  h: number;
  /** Saturation — percentage `0` (grey/desaturated) to `100` (fully saturated) */
  s: number;
  /** Value (brightness) — percentage `0` (black) to `100` (full brightness) */
  v: number;
  /** Alpha (opacity) — float `0` (fully transparent) to `1` (fully opaque) */
  a: number;
}

declare module "@xpyjs/color" {
  interface XColorInputObjectMap { hsva: Omit<HSVA, "a"> & { a?: number }; }
  interface XColorStringFormatMap { hsv: true; }
  interface XColor {
    /** Get HSV channels. */
    hsv(): HSVA;
    /** Set HSV channels, preserving alpha when omitted. Returns this. */
    hsv(h: number, s: number, v: number, a?: number): this;
    /** Get HSV value in [0,100]. */
    value(): number;
    /** Set HSV value in [0,100]. Returns this. */
    value(value: number): this;
    /** Alias for value(). */
    v(): number;
    v(value: number): this;
    /** Serialize HSV channels with stored alpha precision. */
    toHsv(): HSVA;
    /** Serialize HSV as a tuple. */
    toHsvArray(): [number,number,number,number];
    /** Serialize as hsv()/hsva(). */
    toHsvString(): string;
  }
}
function check(color: XColor, ...values: (number | undefined)[]): void {
  if (color._opts.strict && values.some(value => value !== undefined && !Number.isFinite(value))) {
    throw Logger.createError("Color channels and amounts must be finite", "INVALID_ARGUMENT", "mutation");
  }
}
class HsvMethods extends XColor {
  /**
   * Get the value(brightness) value (0-100) in HSV color space.
   * @returns Value percentage
   * @example xcolor('#ff0000').value() // 100
   */
  value(): number;
  /**
   * Set the value(brightness) value (0-100). Values are clamped.
   * @param value - New value percentage (0-100)
   * @returns Current instance
   * @example xcolor('#800000').value(100).toHex() // '#ff0000'
   */
  value(value: number): this;
  value(value?: number): number | this {
    check(this, value);
    if (value === undefined) return rgbToHsv(this.red(), this.green(), this.blue(), this._opts.useDecimal).v;
    const current = this.toHsv();
    return this.hsv(current.h, current.s, value);
  }

  /**
   * Alias for {@link value}. Get or set the value (0-100).
   * @example xcolor('#ff0000').v() // 100
   * @example xcolor('#800000').v(100).toHex() // '#ff0000'
   */
  v(): number;
  v(value: number): this;
  v(value?: number): number | this {
    return arguments.length ? this.value(value!) : this.value();
  }

  /**
   * Get the HSV(A) object.
   * @returns `{ h, s, v, a }` (same as {@link toHsv()})
    * @alias toHsv
   * @example xcolor('#ff0000').hsv() // { h: 0, s: 100, v: 100, a: 1 }
   */
  hsv(): HSVA;
  /**
   * Set the HSV(A) channels.
   * @param h Hue (0-360)
   * @param s Saturation (0-100)
   * @param v Value (0-100)
   * @param a Alpha (0-1)
   * @returns Current instance
   * @example xcolor('#000').hsv(0, 100, 100).toHex() // '#ff0000'
   */
  hsv(h: number, s: number, v: number, a?: number): this;
  hsv(h?: number, s?: number, v?: number, a?: number): HSVA | this {
    check(this, h,s,v,a);
    if (h === undefined) return this.toHsv();
    if (!Number.isFinite(h)) return this;
    const current = this.toHsv();
    const c = hsvToRgb(
      ((h % 360) + 360) % 360,
      clamp(s ?? current.s, 0, 100),
      clamp(v ?? current.v, 0, 100),
      this._opts.useDecimal
    );
    return this.rgb(c.r, c.g, c.b, a);
  }

  /**
   * Serialize the color to an {@link HSVA} object `{ h, s, v, a }`.
   * Alpha preserves the stored value.
   * @returns HSVA color object
   * @example
   * ```ts
   * xcolor('#ff0000').toHsv()   // { h: 0, s: 100, v: 100, a: 1 }
   * xcolor('#800000').toHsv()   // { h: 0, s: 100, v: 50, a: 1 }
   * ```
   */
  toHsv(): HSVA {
    const _hsv = rgbToHsv(this.red(), this.green(), this.blue(), this._opts.useDecimal);
    return { h: _hsv.h, s: _hsv.s, v: _hsv.v, a: this.alpha() };
  }

  /**
   * Serialize as [hue, saturation, value, alpha], with the same precision as toHsv().
   * @returns HSV channels and alpha
   */
  toHsvArray(): [number, number, number, number] {
    const { h, s, v, a } = this.toHsv();
    return [h, s, v, a];
  }

  /**
   * Serialize the color to an `hsv()` or `hsva()` string.
   * Alpha is omitted (uses `hsv()`) when the color is fully opaque.
   * @returns Color string in HSV notation
   * @example
   * ```ts
   * xcolor('#ff0000').toHsvString()             // 'hsv(0, 100%, 100%)'
   * xcolor('rgba(255,0,0,0.5)').toHsvString()   // 'hsva(0, 100%, 100%, 0.5)'
   * ```
   */
  toHsvString(): string {
    const _hsv = rgbToHsv(this.red(), this.green(), this.blue(), this._opts.useDecimal);
    if (this.alpha() === 1) {
      return "hsv(" + round(_hsv.h) + ", " + round(_hsv.s) + "%, " + round(_hsv.v) + "%)";
    }
    return "hsva(" + round(_hsv.h) + ", " + round(_hsv.s) + "%, " + round(_hsv.v) + "%, " + this.alpha() + ")";
  }

}
const hsv: XColorPlugin = {
  name: "@xpyjs/color/plugins/hsv",
  install(_option, cls) {
    for (const key of Object.getOwnPropertyNames(HsvMethods.prototype)) {
      if (key !== "constructor") defineMethod(cls, key, Object.getOwnPropertyDescriptor(HsvMethods.prototype, key)!.value);
    }
    registerColorParser(input => {
      let channels: unknown[], alpha: unknown;
      if (typeof input === "string") {
        const parsed = parseFunctionalChannels(input, ["hsv", "hsva"], 3);
        if (!parsed) return null;
        channels = parsed.channels;
        alpha = parsed.alpha ?? 1;
      } else if (input && typeof input === "object" && "h" in input && "s" in input && "v" in input) {
        channels = [input.h, input.s, input.v];
        alpha = "a" in input ? input.a ?? 1 : 1;
      } else return null;
      const h = hueToken(channels[0]), s = numericToken(channels[1], 100), v = numericToken(channels[2], 100), a = numericToken(alpha, 1);
      if (![h,s,v,a].every(Number.isFinite)) return null;
      return { ...hsvToRgb(h, clamp(s,0,100), clamp(v,0,100), true), a: clamp(a,0,1) };
    });
    registerStringFormatter(cls, "hsv", color => color.toHsvString());
  }
};
export default hsv;

export { rgbToHsv, hsvToRgb } from "../../utils";
