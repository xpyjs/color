// =======================================
// Tests: Boundary and edge cases
// Covers areas identified as under-tested:
// - utils edge cases
// - core.toNumber() with useDecimal
// - core.equals() alpha precision
// - core.isDark() at brightness boundary
// - chain validation
// =======================================

import { describe, it, expect } from "vitest";
import { XColor, xcolor } from "../src/core";
import { clamp, round, clampByte, normalizeSteps } from "../src/utils";

describe("utils boundary tests", () => {
  describe("clamp edge cases", () => {
    it("should handle all NaN arguments returning 0", () => {
      expect(clamp(NaN, NaN, NaN)).toBe(0);
    });

    it("should handle negative Infinity", () => {
      expect(clamp(-Infinity, 0, 255)).toBe(0);
    });

    it("should handle positive Infinity as min", () => {
      expect(clamp(10, Infinity, 255)).toBe(0);
    });

    it("should handle -0", () => {
      expect(clamp(-0, 0, 255)).toBe(0);
    });
  });

  describe("round edge cases", () => {
    it("should handle negative numbers", () => {
      expect(round(-3.7)).toBe(-4);
      expect(round(-3.2)).toBe(-3);
      expect(round(-3.14159, 2)).toBe(-3.14);
    });

    it("should handle very large numbers", () => {
      expect(round(1e15, 0)).toBe(1e15);
      expect(round(123456789.123, 2)).toBe(123456789.12);
    });

    it("should handle 0", () => {
      expect(round(0)).toBe(0);
      expect(round(0, 5)).toBe(0);
    });
  });

  describe("clampByte edge cases", () => {
    it("should clamp and round fractional values", () => {
      expect(clampByte(127.4)).toBe(127);
      expect(clampByte(127.6)).toBe(128);
    });

    it("should handle negative values", () => {
      expect(clampByte(-100)).toBe(0);
    });

    it("should handle values exceeding 255", () => {
      expect(clampByte(500)).toBe(255);
    });
  });

  describe("normalizeSteps edge cases", () => {
    it("should return fallback for NaN", () => {
      expect(normalizeSteps(NaN)).toBe(5);
    });

    it("should return fallback for undefined", () => {
      expect(normalizeSteps(undefined)).toBe(5);
    });

    it("should return fallback for Infinity", () => {
      expect(normalizeSteps(Infinity)).toBe(5);
    });

    it("should use custom fallback", () => {
      expect(normalizeSteps(NaN, 10)).toBe(10);
    });

    it("should enforce minimum of 2", () => {
      expect(normalizeSteps(0)).toBe(2);
      expect(normalizeSteps(1)).toBe(2);
      expect(normalizeSteps(-5)).toBe(2);
    });

    it("should floor fractional steps", () => {
      expect(normalizeSteps(3.9)).toBe(3);
      expect(normalizeSteps(10.5)).toBe(10);
    });
  });
});

describe("core boundary tests", () => {
  describe("toNumber() with useDecimal", () => {
    it("should still produce valid integer for useDecimal colors", () => {
      const c = new XColor("#ff0000", { useDecimal: true });
      c.red(127.6);
      // toNumber should round internally
      const num = c.toNumber();
      expect(Number.isInteger(num)).toBe(true);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(0xFFFFFF);
    });

    it("should handle fractional RGB in toNumber", () => {
      const c = new XColor("#000000", { useDecimal: true });
      c.rgb(100.7, 200.3, 50.9);
      const num = c.toNumber();
      expect(Number.isInteger(num)).toBe(true);
    });
  });

  describe("equals() alpha precision", () => {
    it("should consider colors equal when alpha difference < 0.01", () => {
      const c1 = xcolor("rgba(255, 0, 0, 0.5)");
      const c2 = xcolor("rgba(255, 0, 0, 0.505)");
      expect(c1.equals(c2)).toBe(true);
    });

    it("should consider colors different when alpha differs by >= 0.01", () => {
      const c1 = xcolor("rgba(255, 0, 0, 0.5)");
      const c2 = xcolor("rgba(255, 0, 0, 0.52)");
      expect(c1.equals(c2)).toBe(false);
    });

    it("should consider 0 alpha and 0.005 alpha as equal", () => {
      const c1 = xcolor("rgba(255, 0, 0, 0)");
      const c2 = xcolor("rgba(255, 0, 0, 0.005)");
      expect(c1.equals(c2)).toBe(true);
    });
  });

  describe("isDark/isLight at brightness boundary", () => {
    it("should handle brightness exactly at 128 (classified as dark)", () => {
      // brightness = (r * 299 + g * 587 + b * 114) / 1000
      // isLight() uses > 128 (strictly), so brightness=128 → dark
      const c = xcolor("#808080");
      const brightness = c.brightness();
      expect(brightness).toBe(128);
      expect(c.isLight()).toBe(false);
      expect(c.isDark()).toBe(true);
    });

    it("should handle brightness just above 128", () => {
      // #818181 → brightness = 129
      const c = xcolor("#818181");
      const brightness = c.brightness();
      expect(brightness).toBe(129);
      expect(c.isLight()).toBe(true);
      expect(c.isDark()).toBe(false);
    });

    it("should handle brightness just below 128", () => {
      const c = xcolor("#7f7f7f");
      const brightness = c.brightness();
      expect(brightness).toBe(127);
      expect(c.isLight()).toBe(false);
      expect(c.isDark()).toBe(true);
    });
  });

  describe("chain validation", () => {
    it("should chain multiple operations correctly", () => {
      const c = xcolor("#ff0000")
        .lighten(10)
        .darken(5)
        .saturate(10)
        .desaturate(5)
        .spin(30)
        .fade(0.1)
        .opaquer(0.05);
      expect(c.isValid()).toBe(true);
      expect(c).toBeInstanceOf(XColor);
    });

    it("should chain with negate", () => {
      const c = xcolor("#ff0000").negate();
      expect(c.toHex()).toBe("#00ffff");
      expect(c.isValid()).toBe(true);
    });

    it("should chain clone and modify independently", () => {
      const c1 = xcolor("#ff0000");
      const c2 = c1.clone().lighten(50);
      expect(c1.toHex()).toBe("#ff0000");
      expect(c2.toHex()).not.toBe("#ff0000");
    });

    it("should chain tint and shade", () => {
      const c = xcolor("#ff0000");
      const tinted = c.clone().tint(50);
      const shaded = c.clone().shade(50);
      expect(tinted.lightness()).toBeGreaterThan(c.lightness());
      expect(shaded.lightness()).toBeLessThan(c.lightness());
    });
  });
});
