// =======================================
// Plugin: theme - Configuration resolver
// =======================================

import type { XColorThemeOptions, ColorConfig, Shade, ThemeResult } from "./types";
import { DEFAULT_SHADES } from "./types";
import { generatePalette } from "@xpyjs/color/plugins/palette/generate";
import { generateSemantic } from "./semantic";
import { generateDarkPalette, generateDarkSemantic } from "./dark";
import { buildCssString } from "./css";
import { resolveDeriveOptions, deriveRoleColors } from "./derive";

/**
 * Check whether a ColorConfig object has a DEFAULT base color.
 */
function hasDefault(config: ColorConfig): config is { DEFAULT: string; [key: string]: string | ColorConfig } {
  return typeof config === "object" && typeof (config as any).DEFAULT === "string";
}

/**
 * Recursively flatten a nested color config into a flat CSS variable map.
 *
 * Variable names are built by joining key segments with `-`:
 * `{prefix}-{key1}-{key2}-...-{keyN}`.
 *
 * The special `DEFAULT` key does not contribute to the variable name;
 * instead it marks the base color for automatic palette generation.
 *
 * @param colors - Color definitions to flatten
 * @param prefix - Current variable name prefix (e.g. `'--x-primary'`)
 * @returns Flat map of CSS variable names → hex color values
 */
export function flattenColors(
  colors: Record<string, string | ColorConfig>,
  prefix: string
): Record<string, string> {
  var result: Record<string, string> = {};
  var keys = Object.keys(colors);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = colors[key];

    // Skip DEFAULT — it's handled separately by the palette generator
    if (key === "DEFAULT") continue;

    var varName = prefix + "-" + key;

    if (typeof value === "string") {
      result[varName] = value;
    } else {
      // Recurse into nested objects
      var nested = flattenColors(value as Record<string, string | ColorConfig>, varName);
      var nkeys = Object.keys(nested);
      for (var j = 0; j < nkeys.length; j++) {
        result[nkeys[j]] = nested[nkeys[j]];
      }
    }
  }

  return result;
}

/**
 * Normalize a user-provided CSS variable prefix into a valid `--<letters>` form.
 *
 * Rules:
 * - Only lowercase letters (`a-z`) and hyphens (`-`) are kept.
 * - Leading non-letter characters are stripped (prefix must start with a letter).
 * - The result is always prefixed with `--`.
 * - If nothing valid remains, falls back to `--x`.
 *
 * @example
 * normalizePrefix('color')   // '--color'
 * normalizePrefix('--x')     // '--x'
 * normalizePrefix('--X-Foo') // '--x-foo'
 * normalizePrefix('123abc')  // '--abc'
 * normalizePrefix('')        // '--x'
 */
export function normalizePrefix(raw?: string): string {
  if (!raw) return "--x";

  // Lowercase, keep only a-z and hyphen
  var cleaned = raw.toLowerCase().replace(/[^a-z-]/g, "");

  // Strip leading hyphens (we'll re-add --)
  cleaned = cleaned.replace(/^-+/, "");

  // Strip leading non-letter chars (shouldn't remain after above, but safety)
  cleaned = cleaned.replace(/^[^a-z]+/, "");

  if (!cleaned) return "--x";

  return "--" + cleaned;
}

/**
 * Resolve a complete theme configuration into CSS output and structured data.
 *
 * Processing steps for each color entry:
 * 1. If it's a string → treat as base color, generate palette + semantic
 * 2. If it has `DEFAULT` → generate palette + semantic, then overlay user overrides
 * 3. If it has no `DEFAULT` → pure custom flatten, no palette generation
 *
 * @param options - Theme configuration
 * @param cls - XColor class constructor
 * @param factory - xcolor factory function
 * @returns ThemeResult with CSS string, variable map, and color palettes
 */
export function resolveThemeConfig(
  options: XColorThemeOptions,
  cls: new (...args: any[]) => any,
  factory: (...args: any[]) => any
): ThemeResult {
  var prefix = normalizePrefix(options.prefix);
  var type = options.type || "antd";
  var shades = options.shades || DEFAULT_SHADES;
  var semantic = options.semantic !== false; // default true
  var darkMode = options.darkMode || false;

  var vars: Record<string, string> = {};
  var darkVars: Record<string, string> = {};
  var colorPalettes: Record<string, any[]> = {};

  // ---- Derive role colors (if enabled) ----
  var deriveOpts = resolveDeriveOptions(options.derive);
  var workingColors = deriveOpts
    ? deriveRoleColors(options.colors, deriveOpts, cls)
    : options.colors;

  var colorKeys = Object.keys(workingColors);

  for (var ci = 0; ci < colorKeys.length; ci++) {
    var colorName = colorKeys[ci];
    var colorValue = workingColors[colorName];
    var colorPrefix = prefix + "-" + colorName;

    var baseColor: string | null = null;

    if (typeof colorValue === "string") {
      baseColor = colorValue;
    } else if (hasDefault(colorValue)) {
      baseColor = colorValue.DEFAULT;
    }

    if (baseColor) {
      // Generate palette from base color
      var base = new (cls as any)(baseColor);
      var palette = generatePalette(base, type, shades, cls);
      colorPalettes[colorName] = palette;

      // Map palette shades to CSS variables
      for (var si = 0; si < shades.length; si++) {
        vars[colorPrefix + "-" + shades[si]] = palette[si].toHex();
      }

      // Always emit a bare base variable (e.g. --x-primary) that points
      // to the 500 shade — this gives users a convenient shorthand.
      var shade500Idx = shades.indexOf(500 as any);
      vars[colorPrefix] = shade500Idx !== -1 ? palette[shade500Idx].toHex() : base.toHex();

      // Generate semantic colors
      if (semantic) {
        var semanticColors = generateSemantic(palette, shades);

        // If the value is an object, user overrides take priority
        if (typeof colorValue === "object") {
          var userOverrides = flattenColors(colorValue as Record<string, string | ColorConfig>, colorPrefix);
          var okeys = Object.keys(userOverrides);
          for (var oi = 0; oi < okeys.length; oi++) {
            vars[okeys[oi]] = userOverrides[okeys[oi]];
          }

          // Fill semantic colors not already specified by user
          var semKeys = Object.keys(semanticColors);
          for (var ski = 0; ski < semKeys.length; ski++) {
            var semVarName = colorPrefix + "-" + semKeys[ski];
            if (!(semVarName in vars)) {
              vars[semVarName] = semanticColors[semKeys[ski]];
            }
          }
        } else {
          // String shorthand — all semantic colors are auto-generated
          var semKeys2 = Object.keys(semanticColors);
          for (var ski2 = 0; ski2 < semKeys2.length; ski2++) {
            vars[colorPrefix + "-" + semKeys2[ski2]] = semanticColors[semKeys2[ski2]];
          }
        }
      } else if (typeof colorValue === "object") {
        // No semantic but has user overrides
        var userOnly = flattenColors(colorValue as Record<string, string | ColorConfig>, colorPrefix);
        var ukeys = Object.keys(userOnly);
        for (var ui = 0; ui < ukeys.length; ui++) {
          vars[ukeys[ui]] = userOnly[ukeys[ui]];
        }
      }

      // Dark mode
      if (darkMode) {
        var darkPalette = generateDarkPalette(palette, shades, cls);
        for (var di = 0; di < shades.length; di++) {
          darkVars[colorPrefix + "-" + shades[di]] = darkPalette[di].toHex();
        }
        // Bare base variable for dark mode
        var darkShade500Idx = shades.indexOf(500 as any);
        darkVars[colorPrefix] = darkShade500Idx !== -1 ? darkPalette[darkShade500Idx].toHex() : darkPalette[Math.floor(darkPalette.length / 2)].toHex();
        if (semantic) {
          var darkSemantic = generateDarkSemantic(darkPalette, shades);
          var dsKeys = Object.keys(darkSemantic);
          for (var dsi = 0; dsi < dsKeys.length; dsi++) {
            darkVars[colorPrefix + "-" + dsKeys[dsi]] = darkSemantic[dsKeys[dsi]];
          }
        }
      }
    } else {
      // No base color — pure custom nesting, just flatten
      if (typeof colorValue === "object") {
        var custom = flattenColors(colorValue as Record<string, string | ColorConfig>, colorPrefix);
        var ckeys = Object.keys(custom);
        for (var cki = 0; cki < ckeys.length; cki++) {
          vars[ckeys[cki]] = custom[ckeys[cki]];
        }
      }
    }
  }

  var css = buildCssString(vars, darkMode ? darkVars : null, options);

  return { css: css, vars: vars, colors: colorPalettes };
}

/**
 * Deep merge two objects. Arrays are replaced, not merged.
 * Used by `updateTheme()` to merge partial options into existing options.
 *
 * @param target - Base object
 * @param source - Partial object to merge in
 * @returns A new merged object
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  var result = {} as any;
  var targetKeys = Object.keys(target);
  for (var i = 0; i < targetKeys.length; i++) {
    result[targetKeys[i]] = target[targetKeys[i]];
  }

  var sourceKeys = Object.keys(source);
  for (var j = 0; j < sourceKeys.length; j++) {
    var key = sourceKeys[j];
    var sv = (source as any)[key];
    var tv = result[key];

    if (
      sv !== null &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      result[key] = deepMerge(tv, sv);
    } else {
      result[key] = sv;
    }
  }

  return result as T;
}
