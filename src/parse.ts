// =======================================
// Color parsing pipeline for @xpyjs/color
// =======================================

import type { RGBA } from "./types";
import type { XColorInputNative } from "./core";
import { clamp, round, hslToRgb, hsvToRgb, Logger } from "./utils";

// ---- Types ----

/**
 * A color parser function. Takes any native color input and returns
 * an RGBA object if it can parse it, or `null` to pass to the next parser.
 */
export type XColorParser = (value: XColorInputNative) => RGBA | null;

/** Result of {@link parseFunctionalChannels}. */
export type XColorFunctionalChannelsResult = {
  channels: string[];
  alpha?: string;
};

// ---- Parser registry (before / after built-in) ----

const BEFORE_PARSERS: XColorParser[] = [];
const AFTER_PARSERS: XColorParser[] = [];

/**
 * Register a custom color parser into the parsing pipeline.
 * By default parsers run **after** built-in parsers. Set `priority: 'before'`
 * to run before built-in parsers (e.g. to override a built-in format).
 *
 * @param parser - Parser function `(value) => RGBA | null`
 * @param options - `{ priority?: 'before' | 'after' }` (default `'after'`)
 * @returns An unregister function that removes the parser from the pipeline
 * @example
 * const unregister = registerColorParser(
 *   (v) => v === 'brand' ? { r: 18, g: 52, b: 86, a: 1 } : null
 * );
 */
export function registerColorParser(
  parser: XColorParser,
  options?: { priority?: "before" | "after" }
): () => void {
  if (typeof parser !== "function") return () => {};
  const list = options?.priority === "before" ? BEFORE_PARSERS : AFTER_PARSERS;
  if (list.indexOf(parser) === -1) list.push(parser);
  return () => {
    const idx = list.indexOf(parser);
    if (idx >= 0) list.splice(idx, 1);
  };
}

// ---- Channel parsers (exported for plugin reuse) ----

/**
 * Parse an RGB channel value. Supports plain numbers and percentages.
 * @param val - Channel value (e.g. `"128"`, `"50%"`, `200`)
 * @returns Integer 0-255
 * @example parseRgbChannel("50%") // 128
 * @example parseRgbChannel(200)   // 200
 */
export function parseRgbChannel(val: string | number): number {
  const str = typeof val === "string" ? val.trim() : `${val}`;
  return Math.round(clamp(
    str.endsWith("%") ? (parseFloat(str) / 100) * 255 : parseFloat(str),
    0, 255
  ));
}

/**
 * Parse an alpha channel value. Supports plain numbers and percentages.
 * @param val - Alpha value (e.g. `"50%"`, `"0.8"`, `0.8`)
 * @returns Number 0-1
 * @example parseAlphaChannel("50%") // 0.5
 * @example parseAlphaChannel(0.8)   // 0.8
 */
export function parseAlphaChannel(val: string | number): number {
  const str = typeof val === "string" ? val.trim() : `${val}`;
  return clamp(
    str.endsWith("%") ? parseFloat(str) / 100 : parseFloat(str),
    0, 1
  );
}

/**
 * Parse a percentage channel value (for saturation, lightness, value, etc.).
 * @param val - Value (e.g. `"50%"`, `"50"`, `50`)
 * @returns Number 0-100
 * @example parsePercent("50%") // 50
 */
export function parsePercent(val: string | number): number {
  const str = typeof val === "string" ? val.trim() : `${val}`;
  return clamp(parseFloat(str), 0, 100);
}

/**
 * Parse a hue value with optional unit (deg, grad, rad, turn).
 * @param val - Hue (e.g. `"0.5turn"`, `"200grad"`, `180`)
 * @returns Degrees 0-360
 * @example parseHue("0.5turn") // 180
 * @example parseHue("200grad") // 180
 */
export function parseHue(val: string | number): number {
  if (typeof val === "number") return ((val % 360) + 360) % 360;
  const m = String(val).trim().toLowerCase()
    .match(/^([+-]?[\d.]+)(deg|grad|rad|turn)?$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const deg = m[2] === "turn" ? n * 360
    : m[2] === "grad" ? n * 0.9
    : m[2] === "rad" ? (n * 180) / Math.PI
    : n;
  return ((deg % 360) + 360) % 360;
}

// ---- Functional channel string parser ----

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parse function-like color channel arguments in a unified way.
 * Supports parenthesized and bare forms, comma or space separators,
 * and optional alpha via `/` or a trailing extra argument in comma mode.
 *
 * @param input - Raw string input (e.g. `"rgb(255 0 0 / 50%)"`)
 * @param names - Function name(s) to match (e.g. `["rgb", "rgba"]`)
 * @param channelCount - Expected number of channels (e.g. `3`, `4`)
 * @returns Parsed result or `null`
 * @example parseFunctionalChannels('rgb(255 0 0 / 50%)', ['rgb','rgba'], 3)
 * // { channels: ["255","0","0"], alpha: "50%" }
 * @example parseFunctionalChannels('cmyk 10 20 30 40', 'cmyk', 4)
 * // { channels: ["10","20","30","40"] }
 */
export function parseFunctionalChannels(
  input: string,
  names: string | string[],
  channelCount: number
): XColorFunctionalChannelsResult | null {
  if (!Number.isInteger(channelCount) || channelCount <= 0) return null;

  const pat = (Array.isArray(names) ? names : [names]).map(escapeRegExp).join("|");
  const m = input.trim().match(
    new RegExp(`^(?:${pat})(?:\\s*\\(\\s*(.*?)\\s*\\)|\\s+(.+))$`, "i")
  );
  if (!m) return null;

  const payload = (m[1] ?? m[2] ?? "").trim();
  if (!payload) return null;

  let alpha: string | undefined;
  let channelsPart = payload;

  const slashIdx = payload.lastIndexOf("/");
  if (slashIdx >= 0) {
    alpha = payload.slice(slashIdx + 1).trim();
    channelsPart = payload.slice(0, slashIdx).trim();
    if (!alpha) return null;
  }

  let channels: string[];
  if (channelsPart.includes(",")) {
    channels = channelsPart.split(/\s*,\s*/).filter(Boolean);
    if (channels.length === channelCount + 1 && alpha === undefined) {
      alpha = channels[channelCount];
      channels = channels.slice(0, channelCount);
    }
  } else {
    channels = channelsPart.split(/\s+/).filter(Boolean);
  }

  if (channels.length !== channelCount) return null;
  return { channels, alpha };
}

// ---- Color model config table + factory ----

/** @internal Configuration for a colour model parser. */
interface ColorModel {
  /** Object property names to detect (omit to skip object input). */
  keys?: string[];
  /** `true` = any key triggers match; default = all keys required. */
  anyKey?: boolean;
  /** Function name(s) for string input (omit to skip string input). */
  names?: string[];
  /** Number of channels (default `3`). */
  channels?: number;
  /** Per-channel parse functions. */
  parsers: ((v: string | number) => number)[];
  /** Convert parsed channels to RGB. */
  toRgb: (...args: number[]) => { r: number; g: number; b: number };
}

/** sRGB channel parser: 0-1 float → 0-255 int. */
const srgbCh = (v: string | number): number =>
  Math.round(clamp(parseFloat(String(v)) * 255, 0, 255));

/**
 * Built-in colour models. Each entry generates one pipeline parser via
 * {@link createModelParser}. Object and string parsing share the same
 * channel parsers and toRgb converter — zero duplication.
 * @internal
 */
const MODELS: ColorModel[] = [
  {
    keys: ["r", "g", "b"], anyKey: true,
    names: ["rgb", "rgba"],
    parsers: [parseRgbChannel, parseRgbChannel, parseRgbChannel],
    toRgb: (r, g, b) => ({ r, g, b })
  },
  {
    keys: ["h", "s", "l"],
    names: ["hsl", "hsla"],
    parsers: [parseHue, parsePercent, parsePercent],
    toRgb: hslToRgb
  },
  {
    keys: ["h", "s", "v"],
    names: ["hsv", "hsva"],
    parsers: [parseHue, parsePercent, parsePercent],
    toRgb: hsvToRgb
  },
  {
    names: ["srgb"],
    parsers: [srgbCh, srgbCh, srgbCh],
    toRgb: (r, g, b) => ({ r, g, b })
  }
];

/**
 * Create a pipeline {@link XColorParser} from a {@link ColorModel} config.
 * A single generated parser handles **both** object and string inputs.
 * @internal
 */
function createModelParser(model: ColorModel): XColorParser {
  const chCount = model.channels ?? 3;

  return (value: XColorInputNative): RGBA | null => {
    // ── Object branch (only when model.keys is defined) ──
    if (model.keys && typeof value === "object" && value !== null) {
      const v = value as Record<string, unknown>;
      const match = model.anyKey
        ? model.keys.some((k) => v[k] !== undefined)
        : model.keys.every((k) => v[k] !== undefined);
      if (match) {
        const vals = model.keys.map((k, i) => model.parsers[i]((v[k] as string | number | undefined) ?? 0));
        const rgb = model.toRgb(...vals);
        return { ...rgb, a: parseAlphaChannel((v.a as string | number | undefined) ?? 1) };
      }
    }

    // ── String branch (only when model.names is defined) ──
    if (model.names && typeof value === "string") {
      const res = parseFunctionalChannels(value, model.names, chCount);
      if (res) {
        const vals = res.channels.map((ch, i) => model.parsers[i](ch));
        const rgb = model.toRgb(...vals);
        return { ...rgb, a: res.alpha !== undefined ? parseAlphaChannel(res.alpha) : 1 };
      }
    }

    return null;
  };
}

// ---- Hand-written built-in parsers ----

/** Single regex for all hex variants: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, and without #. */
const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Parse numeric colour input (0x000000 – 0xFFFFFF).
 * @internal
 */
function parseNumber(value: XColorInputNative): RGBA | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value) || value < 0 || value > 0xFFFFFF) return null;
  return { r: (value >> 16) & 0xFF, g: (value >> 8) & 0xFF, b: value & 0xFF, a: 1 };
}

/**
 * Parse hex string (with or without `#`, 3/4/6/8 digits).
 * @internal
 */
function parseHex(value: XColorInputNative): RGBA | null {
  if (typeof value !== "string") return null;
  const m = value.trim().match(HEX_RE);
  if (!m) return null;
  let hex = m[1];
  if (hex.length <= 4) hex = hex.replace(/./g, "$&$&");
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: hex.length === 8 ? round(parseInt(hex.slice(6, 8), 16) / 255, 4) : 1
  };
}

// ---- Assemble built-in pipeline ----

const BUILTIN_PARSERS: XColorParser[] = [
  parseNumber,
  parseHex,
  ...MODELS.map(createModelParser)
];

// ---- Public entry ----

/**
 * Normalize input before feeding into the pipeline.
 * Converts `color(srgb ...)` → `srgb(...)` so the sRGB model config
 * can handle it via {@link parseFunctionalChannels}.
 * @internal
 */
function normalize(value: XColorInputNative): XColorInputNative {
  if (typeof value !== "string") return value;
  const s = value.trim().toLowerCase();
  return s.replace(/^color\(\s*srgb\b\s*/, "srgb(");
}

/**
 * Produce diagnostic warning on parse failure (called only on failure path).
 * @internal
 */
const MDN_COLOR_VALUE = "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value";

function diagnose(value: XColorInputNative): void {
  if (typeof value === "number") {
    Logger.warn(`Invalid numeric color: ${value}. Expected integer 0x000000–0xFFFFFF. See: ${MDN_COLOR_VALUE}`);
  } else if (typeof value === "string") {
    const s = value.trim();
    if (!s) {
      Logger.warn("Color input is empty.");
    } else if (/^#?[0-9a-f]+$/i.test(s)) {
      Logger.warn(`Invalid hex color: "${s}". See: ${MDN_COLOR_VALUE}`);
    } else if (/^[a-z]+$/i.test(s)) {
      Logger.warn(`Unknown color name: "${s}". Enable the name plugin via xcolor.use(name), or see: ${MDN_COLOR_VALUE}`);
    } else {
      Logger.warn(`Invalid color value: "${s}". See: ${MDN_COLOR_VALUE}`);
    }
  } else {
    Logger.warn(`Invalid color value: ${JSON.stringify(value)}. See: ${MDN_COLOR_VALUE}`);
  }
}

/**
 * Parse a color input to RGBA values using the pipeline architecture.
 *
 * Pipeline order: `BEFORE_PARSERS → BUILTIN_PARSERS → AFTER_PARSERS`.
 * Each parser receives the (normalized) value and returns `RGBA | null`.
 * The first non-null result wins. All results are clamped & rounded.
 *
 * @param value - Color value as string, object, or number
 * @returns RGBA object, or `null` if parsing fails
 * @example parseColor('#ff0000')           // { r: 255, g: 0, b: 0, a: 1 }
 * @example parseColor(0xFF0000)            // { r: 255, g: 0, b: 0, a: 1 }
 * @example parseColor('rgb(255, 0, 0)')    // { r: 255, g: 0, b: 0, a: 1 }
 * @example parseColor({ r: 255 })          // { r: 255, g: 0, b: 0, a: 1 }
 * @example parseColor('color(srgb 1 0 0)') // { r: 255, g: 0, b: 0, a: 1 }
 */
export function parseColor(value: XColorInputNative): RGBA | null {
  const input = normalize(value);
  const pipeline = BEFORE_PARSERS.length || AFTER_PARSERS.length
    ? [...BEFORE_PARSERS, ...BUILTIN_PARSERS, ...AFTER_PARSERS]
    : BUILTIN_PARSERS;

  for (let i = 0; i < pipeline.length; i++) {
    try {
      const result = pipeline[i](input);
      if (result !== null) {
        return {
          r: clamp(result.r, 0, 255),
          g: clamp(result.g, 0, 255),
          b: clamp(result.b, 0, 255),
          a: clamp(result.a, 0, 1)
        };
      }
    } catch (err) {
      Logger.warn("Parser error:", err);
    }
  }

  diagnose(value);
  return null;
}
