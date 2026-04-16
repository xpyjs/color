// =======================================
// Tests: Plugin - OKLab & OKLCh
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import oklab from "../../src/plugins/oklab";

beforeAll(() => {
  XColor.extend(oklab);
});

describe("oklab plugin", () => {
  describe("toOklab", () => {
    it("should convert white", () => {
      const r = xcolor("#ffffff").toOklab();
      expect(r.l).toBeCloseTo(1, 1);
      expect(r.a).toBeCloseTo(0, 2);
      expect(r.b).toBeCloseTo(0, 2);
    });

    it("should convert black", () => {
      const r = xcolor("#000000").toOklab();
      expect(r.l).toBeCloseTo(0, 2);
      expect(r.a).toBeCloseTo(0, 2);
      expect(r.b).toBeCloseTo(0, 2);
    });

    it("should convert red", () => {
      const r = xcolor("#ff0000").toOklab();
      expect(r.l).toBeCloseTo(0.6279, 2);
      expect(r.a).toBeCloseTo(0.2249, 2);
      expect(r.b).toBeCloseTo(0.1264, 2);
    });

    it("should convert green", () => {
      const r = xcolor("#00ff00").toOklab();
      expect(r.l).toBeCloseTo(0.8664, 2);
      expect(r.a).toBeCloseTo(-0.2338, 2);
      expect(r.b).toBeCloseTo(0.1795, 2);
    });

    it("should convert blue", () => {
      const r = xcolor("#0000ff").toOklab();
      expect(r.l).toBeCloseTo(0.4520, 2);
      expect(r.a).toBeCloseTo(-0.0324, 2);
      expect(r.b).toBeCloseTo(-0.3116, 2);
    });
  });

  describe("toOklabString", () => {
    it("should output formatted oklab string", () => {
      const str = xcolor("#ffffff").toOklabString();
      expect(str).toMatch(/^oklab\(/);
      expect(str).toMatch(/\)$/);
    });

    it("should contain correct format", () => {
      const str = xcolor("#ff0000").toOklabString();
      expect(str).toMatch(/^oklab\(\d+(\.\d+)? -?\d+(\.\d+)? -?\d+(\.\d+)?\)$/);
    });
  });

  describe("toOklch", () => {
    it("should convert white (achromatic)", () => {
      const r = xcolor("#ffffff").toOklch();
      expect(r.l).toBeCloseTo(1, 1);
      expect(r.c).toBeCloseTo(0, 2);
    });

    it("should convert red", () => {
      const r = xcolor("#ff0000").toOklch();
      expect(r.l).toBeCloseTo(0.6279, 2);
      expect(r.c).toBeGreaterThan(0.2);
      expect(r.h).toBeGreaterThan(20);
      expect(r.h).toBeLessThan(35);
    });

    it("should have hue 0-360 range", () => {
      const r = xcolor("#0000ff").toOklch();
      expect(r.h).toBeGreaterThanOrEqual(0);
      expect(r.h).toBeLessThanOrEqual(360);
    });
  });

  describe("toOklchString", () => {
    it("should output formated oklch string", () => {
      const str = xcolor("#ff0000").toOklchString();
      expect(str).toMatch(/^oklch\(/);
      expect(str).toMatch(/\)$/);
    });
  });

  describe("toString format", () => {
    it("should output oklab via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("oklab")).toBe(c.toOklabString());
    });

    it("should output oklch via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("oklch")).toBe(c.toOklchString());
    });

    it("should not break other toString formats", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("hex")).toBe("#ff0000");
    });
  });

  describe("oklab() string parsing", () => {
    it("should parse oklab() string", () => {
      const c = xcolor("oklab(0.6279 0.2249 0.1264)");
      expect(c.red()).toBeCloseTo(255, 0);
      expect(c.green()).toBeCloseTo(0, 0);
      expect(c.blue()).toBeCloseTo(0, 0);
    });

    it("should parse oklab() with alpha", () => {
      const c = xcolor("oklab(0.6279 0.2249 0.1264 / 0.5)");
      expect(c.alpha()).toBeCloseTo(0.5, 2);
    });

    it("should roundtrip sRGB → OKLab → sRGB", () => {
      const original = xcolor("#cc6633");
      const labStr = original.toOklabString();
      const roundtrip = xcolor(labStr);
      expect(roundtrip.red()).toBeCloseTo(original.red(), 0);
      expect(roundtrip.green()).toBeCloseTo(original.green(), 0);
      expect(roundtrip.blue()).toBeCloseTo(original.blue(), 0);
    });
  });

  describe("oklch() string parsing", () => {
    it("should parse oklch() string", () => {
      const c = xcolor("oklch(0.6279 0.2580 29.23)");
      expect(c.red()).toBeCloseTo(255, 0);
      expect(c.green()).toBeCloseTo(0, 0);
    });

    it("should parse oklch() with alpha", () => {
      const c = xcolor("oklch(0.6279 0.2580 29.23 / 0.8)");
      expect(c.alpha()).toBeCloseTo(0.8, 2);
    });
  });
});
