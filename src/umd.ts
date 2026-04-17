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

const exp = xcolor as typeof xcolor & Record<string, unknown>;

// Core class
exp.XColor = XColor;
exp.registerStringFormatter = registerStringFormatter;

// Parse pipeline
exp.parseColor = parseColor;
exp.registerColorParser = registerColorParser;
exp.parseFunctionalChannels = parseFunctionalChannels;
exp.parseRgbChannel = parseRgbChannel;
exp.parseAlphaChannel = parseAlphaChannel;
exp.parsePercent = parsePercent;
exp.parseHue = parseHue;

// Utilities
exp.clamp = clamp;
exp.round = round;
exp.clampByte = clampByte;
exp.normalizeSteps = normalizeSteps;
exp.rgbaToHex = rgbaToHex;
exp.rgbToHsl = rgbToHsl;
exp.hslToRgb = hslToRgb;
exp.rgbToHsv = rgbToHsv;
exp.hsvToRgb = hsvToRgb;
exp.relativeLuminance = relativeLuminance;
exp.contrastRatio = contrastRatio;
exp.defineMethod = defineMethod;
exp.Logger = Logger;

export default exp;
