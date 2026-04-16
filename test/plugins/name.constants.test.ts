// =======================================
// Tests: Name plugin constants
// =======================================

import { describe, it, expect } from "vitest";
import { NAMED_COLORS } from "../../src/plugins/name/constants";

describe("name plugin constants", () => {
  describe("NAMED_COLORS", () => {
    it("should contain common colors", () => {
      expect(NAMED_COLORS["red"]).toBe("#ff0000");
      expect(NAMED_COLORS["blue"]).toBe("#0000ff");
      expect(NAMED_COLORS["green"]).toBe("#008000");
      expect(NAMED_COLORS["white"]).toBe("#ffffff");
      expect(NAMED_COLORS["black"]).toBe("#000000");
    });

    it("should contain transparent", () => {
      expect(NAMED_COLORS["transparent"]).toBe("#00000000");
    });

    it("should contain all 148 CSS colors", () => {
      const count = Object.keys(NAMED_COLORS).length;
      expect(count).toBeGreaterThanOrEqual(140);
    });

    it("should have lowercase keys", () => {
      for (const key of Object.keys(NAMED_COLORS)) {
        expect(key).toBe(key.toLowerCase());
      }
    });

    it("should have valid hex values", () => {
      for (const hex of Object.values(NAMED_COLORS)) {
        expect(hex).toMatch(/^#[0-9a-f]{6,8}$/);
      }
    });
  });
});
