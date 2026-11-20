// =======================================
// Entry point for @xpyjs/color
// =======================================

export {
  XColor,
  xcolor,
  registerStringFormatter,
  type XColorFactory,
  type XColorInput,
  type XColorInputNative,
  type XColorInputObjectMap,
  type XColorObjectInput,
  type XColorOptions,
  type XColorStringFormat,
  type XColorStringFormatMap
} from "./core";
export type { RGBA, HSLA, XColorPlugin, XColorParser } from "./types";

// Re-export utility functions for advanced usage
export {
  clamp,
  round,
  clampByte,
  normalizeSteps,
  rgbaToHex,
  rgbToHsl,
  hslToRgb,
  relativeLuminance,
  contrastRatio,
  defineMethod,
  Logger
} from "./utils";
export { XColorError, type XColorErrorCode } from "./utils";

// Re-export parsing functions & channel parsers
export {
  parseColor,
  registerColorParser,
  parseFunctionalChannels,
  parseRgbChannel,
  parseAlphaChannel,
  parsePercent,
  parseHue,
  type XColorFunctionalChannelsResult
} from "./parse";

// Default export is the factory function
import { xcolor } from "./core";
export default xcolor;
