import { XColor, defineMethod, Logger, parseColor as parseSrgb, parseFunctionalChannels, registerColorParser, type XColorOptions, type XColorPlugin } from "@xpyjs/color";
import { alphaSuffix, hueToken, numericToken } from "../../tokens";
import { parseCoordinates } from "../wide-color";
import { parseCssLiteral } from "./css";
import { evaluateCssExpression, type XColorCssContext } from "./expression";
export type { XColorCssContext } from "./expression";
import { fromXyzD65, toXyzD65, isRgbSpace, type ColorSpace, type RGBSpace, type Coordinates } from "./conversion";

/** Supported coordinate spaces. Lab/LCH use the CSS D50 white point. */
export type XColorSpace = ColorSpace;
/** RGB spaces with a bounded display gamut. */
export type XColorRgbSpace = RGBSpace;

/** Color coordinates retained in their source space, without sRGB clipping. */
export interface XColorSpaceRecord {
  readonly space: XColorSpace;
  readonly coordinates: readonly [number, number, number];
  readonly alpha: number;
  /** Explicit CSS none flags for the three coordinates and alpha. Numeric placeholders are zero. */
  readonly missing?: readonly [boolean, boolean, boolean, boolean];
}

/** Syntax policy for the explicit CSS parser. */
export interface XColorCssParseOptions {
  /** strict (default): CSS literals only; loose also accepts existing library syntax. */
  syntax?: "strict" | "loose";
}

/**
 * Parse standalone CSS color literals, retaining wide coordinates and explicit none flags.
 * Supports hex, named colors, rgb/hsl/hwb/Lab/OKLab and predefined color() spaces.
 * Expressions, CSS escapes/comments, custom profiles and context-dependent keywords return null.
 * @param input - Complete literal, without a CSS declaration
 * @param options - Strict literal grammar by default; loose enables legacy library fallbacks
 * @returns An independent record or null; never resolves currentColor or variables implicitly
 * @see https://www.w3.org/TR/css-color-4/#missing
 */
export function parseCssColor(input: string, options: XColorCssParseOptions = {}): XColorSpaceRecord | null {
  if (options.syntax !== undefined && options.syntax !== "strict" && options.syntax !== "loose") throw Logger.createError("Unknown CSS syntax policy");
  return parseCssLiteral(input) ?? (options.syntax === "loose" ? parseColorSpace(input) : null);
}

/**
 * Resolve CSS literals, two-color color-mix(), and relative color functions.
 * Relative calc supports finite numbers, channel keywords, arithmetic and parentheses.
 * @param input - Expression (maximum 16384 characters, 32 nesting levels, 256 resolution steps)
 * @param context - Explicit currentColor and whole-color custom properties; no DOM lookup
 * @returns Independent coordinates, or null for unresolved/invalid/unsupported expressions
 * @see https://www.w3.org/TR/css-color-5/
 */
export function resolveCssColor(input: string, context: XColorCssContext = {}): XColorSpaceRecord | null {
  return evaluateCssExpression(input, context, convertColorSpace);
}

const SPACES: readonly XColorSpace[] = ["srgb", "srgb-linear", "display-p3", "a98-rgb", "prophoto-rgb", "rec2020", "xyz", "xyz-d65", "xyz-d50", "lab", "lch", "oklab", "oklch", "hsl", "hsv", "hwb"];

/** Precision for coordinate serialization; never changes the stored record. */
export interface XColorSpaceFormatOptions {
  /** Decimal places from 0 to 15, or full stored precision (default 'full'). */
  precision?: number | "full";
}

function validate(color: XColorSpaceRecord): void {
  if (!color || !SPACES.includes(color.space) || !Array.isArray(color.coordinates) || color.coordinates.length !== 3 ||
      ![...color.coordinates, color.alpha].every(Number.isFinite) || color.alpha < 0 || color.alpha > 1) {
    throw Logger.createError("Invalid color-space record");
  }
  if (color.missing !== undefined && (!Array.isArray(color.missing) || color.missing.length !== 4 || !color.missing.every(v => typeof v === "boolean"))) {
    throw Logger.createError("Invalid missing-channel flags");
  }
}

/**
 * Parse a color without discarding its original wide-gamut coordinates.
 * CSS lab/lch always use D50, independently of the legacy lab plugin option.
 * Existing core input syntax and registered parsers fall back to sRGB records.
 * @param input - Color string
 * @returns An independent record, or null for invalid/unsupported syntax
 */
export function parseColorSpace(input: string): XColorSpaceRecord | null {
  if (typeof input !== "string") return null;
  if (/\bnone\b/i.test(input)) return parseCssLiteral(input);
  for (const space of SPACES) {
    if (isRgbSpace(space) || space.startsWith("xyz")) {
      const parsed = parseCoordinates(input, space);
      if (parsed) return parsed;
      continue;
    }
    const parsed = parseFunctionalChannels(input, space, 3);
    if (!parsed) continue;
    if (space === "hsl" || space === "hsv" || space === "hwb") {
      const values = [hueToken(parsed.channels[0]), numericToken(parsed.channels[1],100), numericToken(parsed.channels[2],100)];
      const alpha = parsed.alpha === undefined ? 1 : numericToken(parsed.alpha,1);
      if (![...values,alpha].every(Number.isFinite)) return null;
      return { space, coordinates: values as Coordinates, alpha: Math.max(0,Math.min(1,alpha)) };
    }
    const ok = space.startsWith("ok"), polar = space.endsWith("lch");
    const l = numericToken(parsed.channels[0], ok ? 1 : 100);
    const second = numericToken(parsed.channels[1], ok ? .4 : polar ? 150 : 125);
    const third = polar ? hueToken(parsed.channels[2]) : numericToken(parsed.channels[2], ok ? .4 : 125);
    const alpha = parsed.alpha === undefined ? 1 : numericToken(parsed.alpha, 1);
    if (![l, second, third, alpha].every(Number.isFinite)) return null;
    return { space, coordinates: [l, polar ? Math.max(0, second) : second, third], alpha: Math.max(0, Math.min(1, alpha)) };
  }
  const rgb = parseSrgb(input, true);
  return rgb ? { space: "srgb", coordinates: [rgb.r/255, rgb.g/255, rgb.b/255], alpha: rgb.a } : null;
}

/**
 * Convert between spaces without clipping, rounding, or modifying the input.
 * Outside interpolation, missing components resolve to zero and their flags are removed.
 * @param color - A validated coordinate record (including existing parseWideColor results)
 * @param space - Destination space
 * @returns Independent target coordinates, preserving alpha
 * @throws For malformed records, unknown spaces or numeric overflow
 */
export function convertColorSpace<Space extends XColorSpace>(color: XColorSpaceRecord, space: Space): XColorSpaceRecord & { readonly space: Space } {
  validate(color);
  if (!SPACES.includes(space)) throw Logger.createError("Unknown target color space");
  const source = color.coordinates.map((v, i) => color.missing?.[i] ? 0 : v) as Coordinates;
  const coordinates: Coordinates = color.space === space ? source : fromXyzD65(space, toXyzD65(color.space, source));
  if (!coordinates.every(Number.isFinite)) throw Logger.createError("Color conversion overflow");
  return { space, coordinates, alpha: color.missing?.[3] ? 0 : color.alpha };
}

/**
 * Test whether a color fits a target RGB gamut without changing it.
 * @param color - Source record
 * @param space - Target RGB gamut (default srgb)
 * @param epsilon - Nonnegative numeric tolerance (default 1e-7)
 * @returns Whether all converted channels lie within [0, 1], allowing tolerance
 */
export function inGamut(color: XColorSpaceRecord, space: XColorRgbSpace = "srgb", epsilon = 1e-7): boolean {
  if (!isRgbSpace(space) || !Number.isFinite(epsilon) || epsilon < 0) throw Logger.createError("Invalid gamut or tolerance");
  return convertColorSpace(color, space).coordinates.every(v=>v >= -epsilon && v <= 1+epsilon);
}

/** Explicit gamut mapping policy; chroma reduction is not CSS Local MINDE. */
export type XColorGamutMethod = "clip" | "oklch-chroma";

/**
 * Explicitly map a color into an RGB gamut, preserving alpha.
 * @param color - Source record
 * @param space - Target gamut (default srgb)
 * @param method - Channel clipping (default) or binary-search OKLCh chroma reduction
 * @returns Independent bounded target RGB coordinates
 * @throws For an invalid target, method or source record
 */
export function mapToGamut<Space extends XColorRgbSpace = "srgb">(
  color: XColorSpaceRecord, space: Space = "srgb" as Space, method: XColorGamutMethod = "clip"
): XColorSpaceRecord & { readonly space: Space } {
  if (!isRgbSpace(space) || !["clip", "oklch-chroma"].includes(method)) throw Logger.createError("Invalid gamut mapping options");
  const clip = (value: XColorSpaceRecord) => {
    const converted = convertColorSpace(value, space);
    return { ...converted, coordinates: converted.coordinates.map(v=>Math.max(0,Math.min(1,v))) as Coordinates };
  };
  if (method === "clip" || inGamut(color, space)) return clip(color);
  const lch = convertColorSpace(color, "oklch");
  const [l,c,h] = lch.coordinates;
  if (l <= 0 || l >= 1) return { space, coordinates: l <= 0 ? [0,0,0] : [1,1,1], alpha: lch.alpha };
  let low = 0, high = c;
  for (let i = 0; i < 32; i++) {
    const mid = (low+high)/2;
    if (inGamut({ ...lch, coordinates: [l,mid,h] }, space)) low = mid;
    else high = mid;
  }
  return clip({ ...lch, coordinates: [l,low,h] });
}

/**
 * Serialize coordinates directly without conversion; rounding is opt-in.
 * @param color - Source record
 * @param options - Full precision (default) or 0–15 decimal places, including alpha
 * @returns A color function string; hsv() is library notation, not CSS
 * @throws For an invalid record
 */
export function formatColorSpace(color: XColorSpaceRecord, options: XColorSpaceFormatOptions = {}): string {
  validate(color);
  const precision = options.precision ?? "full";
  if (precision !== "full" && (!Number.isInteger(precision) || precision < 0 || precision > 15)) {
    throw Logger.createError("Output precision must be full or an integer from 0 to 15");
  }
  const number = (value: number) => precision === "full" ? value : Number(value.toFixed(precision));
  const coordinates = color.coordinates.map((v, i) => color.missing?.[i] ? "none" : number(v));
  const alpha = number(color.alpha);
  const suffix = color.missing?.[3] ? " / none" : alphaSuffix(alpha);
  if (color.space === "hsl" || color.space === "hsv" || color.space === "hwb") {
    const percent = (i: number) => coordinates[i] === "none" ? "none" : `${coordinates[i]}%`;
    return `${color.space}(${coordinates[0]} ${percent(1)} ${percent(2)}${suffix})`;
  }
  const values = coordinates.join(" ");
  return isRgbSpace(color.space) || color.space.startsWith("xyz")
    ? `color(${color.space} ${values}${suffix})`
    : `${color.space}(${values}${suffix})`;
}

declare module "@xpyjs/color" {
  interface XColorInputObjectMap {
    colorSpace: XColorSpaceRecord;
  }
  interface XColor {
    /** Get an independent full-precision sRGB coordinate record. @returns Current coordinates and alpha */
    colorSpace(): XColorSpaceRecord;
    /**
     * Replace the current color from an explicitly tagged space record.
     * @param value - Coordinates and alpha; conversion to this sRGB instance clips out-of-gamut channels
     * @returns Current instance for chaining, retaining its precision options
     * @throws For invalid records, without modifying this instance
     */
    colorSpace(value: XColorSpaceRecord): this;
    /**
     * Convert the current sRGB instance to an unclipped coordinate record.
     * Already-clipped input cannot be recovered; use parseColorSpace for wide input.
     * @param space - Target space (default srgb)
     * @returns Independent coordinates with full alpha precision
     * @throws If the source instance is invalid
     */
    toColorSpace<Space extends XColorSpace = "srgb">(space?: Space): XColorSpaceRecord & { readonly space: Space };
  }
}

/**
 * Create an sRGB instance from a tagged record without registering the plugin.
 * @param color - Explicit source coordinates and alpha
 * @param options - Instance options, e.g. useDecimal
 * @returns A new instance; out-of-sRGB channels are clipped
 * @throws For invalid records
 */
export function fromColorSpace(color: XColorSpaceRecord, options?: XColorOptions): XColor {
  return new XColor(instanceRgba(color), options);
}

// Resolve display endpoints without changing the unclipped coordinate conversion API.
function instanceRgba(color: XColorSpaceRecord) {
  const converted = convertColorSpace(color, "srgb");
  let [r,g,b] = converted.coordinates;
  if (["lab", "lch", "oklab", "oklch"].includes(color.space)) {
    const l = color.missing?.[0] ? 0 : color.coordinates[0];
    if (l <= 0) r = g = b = 0;
    else if (l >= (color.space.startsWith("ok") ? 1 : 100)) r = g = b = 1;
  }
  return { r:r*255,g:g*255,b:b*255,a:converted.alpha };
}

const colorSpace: XColorPlugin = {
  name: "@xpyjs/color/plugins/colorSpace",
  install(_option, cls) {
    registerColorParser(value => {
      if (typeof value === "string") {
        if (!/\bnone\b/i.test(value) && !/^\s*color\(\s*srgb-linear\s/i.test(value)) return null;
        const parsed = parseCssLiteral(value);
        if (!parsed) return null;
        return instanceRgba(parsed);
      }
      if (!value || typeof value !== "object" || !("space" in value)) return null;
      return instanceRgba(value as XColorSpaceRecord);
    }, { priority: "before" });

    defineMethod(cls, "colorSpace", function (value?: XColorSpaceRecord) {
      if (value === undefined) return this.toColorSpace();
      const {r,g,b,a} = instanceRgba(value);
      return this.rgb(r,g,b,a);
    });
    defineMethod(cls, "toColorSpace", function (space: XColorSpace = "srgb") {
      if (!this.isValid()) throw Logger.createError("Invalid source color");
      return convertColorSpace({ space: "srgb", coordinates: [this.red()/255,this.green()/255,this.blue()/255], alpha: this.alpha() }, space);
    });
  }
};
export default colorSpace;
