// =======================================
// Plugin: theme - Derive role colors from a source color
// =======================================
//
// Generates a unified set of semantic role colors (secondary, success,
// warning, error, info) from a single source color by rotating the hue
// in a perceptually uniform color space (OKLCh by default, HSL fallback).
//
// The OKLCh conversion matrices are inlined here so that the theme plugin
// does NOT depend on the oklab plugin at runtime.
// =======================================

import { clamp } from "@xpyjs/color";
import { Logger } from "@xpyjs/color";
import type { BuiltinRole, XColorThemeDeriveOptions, ColorConfig } from "./types";

// =======================================
// Default constants
// =======================================

/**
 * The five built-in semantic role names, in a stable order.
 */
export const DEFAULT_ROLES: BuiltinRole[] = [
  "secondary",
  "success",
  "warning",
  "error",
  "info"
];

/**
 * Default OKLCh hue anchors (degrees) for each role.
 *
 * | Role | Hue | Color region |
 * | --- | --- | --- |
 * | error | 27 | Red |
 * | warning | 70 | Amber / Orange |
 * | success | 145 | Green |
 * | info | 235 | Blue-cyan |
 * | secondary | (computed) | Complementary to source |
 *
 * `secondary` is intentionally omitted because its default is
 * `sourceHue + 180` (complementary), computed dynamically.
 */
export const DEFAULT_ROLE_HUES: Partial<Record<BuiltinRole, number>> = {
  error: 27,
  warning: 70,
  success: 145,
  info: 235
  // secondary: dynamic — sourceHue + 180
};

// =======================================
// Inline OKLCh conversion (no oklab dep)
// =======================================

/** @internal sRGB gamma → linear */
function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** @internal linear → sRGB gamma */
function linearToSrgb(c: number): number {
  return c <= 0.0031308
    ? c * 12.92
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** @internal RGB (0-255) → OKLab { l, a, b } */
function rgbToOklab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  var rl = srgbToLinear(r);
  var gl = srgbToLinear(g);
  var bl = srgbToLinear(b);

  var l_ = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  var m_ = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  var s_ = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  var l1 = Math.cbrt(l_);
  var m1 = Math.cbrt(m_);
  var s1 = Math.cbrt(s_);

  return {
    l: 0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1,
    a: 1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1,
    b: 0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1
  };
}

/** @internal OKLab → RGB (0-255, clamped & rounded) */
function oklabToRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  var l1 = L + 0.3963377774 * a + 0.2158037573 * b;
  var m1 = L - 0.1055613458 * a - 0.0638541728 * b;
  var s1 = L - 0.0894841775 * a - 1.2914855480 * b;

  var l_ = l1 * l1 * l1;
  var m_ = m1 * m1 * m1;
  var s_ = s1 * s1 * s1;

  var rl = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  var gl = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  var bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  return {
    r: Math.round(clamp(linearToSrgb(rl) * 255, 0, 255)),
    g: Math.round(clamp(linearToSrgb(gl) * 255, 0, 255)),
    b: Math.round(clamp(linearToSrgb(bl) * 255, 0, 255))
  };
}

/** @internal OKLab → OKLCh (polar form) */
function oklabToOklch(l: number, a: number, b: number): { l: number; c: number; h: number } {
  var c = Math.sqrt(a * a + b * b);
  var h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return { l: l, c: c, h: h };
}

/** @internal OKLCh → RGB (0-255) */
function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  var hRad = h * Math.PI / 180;
  var a = c * Math.cos(hRad);
  var b = c * Math.sin(hRad);
  return oklabToRgb(l, a, b);
}

// =======================================
// HSL helpers (fallback algorithm)
// =======================================

/** @internal RGB (0-255) → HSL { h: 0-360, s: 0-100, l: 0-100 } */
function rgbToHslLocal(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var l = (max + min) / 2;
  var h = 0;
  var s = 0;

  if (max !== min) {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/** @internal HSL { h: 0-360, s: 0-100, l: 0-100 } → RGB (0-255) */
function hslToRgbLocal(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    var v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  };
}

// =======================================
// Public API
// =======================================

/**
 * Normalise a `derive` option into a fully-resolved options object.
 *
 * | Input | Result |
 * | --- | --- |
 * | `false` / `undefined` | `null` (derivation disabled) |
 * | `true` | All defaults |
 * | `{ ... }` | Merged with defaults; `enabled: false` → `null` |
 *
 * @param input - Raw `derive` value from `XColorThemeOptions`
 * @returns Resolved options, or `null` if disabled
 */
export function resolveDeriveOptions(
  input: boolean | XColorThemeDeriveOptions | undefined
): XColorThemeDeriveOptions | null {
  if (input === undefined || input === false) return null;

  if (input === true) {
    return {
      enabled: true,
      from: "primary",
      algorithm: "oklch",
      roles: DEFAULT_ROLES.slice(),
      hues: {},
      alias: {},
      chromaScale: 1,
      lightnessShift: 0
    };
  }

  // Object form
  if (input.enabled === false) return null;

  return {
    enabled: true,
    from: input.from || "primary",
    algorithm: input.algorithm || "oklch",
    roles: input.roles || DEFAULT_ROLES.slice(),
    hues: input.hues || {},
    alias: input.alias || {},
    chromaScale: input.chromaScale !== undefined ? input.chromaScale : 1,
    lightnessShift: input.lightnessShift !== undefined ? input.lightnessShift : 0
  };
}

/**
 * Derive a single role's base color from a source XColor instance.
 *
 * The algorithm reads the source color, converts to OKLCh (or HSL),
 * replaces the hue with the role's anchor, optionally adjusts chroma
 * and lightness, then converts back to a hex string.
 *
 * @param sourceColor - The source XColor instance (e.g. the primary color)
 * @param role - The semantic role to derive
 * @param opts - Resolved derive options
 * @returns Hex color string (e.g. `'#52c41a'`)
 */
export function deriveBaseColor(
  sourceColor: any,
  role: BuiltinRole,
  opts: XColorThemeDeriveOptions
): string {
  var r = sourceColor.red();
  var g = sourceColor.green();
  var b = sourceColor.blue();

  if (opts.algorithm === "hsl") {
    // HSL fallback
    var hsl = rgbToHslLocal(r, g, b);
    var targetHue: number;

    if (opts.hues && opts.hues[role] !== undefined) {
      targetHue = opts.hues[role]!;
    } else if (role === "secondary") {
      targetHue = (hsl.h + 180) % 360;
    } else {
      targetHue = DEFAULT_ROLE_HUES[role] || hsl.h;
    }

    var newS = clamp(hsl.s * (opts.chromaScale || 1), 0, 100);
    var newL = clamp(hsl.l + (opts.lightnessShift || 0) * 100, 0, 100);
    var rgb = hslToRgbLocal(targetHue, newS, newL);

    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // OKLCh (default)
  var ok = rgbToOklab(r, g, b);
  var lch = oklabToOklch(ok.l, ok.a, ok.b);

  var targetH: number;
  if (opts.hues && opts.hues[role] !== undefined) {
    targetH = opts.hues[role]!;
  } else if (role === "secondary") {
    targetH = (lch.h + 180) % 360;
  } else {
    targetH = DEFAULT_ROLE_HUES[role] || lch.h;
  }

  var newC = clamp(lch.c * (opts.chromaScale || 1), 0, 0.4);
  var newLightness = clamp(lch.l + (opts.lightnessShift || 0), 0, 1);

  var result = oklchToRgb(newLightness, newC, targetH);
  return rgbToHex(result.r, result.g, result.b);
}

/**
 * Build a `#rrggbb` hex string from r, g, b values (0-255).
 * @internal
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/**
 * Derive all missing role colors and merge them into the working
 * `colors` object.
 *
 * This function does NOT mutate the original `colors`. It returns a
 * **new** object with derived entries appended for any role that is not
 * already present. User-provided colors always take priority.
 *
 * Priority (high → low):
 * 1. User explicitly provides `colors[outputName]` (string or object)
 * 2. Derived base color from the source + role hue anchor
 *
 * @param colors - Original `options.colors` from the user
 * @param opts - Resolved derive options
 * @param cls - XColor class constructor
 * @returns Extended colors record with derived entries
 */
export function deriveRoleColors(
  colors: Record<string, string | ColorConfig>,
  opts: XColorThemeDeriveOptions,
  cls: new (...args: any[]) => any
): Record<string, string | ColorConfig> {
  var fromKey = opts.from || "primary";
  var sourceValue = colors[fromKey];

  // Resolve base color from source entry
  var baseHex: string | null = null;
  if (typeof sourceValue === "string") {
    baseHex = sourceValue;
  } else if (sourceValue && typeof sourceValue === "object" && typeof (sourceValue as any).DEFAULT === "string") {
    baseHex = (sourceValue as any).DEFAULT;
  }

  if (!baseHex) {
    Logger.warn(
      "ThemePlugin derive: source color '" + fromKey + "' not found or has no base value. " +
      "Derivation skipped. Provide '" + fromKey + "' as a string or an object with a DEFAULT key."
    );
    return colors;
  }

  var sourceColor = new cls(baseHex);

  // Build extended colors
  var result: Record<string, string | ColorConfig> = {};
  var origKeys = Object.keys(colors);
  for (var i = 0; i < origKeys.length; i++) {
    result[origKeys[i]] = colors[origKeys[i]];
  }

  var roles = opts.roles || DEFAULT_ROLES;
  for (var ri = 0; ri < roles.length; ri++) {
    var role = roles[ri];
    var outputName = (opts.alias && opts.alias[role]) || role;

    // Skip if user already provided this color (by output name)
    if (result[outputName] !== undefined) continue;

    // Derive the base color
    var derived = deriveBaseColor(sourceColor, role, opts);
    result[outputName] = derived;
  }

  return result;
}
