// =======================================
// Tests: Plugin - CMYK
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import cmyk from "../../src/plugins/cmyk";

beforeAll(() => {
  XColor.extend(cmyk);
});

describe("cmyk plugin", () => {
  describe("object input", () => {
    it("should create color from CMYK object via xcolor()", () => {
      const c = xcolor({ c: 0, m: 100, y: 100, k: 0 });
      expect(c.toHex()).toBe("#ff0000");
    });
  });

  describe("toCmyk", () => {
    it("should convert red to CMYK", () => {
      const c = xcolor("#ff0000");
      const result = c.toCmyk();
      expect(result.c).toBe(0);
      expect(result.m).toBe(100);
      expect(result.y).toBe(100);
      expect(result.k).toBe(0);
    });

    it("should convert green to CMYK", () => {
      const c = xcolor("#00ff00");
      const result = c.toCmyk();
      expect(result.c).toBe(100);
      expect(result.m).toBe(0);
      expect(result.y).toBe(100);
      expect(result.k).toBe(0);
    });

    it("should convert blue to CMYK", () => {
      const c = xcolor("#0000ff");
      const result = c.toCmyk();
      expect(result.c).toBe(100);
      expect(result.m).toBe(100);
      expect(result.y).toBe(0);
      expect(result.k).toBe(0);
    });

    it("should convert white to CMYK", () => {
      const c = xcolor("#ffffff");
      const result = c.toCmyk();
      expect(result.c).toBe(0);
      expect(result.m).toBe(0);
      expect(result.y).toBe(0);
      expect(result.k).toBe(0);
    });

    it("should convert black to CMYK", () => {
      const c = xcolor("#000000");
      const result = c.toCmyk();
      expect(result.c).toBe(0);
      expect(result.m).toBe(0);
      expect(result.y).toBe(0);
      expect(result.k).toBe(100);
    });

    it("should convert gray correctly", () => {
      const c = xcolor("#808080");
      const result = c.toCmyk();
      expect(result.c).toBe(0);
      expect(result.m).toBe(0);
      expect(result.y).toBe(0);
      expect(result.k).toBeCloseTo(50, 0);
    });
  });

  describe("toCmykString", () => {
    it("should output formatted CMYK string", () => {
      const c = xcolor("#ff0000");
      expect(c.toCmykString()).toBe("cmyk(0%, 100%, 100%, 0%)");
    });

    it("should output for black", () => {
      const c = xcolor("#000000");
      expect(c.toCmykString()).toBe("cmyk(0%, 0%, 0%, 100%)");
    });
  });

  describe("toString('cmyk')", () => {
    it("should output CMYK string when format is 'cmyk'", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("cmyk")).toBe("cmyk(0%, 100%, 100%, 0%)");
    });

    it("should output CMYK for black", () => {
      const c = xcolor("#000000");
      expect(c.toString("cmyk")).toBe("cmyk(0%, 0%, 0%, 100%)");
    });

    it("should fallback to default toString for other formats", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("hex")).toBe("#ff0000");
      expect(c.toString("rgb")).toBe("rgb(255, 0, 0)");
    });

    it("should fallback to default toString when no format given", () => {
      const c = xcolor("#ff0000");
      expect(c.toString()).toBe("#ff0000");
    });
  });

  describe("parse cmyk() string", () => {
    it("should parse cmyk string after plugin loaded", () => {
      const c = xcolor("cmyk(0, 100, 100, 0)");
      expect(c.toHex()).toBe("#ff0000");
    });

    it("should parse cmyk with alpha slash", () => {
      const c = xcolor("cmyk(0 100 100 0 / 50%)");
      expect(c.alpha()).toBeCloseTo(0.5, 2);
    });
  });
});
