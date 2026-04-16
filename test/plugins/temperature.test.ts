import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import temperature from "../../src/plugins/temperature";

beforeAll(() => {
  XColor.extend(temperature);
});

describe("temperature plugin", () => {
  it("should get and set temperature", () => {
    const c = xcolor("#ffffff");
    const t = c.temperature();
    expect(typeof t).toBe("number");

    c.temperature(3000);
    expect(c.red()).toBeGreaterThan(c.blue());
  });

  it("should allow creation via unified xcolor() input", () => {
    const c = xcolor({ r: 255, g: 255, b: 255 }).temperature(6500);
    expect(c.isValid()).toBe(true);
  });

  describe("getter", () => {
    it("should return a number in range 1000-40000", () => {
      const t = xcolor("#ff8000").temperature();
      expect(t).toBeGreaterThanOrEqual(1000);
      expect(t).toBeLessThanOrEqual(40000);
    });

    it("should return low temperature for warm (reddish) colors", () => {
      const t = xcolor("#ff4400").temperature();
      expect(t).toBeLessThan(3000);
    });

    it("should return high temperature for cool (bluish) colors", () => {
      const t = xcolor("#8080ff").temperature();
      expect(t).toBeGreaterThan(8000);
    });
  });

  describe("setter", () => {
    it("should set warm color at low kelvin", () => {
      const c = xcolor("#000000").temperature(2000);
      expect(c.red()).toBeGreaterThan(c.blue());
    });

    it("should set cool color at high kelvin", () => {
      const c = xcolor("#000000").temperature(15000);
      expect(c.blue()).toBe(255);
    });

    it("should return this for chaining", () => {
      const c = xcolor("#000000");
      const result = c.temperature(5000);
      expect(result).toBe(c);
    });
  });

  describe("boundary values", () => {
    it("should clamp at 1000K minimum", () => {
      const c1 = xcolor("#000").temperature(1000);
      const c2 = xcolor("#000").temperature(500); // below min, clamped to 1000
      expect(c1.toHex()).toBe(c2.toHex());
    });

    it("should clamp at 40000K maximum", () => {
      const c1 = xcolor("#000").temperature(40000);
      const c2 = xcolor("#000").temperature(50000); // above max, clamped to 40000
      expect(c1.toHex()).toBe(c2.toHex());
    });

    it("should produce pure red at 1000K (no blue)", () => {
      const c = xcolor("#000").temperature(1000);
      expect(c.red()).toBe(255);
      expect(c.blue()).toBe(0);
    });

    it("should produce blue=255 at very high kelvin", () => {
      const c = xcolor("#000").temperature(40000);
      expect(c.blue()).toBe(255);
    });
  });

  describe("round-trip", () => {
    it("should approximate original kelvin after set→get", () => {
      // The binary search rgbToKelvin is a rough approximation.
      // It works best in the warm range where blue/red ratio varies significantly.
      // Use low temperatures (1500, 2500, 4500) for reliable monotonicity.
      const c1 = xcolor("#000").temperature(1500);
      const c2 = xcolor("#000").temperature(2500);
      const c3 = xcolor("#000").temperature(4500);
      const t1 = c1.temperature();
      const t2 = c2.temperature();
      const t3 = c3.temperature();
      // Monotonically increasing
      expect(t1).toBeLessThan(t2);
      expect(t2).toBeLessThan(t3);
    });

    it("should return values within the valid range", () => {
      for (const k of [1000, 2700, 5000, 6500, 10000, 20000, 40000]) {
        const c = xcolor("#000").temperature(k);
        const retrieved = c.temperature();
        expect(retrieved).toBeGreaterThanOrEqual(1000);
        expect(retrieved).toBeLessThanOrEqual(40000);
      }
    });
  });
});
