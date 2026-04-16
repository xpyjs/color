// =======================================
// Tests: Plugin - Name (closest color name)
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import name from "../../src/plugins/name";

beforeAll(() => {
  XColor.extend(name);
});

describe("name plugin", () => {
  describe("toName / toString(name)", () => {
    it("should return named color if exact match", () => {
      expect(xcolor("#ff0000").toName()).toBe("red");
    });

    it("should return undefined for non-named colors", () => {
      expect(xcolor("#f1f2f3").toName()).toBeUndefined();
    });

    it("should return undefined when alpha < 1", () => {
      expect(xcolor("rgba(255, 0, 0, 0.5)").toName()).toBeUndefined();
    });

    it("should return transparent when alpha is 0", () => {
      expect(xcolor("rgba(0, 0, 0, 0)").toName()).toBe("transparent");
    });

    it("should support name format via toString", () => {
      expect(xcolor("#ff0000").toString("name")).toBe("red");
      expect(xcolor("#f1f2f3").toString("name")).toBe("#f1f2f3");
    });
  });

  describe("closestName", () => {
    it("should find exact match", () => {
      expect(xcolor("#ff0000").closestName()).toBe("red");
      expect(xcolor("#0000ff").closestName()).toBe("blue");
      expect(xcolor("#ffffff").closestName()).toBe("white");
    });

    it("should find closest name for non-exact colors", () => {
      // A reddish color should be closest to red
      const name = xcolor("#fe0000").closestName();
      expect(name).toBe("red");
    });

    it("should find closest for arbitrary colors", () => {
      const name = xcolor("#f1f2f3").closestName();
      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
    });

    it("should return a string always", () => {
      const c = xcolor("#abcdef");
      expect(typeof c.closestName()).toBe("string");
    });

    it("should find black for #000000", () => {
      expect(xcolor("#000000").closestName()).toBe("black");
    });

    it("should find a name for gray (#808080)", () => {
      const name = xcolor("#808080").closestName();
      expect(name).toBe("gray");
    });

    it("should handle near-primary colors correctly", () => {
      // Near-green: should be closest to lime or green
      const nearGreen = xcolor("#01ff01").closestName();
      expect(nearGreen).toBe("lime");
    });

    it("should handle mid-range colors", () => {
      // #ff8c00 is darkorange exact
      expect(xcolor("#ff8c00").closestName()).toBe("darkorange");
    });
  });

  describe("xcolor(name)", () => {
    it("should be case-insensitive", () => {
      const c = xcolor("Red");
      expect(c.toHex()).toBe("#ff0000");
    });

    it("should work with complex color names", () => {
      const c = xcolor("cornflowerblue");
      expect(c.toHex()).toBe("#6495ed");
    });

    it("hex(value) should support named colors after plugin enabled", () => {
      const c = xcolor("#000").hex("red");
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(0);
      expect(c.b()).toBe(0);
    });
  });
});
