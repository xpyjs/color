// =======================================
// Tests: Plugin - Lab & DeltaE
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import lab from "../../src/plugins/lab";

beforeAll(() => {
  XColor.extend(lab);
});

describe("lab plugin", () => {
  describe("toLab", () => {
    it("should convert white", () => {
      const c = xcolor("#ffffff");
      const result = c.toLab();
      expect(result.l).toBeCloseTo(100, 0);
      expect(result.a).toBeCloseTo(0, 0);
      expect(result.b).toBeCloseTo(0, 0);
    });

    it("should convert black", () => {
      const c = xcolor("#000000");
      const result = c.toLab();
      expect(result.l).toBeCloseTo(0, 0);
      expect(result.a).toBeCloseTo(0, 0);
      expect(result.b).toBeCloseTo(0, 0);
    });

    it("should convert red", () => {
      const c = xcolor("#ff0000");
      const result = c.toLab();
      expect(result.l).toBeCloseTo(53.23, 0);
      expect(result.a).toBeCloseTo(80.11, 0);
      expect(result.b).toBeCloseTo(67.22, 0);
    });

    it("should convert blue", () => {
      const c = xcolor("#0000ff");
      const result = c.toLab();
      expect(result.l).toBeCloseTo(32.30, 0);
      expect(result.a).toBeCloseTo(79.20, 0);
      expect(result.b).toBeCloseTo(-107.86, 0);
    });
  });

  describe("toLabString", () => {
    it("should output formatted Lab string", () => {
      const c = xcolor("#ffffff");
      const str = c.toLabString();
      expect(str).toMatch(/^lab\(/);
      expect(str).toMatch(/\)$/);
    });

    it("should output correct format: lab(L% a b)", () => {
      const str = xcolor("#ff0000").toLabString();
      expect(str).toMatch(/^lab\(\d+(\.\d+)?% -?\d+(\.\d+)? -?\d+(\.\d+)?\)$/);
    });

    it("should contain correct values for red", () => {
      const str = xcolor("#ff0000").toLabString();
      const match = str.match(/^lab\(([\d.]+)% ([\d.-]+) ([\d.-]+)\)$/);
      expect(match).not.toBeNull();
      const [, l, a, b] = match!;
      expect(parseFloat(l)).toBeCloseTo(53.23, 0);
      expect(parseFloat(a)).toBeCloseTo(80.11, 0);
      expect(parseFloat(b)).toBeCloseTo(67.22, 0);
    });
  });

  describe("toString('lab')", () => {
    it("should output lab format via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("lab")).toBe(c.toLabString());
    });

    it("should not break other toString formats", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("hex")).toBe("#ff0000");
      expect(c.toString("rgb")).toBe("rgb(255, 0, 0)");
    });
  });

  describe("deltaE", () => {
    it("should return 0 for identical colors", () => {
      const c = xcolor("#ff0000");
      expect(c.deltaE("#ff0000")).toBe(0);
    });

    it("should return small value for similar colors", () => {
      const c = xcolor("#ff0000");
      const de = c.deltaE("#fe0000");
      expect(de).toBeLessThan(2);
      expect(de).toBeGreaterThan(0);
    });

    it("should return large value for different colors", () => {
      const c = xcolor("#ff0000");
      const de = c.deltaE("#0000ff");
      expect(de).toBeGreaterThan(50);
    });

    it("should return max difference for black vs white", () => {
      const c = xcolor("#000000");
      const de = c.deltaE("#ffffff");
      expect(de).toBeGreaterThan(90);
    });

    it("should be symmetric", () => {
      const c1 = xcolor("#ff0000");
      const c2 = xcolor("#00ff00");
      expect(c1.deltaE("#00ff00")).toBeCloseTo(c2.deltaE("#ff0000"), 2);
    });
  });

  describe("lab() string parsing", () => {
    it("should parse lab(53.23% 80.11 67.22) as red", () => {
      const c = xcolor("lab(53.23% 80.11 67.22)");
      expect(c.red()).toBeCloseTo(255, 0);
      expect(c.green()).toBeCloseTo(0, 0);
      expect(c.blue()).toBeCloseTo(0, 0);
    });

    it("should parse lab() with alpha", () => {
      const c = xcolor("lab(53.23% 80.11 67.22 / 0.5)");
      expect(c.alpha()).toBeCloseTo(0.5, 2);
    });

    it("should roundtrip sRGB → lab string → sRGB", () => {
      const original = xcolor("#cc6633");
      const labStr = original.toLabString();
      const roundtrip = xcolor(labStr);
      expect(roundtrip.red()).toBeCloseTo(original.red(), 0);
      expect(roundtrip.green()).toBeCloseTo(original.green(), 0);
      expect(roundtrip.blue()).toBeCloseTo(original.blue(), 0);
    });
  });

  describe("toLch", () => {
    it("should convert red to LCH", () => {
      const r = xcolor("#ff0000").toLch();
      expect(r.l).toBeCloseTo(53.23, 0);
      expect(r.c).toBeGreaterThan(100);
      expect(r.h).toBeGreaterThan(30);
      expect(r.h).toBeLessThan(50);
    });

    it("should have achromatic chroma for white", () => {
      const r = xcolor("#ffffff").toLch();
      expect(r.l).toBeCloseTo(100, 0);
      expect(r.c).toBeCloseTo(0, 0);
    });

    it("should have hue in 0-360 range", () => {
      const r = xcolor("#0000ff").toLch();
      expect(r.h).toBeGreaterThanOrEqual(0);
      expect(r.h).toBeLessThanOrEqual(360);
    });
  });

  describe("toLchString", () => {
    it("should output formatted lch string", () => {
      const str = xcolor("#ff0000").toLchString();
      expect(str).toMatch(/^lch\(/);
      expect(str).toMatch(/\)$/);
    });
  });

  describe("lch() string parsing", () => {
    it("should parse lch() string", () => {
      const original = xcolor("#ff0000");
      const lchStr = original.toLchString();
      const c = xcolor(lchStr);
      expect(c.red()).toBeCloseTo(original.red(), 0);
      expect(c.green()).toBeCloseTo(original.green(), 0);
    });

    it("should parse lch() with alpha", () => {
      const c = xcolor("lch(53.23% 104.55 40 / 0.8)");
      expect(c.alpha()).toBeCloseTo(0.8, 2);
    });
  });

  describe("toString('lch')", () => {
    it("should output lch format via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("lch")).toBe(c.toLchString());
    });
  });
});
