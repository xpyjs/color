// =======================================
// Plugin: palette - Palette generation algorithms
// =======================================

import { rgbToHsv, hsvToRgb, clamp, round } from "@xpyjs/color";
import type { XColor } from "@xpyjs/color";
import type { Shade, PaletteType } from "./types";
import { DEFAULT_SHADES } from "./types";

// ---- Ant Design algorithm ----
// Inspired by @ant-design/colors. Operates in HSV space with non-linear
// curves for hue rotation, saturation, and value across 10 fixed levels.

/** Hue offset step per shade level (warm direction for light, cool for dark). */
const HUE_STEP = 2;
/** Saturation step for light shades (decrease). */
const SATURATION_STEP_LIGHT = 16;
/** Saturation step for dark shades (increase). */
const SATURATION_STEP_DARK = 5;
/** Brightness step for light shades (increase). */
const BRIGHTNESS_STEP_LIGHT = 5;
/** Brightness step for dark shades (decrease). */
const BRIGHTNESS_STEP_DARK = 15;

/** Number of light variants (indexes 0-4, shades 50-400). */
const LIGHT_COUNT = 5;
/** Number of dark variants (indexes 6-9, shades 600-900). Base is index 5. */
const DARK_COUNT = 4;

/**
 * Get the hue value for a given palette index.
 *
 * Light shades rotate toward warm (hue decreases), dark shades rotate
 * toward cool (hue increases). The function handles hue wrapping at 0/360.
 */
function getHue(hsv: { h: number; s: number; v: number }, i: number, isLight: boolean): number {
  let hue: number;
  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    // Cool hues (60-240): light goes warmer (lower hue), dark goes cooler (higher hue)
    hue = isLight ? Math.round(hsv.h) - HUE_STEP * i : Math.round(hsv.h) + HUE_STEP * i;
  } else {
    // Warm hues (0-60, 240-360): opposite direction
    hue = isLight ? Math.round(hsv.h) + HUE_STEP * i : Math.round(hsv.h) - HUE_STEP * i;
  }
  if (hue < 0) hue += 360;
  else if (hue >= 360) hue -= 360;
  return hue;
}

/**
 * Get the saturation value for a given palette index.
 *
 * Light shades decrease saturation; dark shades increase saturation.
 * Special handling for base colors with very low saturation (neutral greys).
 */
function getSaturation(hsv: { h: number; s: number; v: number }, i: number, isLight: boolean): number {
  // For very low saturation (near-grey), keep saturation unchanged
  if (hsv.s < 5 && !isLight) return hsv.s;

  let saturation: number;
  if (isLight) {
    saturation = hsv.s - SATURATION_STEP_LIGHT * i;
  } else {
    saturation = hsv.s + SATURATION_STEP_DARK * i;
  }
  if (saturation < 6) saturation = 6;
  if (saturation > 100) saturation = 100;

  // For very low saturation inputs, clamp to original
  if (hsv.s < 5) saturation = hsv.s;

  return round(saturation, 2);
}

/**
 * Get the brightness (value) for a given palette index.
 *
 * Light shades increase brightness; dark shades decrease brightness.
 */
function getValue(hsv: { h: number; s: number; v: number }, i: number, isLight: boolean): number {
  let value: number;
  if (isLight) {
    value = hsv.v + BRIGHTNESS_STEP_LIGHT * i;
  } else {
    value = hsv.v - BRIGHTNESS_STEP_DARK * i;
  }
  return round(clamp(value, 5, 100), 2);
}

/**
 * Generate a 10-level palette using the Ant Design HSV curve algorithm.
 *
 * Index 5 is the base color. Indexes 0-4 are progressively lighter,
 * indexes 6-9 are progressively darker. Each level adjusts hue,
 * saturation, and value independently with non-linear curves.
 *
 * @param baseColor - The base color to generate a palette from
 * @param cls - XColor class constructor for creating new instances
 * @returns Array of 10 XColor instances from lightest to darkest
 */
function antdPalette(baseColor: InstanceType<typeof import("@xpyjs/color").XColor>, cls: new (...args: any[]) => any): any[] {
  const r = baseColor.red();
  const g = baseColor.green();
  const b = baseColor.blue();
  const hsv = rgbToHsv(r, g, b);

  const colors: any[] = [];

  // Generate light shades (indexes 0-4 → shades 50-400)
  for (let i = LIGHT_COUNT; i > 0; i--) {
    const h = getHue(hsv, i, true);
    const s = getSaturation(hsv, i, true);
    const v = getValue(hsv, i, true);
    const rgb = hsvToRgb(h, s, v);
    colors.push(new cls({ r: rgb.r, g: rgb.g, b: rgb.b, a: 1 }));
  }

  // Base color (index 5 → shade 500)
  colors.push(new cls({ r, g, b, a: 1 }));

  // Generate dark shades (indexes 6-9 → shades 600-900)
  for (let i = 1; i <= DARK_COUNT; i++) {
    const h = getHue(hsv, i, false);
    const s = getSaturation(hsv, i, false);
    const v = getValue(hsv, i, false);
    const rgb = hsvToRgb(h, s, v);
    colors.push(new cls({ r: rgb.r, g: rgb.g, b: rgb.b, a: 1 }));
  }

  return colors;
}

/**
 * Generate a palette using linear interpolation between white, base, and black.
 *
 * Light shades interpolate from white to base; dark shades interpolate
 * from base toward black. Uses simple RGB mixing.
 *
 * @param baseColor - The base color
 * @param shades - Shade levels to generate
 * @param cls - XColor class constructor
 * @returns Array of XColor instances matching the shade levels
 */
function linearPalette(baseColor: InstanceType<typeof import("@xpyjs/color").XColor>, shades: Shade[], cls: new (...args: any[]) => any): any[] {
  const r = baseColor.red();
  const g = baseColor.green();
  const b = baseColor.blue();
  const baseIndex = shades.indexOf(500 as Shade);
  const total = shades.length;

  const colors: any[] = [];

  for (let i = 0; i < total; i++) {
    if (i === baseIndex) {
      colors.push(new cls({ r, g, b, a: 1 }));
      continue;
    }

    let factor: number;
    let tr: number, tg: number, tb: number;

    if (i < baseIndex) {
      // Light: interpolate toward white
      factor = 1 - (i / baseIndex);
      tr = Math.round(r + (255 - r) * factor);
      tg = Math.round(g + (255 - g) * factor);
      tb = Math.round(b + (255 - b) * factor);
    } else {
      // Dark: interpolate toward black
      factor = (i - baseIndex) / (total - 1 - baseIndex);
      tr = Math.round(r * (1 - factor));
      tg = Math.round(g * (1 - factor));
      tb = Math.round(b * (1 - factor));
    }

    colors.push(new cls({
      r: clamp(tr, 0, 255),
      g: clamp(tg, 0, 255),
      b: clamp(tb, 0, 255),
      a: 1
    }));
  }

  return colors;
}

/**
 * Generate a design system palette from a base color.
 *
 * @param baseColor - The base color to generate shades for
 * @param type - Palette generation type (`'antd'`, `'linear'`, or a custom function)
 * @param shades - Shade levels to map. The Ant Design algorithm always generates
 *   10 fixed levels internally and maps them to the requested shades.
 * @param cls - XColor class constructor for creating instances
 * @returns Array of XColor instances matching the requested shade levels
 */
export function generatePalette(
  baseColor: any,
  type: PaletteType,
  shades: Shade[],
  cls: new (...args: any[]) => any
): any[] {
  if (typeof type === "function") {
    return type(baseColor, shades);
  }

  if (type === "linear") {
    return linearPalette(baseColor, shades, cls);
  }

  // Ant Design algorithm generates exactly 10 levels.
  // Map those to the standard 10 shades [50,100,200,...,900].
  // The extra 950 shade is derived from the darkest level.
  const antdColors = antdPalette(baseColor, cls);
  const standardShades: Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  const result: any[] = [];
  for (var i = 0; i < shades.length; i++) {
    var shade = shades[i];
    var idx = standardShades.indexOf(shade);
    if (idx !== -1) {
      result.push(antdColors[idx]);
    } else if (shade === 950) {
      // 950 is darker than 900 — derive from the darkest antd shade
      var darkest = antdColors[antdColors.length - 1];
      var dr = darkest.red();
      var dg = darkest.green();
      var db = darkest.blue();
      var darkHsv = rgbToHsv(dr, dg, db);
      var v = clamp(darkHsv.v - BRIGHTNESS_STEP_DARK, 5, 100);
      var rgb = hsvToRgb(darkHsv.h, clamp(darkHsv.s + SATURATION_STEP_DARK, 0, 100), v);
      result.push(new cls({ r: rgb.r, g: rgb.g, b: rgb.b, a: 1 }));
    }
  }

  return result;
}
