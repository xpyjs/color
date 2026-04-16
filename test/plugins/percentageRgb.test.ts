// =======================================
// Tests: Plugin - PercentageRgb
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import percentageRgb from "../../src/plugins/percentageRgb";

beforeAll(() => {
  XColor.extend(percentageRgb);
});

describe("percentageRgb plugin", () => {
  describe("toPercentageRgb", () => {
    it("should return percentage-based RGB for pure red", () => {
      const result = xcolor("#ff0000").toPercentageRgb();
      expect(result).toEqual({ r: "100%", g: "0%", b: "0%", a: 1 });
    });

    it("should return percentage-based RGB for mixed color", () => {
      const result = xcolor("#ff8000").toPercentageRgb();
      expect(result.r).toBe("100%");
      expect(result.g).toBe("50%");
      expect(result.b).toBe("0%");
      expect(result.a).toBe(1);
    });

    it("should return percentage-based RGB for white", () => {
      const result = xcolor("#ffffff").toPercentageRgb();
      expect(result).toEqual({ r: "100%", g: "100%", b: "100%", a: 1 });
    });

    it("should return percentage-based RGB for black", () => {
      const result = xcolor("#000000").toPercentageRgb();
      expect(result).toEqual({ r: "0%", g: "0%", b: "0%", a: 1 });
    });

    it("should include alpha value", () => {
      const result = xcolor("rgba(255, 0, 0, 0.5)").toPercentageRgb();
      expect(result.a).toBe(0.5);
    });

    it("should handle gray correctly", () => {
      const result = xcolor("#808080").toPercentageRgb();
      expect(result.r).toBe("50%");
      expect(result.g).toBe("50%");
      expect(result.b).toBe("50%");
    });
  });

  describe("toString('percentageRgb')", () => {
    it("should output rgb with percentages for red (alpha=1)", () => {
      expect(xcolor("#ff0000").toString("percentageRgb")).toBe("rgb(100%, 0%, 0%)");
    });

    it("should output rgb with percentages for mixed color (alpha=1)", () => {
      expect(xcolor("#ff8000").toString("percentageRgb")).toBe("rgb(100%, 50%, 0%)");
    });

    it("should output rgba with alpha < 1", () => {
      expect(xcolor("rgba(255, 0, 0, 0.5)").toString("percentageRgb")).toBe("rgba(100%, 0%, 0%, 0.5)");
    });

    it("should still support default toString formats", () => {
      const c = xcolor("#ff0000");
      // Default toString should still work (hex format)
      expect(c.toString("hex")).toBe("#ff0000");
      expect(c.toString("rgb")).toBe("rgb(255, 0, 0)");
    });
  });
});
