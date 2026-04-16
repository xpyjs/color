// =======================================
// Utility functions for @xpyjs/color
// =======================================

/**
 * Internal logging utility used by the core and plugins.
 * All messages are prefixed with `[X-Color]` to clearly identify their origin.
 *
 * Plugins may use `Logger.warn` / `Logger.error` for consistent output, or
 * `Logger.createError` to throw a labelled `Error` instance.
 *
 * @example
 * ```ts
 * import { Logger } from '@xpyjs/color'
 *
 * Logger.warn('something unexpected happened')
 * // → console.warn('[X-Color]', 'something unexpected happened')
 *
 * throw Logger.createError('invalid input')
 * // → Error: [X-Color] invalid input
 * ```
 */
export const Logger = {
  /** The fixed prefix prepended to every logged message. */
  prefix: "[X-Color]",
  /**
   * Emit a console warning with the `[X-Color]` prefix.
   * @param args - Any values to pass to `console.warn`
   */
  warn: (...args: any[]) => { console.warn(Logger.prefix, ...args); },
  /**
   * Emit a console error with the `[X-Color]` prefix.
   * @param args - Any values to pass to `console.error`
   */
  error: (...args: any[]) => { console.error(Logger.prefix, ...args); },
  /**
   * Create a new `Error` with the `[X-Color]` prefix in its message.
   * Use this instead of `new Error(...)` to keep error messages consistent.
   * @param message - The error description
   * @returns A new `Error` instance
   */
  createError: (message: string) => new Error(`${Logger.prefix} ${message}`)
};

/**
 * Clamp a numeric value between min and max (inclusive).
 * If any argument is NaN/Infinity, returns min if finite, else 0.
 * @param value - The value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 * @example clamp(150, 0, 100) // 100
 * @example clamp(-5, 0, 255) // 0
 */
export function clamp(value: number, min: number, max: number): number {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return Number.isFinite(min) ? min : 0;
  }
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.min(Math.max(lo, value), hi);
}

/**
 * Round a number to a specified number of decimal places.
 * @param value - Number to round
 * @param decimals - Number of decimal places (default 0)
 * @returns Rounded number
 * @example round(3.14159, 2) // 3.14
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** @internal Shared RGB normalization for rgbToHsl/rgbToHsv */
function rgbNorm(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return { rn, gn, bn, max, min, d, h };
}

/**
 * Convert RGB to HSL color.
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns HSL object with h (0-360), s (0-100), l (0-100)
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const { max, min, d, h } = rgbNorm(r, g, b);
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
  return { h: round(h * 360, 2), s: round(s * 100, 2), l: round(l * 100, 2) };
}

/**
 * Convert HSL to RGB color.
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns RGB object with r, g, b (0-255)
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const val = Math.round(ln * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255)
  };
}

/**
 * Convert RGB to HSV color.
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns HSV object with h (0-360), s (0-100), v (0-100)
 */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const { max, d, h } = rgbNorm(r, g, b);
  const s = max === 0 ? 0 : d / max;
  return { h: round(h * 360, 2), s: round(s * 100, 2), v: round(max * 100, 2) };
}

/**
 * Convert HSV to RGB color.
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param v - Value/Brightness (0-100)
 * @returns RGB object with r, g, b (0-255)
 */
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hn = h / 360;
  const sn = s / 100;
  const vn = v / 100;

  const i = Math.floor(hn * 6);
  const f = hn * 6 - i;
  const p = vn * (1 - sn);
  const q = vn * (1 - f * sn);
  const t = vn * (1 - (1 - f) * sn);

  let r: number, g: number, b: number;
  switch (i % 6) {
    case 0: r = vn; g = t; b = p; break;
    case 1: r = q; g = vn; b = p; break;
    case 2: r = p; g = vn; b = t; break;
    case 3: r = p; g = q; b = vn; break;
    case 4: r = t; g = p; b = vn; break;
    case 5: r = vn; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convert a single channel value (0-255) to 2-char hex
 */
function toHex2(val: number): string {
  const hex = Math.round(clamp(val, 0, 255)).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Convert RGBA values to a hex color string.
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @param a - Alpha channel (0-1)
 * @param allow3Char - If true, return #RGB short form when possible
 * @param forceAlpha - If true, always include alpha in output
 * @returns Hex string (e.g., '#ff0000', '#f00', '#ff000080')
 */
export function rgbaToHex(
  r: number,
  g: number,
  b: number,
  a: number,
  allow3Char: boolean = false,
  forceAlpha: boolean = false
): string {
  const hexR = toHex2(r);
  const hexG = toHex2(g);
  const hexB = toHex2(b);
  const hexA = toHex2(a * 255);

  // Try short form #RGB
  if (
    allow3Char &&
    hexR[0] === hexR[1] &&
    hexG[0] === hexG[1] &&
    hexB[0] === hexB[1] &&
    a === 1 &&
    !forceAlpha
  ) {
    return `#${hexR[0]}${hexG[0]}${hexB[0]}`;
  }

  const baseHex = `#${hexR}${hexG}${hexB}`;
  if (forceAlpha || a < 1) {
    return `${baseHex}${hexA}`;
  }
  return baseHex;
}

/**
 * Clamp a value to the byte range 0-255 and round to an integer.
 * @param value - The value to clamp
 * @returns Integer 0-255
 * @example clampByte(300) // 255
 * @example clampByte(-5) // 0
 */
export function clampByte(value: number): number {
  return Math.round(Math.min(255, Math.max(0, value)));
}

/**
 * Normalize a step count for gradient/scale operations.
 * Ensures the result is an integer >= 2.
 * @param steps - Requested step count
 * @param fallback - Default value if steps is not finite (default 5)
 * @returns Normalized step count (integer >= 2)
 * @example normalizeSteps(10) // 10
 * @example normalizeSteps(NaN) // 5
 * @example normalizeSteps(1) // 2
 */
export function normalizeSteps(steps: number | undefined, fallback: number = 5): number {
  if (!Number.isFinite(steps as number)) return fallback;
  return Math.max(2, Math.floor(steps as number));
}

// ---- Luminance & Contrast ----

/**
 * Calculate relative luminance per WCAG 2.0 specification.
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns Relative luminance (0 to 1)
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two luminance values per WCAG 2.0.
 * @param lum1 - First luminance value
 * @param lum2 - Second luminance value
 * @returns Contrast ratio (1 to 21)
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return round((lighter + 0.05) / (darker + 0.05), 2);
}

/**
 * Type-safe helper that adds a method to a class prototype.
 * Replaces the `const proto: any = cls.prototype; proto.name = fn` pattern
 * that is commonly used in plugin `install()` callbacks.
 *
 * @param cls - The class constructor to extend
 * @param name - The method name to add
 * @param fn - The method implementation (must use `function`, not arrow syntax, to receive `this`)
 */
export function defineMethod(
  cls: new (...args: any[]) => any,
  name: string,
  fn: Function
): void {
  Object.defineProperty(cls.prototype, name, {
    value: fn,
    writable: true,
    configurable: true,
    enumerable: false
  });
}
