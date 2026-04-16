// =======================================
// Tests: Plugin - Display P3
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import displayP3 from "../../src/plugins/displayP3";

beforeAll(() => {
  XColor.extend(displayP3);
});

describe("displayP3 plugin", () => {
  describe("toDisplayP3", () => {
    it("should convert white", () => {
      const r = xcolor("#ffffff").toDisplayP3();
      expect(r.r).toBeCloseTo(1, 2);
      expect(r.g).toBeCloseTo(1, 2);
      expect(r.b).toBeCloseTo(1, 2);
    });

    it("should convert black", () => {
      const r = xcolor("#000000").toDisplayP3();
      expect(r.r).toBeCloseTo(0, 2);
      expect(r.g).toBeCloseTo(0, 2);
      expect(r.b).toBeCloseTo(0, 2);
    });

    it("should convert red (sRGB red maps to within P3 gamut)", () => {
      const r = xcolor("#ff0000").toDisplayP3();
      expect(r.r).toBeGreaterThan(0.9);
      expect(r.r).toBeLessThanOrEqual(1);
      expect(r.g).toBeLessThan(0.25);
      expect(r.b).toBeLessThan(0.15);
    });
  });

  describe("toDisplayP3String", () => {
    it("should output correct format", () => {
      const str = xcolor("#ff0000").toDisplayP3String();
      expect(str).toMatch(/^color\(display-p3 /);
      expect(str).toMatch(/\)$/);
    });
  });

  describe("toString format", () => {
    it("should output displayP3 via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("displayP3")).toBe(c.toDisplayP3String());
    });

    it("should not break other toString formats", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("hex")).toBe("#ff0000");
    });
  });

  describe("color() string parsing", () => {
    it("should parse color(display-p3 1 0 0)", () => {
      const c = xcolor("color(display-p3 1 0 0)");
      expect(c.red()).toBeGreaterThan(240);
      expect(c.green()).toBeCloseTo(0, -1);
    });

    it("should parse color(display-p3 ...) with alpha", () => {
      const c = xcolor("color(display-p3 1 0 0 / 0.5)");
      expect(c.alpha()).toBeCloseTo(0.5, 2);
    });

    it("should roundtrip sRGB → Display P3 string → sRGB", () => {
      const original = xcolor("#cc6633");
      const p3Str = original.toDisplayP3String();
      const roundtrip = xcolor(p3Str);
      expect(roundtrip.red()).toBeCloseTo(original.red(), 0);
      expect(roundtrip.green()).toBeCloseTo(original.green(), 0);
      expect(roundtrip.blue()).toBeCloseTo(original.blue(), 0);
    });
  });
});
