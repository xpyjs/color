// =======================================
// Tests: Plugin - ProPhoto RGB
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import proPhotoRgb from "../../src/plugins/proPhotoRgb";

beforeAll(() => {
  XColor.extend(proPhotoRgb);
});

describe("proPhotoRgb plugin", () => {
  describe("toProPhotoRgb", () => {
    it("should convert white", () => {
      const r = xcolor("#ffffff").toProPhotoRgb();
      expect(r.r).toBeCloseTo(1, 2);
      expect(r.g).toBeCloseTo(1, 2);
      expect(r.b).toBeCloseTo(1, 2);
    });

    it("should convert black", () => {
      const r = xcolor("#000000").toProPhotoRgb();
      expect(r.r).toBeCloseTo(0, 2);
      expect(r.g).toBeCloseTo(0, 2);
      expect(r.b).toBeCloseTo(0, 2);
    });
  });

  describe("toProPhotoRgbString", () => {
    it("should output correct format", () => {
      const str = xcolor("#ff0000").toProPhotoRgbString();
      expect(str).toMatch(/^color\(prophoto-rgb /);
    });
  });

  describe("toString format", () => {
    it("should output proPhotoRgb via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("proPhotoRgb")).toBe(c.toProPhotoRgbString());
    });
  });

  describe("color() string parsing", () => {
    it("should parse color(prophoto-rgb 1 0 0)", () => {
      const c = xcolor("color(prophoto-rgb 1 0 0)");
      expect(c.red()).toBeGreaterThan(200);
    });
  });
});
