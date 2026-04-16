// =======================================
// Tests: Plugin - XYZ (CIE XYZ D65/D50)
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import xyz from "../../src/plugins/xyz";

beforeAll(() => {
  XColor.extend(xyz);
});

describe("xyz plugin", () => {
  describe("toXyz", () => {
    it("should convert white to D65 reference", () => {
      const r = xcolor("#ffffff").toXyz();
      expect(r.x).toBeCloseTo(0.9505, 2);
      expect(r.y).toBeCloseTo(1.0, 2);
      expect(r.z).toBeCloseTo(1.089, 2);
    });

    it("should convert black", () => {
      const r = xcolor("#000000").toXyz();
      expect(r.x).toBeCloseTo(0, 2);
      expect(r.y).toBeCloseTo(0, 2);
      expect(r.z).toBeCloseTo(0, 2);
    });

    it("should convert sRGB red", () => {
      const r = xcolor("#ff0000").toXyz();
      expect(r.x).toBeCloseTo(0.4124, 2);
      expect(r.y).toBeCloseTo(0.2126, 2);
      expect(r.z).toBeCloseTo(0.0193, 2);
    });
  });

  describe("toXyzString", () => {
    it("should output correct format", () => {
      const str = xcolor("#ff0000").toXyzString();
      expect(str).toMatch(/^color\(xyz-d65 /);
    });
  });

  describe("toString format", () => {
    it("should output xyz via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("xyz")).toBe(c.toXyzString());
    });
  });

  describe("color() string parsing", () => {
    it("should parse color(xyz-d65 0.4124 0.2126 0.0193)", () => {
      const c = xcolor("color(xyz-d65 0.4124 0.2126 0.0193)");
      expect(c.red()).toBeCloseTo(255, 0);
      expect(c.green()).toBeCloseTo(0, 0);
      expect(c.blue()).toBeCloseTo(0, 0);
    });

    it("should parse color(xyz 0.4124 0.2126 0.0193) as xyz-d65", () => {
      const c = xcolor("color(xyz 0.4124 0.2126 0.0193)");
      expect(c.red()).toBeCloseTo(255, 0);
    });

    it("should parse color(xyz-d50 ...) correctly", () => {
      const c = xcolor("color(xyz-d50 0.4360 0.2225 0.0139)");
      expect(c.red()).toBeGreaterThan(240);
    });

    it("should roundtrip sRGB → XYZ string → sRGB", () => {
      const original = xcolor("#3366cc");
      const xyzStr = original.toXyzString();
      const roundtrip = xcolor(xyzStr);
      expect(roundtrip.red()).toBeCloseTo(original.red(), 0);
      expect(roundtrip.green()).toBeCloseTo(original.green(), 0);
      expect(roundtrip.blue()).toBeCloseTo(original.blue(), 0);
    });
  });
});
