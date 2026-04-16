// =======================================
// Tests: Plugin - A11y (Accessibility)
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import a11y from "../../src/plugins/a11y";

beforeAll(() => {
  XColor.extend(a11y);
});

describe("a11y plugin", () => {
  describe("isReadable", () => {
    it("should return true for black text on white background", () => {
      const text = xcolor("#000000");
      expect(text.isReadable("#ffffff")).toBe(true);
    });

    it("should return false for white text on white background", () => {
      const text = xcolor("#ffffff");
      expect(text.isReadable("#ffffff")).toBe(false);
    });

    it("should check AA normal text by default", () => {
      const text = xcolor("#767676"); // Just meets AA normal
      // Contrast ratio of #767676 on white is ~4.54:1
      expect(text.isReadable("#ffffff", { level: "AA", size: "normal" })).toBe(true);
    });

    it("should check AAA level", () => {
      const text = xcolor("#767676");
      // Contrast ratio ~4.54 doesn't meet AAA normal (7:1)
      expect(text.isReadable("#ffffff", { level: "AAA", size: "normal" })).toBe(false);
    });

    it("should check large text threshold", () => {
      const text = xcolor("#888888");
      // Contrast ratio of #888 on white is ~3.54:1, meets AA large (3:1)
      expect(text.isReadable("#ffffff", { level: "AA", size: "large" })).toBe(true);
    });
  });

  describe("mostReadable", () => {
    it("should return the most contrasting color", () => {
      const bg = xcolor("#ffffff");
      const best = bg.mostReadable(["#000000", "#808080", "#ffffff"]);
      expect(best.toHex()).toBe("#000000");
    });

    it("should handle empty-like lists with fallback", () => {
      const bg = xcolor("#ffffff");
      const best = bg.mostReadable(["#fefefe"]);
      expect(best).toBeInstanceOf(XColor);
    });

    it("should fallback to black/white when level not met", () => {
      const bg = xcolor("#808080");
      const best = bg.mostReadable(["#7f7f7f"], { level: "AAA" });
      // Should fallback to black or white
      const hex = best.toHex();
      expect(hex === "#000000" || hex === "#ffffff").toBe(true);
    });

    it("should fallback to black/white for empty array", () => {
      const bg = xcolor("#ffffff");
      const best = bg.mostReadable([]);
      expect(best).toBeInstanceOf(XColor);
      // White background → should fallback to black
      expect(best.toHex()).toBe("#000000");
    });

    it("should fallback for dark background with empty array", () => {
      const bg = xcolor("#000000");
      const best = bg.mostReadable([]);
      expect(best).toBeInstanceOf(XColor);
      // Black background → should fallback to white
      expect(best.toHex()).toBe("#ffffff");
    });

    it("should handle all unreadable candidates at AA level", () => {
      const bg = xcolor("#808080");
      // All very similar grays - none will meet AA threshold (4.5:1)
      const best = bg.mostReadable(["#7e7e7e", "#7f7f7f", "#818181"], { level: "AA" });
      expect(best).toBeInstanceOf(XColor);
      const hex = best.toHex();
      expect(hex === "#000000" || hex === "#ffffff").toBe(true);
    });
  });

  describe("wcagLevel", () => {
    it("should return AAA for high contrast", () => {
      const c = xcolor("#000000");
      const result = c.wcagLevel("#ffffff");
      expect(result.level).toBe("AAA");
      expect(result.largeText).toBe("AAA");
      expect(result.ratio).toBe(21);
    });

    it("should return FAIL for low contrast", () => {
      const c = xcolor("#ffffff");
      const result = c.wcagLevel("#fefefe");
      expect(result.level).toBe("FAIL");
    });

    it("should distinguish between normal and large text compliance", () => {
      // Find a color with contrast between 3 and 4.5
      const c = xcolor("#888888");
      const result = c.wcagLevel("#ffffff");
      // Contrast ~3.54, passes AA large but not AA normal
      expect(result.ratio).toBeGreaterThan(3);
      expect(result.ratio).toBeLessThan(4.5);
      expect(result.level).toBe("FAIL");
      expect(result.largeText).toBe("AA");
    });
  });
});
