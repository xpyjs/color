// =======================================
// Tests: Plugin - HWB
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import hwb from "../../src/plugins/hwb";

beforeAll(() => {
  XColor.extend(hwb);
});

describe("hwb plugin", () => {
  describe("toHwb", () => {
    it("should convert red", () => {
      const r = xcolor("#ff0000").toHwb();
      expect(r.h).toBe(0);
      expect(r.w).toBe(0);
      expect(r.b).toBe(0);
    });

    it("should convert white", () => {
      const r = xcolor("#ffffff").toHwb();
      expect(r.w).toBe(100);
      expect(r.b).toBe(0);
    });

    it("should convert black", () => {
      const r = xcolor("#000000").toHwb();
      expect(r.w).toBe(0);
      expect(r.b).toBe(100);
    });

    it("should convert grey", () => {
      const r = xcolor("#808080").toHwb();
      expect(r.w).toBeCloseTo(50.2, 0);
      expect(r.b).toBeCloseTo(49.8, 0);
    });

    it("should convert green", () => {
      const r = xcolor("#00ff00").toHwb();
      expect(r.h).toBe(120);
      expect(r.w).toBe(0);
      expect(r.b).toBe(0);
    });

    it("should convert blue", () => {
      const r = xcolor("#0000ff").toHwb();
      expect(r.h).toBe(240);
      expect(r.w).toBe(0);
      expect(r.b).toBe(0);
    });
  });

  describe("toHwbString", () => {
    it("should output hwb string for red", () => {
      const str = xcolor("#ff0000").toHwbString();
      expect(str).toBe("hwb(0 0% 0%)");
    });

    it("should output correct format", () => {
      const str = xcolor("#cc6633").toHwbString();
      expect(str).toMatch(/^hwb\(\d+(\.\d+)? \d+(\.\d+)?% \d+(\.\d+)?%\)$/);
    });
  });

  describe("toString format", () => {
    it("should output hwb via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("hwb")).toBe(c.toHwbString());
    });

    it("should not break other toString formats", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("hex")).toBe("#ff0000");
    });
  });

  describe("hwb() string parsing", () => {
    it("should parse hwb(0 0% 0%) as red", () => {
      const c = xcolor("hwb(0 0% 0%)");
      expect(c.red()).toBe(255);
      expect(c.green()).toBe(0);
      expect(c.blue()).toBe(0);
    });

    it("should parse hwb with alpha", () => {
      const c = xcolor("hwb(0 0% 0% / 0.5)");
      expect(c.red()).toBe(255);
      expect(c.alpha()).toBeCloseTo(0.5, 2);
    });

    it("should parse hwb(120 0 0) as green", () => {
      const c = xcolor("hwb(120 0% 0%)");
      expect(c.green()).toBe(255);
      expect(c.red()).toBe(0);
    });

    it("should parse hwb with whiteness and blackness", () => {
      const c = xcolor("hwb(0 50% 50%)");
      // When w + b = 100%, result is grey
      expect(c.red()).toBeCloseTo(c.green(), 0);
      expect(c.green()).toBeCloseTo(c.blue(), 0);
    });
  });

  describe("roundtrip", () => {
    it("should roundtrip sRGB → HWB string → sRGB", () => {
      const original = xcolor("#cc6633");
      const hwbStr = original.toHwbString();
      const roundtrip = xcolor(hwbStr);
      expect(roundtrip.red()).toBeCloseTo(original.red(), 0);
      expect(roundtrip.green()).toBeCloseTo(original.green(), 0);
      expect(roundtrip.blue()).toBeCloseTo(original.blue(), 0);
    });
  });
});
