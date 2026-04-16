// =======================================
// Plugin: name - Extended named color support
// =======================================
import type { XColorPlugin } from "@xpyjs/color";
import { NAMED_COLORS } from "./constants";
import { registerColorParser, rgbaToHex, registerStringFormatter, defineMethod } from "@xpyjs/color";

const HEX_TO_NAME: Record<string, string> = {};
for (const key in NAMED_COLORS) {
  if (!Object.prototype.hasOwnProperty.call(NAMED_COLORS, key)) continue;
  const hex = NAMED_COLORS[key];
  if (!HEX_TO_NAME[hex]) HEX_TO_NAME[hex] = key;
}

function parseNamedHex(hex: string) {
  const normalized = hex.toLowerCase();
  if (!normalized.startsWith("#")) return null;
  if (normalized.length === 7) {
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
      a: 1
    };
  }
  if (normalized.length === 9) {
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
      a: parseInt(normalized.slice(7, 9), 16) / 255
    };
  }
  return null;
}

declare module "@xpyjs/color" {
  /** Adds `'name'` as a valid {@link XColorStringFormat} key. */
  interface XColorStringFormatMap {
    /** CSS named color format. Falls back to hex when no exact name exists. */
    name: true;
  }

  interface XColor {
    /**
     * Try to find the matching CSS named color.
     * Returns `undefined` if no exact match or when alpha is not opaque.
     * Returns `"transparent"` when alpha is 0.
     * @returns The CSS color name, or `undefined` if no exact match
     * @example
     * ```ts
     * xcolor('#ff0000').toName()   // 'red'
     * xcolor('#fe0001').toName()   // undefined (no exact match)
     * xcolor('#00000000').toName() // 'transparent'
     * ```
     */
    toName(): string | undefined;

    /**
     * Find the closest CSS named color.
     * First tries exact match via `toName()`, then falls back
     * to Euclidean distance in RGB space.
     * @returns The closest CSS color name
     * @example
     * ```ts
     * xcolor('#ff0000').closestName() // 'red'
     * xcolor('#fe0001').closestName() // 'red'
     * ```
     */
    closestName(): string;
  }
}

let namedColorsRgbCache: Record<string, {r:number,g:number,b:number}> | null = null;

function getNamedColorsRgb(cls: any): Record<string, {r:number,g:number,b:number}> {
  if (namedColorsRgbCache) return namedColorsRgbCache;
  namedColorsRgbCache = {};
  for (const [name, hex] of Object.entries(NAMED_COLORS)) {
    const c = new cls(hex);
    namedColorsRgbCache[name] = { r: c.red(), g: c.green(), b: c.blue() };
  }
  return namedColorsRgbCache;
}

const name: XColorPlugin = {
  name: "@xpyjs/color/plugins/name",
  install(_option, cls, _factory) {
    registerColorParser((value) => {
      if (typeof value !== "string") return null;
      const key = value.trim().toLowerCase();
      const hex = NAMED_COLORS[key];
      if (!hex) return null;
      return parseNamedHex(hex);
    });

    defineMethod(cls, 'toName', function (this: InstanceType<typeof cls>) {
      if (this.alpha() === 0) return "transparent";
      if (this.alpha() < 1) return undefined;
      const key = rgbaToHex(this.red(), this.green(), this.blue(), 1, false, false).toLowerCase();
      return HEX_TO_NAME[key];
    });

    registerStringFormatter(cls, "name", color => color.toName() || color.toHex());

    defineMethod(cls, 'closestName', function (this: InstanceType<typeof cls>) {
      // First try exact match
      const exactName = this.toName();
      if (exactName) return exactName;

      // Otherwise find closest by Euclidean distance in RGB space
      let closestName = "black";
      let minDistance = Infinity;

      const r = this.red();
      const g = this.green();
      const b = this.blue();

      const namedRgb = getNamedColorsRgb(cls);
      for (const colorName in namedRgb) {
        if (colorName === "transparent") continue;
        const other = namedRgb[colorName];
        const dr = r - other.r;
        const dg = g - other.g;
        const db = b - other.b;
        const distance = dr * dr + dg * dg + db * db;

        if (distance < minDistance) {
          minDistance = distance;
          closestName = colorName;
        }
      }

      return closestName;
    });
  }
};

export default name;
