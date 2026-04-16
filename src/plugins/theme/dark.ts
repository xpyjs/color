// =======================================
// Plugin: theme - Dark mode palette generation
// =======================================

import { rgbToHsv, hsvToRgb, clamp, round } from "@xpyjs/color";
import type { Shade } from "./types";
import { generateSemantic } from "./semantic";

/**
 * Generate a dark-mode palette from a light-mode palette.
 *
 * The strategy reverses the shade mapping and adjusts saturation/value so
 * that dark-mode palettes look natural rather than simply inverted:
 *
 * - Light shade 50 → Dark shade 950 (and vice versa)
 * - Saturation is reduced slightly (dark backgrounds need less saturation)
 * - Value (brightness) is adjusted to avoid washed-out or too-bright colors
 *
 * @param lightPalette - The light-mode palette (ordered lightest → darkest)
 * @param shades - Shade levels corresponding to palette entries
 * @param cls - XColor class constructor
 * @returns Dark-mode palette in the same shade order
 */
export function generateDarkPalette(
  lightPalette: any[],
  shades: Shade[],
  cls: new (...args: any[]) => any
): any[] {
  const count = lightPalette.length;
  const darkColors: any[] = [];

  for (let i = 0; i < count; i++) {
    // Reverse the index: lightest becomes darkest and vice versa
    const sourceIdx = count - 1 - i;
    const source = lightPalette[sourceIdx];

    const r = source.red();
    const g = source.green();
    const b = source.blue();
    const hsv = rgbToHsv(r, g, b);

    // Adjust for dark mode: reduce saturation slightly, shift value
    const s = round(clamp(hsv.s * 0.85, 0, 100), 2);
    const v = round(clamp(hsv.v * 0.9, 5, 100), 2);

    const rgb = hsvToRgb(hsv.h, s, v);
    darkColors.push(new cls({ r: rgb.r, g: rgb.g, b: rgb.b, a: 1 }));
  }

  return darkColors;
}

/**
 * Generate semantic colors for dark mode from a dark palette.
 *
 * @param darkPalette - The dark-mode palette
 * @param shades - Shade levels
 * @returns Semantic color map for dark mode
 */
export function generateDarkSemantic(
  darkPalette: any[],
  shades: Shade[]
): Record<string, string> {
  return generateSemantic(darkPalette, shades);
}
