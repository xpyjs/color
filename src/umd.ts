// =======================================
// UMD entry - @xpyjs/color
// Attaches all named exports onto the xcolor factory
// so that plugins can access them via the global.
// e.g. window.xcolor.registerColorParser(...)
// =======================================

import { xcolor, XColor, registerStringFormatter } from "./core";
import {
  clamp, round, clampByte, normalizeSteps, rgbaToHex,
  rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb,
  relativeLuminance, contrastRatio, defineMethod, Logger
} from "./utils";
import {
  parseColor, registerColorParser, parseFunctionalChannels,
  parseRgbChannel, parseAlphaChannel, parsePercent, parseHue
} from "./parse";

export default Object.assign(xcolor, {
  XColor, registerStringFormatter,
  parseColor, registerColorParser, parseFunctionalChannels,
  parseRgbChannel, parseAlphaChannel, parsePercent, parseHue,
  clamp, round, clampByte, normalizeSteps, rgbaToHex,
  rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb,
  relativeLuminance, contrastRatio, defineMethod, Logger
});
