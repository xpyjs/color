// =======================================
// Tests: Plugin - A98-RGB
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import a98Rgb from "../../src/plugins/a98Rgb";

beforeAll(() => {
  XColor.extend(a98Rgb);
});

describe("a98Rgb plugin", () => {
  describe("toA98Rgb", () => {
    it("should convert white", () => {
      const r = xcolor("#ffffff").toA98Rgb();
      expect(r.r).toBeCloseTo(1, 2);
      expect(r.g).toBeCloseTo(1, 2);
      expect(r.b).toBeCloseTo(1, 2);
    });

    it("should convert black", () => {
      const r = xcolor("#000000").toA98Rgb();
      expect(r.r).toBeCloseTo(0, 2);
      expect(r.g).toBeCloseTo(0, 2);
      expect(r.b).toBeCloseTo(0, 2);
    });

    it("should convert pure sRGB red", () => {
      const r = xcolor("#ff0000").toA98Rgb();
      expect(r.r).toBeGreaterThan(0.8);
      expect(r.r).toBeLessThanOrEqual(1);
    });
  });

  describe("toA98RgbString", () => {
    it("should output correct format", () => {
      const str = xcolor("#ff0000").toA98RgbString();
      expect(str).toMatch(/^color\(a98-rgb /);
    });
  });

  describe("toString format", () => {
    it("should output a98Rgb via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("a98Rgb")).toBe(c.toA98RgbString());
    });
  });

  describe("color() string parsing", () => {
    it("should parse color(a98-rgb 1 0 0)", () => {
      const c = xcolor("color(a98-rgb 1 0 0)");
      expect(c.red()).toBeGreaterThan(240);
    });
  });
});
