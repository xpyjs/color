// =======================================
// Tests: Plugin - Gradient
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import gradient from "../../src/plugins/gradient";

beforeAll(() => {
  XColor.extend(gradient);
});

describe("gradient plugin", () => {
  describe("gradient", () => {
    it("should generate gradient between two colors", () => {
      const c = xcolor("#ff0000");
      const grad = c.gradient("#0000ff", 5);
      expect(grad).toHaveLength(5);
      // First should be red
      expect(grad[0].r()).toBe(255);
      expect(grad[0].b()).toBe(0);
      // Last should be blue
      expect(grad[4].r()).toBe(0);
      expect(grad[4].b()).toBe(255);
    });

    it("should include intermediate colors", () => {
      const c = xcolor("#ff0000");
      const grad = c.gradient("#0000ff", 3);
      // Middle should be purple-ish
      expect(grad[1].r()).toBeCloseTo(128, 0);
      expect(grad[1].b()).toBeCloseTo(128, 0);
    });

    it("should default to 5 steps", () => {
      const c = xcolor("#ff0000");
      const grad = c.gradient("#0000ff");
      expect(grad).toHaveLength(5);
    });

    it("should normalize single step to 2", () => {
      const c = xcolor("#ff0000");
      const grad = c.gradient("#0000ff", 1);
      expect(grad).toHaveLength(2);
      expect(grad[0].r()).toBe(255);
      expect(grad[1].b()).toBe(255);
    });

    it("should handle 2 steps (start and end)", () => {
      const c = xcolor("#ff0000");
      const grad = c.gradient("#0000ff", 2);
      expect(grad).toHaveLength(2);
      expect(grad[0].r()).toBe(255);
      expect(grad[1].b()).toBe(255);
    });

    it("should not mutate original", () => {
      const c = xcolor("#ff0000");
      c.gradient("#0000ff");
      expect(c.toHex()).toBe("#ff0000");
    });

    it("should interpolate alpha", () => {
      const c = xcolor("rgba(255,0,0,1)");
      const grad = c.gradient("rgba(0,0,255,0)", 3);
      expect(grad[1].a()).toBeCloseTo(0.5, 1);
    });
  });

  describe("tones", () => {
    it("should generate tints and shades", () => {
      const c = xcolor("#ff0000");
      const pal = c.tones(3);
      // 3 shades + original + 3 tints = 7
      expect(pal).toHaveLength(7);
    });

    it("should default to 5 steps each way", () => {
      const c = xcolor("#ff0000");
      const pal = c.tones();
      // 5 shades + original + 5 tints = 11
      expect(pal).toHaveLength(11);
    });

    it("shades should be darker than original", () => {
      const c = xcolor("#ff0000");
      const pal = c.tones(3);
      // First 3 are shades (darker)
      expect(pal[0].brightness()).toBeLessThan(c.brightness());
    });

    it("tints should be lighter than original", () => {
      const c = xcolor("#ff0000");
      const pal = c.tones(3);
      // Last 3 are tints (lighter)
      expect(pal[6].brightness()).toBeGreaterThan(c.brightness());
    });

    it("should not mutate original", () => {
      const c = xcolor("#ff0000");
      c.tones();
      expect(c.toHex()).toBe("#ff0000");
    });

    it("should normalize palette steps < 2 to 2", () => {
      const c = xcolor("#ff0000");
      const pal = c.tones(1);
      // normalizeSteps(1) = 2, so 2 shades + original + 2 tints = 5
      expect(pal).toHaveLength(5);
    });

    it("should handle large palette steps", () => {
      const c = xcolor("#ff0000");
      const pal = c.tones(20);
      // 20 shades + original + 20 tints = 41
      expect(pal).toHaveLength(41);
      // All should be valid colors
      for (const p of pal) {
        expect(p.isValid()).toBe(true);
        expect(p.red()).toBeGreaterThanOrEqual(0);
        expect(p.red()).toBeLessThanOrEqual(255);
      }
    });

    it("should produce monotonic lightness gradient", () => {
      const c = xcolor("#808080");
      const pal = c.tones(5);
      // Shades should get progressively lighter (index 0 is darkest shade)
      for (let i = 0; i < pal.length - 1; i++) {
        expect(pal[i].brightness()).toBeLessThanOrEqual(pal[i + 1].brightness());
      }
    });
  });
});
