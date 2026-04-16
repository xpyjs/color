// =======================================
// Tests: Utility functions
// =======================================

import { describe, it, expect } from "vitest";
import {
  clamp,
  round,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbaToHex,
  relativeLuminance,
  contrastRatio
} from "../src/utils";

describe("clamp", () => {
  it("should clamp value within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("should handle min > max by swapping", () => {
    expect(clamp(5, 10, 0)).toBe(5);
    expect(clamp(-5, 10, 0)).toBe(0);
    expect(clamp(15, 10, 0)).toBe(10);
  });

  it("should handle NaN/Infinity inputs", () => {
    expect(clamp(NaN, 0, 255)).toBe(0);
    expect(clamp(100, NaN, 255)).toBe(0);
    expect(clamp(100, 0, Infinity)).toBe(0);
    expect(clamp(Infinity, 0, 255)).toBe(0);
    expect(clamp(100, 5, NaN)).toBe(5);
  });

  it("should handle exact boundary values", () => {
    expect(clamp(0, 0, 255)).toBe(0);
    expect(clamp(255, 0, 255)).toBe(255);
    expect(clamp(0, 0, 0)).toBe(0);
  });
});

describe("round", () => {
  it("should round to specified decimal places", () => {
    expect(round(3.14159, 2)).toBe(3.14);
    expect(round(3.14159, 0)).toBe(3);
    expect(round(3.14159, 4)).toBe(3.1416);
  });

  it("should default to 0 decimal places", () => {
    expect(round(3.7)).toBe(4);
    expect(round(3.2)).toBe(3);
  });
});

describe("rgbToHsl", () => {
  it("should convert primary colors", () => {
    // Red
    const red = rgbToHsl(255, 0, 0);
    expect(red.h).toBe(0);
    expect(red.s).toBe(100);
    expect(red.l).toBe(50);

    // Green
    const green = rgbToHsl(0, 128, 0);
    expect(green.h).toBe(120);
    expect(green.s).toBe(100);
    expect(green.l).toBe(25.1);

    // Blue
    const blue = rgbToHsl(0, 0, 255);
    expect(blue.h).toBe(240);
    expect(blue.s).toBe(100);
    expect(blue.l).toBe(50);
  });

  it("should handle black and white", () => {
    const black = rgbToHsl(0, 0, 0);
    expect(black.h).toBe(0);
    expect(black.s).toBe(0);
    expect(black.l).toBe(0);

    const white = rgbToHsl(255, 255, 255);
    expect(white.h).toBe(0);
    expect(white.s).toBe(0);
    expect(white.l).toBe(100);
  });

  it("should handle grays", () => {
    const gray = rgbToHsl(128, 128, 128);
    expect(gray.h).toBe(0);
    expect(gray.s).toBe(0);
    expect(gray.l).toBeCloseTo(50.2, 0);
  });

  it("should handle secondary colors", () => {
    // Yellow
    const yellow = rgbToHsl(255, 255, 0);
    expect(yellow.h).toBe(60);
    expect(yellow.s).toBe(100);
    expect(yellow.l).toBe(50);

    // Cyan
    const cyan = rgbToHsl(0, 255, 255);
    expect(cyan.h).toBe(180);
    expect(cyan.s).toBe(100);
    expect(cyan.l).toBe(50);

    // Magenta
    const magenta = rgbToHsl(255, 0, 255);
    expect(magenta.h).toBe(300);
    expect(magenta.s).toBe(100);
    expect(magenta.l).toBe(50);
  });
});

describe("hslToRgb", () => {
  it("should convert primary colors back", () => {
    // Red
    const red = hslToRgb(0, 100, 50);
    expect(red.r).toBe(255);
    expect(red.g).toBe(0);
    expect(red.b).toBe(0);

    // Blue
    const blue = hslToRgb(240, 100, 50);
    expect(blue.r).toBe(0);
    expect(blue.g).toBe(0);
    expect(blue.b).toBe(255);
  });

  it("should handle achromatic colors (s=0)", () => {
    const gray = hslToRgb(0, 0, 50);
    expect(gray.r).toBe(128);
    expect(gray.g).toBe(128);
    expect(gray.b).toBe(128);
  });

  it("should handle black and white", () => {
    const black = hslToRgb(0, 0, 0);
    expect(black.r).toBe(0);
    expect(black.g).toBe(0);
    expect(black.b).toBe(0);

    const white = hslToRgb(0, 0, 100);
    expect(white.r).toBe(255);
    expect(white.g).toBe(255);
    expect(white.b).toBe(255);
  });

  it("should roundtrip with rgbToHsl", () => {
    const orig = { r: 100, g: 150, b: 200 };
    const hsl = rgbToHsl(orig.r, orig.g, orig.b);
    const back = hslToRgb(hsl.h, hsl.s, hsl.l);
    expect(back.r).toBeCloseTo(orig.r, 0);
    expect(back.g).toBeCloseTo(orig.g, 0);
    expect(back.b).toBeCloseTo(orig.b, 0);
  });
});

describe("rgbToHsv", () => {
  it("should convert primary colors", () => {
    const red = rgbToHsv(255, 0, 0);
    expect(red.h).toBe(0);
    expect(red.s).toBe(100);
    expect(red.v).toBe(100);
  });

  it("should handle black", () => {
    const black = rgbToHsv(0, 0, 0);
    expect(black.h).toBe(0);
    expect(black.s).toBe(0);
    expect(black.v).toBe(0);
  });

  it("should handle white", () => {
    const white = rgbToHsv(255, 255, 255);
    expect(white.s).toBe(0);
    expect(white.v).toBe(100);
  });
});

describe("hsvToRgb", () => {
  it("should convert primary colors back", () => {
    const red = hsvToRgb(0, 100, 100);
    expect(red.r).toBe(255);
    expect(red.g).toBe(0);
    expect(red.b).toBe(0);
  });

  it("should roundtrip with rgbToHsv", () => {
    const orig = { r: 75, g: 150, b: 200 };
    const hsv = rgbToHsv(orig.r, orig.g, orig.b);
    const back = hsvToRgb(hsv.h, hsv.s, hsv.v);
    expect(back.r).toBeCloseTo(orig.r, 0);
    expect(back.g).toBeCloseTo(orig.g, 0);
    expect(back.b).toBeCloseTo(orig.b, 0);
  });

  it("should handle all six HSV sectors", () => {
    // Sector 0 (red-yellow): h=30
    const s0 = hsvToRgb(30, 100, 100);
    expect(s0.r).toBe(255);
    expect(s0.g).toBe(128);
    expect(s0.b).toBe(0);

    // Sector 1 (yellow-green): h=90
    const s1 = hsvToRgb(90, 100, 100);
    expect(s1.r).toBe(128);
    expect(s1.g).toBe(255);
    expect(s1.b).toBe(0);

    // Sector 2 (green-cyan): h=150
    const s2 = hsvToRgb(150, 100, 100);
    expect(s2.r).toBe(0);
    expect(s2.g).toBe(255);
    expect(s2.b).toBe(128);

    // Sector 3 (cyan-blue): h=210
    const s3 = hsvToRgb(210, 100, 100);
    expect(s3.r).toBe(0);
    expect(s3.g).toBe(128);
    expect(s3.b).toBe(255);

    // Sector 4 (blue-magenta): h=270
    const s4 = hsvToRgb(270, 100, 100);
    expect(s4.r).toBe(128);
    expect(s4.g).toBe(0);
    expect(s4.b).toBe(255);

    // Sector 5 (magenta-red): h=330
    const s5 = hsvToRgb(330, 100, 100);
    expect(s5.r).toBe(255);
    expect(s5.g).toBe(0);
    expect(s5.b).toBe(128);
  });
});

describe("rgbaToHex", () => {
  it("should convert to 6-char hex", () => {
    expect(rgbaToHex(255, 0, 0, 1)).toBe("#ff0000");
    expect(rgbaToHex(0, 255, 0, 1)).toBe("#00ff00");
    expect(rgbaToHex(0, 0, 255, 1)).toBe("#0000ff");
  });

  it("should support 3-char hex", () => {
    expect(rgbaToHex(255, 0, 0, 1, true)).toBe("#f00");
    expect(rgbaToHex(255, 255, 255, 1, true)).toBe("#fff");
    expect(rgbaToHex(0, 0, 0, 1, true)).toBe("#000");
  });

  it("should not use 3-char hex when channels differ", () => {
    expect(rgbaToHex(255, 100, 0, 1, true)).toBe("#ff6400");
  });

  it("should include alpha when < 1", () => {
    expect(rgbaToHex(255, 0, 0, 0.5)).toBe("#ff000080");
  });

  it("should force alpha when requested", () => {
    expect(rgbaToHex(255, 0, 0, 1, false, true)).toBe("#ff0000ff");
  });

  it("should not use 3-char when alpha != 1", () => {
    expect(rgbaToHex(255, 0, 0, 0.5, true)).toBe("#ff000080");
  });

  it("should clamp values", () => {
    expect(rgbaToHex(300, -10, 0, 1)).toBe("#ff0000");
  });
});

describe("relativeLuminance", () => {
  it("should return 0 for black", () => {
    expect(relativeLuminance(0, 0, 0)).toBe(0);
  });

  it("should return 1 for white", () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 2);
  });

  it("should calculate correct luminance for primary colors", () => {
    const redLum = relativeLuminance(255, 0, 0);
    const greenLum = relativeLuminance(0, 128, 0);
    expect(redLum).toBeGreaterThan(0);
    expect(greenLum).toBeGreaterThan(0);
  });
});

describe("contrastRatio", () => {
  it("should return 21 for black vs white", () => {
    const blackLum = relativeLuminance(0, 0, 0);
    const whiteLum = relativeLuminance(255, 255, 255);
    expect(contrastRatio(blackLum, whiteLum)).toBe(21);
  });

  it("should return 1 for same colors", () => {
    const lum = relativeLuminance(128, 128, 128);
    expect(contrastRatio(lum, lum)).toBe(1);
  });
});
