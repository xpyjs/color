// =======================================
// Core XColor class - @xpyjs/color
// =======================================

import type { RGBA, HSLA, HSVA, XColorPlugin } from "./types";
import {
  clamp,
  round,
  Logger,
  rgbaToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  relativeLuminance,
  contrastRatio
} from "./utils";
import { parseColor } from "./parse";

/** Global default options, applied when no instance-level opts are provided. */
let _globalOpts: XColorOptions = {};

/**
 * Internal map that associates short key names with the corresponding partial
 * color-object shapes accepted by the constructor.
 * Plugins can augment this interface (e.g. the CMYK plugin adds `cmyk: Partial<CMYK>`)
 * so that the object-input union automatically widens.
 * @internal
 */
export interface XColorInputObjectMap {
  rgba: Partial<RGBA>;
  hsla: Partial<HSLA>;
  hsva: Partial<HSVA>;
}

/**
 * Union of all plain-object shapes accepted as a color input.
 * Resolves to the values of {@link XColorInputObjectMap}, so plugins that
 * augment the map automatically extend this union too.
 *
 * @example
 * ```ts
 * const a: XColorObjectInput = { r: 255, g: 0, b: 0 };    // partial RGBA
 * const b: XColorObjectInput = { h: 120, s: 100, l: 50 }; // partial HSLA
 * ```
 */
export type XColorObjectInput = XColorInputObjectMap[keyof XColorInputObjectMap];

/**
 * Primitive (non-XColor) color inputs accepted by the parser pipeline:
 * - `number`  — 24-bit integer `0x000000`–`0xFFFFFF`, e.g. `0xFF0000`
 * - `string`  — hex, `rgb()`, `hsl()`, `hsv()`, named color (via name plugin), etc.
 * - `object`  — plain object with known channel keys, see {@link XColorObjectInput}
 */
export type XColorInputNative = number | string | XColorObjectInput;

/**
 * All color input types accepted by `xcolor()` and the `XColor` constructor.
 * Extends {@link XColorInputNative} with an `XColor` instance itself,
 * which triggers a clone of the source instance.
 *
 * @example
 * ```ts
 * xcolor('#ff0000')                    // hex string
 * xcolor('rgb(255, 0, 0)')             // rgb() string
 * xcolor({ r: 255, g: 0, b: 0 })      // partial RGBA object
 * xcolor(0xFF0000)                     // 24-bit integer
 * xcolor(existingColor)                // XColor clone
 * ```
 */
export type XColorInput = XColorInputNative | XColor;

/**
 * Extensible map of string format keys supported by `.toString()` / `.format()`.
 * Plugins can augment this interface to register new format literals, which
 * automatically extends the {@link XColorStringFormat} union.
 *
 * Built-in formats:
 * - `"hex"`  — `#RRGGBB` (default when fully opaque)
 * - `"hex3"` — `#RGB` short form (when each channel compresses losslessly)
 * - `"hex8"` — `#RRGGBBAA` (always includes alpha)
 * - `"rgb"`  — `rgb(R, G, B)` or `rgba(R, G, B, A)`
 * - `"hsl"`  — `hsl(H, S%, L%)` or `hsla(H, S%, L%, A)`
 * - `"hsv"`  — `hsv(H, S%, V%)` or `hsva(H, S%, V%, A)`
 *
 * @example Extending via a plugin
 * ```ts
 * declare module '@xpyjs/color' {
 *   interface XColorStringFormatMap {
 *     myFormat: true;
 *   }
 * }
 * ```
 */
export interface XColorStringFormatMap {
  /** Standard 6-digit hex, e.g. `#ff0000`. Alpha is omitted when opaque. */
  hex: true;
  /** Short 3-digit hex, e.g. `#f00`, only when each pair is duplicated (`#aabbcc` → `#abc`). */
  hex3: true;
  /** 8-digit hex including alpha channel, e.g. `#ff000080`. */
  hex8: true;
  /** CSS `rgb()` / `rgba()` functional notation, e.g. `rgb(255, 0, 0)`. */
  rgb: true;
  /** CSS `hsl()` / `hsla()` functional notation, e.g. `hsl(0, 100%, 50%)`. */
  hsl: true;
  /** `hsv()` / `hsva()` functional notation, e.g. `hsv(0, 100%, 100%)`. */
  hsv: true;
}

/**
 * Union of all string format keys recognised by `.toString()` and `.format()`.
 * Automatically extended when plugins augment {@link XColorStringFormatMap}.
 *
 * @example
 * ```ts
 * xcolor('#ff0000').toString('hex')  // '#ff0000'
 * xcolor('#ff0000').toString('rgb')  // 'rgb(255, 0, 0)'
 * xcolor('#ff0000').toString('hsl')  // 'hsl(0, 100%, 50%)'
 * ```
 */
export type XColorStringFormat = keyof XColorStringFormatMap;

/** Options for creating an XColor instance */
export type XColorOptions = {
  /**
   * Whether to enable decimal (fractional) values for RGB channels.
   *
   * When `false` (default), RGB channels are always rounded to integers (0-255).
   * When `true`, RGB channels keep fractional precision (e.g., `127.5`).
   *
   * This is useful for modern CSS `color()` functions and high-precision color math.
   *
   * @default false
   */
  useDecimal?: boolean;
}

/**
 * XColor - A tiny, fast, plugin-extensible color manipulation tool.
 * Supports chainable operations, Getter/Setter overloads, and multiple color formats.
 *
 * @example
 * ```ts
 * import xcolor from '@xpyjs/color'
 *
 * const c = xcolor('#ff0000')
 * c.lighten(20).toHex() // '#ff3333'
 * c.rgb()               // { r: 255, g: 0, b: 0, a: 1 }
 * c.rgb(0, 255, 0)      // set to green, returns this
 * c.r(128).darken(10).rgb() // { r: 115, g: 255, b: 0, a: 1 }
 * ```
 */
export class XColor {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;
  private _valid: boolean;
  /** @internal */
  _opts: XColorOptions;
  /** @internal */
  private static _registeredPluginNames = new Set<string>();

  /**
   * Create a new XColor instance.
   *
   * @param value - Color input (hex, rgb, hsl, hsv, named, object, number)
   * @param opts - Options for color creation
   */
  constructor(value?: XColorInput, opts?: XColorOptions) {
    this._opts = opts ? { ..._globalOpts, ...opts } : { ..._globalOpts };

    if (value instanceof XColor) {
      this._r = value._r;
      this._g = value._g;
      this._b = value._b;
      this._a = value._a;
      this._valid = value._valid;
      // Inherit options from the source unless explicitly provided
      if (!opts) this._opts = { ...value._opts };
      return;
    } else if (value === undefined || value === null) {
      this._r = 0;
      this._g = 0;
      this._b = 0;
      this._a = 1;
      this._valid = true;
      return;
    }

    const parsed = parseColor(value);
    if (parsed === null) {
      this._r = 0;
      this._g = 0;
      this._b = 0;
      this._a = 1;
      this._valid = false;
    } else {
      this._r = this._opts.useDecimal ? parsed.r : Math.round(parsed.r);
      this._g = this._opts.useDecimal ? parsed.g : Math.round(parsed.g);
      this._b = this._opts.useDecimal ? parsed.b : Math.round(parsed.b);
      this._a = parsed.a;
      this._valid = true;
    }
  }

  /**
   * Round a channel value based on the `useDecimal` option.
   * @internal
   */
  private _roundCh(value: number): number {
    return this._opts.useDecimal ? value : Math.round(value);
  }

  /**
   * Apply a color-space transformation: convert to HSL/HSV, run `fn`, convert back.
   * @internal
   */
  private _applyCS<T>(
    toCS: (r: number, g: number, b: number) => T,
    fromCS: (...args: number[]) => { r: number; g: number; b: number },
    keys: (keyof T)[],
    fn: (cs: T) => void
  ): this {
    const cs = toCS(this._r, this._g, this._b);
    fn(cs);
    const c = fromCS(...keys.map(k => cs[k] as number));
    this._r = c.r;
    this._g = c.g;
    this._b = c.b;
    return this;
  }

  /**
   * Generic RGB channel getter/setter.
   * @internal
   */
  private _channel(field: '_r' | '_g' | '_b', value?: number): number | this {
    if (value === undefined) return this[field];
    this[field] = this._roundCh(clamp(value, 0, 255));
    return this;
  }

  // =======================================
  // Channel Get/Set Methods
  // =======================================

  /**
   * Get the red channel value (0-255).
   * @returns Red channel value
   * @example xcolor('#ff8040').red() // 255
   */
  red(): number;
  /**
   * Set the red channel value (0-255). Values are clamped and rounded.
   * @param value - New red value (0-255)
   * @returns Current instance
   * @example xcolor('#000').red(128).toHex() // '#800000'
   */
  red(value: number): this;
  red(value?: number): number | this {
    return this._channel('_r', value);
  }

  /**
   * Alias for {@link red}. Get or set the red channel value.
   * @example xcolor('#ff0000').r() // 255
   * @example xcolor('#000').r(128).toHex() // '#800000'
   */
  r(): number;
  r(value: number): this;
  r(value?: number): number | this {
    return this._channel('_r', value);
  }

  /**
   * Get the green channel value (0-255).
   * @returns Green channel value
   * @example xcolor('#00ff00').green() // 255
   */
  green(): number;
  /**
   * Set the green channel value (0-255). Values are clamped and rounded.
   * @param value - New green value (0-255)
   * @returns Current instance
   * @example xcolor('#000').green(128).toHex() // '#008000'
   */
  green(value: number): this;
  green(value?: number): number | this {
    return this._channel('_g', value);
  }

  /**
   * Alias for {@link green}. Get or set the green channel value.
   * @example xcolor('#00ff00').g() // 255
   * @example xcolor('#000').g(128).toHex() // '#008000'
   */
  g(): number;
  g(value: number): this;
  g(value?: number): number | this {
    return this._channel('_g', value);
  }

  /**
   * Get the blue channel value (0-255).
   * @returns Blue channel value
   * @example xcolor('#0000ff').blue() // 255
   */
  blue(): number;
  /**
   * Set the blue channel value (0-255). Values are clamped and rounded.
   * @param value - New blue value (0-255)
   * @returns Current instance
   * @example xcolor('#000').blue(128).toHex() // '#000080'
   */
  blue(value: number): this;
  blue(value?: number): number | this {
    return this._channel('_b', value);
  }

  /**
   * Alias for {@link blue}. Get or set the blue channel value.
   * @example xcolor('#0000ff').b() // 255
   * @example xcolor('#000').b(128).toHex() // '#000080'
   */
  b(): number;
  b(value: number): this;
  b(value?: number): number | this {
    return this._channel('_b', value);
  }

  /**
   * Get the alpha(opacity) channel value (0-1).
   * @returns Alpha channel value
   * @example xcolor('rgba(0,0,0,0.5)').alpha() // 0.5
   */
  alpha(): number;
  /**
   * Set the alpha(opacity) channel value (0-1). Values are clamped.
   * @param value - New alpha value (0-1)
   * @returns Current instance
   * @example xcolor('#ff0000').alpha(0.5).toRgbString() // 'rgba(255, 0, 0, 0.5)'
   */
  alpha(value: number): this;
  alpha(value?: number): number | this {
    if (value === undefined) return this._a;
    this._a = clamp(value, 0, 1);
    return this;
  }

  /**
   * Same as {@link alpha}. Get or set the alpha(opacity) channel value (0-1).
   * @example xcolor('rgba(0,0,0,0.5)').opacity() // 0.5
   * @example xcolor('#ff0000').opacity(0.5).toRgbString() // 'rgba(255, 0, 0, 0.5)'
   */
  opacity(): number;
  opacity(value: number): this;
  opacity(value?: number): number | this {
    return arguments.length ? this.alpha(value!) : this.alpha();
  }

  /**
   * Alias for {@link alpha}. Get or set the alpha channel value (0-1).
   * @example xcolor('rgba(0,0,0,0.5)').a() // 0.5
   * @example xcolor('#ff0000').a(0.5).toRgbString() // 'rgba(255, 0, 0, 0.5)'
   */
  a(): number;
  a(value: number): this;
  a(value?: number): number | this {
    return arguments.length ? this.alpha(value!) : this.alpha();
  }

  // =======================================
  // HSL/HSV Channel Methods
  // =======================================

  /**
   * Get the hue value (0-360) in HSL/HSV color space.
   * @returns Hue angle in degrees
   * @example xcolor('#ff0000').hue() // 0
   */
  hue(): number;
  /**
   * Set the hue value (0-360). Wraps around (e.g., 400 → 40).
   * @param value - New hue angle in degrees
   * @returns Current instance
   * @example xcolor('#ff0000').hue(240).toHex() // '#0000ff'
   */
  hue(value: number): this;
  hue(value?: number): number | this {
    if (value === undefined) return rgbToHsl(this._r, this._g, this._b).h;
    return this._applyCS(rgbToHsl, hslToRgb, ["h", "s", "l"], hsl => { hsl.h = ((value % 360) + 360) % 360; });
  }

  /**
   * Alias for {@link hue}. Get or set the hue (0-360).
   * @example xcolor('#ff0000').h() // 0
   * @example xcolor('#00ff00').h(240).toHex() // '#0000ff'
   */
  h(): number;
  h(value: number): this;
  h(value?: number): number | this {
    return arguments.length ? this.hue(value!) : this.hue();
  }

  /**
   * Get the saturation value (0-100) in HSL/HSV color space.
   * @returns Saturation percentage
   * @example xcolor('#ff0000').saturation() // 100
   */
  saturation(): number;
  /**
   * Set the saturation value (0-100). Values are clamped.
   * @param value - New saturation percentage (0-100)
   * @returns Current instance
   * @example xcolor('#ff0000').saturation(50).toHex() // '#ff8080'
   */
  saturation(value: number): this;
  saturation(value?: number): number | this {
    if (value === undefined) return rgbToHsl(this._r, this._g, this._b).s;
    return this._applyCS(rgbToHsl, hslToRgb, ["h", "s", "l"], hsl => { hsl.s = clamp(value, 0, 100); });
  }

  /**
   * Alias for {@link saturation}. Get or set the saturation (0-100).
   * @example xcolor('#ff0000').s() // 100
   * @example xcolor('#ff0000').s(50).toHex() // '#ff8080'
   */
  s(): number;
  s(value: number): this;
  s(value?: number): number | this {
    return arguments.length ? this.saturation(value!) : this.saturation();
  }

  /**
   * Get the lightness value (0-100) in HSL color space.
   * @returns Lightness percentage
   * @example xcolor('#ff0000').lightness() // 50
   */
  lightness(): number;
  /**
   * Set the lightness value (0-100). Values are clamped.
   * @param value - New lightness percentage (0-100)
   * @returns Current instance
   * @example xcolor('#ff0000').lightness(20).toHex() // '#cc0000'
   */
  lightness(value: number): this;
  lightness(value?: number): number | this {
    if (value === undefined) return rgbToHsl(this._r, this._g, this._b).l;
    return this._applyCS(rgbToHsl, hslToRgb, ["h", "s", "l"], hsl => { hsl.l = clamp(value, 0, 100); });
  }

  /**
   * Alias for {@link lightness}. Get or set the lightness (0-100).
   * @example xcolor('#ff0000').l() // 50
   * @example xcolor('#ff0000').l(20).toHex() // '#cc0000'
   */
  l(): number;
  l(value: number): this;
  l(value?: number): number | this {
    return arguments.length ? this.lightness(value!) : this.lightness();
  }

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
    if (value === undefined) return rgbToHsv(this._r, this._g, this._b).v;
    return this._applyCS(rgbToHsv, hsvToRgb, ["h", "s", "v"], hsv => { hsv.v = clamp(value, 0, 100); });
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

  // =======================================
  // Compound Getter/Setter Methods
  // =======================================

  /**
   * Get the RGB(A) object.
   * @returns `{ r, g, b, a }` (same as {@link toRgb()})
    * @alias toRgb
   * @example xcolor('#ff0000').rgb() // { r: 255, g: 0, b: 0, a: 1 }
   */
  rgb(): RGBA;
  /**
   * Set the RGB(A) channels.
   * @param r Red channel (0-255)
   * @param g Green channel (0-255)
   * @param b Blue channel (0-255)
   * @param a Alpha channel (0-1)
   * @return Current instance
   * @example xcolor('#000').rgb(255, 128, 0).toHex() // '#ff8000'
   */
  rgb(r: number, g: number, b: number, a?: number): this;
  rgb(r?: number, g?: number, b?: number, a?: number): RGBA | this {
    if (r === undefined) return this.toRgb();
    const nextG = g ?? this._g;
    const nextB = b ?? this._b;
    this._r = this._roundCh(clamp(r, 0, 255));
    this._g = this._roundCh(clamp(nextG, 0, 255));
    this._b = this._roundCh(clamp(nextB, 0, 255));
    if (a !== undefined) this._a = clamp(a, 0, 1);
    return this;
  }

  /**
   * Get the HSL(A) object.
   * @returns `{ h, s, l, a }` (same as {@link toHsl()})
    * @alias toHsl
   * @example xcolor('#ff0000').hsl() // { h: 0, s: 100, l: 50, a: 1 }
   */
  hsl(): HSLA;
  /**
   * Set the HSL(A) channels.
   * @param h Hue (0-360)
   * @param s Saturation (0-100)
   * @param l Lightness (0-100)
   * @param a Alpha (0-1)
   * @returns Current instance
   * @example xcolor('#000').hsl(0, 100, 50).toHex() // '#ff0000'
   */
  hsl(h: number, s: number, l: number, a?: number): this;
  hsl(h?: number, s?: number, l?: number, a?: number): HSLA | this {
    if (h === undefined) return this.toHsl();
    const current = this.toHsl();
    const c = hslToRgb(
      ((h % 360) + 360) % 360,
      clamp(s ?? current.s, 0, 100),
      clamp(l ?? current.l, 0, 100)
    );
    this._r = c.r;
    this._g = c.g;
    this._b = c.b;
    if (a !== undefined) this._a = clamp(a, 0, 1);
    return this;
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
    if (h === undefined) return this.toHsv();
    const current = this.toHsv();
    const c = hsvToRgb(
      ((h % 360) + 360) % 360,
      clamp(s ?? current.s, 0, 100),
      clamp(v ?? current.v, 0, 100)
    );
    this._r = c.r;
    this._g = c.g;
    this._b = c.b;
    if (a !== undefined) this._a = clamp(a, 0, 1);
    return this;
  }

  /**
   * Get the hex string.
   * @returns Hex color string. Same as {@link toHex()}.
    * @alias toHex
   * @example xcolor('#ff0000').hex() // '#ff0000'
   */
  hex(): string;
  /**
   * Set the color from a hex string.
   * @param value - Hex color string (#RRGGBB, #RRGGBBAA, #RGB, #RGBA)
   * @returns Current instance
   * @example xcolor().hex('#00ff00').toRgb() // { r: 0, g: 255, b: 0, a: 1 }
   */
  hex(value: string): this;
  hex(value?: string): string | this {
    if (value === undefined) return this.toHex();
    const parsed = parseColor(value);
    if (parsed) {
      this._r = parsed.r;
      this._g = parsed.g;
      this._b = parsed.b;
      this._a = parsed.a;
      this._valid = true;
    } else {
      this._valid = false;
      throw Logger.createError(`Invalid hex value: ${value}`);
    }
    return this;
  }

  // =======================================
  // Output Methods
  // =======================================

  /**
   * Serialize the color to a hex string.
   *
   * @param allow3Char - When `true`, return a 3-digit `#RGB` form if the color
   *   compresses losslessly (e.g. `#aabbcc` → `#abc`). Requires full opacity.
   * @param forceAlpha - When `true`, always append the alpha byte even when the
   *   color is fully opaque, producing an 8-digit `#RRGGBBAA` value.
   * @returns Hex color string
   * @example
   * ```ts
   * xcolor('#ff0000').toHex()              // '#ff0000'
   * xcolor('#ff0000').toHex(true)          // '#f00'
   * xcolor('rgba(255,0,0,0.5)').toHex()   // '#ff000080'
   * xcolor('#ff0000').toHex(false, true)   // '#ff0000ff'
   * ```
   */
  toHex(allow3Char: boolean = false, forceAlpha: boolean = false): string {
    return rgbaToHex(this._r, this._g, this._b, this._a, allow3Char, forceAlpha);
  }

  /**
   * Alias for {@link toHex}. Serialize the color to a hex string.
   * @param allow3Char - Allow short 3-digit `#RGB` form when possible
   * @param forceAlpha - Always include alpha channel in the output
   * @returns Hex color string
   * @example
   * ```ts
   * xcolor('#ff0000').toHexString()       // '#ff0000'
   * xcolor('#ff0000').toHexString(true)   // '#f00'
   * ```
   */
  toHexString(allow3Char: boolean = false, forceAlpha: boolean = false): string {
    return this.toHex(allow3Char, forceAlpha);
  }

  /**
   * Serialize the color to an {@link RGBA} object `{ r, g, b, a }`.
   * Alpha is rounded to 2 decimal places.
   * @returns RGBA color object
   * @example
   * ```ts
   * xcolor('#ff0000').toRgb()                   // { r: 255, g: 0, b: 0, a: 1 }
   * xcolor('rgba(0,0,0,0.5)').toRgb()           // { r: 0, g: 0, b: 0, a: 0.5 }
   * ```
   */
  toRgb(): RGBA {
    return { r: this._r, g: this._g, b: this._b, a: round(this._a, 2) };
  }

  /**
   * Serialize the color to a CSS `rgb()` or `rgba()` string.
   * Alpha is omitted (uses `rgb()`) when the color is fully opaque.
   * @returns CSS color string
   * @example
   * ```ts
   * xcolor('#ff0000').toRgbString()             // 'rgb(255, 0, 0)'
   * xcolor('rgba(255,0,0,0.5)').toRgbString()   // 'rgba(255, 0, 0, 0.5)'
   * ```
   */
  toRgbString(): string {
    if (this._a === 1) {
      return "rgb(" + this._r + ", " + this._g + ", " + this._b + ")";
    }
    return "rgba(" + this._r + ", " + this._g + ", " + this._b + ", " + round(this._a, 2) + ")";
  }

  /**
   * Serialize the color to a `[r, g, b, a]` tuple.
   * Alpha is rounded to 2 decimal places.
   * @returns Array with red, green, blue (0–255) and alpha (0–1)
   * @example
   * ```ts
   * xcolor('#ff0000').toRgbArray()              // [255, 0, 0, 1]
   * xcolor('rgba(0,128,0,0.5)').toRgbArray()   // [0, 128, 0, 0.5]
   * ```
   */
  toRgbArray(): [number, number, number, number] {
    return [this._r, this._g, this._b, round(this._a, 2)];
  }

  /**
   * Serialize the color to an {@link HSLA} object `{ h, s, l, a }`.
   * Alpha is rounded to 2 decimal places.
   * @returns HSLA color object
   * @example
   * ```ts
   * xcolor('#ff0000').toHsl()   // { h: 0, s: 100, l: 50, a: 1 }
   * xcolor('#00ff00').toHsl()   // { h: 120, s: 100, l: 50, a: 1 }
   * ```
   */
  toHsl(): HSLA {
    const _hsl = rgbToHsl(this._r, this._g, this._b);
    return { h: _hsl.h, s: _hsl.s, l: _hsl.l, a: round(this._a, 2) };
  }

  /**
   * Serialize the color to a CSS `hsl()` or `hsla()` string.
   * Alpha is omitted (uses `hsl()`) when the color is fully opaque.
   * @returns CSS color string
   * @example
   * ```ts
   * xcolor('#ff0000').toHslString()             // 'hsl(0, 100%, 50%)'
   * xcolor('rgba(255,0,0,0.5)').toHslString()   // 'hsla(0, 100%, 50%, 0.5)'
   * ```
   */
  toHslString(): string {
    const _hsl = rgbToHsl(this._r, this._g, this._b);
    if (this._a === 1) {
      return "hsl(" + round(_hsl.h) + ", " + round(_hsl.s) + "%, " + round(_hsl.l) + "%)";
    }
    return "hsla(" + round(_hsl.h) + ", " + round(_hsl.s) + "%, " + round(_hsl.l) + "%, " + round(this._a, 2) + ")";
  }

  /**
   * Serialize the color to an {@link HSVA} object `{ h, s, v, a }`.
   * Alpha is rounded to 2 decimal places.
   * @returns HSVA color object
   * @example
   * ```ts
   * xcolor('#ff0000').toHsv()   // { h: 0, s: 100, v: 100, a: 1 }
   * xcolor('#800000').toHsv()   // { h: 0, s: 100, v: 50, a: 1 }
   * ```
   */
  toHsv(): HSVA {
    const _hsv = rgbToHsv(this._r, this._g, this._b);
    return { h: _hsv.h, s: _hsv.s, v: _hsv.v, a: round(this._a, 2) };
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
    const _hsv = rgbToHsv(this._r, this._g, this._b);
    if (this._a === 1) {
      return "hsv(" + round(_hsv.h) + ", " + round(_hsv.s) + "%, " + round(_hsv.v) + "%)";
    }
    return "hsva(" + round(_hsv.h) + ", " + round(_hsv.s) + "%, " + round(_hsv.v) + "%, " + round(this._a, 2) + ")";
  }

  /**
   * Serialize the color to a 24-bit integer (`0xRRGGBB`).
   * The alpha channel is **not** included.
   * @returns Integer representation of the RGB channels
   * @example
   * ```ts
   * xcolor('#ff0000').toNumber()   // 16711680  (0xFF0000)
   * xcolor('#00ff00').toNumber()   // 65280      (0x00FF00)
   * xcolor('#0000ff').toNumber()   // 255        (0x0000FF)
   * ```
   */
  toNumber(): number {
    return (Math.round(this._r) << 16) + (Math.round(this._g) << 8) + Math.round(this._b);
  }

  /**
   * Alias for {@link toRgb}. Returns an {@link RGBA} object `{ r, g, b, a }`.
   * @returns RGBA color object
   * @example
   * ```ts
   * xcolor('#ff0000').toObject()   // { r: 255, g: 0, b: 0, a: 1 }
   * ```
   */
  toObject(): RGBA {
    return this.toRgb();
  }

  /**
   * Serialize the color to a string in the specified format.
   * When no format is given, returns `rgba(...)` for semi-transparent colors and
   * `#RRGGBB` hex for fully opaque colors.
   *
   * Plugins may extend {@link XColorStringFormatMap} to add more format keys.
   *
   * @param format - Output format key (see {@link XColorStringFormat})
   * @returns Color string
   * @example
   * ```ts
   * const c = xcolor('#ff0000');
   * c.toString()         // '#ff0000'  (default — hex when opaque)
   * c.toString('hex')    // '#ff0000'
   * c.toString('hex3')   // '#f00'
   * c.toString('hex8')   // '#ff0000ff'
   * c.toString('rgb')    // 'rgb(255, 0, 0)'
   * c.toString('hsl')    // 'hsl(0, 100%, 50%)'
   * c.toString('hsv')    // 'hsv(0, 100%, 100%)'
   * ```
   */
  toString(format?: XColorStringFormat): string {
    if (format) {
      const customFormatter = resolveStringFormatter(this.constructor as typeof XColor, format);
      if (customFormatter) {
        return customFormatter(this);
      }
    }

    switch (format) {
      case "hex":
        return this.toHex();
      case "hex3":
        return this.toHex(true);
      case "hex8":
        return this.toHex(false, true);
      case "rgb":
        return this.toRgbString();
      case "hsl":
        return this.toHslString();
      case "hsv":
        return this.toHsvString();
      default:
        return this._a < 1 ? this.toRgbString() : this.toHex();
    }
  }

  /**
   * Alias for {@link toString}. Serialize the color to a string in the specified format.
   * @param format - Output format key (see {@link XColorStringFormat})
   * @returns Color string
   * @example
   * ```ts
   * xcolor('#ff0000').format('rgb')   // 'rgb(255, 0, 0)'
   * xcolor('#ff0000').format('hsl')   // 'hsl(0, 100%, 50%)'
   * ```
   */
  format(format?: XColorStringFormat): string {
    return this.toString(format);
  }

  // =======================================
  // Manipulation Methods
  // =======================================

  /**
   * Lighten the color by increasing its HSL lightness.
   * The result is clamped to `[0, 100]` lightness.
   * All manipulation methods mutate and return the current instance for chaining.
   *
   * @param amount - Points to add to HSL lightness (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').lighten(20).toHex()   // '#ff6666'
   * xcolor('#ff0000').lighten().toHex()      // '#ff3333' (default 10)
   * ```
   */
  lighten(amount: number = 10): this {
    return this._applyCS(rgbToHsl, hslToRgb, ["h", "s", "l"], hsl => { hsl.l = clamp(hsl.l + amount, 0, 100); });
  }

  /**
   * Darken the color by decreasing its HSL lightness.
   * Equivalent to `lighten(-amount)`.
   *
   * @param amount - Points to subtract from HSL lightness (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').darken(20).toHex()   // '#990000'
   * xcolor('#ff0000').darken().toHex()      // '#cc0000' (default 10)
   * ```
   */
  darken(amount: number = 10): this {
    return this.lighten(-amount);
  }

  /**
   * Brighten the color by pushing each RGB channel additively toward 255.
   *
   * Unlike {@link lighten} (which operates in HSL space), `brighten` works
   * directly on RGB channels: `channel + (255 - channel) * factor`.
   * This preserves hue and produces a brighter (whiter) result.
   *
   * @param amount - Percentage to brighten (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').brighten(50).toHex()   // '#ff8080'
   * xcolor('#800000').brighten(100).toHex()  // '#ffffff'
   * ```
   */
  brighten(amount: number = 10): this {
    const factor = clamp(amount, 0, 100) / 100;
    this._r = this._roundCh(clamp(this._r + (255 - this._r) * factor, 0, 255));
    this._g = this._roundCh(clamp(this._g + (255 - this._g) * factor, 0, 255));
    this._b = this._roundCh(clamp(this._b + (255 - this._b) * factor, 0, 255));
    return this;
  }

  /**
   * Increase color saturation by the given amount in HSL space.
   * Clamped to `[0, 100]`.
   *
   * @param amount - Points to add to HSL saturation (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#bf4040').saturate(40).toHex()   // '#ff0000'
   * ```
   */
  saturate(amount: number = 10): this {
    return this._applyCS(rgbToHsl, hslToRgb, ["h", "s", "l"], hsl => { hsl.s = clamp(hsl.s + amount, 0, 100); });
  }

  /**
   * Decrease color saturation by the given amount in HSL space.
   * Equivalent to `saturate(-amount)`.
   *
   * @param amount - Points to subtract from HSL saturation (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').desaturate(50).toHex()   // '#bf4040'
   * ```
   */
  desaturate(amount: number = 10): this {
    return this.saturate(-amount);
  }

  /**
   * Fully desaturate the color, converting it to grayscale.
   * Equivalent to `desaturate(100)`.
   *
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').grayscale().toHex()   // '#808080'
   * xcolor('#00ff00').grayscale().toHex()   // '#808080'
   * ```
   */
  grayscale(): this {
    return this.desaturate(100);
  }

  /**
   * Alias for {@link grayscale} (British English spelling).
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').greyscale().toHex()   // '#808080'
   * ```
   */
  greyscale(): this {
    return this.grayscale();
  }

  /**
   * Rotate the hue by the given number of degrees.
   * The rotation wraps around: `360° ≡ 0°`, negative values are supported.
   *
   * @param degrees - Degrees to rotate the hue (can be negative)
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').spin(120).toHex()    // '#00ff00'  (+120°)
   * xcolor('#ff0000').spin(-120).toHex()   // '#0000ff'  (-120° = +240°)
   * xcolor('#ff0000').spin(180).toHex()    // '#00ffff'  (complement)
   * ```
   */
  spin(degrees: number): this {
    return this._applyCS(rgbToHsl, hslToRgb, ["h", "s", "l"], hsl => { hsl.h = ((hsl.h + degrees) % 360 + 360) % 360; });
  }

  /**
   * Alias for {@link spin}. Rotate the hue by the given number of degrees.
   * @param degrees - Degrees to rotate the hue (can be negative)
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').rotate(120).toHex()   // '#00ff00'
   * ```
   */
  rotate(degrees: number): this {
    return this.spin(degrees);
  }

  /**
   * Negate the color by computing `255 - channel` for each RGB channel.
   * Alpha is preserved.
   *
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').negate().toHex()   // '#00ffff'
   * xcolor('#ffffff').negate().toHex()   // '#000000'
   * ```
   */
  negate(): this {
    this._r = 255 - this._r;
    this._g = 255 - this._g;
    this._b = 255 - this._b;
    return this;
  }

  /**
   * Alias for {@link negate}. Invert the color by computing `255 - channel` for each RGB channel.
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').invert().toHex()   // '#00ffff'
   * ```
   */
  invert(): this {
    return this.negate();
  }

  /**
   * Decrease opacity (make the color more transparent).
   * The alpha value is decreased by `amount / 100` and clamped to `[0, 1]`.
   *
   * @param amount - Percentage points to subtract from alpha (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').fade(50).alpha()           // 0.5
   * xcolor('rgba(255,0,0,0.8)').fade(20).alpha() // 0.6
   * ```
   */
  fade(amount: number = 10): this {
    this._a = clamp(this._a - amount / 100, 0, 1);
    return this;
  }

  /**
   * Increase opacity (make the color more opaque).
   * The alpha value is increased by `amount / 100` and clamped to `[0, 1]`.
   *
   * @param amount - Percentage points to add to alpha (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('rgba(255,0,0,0.5)').opaquer(30).alpha()   // 0.8
   * ```
   */
  opaquer(amount: number = 10): this {
    this._a = clamp(this._a + amount / 100, 0, 1);
    return this;
  }

  /**
   * Alias for {@link opaquer}. Increase opacity by the given percentage.
   * @param amount - Percentage points to add to alpha (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('rgba(255,0,0,0.5)').fadeIn(20).alpha()   // 0.7
   * ```
   */
  fadeIn(amount: number = 10): this {
    return this.opaquer(amount);
  }

  /**
   * Alias for {@link fade}. Decrease opacity by the given percentage.
   * @param amount - Percentage points to subtract from alpha (0–100), default `10`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').fadeOut(50).alpha()   // 0.5
   * ```
   */
  fadeOut(amount: number = 10): this {
    return this.fade(amount);
  }

  /**
   * Mix the color with white (add a tint).
   * Higher `amount` moves closer to pure white (`#ffffff`).
   *
   * @param amount - Percentage of white to mix in (0–100), default `50`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').tint(50).toHex()    // '#ff8080'
   * xcolor('#ff0000').tint(100).toHex()   // '#ffffff'
   * ```
   */
  tint(amount: number = 50): this {
    return this.mix({ r: 255, g: 255, b: 255 }, amount);
  }

  /**
   * Mix the color with black (add a shade).
   * Higher `amount` moves closer to pure black (`#000000`).
   *
   * @param amount - Percentage of black to mix in (0–100), default `50`
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').shade(50).toHex()    // '#800000'
   * xcolor('#ff0000').shade(100).toHex()   // '#000000'
   * ```
   */
  shade(amount: number = 50): this {
    return this.mix({ r: 0, g: 0, b: 0 }, amount);
  }

  /**
   * Mix this color with another color using linear interpolation in RGB space.
   * Both RGB channels and alpha are interpolated independently.
   *
   * @param color  - The other color to mix with (any {@link XColorInput})
   * @param amount - Weight of the `color` argument (0–100):
   *   - `0`   = fully this color (no change)
   *   - `50`  = equal mix (default)
   *   - `100` = fully the other color
   * @returns Current instance (chainable)
   * @example
   * ```ts
   * xcolor('#ff0000').mix('#0000ff', 50).toHex()    // '#800080' (purple)
   * xcolor('#ff0000').mix('#0000ff', 25).toHex()    // '#bf0040'
   * xcolor('#ff0000').mix('#0000ff', 100).toHex()   // '#0000ff'
   * ```
   */
  mix(color: XColorInput, amount: number = 50): this {
    const other = color instanceof XColor ? color : new XColor(color);
    const factor = clamp(amount, 0, 100) / 100;
    this._r = this._roundCh(clamp(this._r * (1 - factor) + other._r * factor, 0, 255));
    this._g = this._roundCh(clamp(this._g * (1 - factor) + other._g * factor, 0, 255));
    this._b = this._roundCh(clamp(this._b * (1 - factor) + other._b * factor, 0, 255));
    this._a = clamp(this._a * (1 - factor) + other._a * factor, 0, 1);
    return this;
  }

  // =======================================
  // Query Methods
  // =======================================

  /**
   * Return `true` if the color is perceived as visually light.
   * Uses the YIQ brightness formula; colors with brightness **> 128** are light.
   * A brightness of exactly 128 is classified as dark.
   *
   * @returns `true` for light colors, `false` for dark colors
   * @example
   * ```ts
   * xcolor('#ffffff').isLight()   // true
   * xcolor('#000000').isLight()   // false
   * xcolor('#ffff00').isLight()   // true  (yellow is perceived as bright)
   * ```
   */
  isLight(): boolean {
    return this.brightness() > 128;
  }

  /**
   * Return `true` if the color is perceived as visually dark.
   * Equivalent to `!isLight()`.
   *
   * @returns `true` for dark colors, `false` for light colors
   * @example
   * ```ts
   * xcolor('#000000').isDark()   // true
   * xcolor('#ffffff').isDark()   // false
   * xcolor('#000080').isDark()   // true  (dark navy)
   * ```
   */
  isDark(): boolean {
    return !this.isLight();
  }

  /**
   * Return `true` if the color was successfully parsed from the input.
   * An invalid color still produces an instance (black, `#000000`) but
   * `isValid()` returns `false`, which lets you detect parse failures.
   *
   * @returns `true` if the color is valid
   * @example
   * ```ts
   * xcolor('#ff0000').isValid()       // true
   * xcolor('not-a-color').isValid()   // false
   * xcolor().isValid()                // true   (defaults to black)
   * ```
   */
  isValid(): boolean {
    return this._valid;
  }

  /**
   * Calculate the perceived brightness of the color using the YIQ formula:
   * `(R × 299 + G × 587 + B × 114) / 1000`.
   *
   * The YIQ formula weights channels according to human perception
   * (green is brighter than red, which is brighter than blue).
   *
   * @returns Brightness value in the range `0` (black) to `255` (white)
   * @example
   * ```ts
   * xcolor('#ffffff').brightness()   // 255
   * xcolor('#000000').brightness()   // 0
   * xcolor('#ffff00').brightness()   // 226  (yellow is very bright)
   * xcolor('#0000ff').brightness()   // 29   (blue is perceived as dark)
   * ```
   */
  brightness(): number {
    return (this._r * 299 + this._g * 587 + this._b * 114) / 1000;
  }

  /**
   * Calculate the relative luminance of the color per the WCAG 2.0 specification.
   * Uses the sRGB linearization formula before computing the weighted sum.
   *
   * @returns Relative luminance in the range `0` (black) to `1` (white), rounded to 4 decimals
   * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
   * @example
   * ```ts
   * xcolor('#ffffff').luminance()   // 1
   * xcolor('#000000').luminance()   // 0
   * xcolor('#ff0000').luminance()   // 0.2126
   * ```
   */
  luminance(): number {
    return round(relativeLuminance(this._r, this._g, this._b), 4);
  }

  /**
   * Calculate the WCAG 2.0 contrast ratio between this color and another.
   * A ratio of `1:1` means identical colors; `21:1` is maximum (black vs. white).
   *
   * WCAG thresholds:
   * - Normal text   AA: ≥ 4.5   AAA: ≥ 7
   * - Large text    AA: ≥ 3     AAA: ≥ 4.5
   *
   * @param other - The color to compare against (any {@link XColorInput})
   * @returns Contrast ratio in the range `1` to `21`
   * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
   * @example
   * ```ts
   * xcolor('#000000').contrast('#ffffff')   // 21     (maximum)
   * xcolor('#000000').contrast('#000000')   // 1      (identical)
   * xcolor('#777777').contrast('#ffffff')   // ~4.48
   * ```
   */
  contrast(other: XColorInput): number {
    const otherColor = other instanceof XColor ? other : new XColor(other);
    return contrastRatio(
      relativeLuminance(this._r, this._g, this._b),
      relativeLuminance(otherColor._r, otherColor._g, otherColor._b)
    );
  }

  /**
   * Check if two colors are visually equal.
   * RGB channels must match exactly; alpha is compared with a tolerance of `0.01`
   * to guard against floating-point rounding.
   *
   * @param other - The color to compare against (any {@link XColorInput})
   * @returns `true` if the colors are visually identical
   * @example
   * ```ts
   * xcolor('#ff0000').equals('#ff0000')           // true
   * xcolor('#ff0000').equals('rgb(255, 0, 0)')    // true
   * xcolor('#ff0000').equals('#00ff00')           // false
   * xcolor('#ff0000').equals('rgba(255,0,0,0.5)') // false (different alpha)
   * ```
   */
  equals(other: XColorInput): boolean {
    const otherColor = other instanceof XColor ? other : new XColor(other);
    return (
      this._r === otherColor._r &&
      this._g === otherColor._g &&
      this._b === otherColor._b &&
      Math.abs(this._a - otherColor._a) < 0.01
    );
  }

  // =======================================
  // Utility
  // =======================================

  /**
   * Create an independent deep clone of this color instance.
   * The clone contains the same RGB channels, alpha, validity flag, and options.
   * Subsequent mutations to either instance do not affect the other.
   *
   * @returns A new `XColor` instance with identical color values
   * @example
   * ```ts
   * const original = xcolor('#ff0000');
   * const copy = original.clone();
   * copy.darken(20);
   * original.toHex()   // '#ff0000'  (unchanged)
   * copy.toHex()       // '#990000'
   * ```
   */
  clone(): XColor {
    return new XColor(this);
  }

  // =======================================
  // Static Methods
  // =======================================

  /**
   * Register a plugin to extend the `XColor` class.
   *
   * Plugins must be objects with a unique `name` and an `install` method.
   * If a plugin with the same name has already been registered, it will be
   * re-installed with a warning (override semantics).
   *
   * @template T - Type of the optional plugin configuration object
   * @param plugin - Plugin object with `{ name, install }`
   * @param option - Optional configuration forwarded to the plugin
   * @returns The `XColor` class itself for fluent chaining
   * @throws Error if `plugin` is not a valid plugin object
   * @example
   * ```ts
   * import xcolor from '@xpyjs/color'
   * import labPlugin from '@xpyjs/color/plugins/lab'
   *
   * xcolor.extend(labPlugin)
   * xcolor('#ff0000').toLab() // { l: 53.23, a: 80.11, b: 67.22 }
   * ```
   */
  static extend<T = unknown>(plugin: XColorPlugin<T>, option?: T): typeof XColor {
    if (
      typeof plugin !== "object" || plugin === null
      || typeof plugin.name !== "string"
      || typeof plugin.install !== "function"
    ) {
      throw Logger.createError("Plugin must be an object with { name, install }");
    }

    const pluginName = plugin.name.trim();
    if (!pluginName) {
      throw Logger.createError("Plugin must provide a non-empty name");
    }

    if (XColor._registeredPluginNames.has(pluginName)) {
      Logger.warn(`Plugin "${pluginName}" is already registered and will be overridden`);
    }

    XColor._registeredPluginNames.add(pluginName);
    plugin.install(option as T, XColor, xcolor);
    return XColor;
  }

  /**
   * Alias for {@link XColor.extend}. Register a plugin to extend the `XColor` class.
   *
   * @template T - Type of the optional plugin configuration object
   * @param plugin - Plugin object with `{ name, install }`
   * @param option - Optional configuration forwarded to the plugin
   * @returns The `XColor` class itself for fluent chaining
   * @example
   * ```ts
   * import xcolor from '@xpyjs/color'
   * import a11yPlugin from '@xpyjs/color/plugins/a11y'
   *
   * xcolor.use(a11yPlugin)
   * ```
   */
  static use<T = unknown>(plugin: XColorPlugin<T>, option?: T): typeof XColor {
    return XColor.extend(plugin, option);
  }

  /**
   * TypeScript type guard that narrows `value` to `XColor`.
   * Equivalent to `value instanceof XColor`.
   *
   * @param value - Any value to test
   * @returns `true` if `value` is an `XColor` instance
   * @example
   * ```ts
   * const c = xcolor('#ff0000');
   * XColor.isColor(c)            // true
   * XColor.isColor('#ff0000')    // false
   * XColor.isColor(null)         // false
   * ```
   */
  static isColor(value: unknown): value is XColor {
    return value instanceof XColor;
  }

  /**
   * Generate a random fully-opaque color.
   * Each RGB channel is sampled independently from a uniform distribution over `[0, 255]`.
   *
   * @returns A new `XColor` instance with random RGB values and alpha `1`
   * @example
   * ```ts
   * const c = XColor.random();
   * c.toHex()   // e.g. '#3e92cc'
   * c.alpha()   // 1
   * ```
   */
  static random(): XColor {
    return new XColor({
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
      a: 1
    });
  }

  /**
   * Set global default options for all new `XColor` instances.
   * Instance-level options passed to the constructor take precedence.
   * Call with no arguments or `{}` to reset to defaults.
   *
   * @param opts - Default {@link XColorOptions} to apply globally
   * @example
   * ```ts
   * xcolor.config({ useDecimal: true });
   * xcolor('#ff0000').red() // may return fractional value
   *
   * xcolor.config({}); // reset to defaults
   * ```
   */
  static config(opts: XColorOptions): void {
    _globalOpts = { ...opts };
  }
}

type XColorStringFormatterFunc = (color: XColor) => string;

const stringFormatRegistry = new WeakMap<object, Map<string, XColorStringFormatterFunc>>();

function getStringFormatRegistry(cls: object): Map<string, XColorStringFormatterFunc> {
  let registry = stringFormatRegistry.get(cls);
  if (!registry) {
    registry = new Map();
    stringFormatRegistry.set(cls, registry);
  }
  return registry;
}

function resolveStringFormatter(cls: typeof XColor, format: string): XColorStringFormatterFunc | undefined {
  return stringFormatRegistry.get(cls)?.get(format)
    ?? (cls === XColor ? undefined : stringFormatRegistry.get(XColor)?.get(format));
}

/**
 * Register a custom string formatter for plugin-extended `toString(format)` output.
 *
 * Plugins should prefer this helper over wrapping `prototype.toString`, which keeps
 * multiple format extensions composable and avoids wrapper-order bugs.
 *
 * @param cls - The `XColor` class being extended by the plugin
 * @param format - Custom format key added by the plugin, e.g. `"cmyk"`
 * @param formatter - Formatter that returns the string output for one instance
 * @example
 * ```ts
 * registerStringFormatter(XColor, 'cmyk', color => color.toCmykString())
 * ```
 */
export function registerStringFormatter<T extends XColor>(
  cls: { prototype: T },
  format: string,
  formatter: (color: T) => string
): void {
  getStringFormatRegistry(cls as object).set(format, formatter as XColorStringFormatterFunc);
}

// =======================================
// Factory Function
// =======================================

/**
 * Interface describing the `xcolor` factory function and its attached static helpers.
 * The factory itself is a callable that creates a new {@link XColor} instance,
 * while the properties mirror the most useful static methods of the class.
 *
 * @example
 * ```ts
 * import xcolor from '@xpyjs/color'
 *
 * // Create instances
 * const c = xcolor('#ff0000')
 * xcolor('rgb(255, 0, 0)')
 * xcolor({ r: 255, g: 0, b: 0 })
 * xcolor(0xFF0000)
 *
 * // Static helpers
 * xcolor.random()                // random color
 * xcolor.isColor(c)              // true
 * xcolor.use(somePlugin)         // register a plugin
 * ```
 */
export interface XColorFactory {
  /**
   * Create a new {@link XColor} instance from any supported input.
   * When `value` is already an `XColor` instance, a clone is returned.
   * When `value` is omitted, returns a valid black (`#000000`) instance.
   *
   * @param value - Color input (hex, rgb, hsl, hsv, number, object, or XColor)
   * @param opts  - Optional creation options (e.g. `{ useDecimal: true }`)
   * @returns A new `XColor` instance
   */
  (value?: XColorInput, opts?: XColorOptions): XColor;

  /**
   * Register a plugin to extend `XColor`.
   * Plugins with the same `name` will be re-installed with a warning.
   *
   * @template T - Type of the optional plugin configuration object
   * @param plugin - Plugin object with `{ name, install }`
   * @param option - Optional configuration forwarded to the plugin
   * @returns The `XColor` class for fluent chaining
   * @example
   * ```ts
   * import xcolor from '@xpyjs/color'
   * import labPlugin from '@xpyjs/color/plugins/lab'
   *
   * xcolor.extend(labPlugin)
   * xcolor('#ff0000').toLab()   // { l: 53.23, a: 80.11, b: 67.22 }
   * ```
   */
  extend<T = unknown>(plugin: XColorPlugin<T>, option?: T): typeof XColor;

  /**
   * Alias for {@link XColorFactory.extend}. Register a plugin to extend `XColor`.
   *
   * @template T - Type of the optional plugin configuration object
   * @param plugin - Plugin object with `{ name, install }`
   * @param option - Optional configuration forwarded to the plugin
   * @returns The `XColor` class for fluent chaining
   * @example
   * ```ts
   * import xcolor from '@xpyjs/color'
   * import a11yPlugin from '@xpyjs/color/plugins/a11y'
   *
   * xcolor.use(a11yPlugin)
   * xcolor('#000').isReadable('#ffffff')   // true
   * ```
   */
  use<T = unknown>(plugin: XColorPlugin<T>, option?: T): typeof XColor;

  /**
   * TypeScript type guard — returns `true` if `value` is an `XColor` instance.
   *
   * @param value - Any value to test
   * @returns `true` if `value` is an `XColor` instance
   * @example
   * ```ts
   * const c = xcolor('#ff0000');
   * xcolor.isColor(c)            // true
   * xcolor.isColor('#ff0000')    // false
   * xcolor.isColor(null)         // false
   * ```
   */
  isColor(value: unknown): value is XColor;

  /**
   * Alias for {@link XColorFactory.isColor}. TypeScript type guard for `XColor` instances.
   *
   * @param value - Any value to test
   * @returns `true` if `value` is an `XColor` instance
   * @example
   * ```ts
   * xcolor.is(xcolor('#ff0000'))   // true
   * xcolor.is({})                  // false
   * ```
   */
  is(value: unknown): value is XColor;

  /**
   * Generate a random fully-opaque color.
   * Each RGB channel is sampled independently from a uniform distribution over `[0, 255]`.
   *
   * @returns A new `XColor` instance with random RGB values and alpha `1`
   * @example
   * ```ts
   * const c = xcolor.random()
   * c.toHex()   // e.g. '#3e92cc'
   * c.alpha()   // 1
   * ```
   */
  random(): XColor;

  /**
   * Set global default options for all new `XColor` instances.
   * Instance-level options take precedence over global defaults.
   * Call with `{}` to reset to defaults.
   *
   * @param opts - Default options to apply globally
   * @example
   * ```ts
   * xcolor.config({ useDecimal: true });
   * xcolor.config({}); // reset
   * ```
   */
  config(opts: XColorOptions): void;
}

/**
 * `xcolor` — the primary entry point for creating and manipulating colors.
 *
 * A tiny (~4 KB gzipped), fast, zero-dependency color manipulation library with
 * full TypeScript support, chainable methods, and a plugin system.
 *
 * Accepts any common color representation and returns a mutable, chainable
 * {@link XColor} instance. When an existing `XColor` instance is passed,
 * a clone is returned so the original is never mutated.
 *
 * Supported input formats (built-in):
 * - Hex string:        `'#ff0000'`, `'#f00'`, `'#ff000080'`
 * - RGB / RGBA string: `'rgb(255, 0, 0)'`, `'rgba(255, 0, 0, 0.5)'`
 * - HSL / HSLA string: `'hsl(0, 100%, 50%)'`, `'hsla(0, 100%, 50%, 0.5)'`
 * - HSV string:        `'hsv(0, 100%, 100%)'`
 * - sRGB string:       `'srgb(1 0 0)'`, `'color(srgb 1 0 0)'`
 * - Object:            `{ r: 255, g: 0, b: 0 }`, `{ h: 0, s: 100, l: 50 }`
 * - Number:            `0xFF0000` (24-bit integer)
 * - Named colors:      `'red'`, `'blue'` *(requires the `name` plugin)*
 *
 * @param value - Color input (see {@link XColorInput})
 * @param opts  - Optional creation options (see {@link XColorOptions})
 * @returns A new {@link XColor} instance
 *
 * @example
 * ```ts
 * import xcolor from '@xpyjs/color'
 *
 * // Parse various formats
 * xcolor('#ff0000')                    // hex
 * xcolor('rgb(255, 0, 0)')             // rgb string
 * xcolor('hsl(0, 100%, 50%)')          // hsl string
 * xcolor({ r: 255, g: 0, b: 0 })      // object
 * xcolor(0xFF0000)                     // number
 *
 * // Chain operations
 * xcolor('#ff0000').lighten(20).desaturate(10).toHex()
 * // '#ff6666' → then desaturated
 *
 * // Getter / setter overloads
 * const c = xcolor('#ff0000')
 * c.r()          // 255   (getter)
 * c.r(128)       // this  (setter, returns instance)
 * c.r(128).darken(10).toHex()
 * ```
 */
export const xcolor: XColorFactory = ((value?: XColorInput, opts?: XColorOptions): XColor => {
  if (value instanceof XColor) {
    return value.clone();
  }
  return new XColor(value, opts);
}) as XColorFactory;

// =======================================
// Attach static methods to factory
// =======================================

xcolor.extend = XColor.extend;
xcolor.use = XColor.use;
xcolor.isColor = XColor.isColor;
xcolor.is = XColor.isColor;
xcolor.random = XColor.random;
xcolor.config = XColor.config;
