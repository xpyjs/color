// =======================================
// Plugin: theme - CSS string generation
// =======================================

import { rgbToHsl } from "@xpyjs/color";
import type { XColorThemeOptions, ThemeCssFormat } from "./types";

/**
 * Format a hex color string according to the requested output format.
 *
 * @param hex - Color in hex format (e.g. `'#1890ff'`)
 * @param format - Desired output format
 * @returns Formatted color string
 */
export function formatColorValue(hex: string, format: ThemeCssFormat): string {
  if (format === "hex") return hex;

  // Parse hex → RGB
  const raw = hex.replace("#", "");
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);

  if (format === "rgb") {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  // HSL
  const hsl = rgbToHsl(r, g, b);
  return "hsl(" + Math.round(hsl.h) + ", " + Math.round(hsl.s) + "%, " + Math.round(hsl.l) + "%)";
}

/**
 * Build a block of CSS variable declarations from a variable map.
 *
 * @param vars - Map of CSS variable names to hex color values
 * @param format - Output format for values
 * @returns CSS declaration lines (no selector wrapping)
 */
function buildDeclarations(vars: Record<string, string>, format: ThemeCssFormat): string {
  var lines: string[] = [];
  var keys = Object.keys(vars);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    lines.push("  " + key + ": " + formatColorValue(vars[key], format) + ";");
  }
  return lines.join("\n");
}

/**
 * Build a complete CSS string from light and dark variable maps.
 *
 * @param vars - Light mode CSS variable map
 * @param darkVars - Dark mode CSS variable map (null if dark mode is disabled)
 * @param options - Theme configuration for selectors and format
 * @returns Complete CSS string ready for injection or file output
 */
export function buildCssString(
  vars: Record<string, string>,
  darkVars: Record<string, string> | null,
  options: XColorThemeOptions
): string {
  var format = options.format || "hex";
  var cssSelector = options.cssSelector || ":root";
  var parts: string[] = [];

  // Light mode block
  var lightDecl = buildDeclarations(vars, format);
  if (lightDecl) {
    parts.push(cssSelector + " {\n" + lightDecl + "\n}");
  }

  // Dark mode block
  if (darkVars && options.darkMode) {
    var darkDecl = buildDeclarations(darkVars, format);
    if (darkDecl) {
      if (options.darkMode === "class") {
        var darkSelector = options.darkSelector || ".dark";
        parts.push(darkSelector + " {\n" + darkDecl + "\n}");
      } else if (options.darkMode === "media") {
        parts.push("@media (prefers-color-scheme: dark) {\n  " + cssSelector + " {\n" + darkDecl.replace(/^  /gm, "    ") + "\n  }\n}");
      }
    }
  }

  return parts.join("\n\n") + "\n";
}
