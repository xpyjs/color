import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import scale from "../../src/plugins/scale";

beforeAll(() => {
  XColor.extend(scale);
});

describe("scale plugin", () => {
  it("should generate scale with default steps", () => {
    const colors = xcolor("#ff0000").scale("#0000ff");
    expect(colors).toHaveLength(5);
    expect(colors[0].toHex()).toBe("#ff0000");
    expect(colors[4].toHex()).toBe("#0000ff");
  });

  it("should interpolate single point with at()", () => {
    const c = xcolor("#ff0000").at("#0000ff", 0.5);
    expect(c.red()).toBeCloseTo(128, 0);
    expect(c.blue()).toBeCloseTo(128, 0);
  });

  it("should support hsl interpolation", () => {
    const c = xcolor("#ff0000").at("#00ff00", 0.5, { space: "hsl" });
    expect(c.hue()).toBeCloseTo(60, 0);
  });

  describe("easing functions", () => {
    it("should apply easeIn (slow start)", () => {
      const linear = xcolor("#000000").at("#ffffff", 0.5, { easing: "linear" });
      const easeIn = xcolor("#000000").at("#ffffff", 0.5, { easing: "easeIn" });
      // easeIn at t=0.5 → 0.25, so channels should be lower than linear
      expect(easeIn.red()).toBeLessThan(linear.red());
    });

    it("should apply easeOut (slow end)", () => {
      const linear = xcolor("#000000").at("#ffffff", 0.5, { easing: "linear" });
      const easeOut = xcolor("#000000").at("#ffffff", 0.5, { easing: "easeOut" });
      // easeOut at t=0.5 → 0.75, so channels should be higher than linear
      expect(easeOut.red()).toBeGreaterThan(linear.red());
    });

    it("should apply easeInOut", () => {
      const easeInOut = xcolor("#000000").at("#ffffff", 0.5, { easing: "easeInOut" });
      // easeInOut at t=0.5 → 0.5 (inflection point)
      expect(easeInOut.red()).toBeCloseTo(128, 0);
    });

    it("easing at t=0 and t=1 should match endpoints", () => {
      for (const easing of ["easeIn", "easeOut", "easeInOut"] as const) {
        const start = xcolor("#ff0000").at("#0000ff", 0, { easing });
        const end = xcolor("#ff0000").at("#0000ff", 1, { easing });
        expect(start.toHex()).toBe("#ff0000");
        expect(end.toHex()).toBe("#0000ff");
      }
    });
  });

  describe("t boundary values", () => {
    it("at t=0 should return start color", () => {
      const c = xcolor("#ff0000").at("#0000ff", 0);
      expect(c.toHex()).toBe("#ff0000");
    });

    it("at t=1 should return end color", () => {
      const c = xcolor("#ff0000").at("#0000ff", 1);
      expect(c.toHex()).toBe("#0000ff");
    });

    it("should clamp t < 0 to 0", () => {
      const c = xcolor("#ff0000").at("#0000ff", -0.5);
      expect(c.toHex()).toBe("#ff0000");
    });

    it("should clamp t > 1 to 1", () => {
      const c = xcolor("#ff0000").at("#0000ff", 2);
      expect(c.toHex()).toBe("#0000ff");
    });

    it("should handle NaN t as 0", () => {
      const c = xcolor("#ff0000").at("#0000ff", NaN);
      expect(c.toHex()).toBe("#ff0000");
    });
  });

  describe("steps boundary values", () => {
    it("should enforce minimum 2 steps", () => {
      const colors = xcolor("#ff0000").scale("#0000ff", { steps: 1 });
      expect(colors.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle steps = 2", () => {
      const colors = xcolor("#ff0000").scale("#0000ff", { steps: 2 });
      expect(colors).toHaveLength(2);
      expect(colors[0].toHex()).toBe("#ff0000");
      expect(colors[1].toHex()).toBe("#0000ff");
    });

    it("should handle large steps", () => {
      const colors = xcolor("#000000").scale("#ffffff", { steps: 100 });
      expect(colors).toHaveLength(100);
      expect(colors[0].toHex()).toBe("#000000");
      expect(colors[99].toHex()).toBe("#ffffff");
    });
  });

  describe("HSL interpolation", () => {
    it("should take shortest hue path", () => {
      // Red (0°) to blue (240°): shortest path goes through magenta (300°→0°→240° = -120° path)
      const mid = xcolor("#ff0000").at("#0000ff", 0.5, { space: "hsl" });
      // But actually: 240 - 0 = 240, > 180, so dh = 240-360 = -120
      // h = 0 + (-120)*0.5 = -60 → +360 = 300
      expect(mid.hue()).toBeCloseTo(300, 0);
    });

    it("should wrap hue from 350° to 10° via shortest path", () => {
      // 350° → 10°: dh = 10-350 = -340, < -180, so dh += 360 = 20
      // midpoint: 350 + 20*0.5 = 360 → 0
      const start = xcolor("hsl(350, 100%, 50%)");
      const end = xcolor("hsl(10, 100%, 50%)");
      const mid = start.at(end, 0.5, { space: "hsl" });
      // Should go through 0/360 not through 180
      expect(mid.hue()).toBeCloseTo(0, 0);
    });

    it("should wrap hue from 10° to 350° via shortest path", () => {
      // 10° → 350°: dh = 350-10 = 340, > 180, so dh -= 360 = -20
      // midpoint: 10 + (-20)*0.5 = 0
      const start = xcolor("hsl(10, 100%, 50%)");
      const end = xcolor("hsl(350, 100%, 50%)");
      const mid = start.at(end, 0.5, { space: "hsl" });
      expect(mid.hue()).toBeCloseTo(0, 0);
    });

    it("should interpolate saturation and lightness in HSL", () => {
      const start = xcolor("hsl(0, 100%, 50%)");
      const end = xcolor("hsl(0, 0%, 100%)");
      const mid = start.at(end, 0.5, { space: "hsl" });
      expect(mid.saturation()).toBeCloseTo(50, 0);
      expect(mid.lightness()).toBeCloseTo(75, 0);
    });

    it("should interpolate alpha in HSL space", () => {
      const start = xcolor("rgba(255, 0, 0, 1)");
      const end = xcolor("rgba(0, 0, 255, 0)");
      const mid = start.at(end, 0.5, { space: "hsl" });
      expect(mid.alpha()).toBeCloseTo(0.5, 1);
    });
  });

  describe("alpha interpolation", () => {
    it("should interpolate alpha values", () => {
      const start = xcolor("rgba(255, 0, 0, 1)");
      const end = xcolor("rgba(0, 0, 255, 0)");
      const mid = start.at(end, 0.5);
      expect(mid.alpha()).toBeCloseTo(0.5, 1);
    });
  });
});
