// =======================================
// Plugin: theme - Semantic color generation
// =======================================

import type { Shade } from "./types";

/**
 * Default semantic state names generated for colors with a base value.
 */
export const SEMANTIC_STATES = ["hover", "active", "disabled", "border", "bg", "text"] as const;

/**
 * Find the palette color at a given shade level.
 * Returns the hex string of the color at that shade index.
 */
function paletteAt(palette: any[], shades: Shade[], targetShade: Shade): any | undefined {
  const idx = shades.indexOf(targetShade);
  return idx !== -1 ? palette[idx] : undefined;
}

/**
 * Generate semantic color variants from a base color and its palette.
 *
 * Semantic colors are common UI states derived from the palette:
 * - `hover` — Slightly lighter than base (shade 400)
 * - `active` — Slightly darker than base (shade 600)
 * - `disabled` — Very light, desaturated (shade 200)
 * - `border` — Light variant (shade 300)
 * - `bg` — Very light background (shade 50)
 * - `text` — Very dark for text contrast (shade 900)
 *
 * @param palette - Generated palette colors (ordered by shade level)
 * @param shades - Shade levels corresponding to palette entries
 * @returns Record of semantic state names to hex color strings
 */
export function generateSemantic(
  palette: any[],
  shades: Shade[]
): Record<string, string> {
  const result: Record<string, string> = {};

  const hoverColor = paletteAt(palette, shades, 400);
  if (hoverColor) result.hover = hoverColor.toHex();

  const activeColor = paletteAt(palette, shades, 600);
  if (activeColor) result.active = activeColor.toHex();

  const disabledColor = paletteAt(palette, shades, 200);
  if (disabledColor) result.disabled = disabledColor.toHex();

  const borderColor = paletteAt(palette, shades, 300);
  if (borderColor) result.border = borderColor.toHex();

  const bgColor = paletteAt(palette, shades, 50);
  if (bgColor) result.bg = bgColor.toHex();

  const textColor = paletteAt(palette, shades, 900);
  if (textColor) result.text = textColor.toHex();

  return result;
}
