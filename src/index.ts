// =======================================
// Entry point for @xpyjs/color
// =======================================

export {
  XColor,
  xcolor,
  registerStringFormatter,
  type XColorFactory,
  type XColorInput,
  type XColorInputObjectMap,
  type XColorOptions,
  type XColorStringFormat,
  type XColorStringFormatMap
} from "./core";
export type { RGBA, HSLA, HSVA, XColorPlugin, XColorParser } from "./types";

// Re-export utility functions for advanced usage
export {
  clamp,
  round,
  clampByte,
  normalizeSteps,
  rgbaToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  relativeLuminance,
  contrastRatio,
  defineMethod,
  Logger
} from "./utils";

// Re-export parsing functions & channel parsers
export {
  parseColor,
  registerColorParser,
  parseFunctionalChannels,
  parseRgbChannel,
  parseAlphaChannel,
  parsePercent,
  parseHue
} from "./parse";

// Default export is the factory function
import { xcolor } from "./core";
export default xcolor;
