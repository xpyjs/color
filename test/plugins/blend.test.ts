// =======================================
// Tests: Plugin - Blend
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import blend from "../../src/plugins/blend";

beforeAll(() => {
  XColor.extend(blend);
});

describe("blend plugin", () => {
  describe("multiply", () => {
    it("should darken colors (multiply mode)", () => {
      const c = xcolor("#ff8080");
      const result = c.blend("#808080", "multiply");
      expect(result).toBeInstanceOf(XColor);
      // multiply: (255*128)/255 = 128, (128*128)/255 �?64
      expect(result.r()).toBeCloseTo(128, 0);
      expect(result.g()).toBeCloseTo(64, 0);
    });

    it("should not mutate original", () => {
      const c = xcolor("#ff0000");
      c.blend("#0000ff", "multiply");
      expect(c.toHex()).toBe("#ff0000");
    });
  });

  describe("screen", () => {
    it("should lighten colors (screen mode)", () => {
      const c = xcolor("#808080");
      const result = c.blend("#808080", "screen");
      // screen: 128 + 128 - (128*128)/255 �?192
      expect(result.r()).toBeCloseTo(192, 0);
    });
  });

  describe("overlay", () => {
    it("should combine multiply and screen", () => {
      const c = xcolor("#808080");
      const result = c.blend("#808080", "overlay");
      expect(result).toBeInstanceOf(XColor);
      expect(result.r()).toBeGreaterThanOrEqual(0);
      expect(result.r()).toBeLessThanOrEqual(255);
    });

    it("should apply multiply when base < 128", () => {
      // overlay(64, 128): base=64 < 128, so (2*64*128)/255 ≈ 64
      const result = xcolor("#404040").blend("#808080", "overlay");
      expect(result.r()).toBeCloseTo(64, 0);
    });

    it("should apply screen when base >= 128", () => {
      // overlay(192, 128): base=192 >= 128, so 255 - (2*(255-192)*(255-128))/255 ≈ 192
      const result = xcolor("#c0c0c0").blend("#808080", "overlay");
      expect(result.r()).toBeCloseTo(192, 0);
    });
  });

  describe("darken", () => {
    it("should keep the darker channel", () => {
      const result = xcolor("#ff8040").blend("#80ff40", "darken");
      expect(result.r()).toBe(128); // min(255, 128)
      expect(result.g()).toBe(128); // min(128, 255)
      expect(result.b()).toBe(64);  // min(64, 64)
    });
  });

  describe("lighten", () => {
    it("should keep the lighter channel", () => {
      const result = xcolor("#ff8040").blend("#80ff40", "lighten");
      expect(result.r()).toBe(255); // max(255, 128)
      expect(result.g()).toBe(255); // max(128, 255)
      expect(result.b()).toBe(64);  // max(64, 64)
    });
  });

  describe("dodge", () => {
    it("should brighten (dodge mode)", () => {
      const result = xcolor("#808080").blend("#808080", "dodge");
      expect(result).toBeInstanceOf(XColor);
      expect(result.r()).toBeGreaterThan(128);
    });

    it("should return 255 when blend color is 255", () => {
      const result = xcolor("#808080").blend("#ffffff", "dodge");
      expect(result.r()).toBe(255);
    });
  });

  describe("burn", () => {
    it("should darken (burn mode)", () => {
      const result = xcolor("#808080").blend("#808080", "burn");
      expect(result).toBeInstanceOf(XColor);
      expect(result.r()).toBeLessThan(128);
    });

    it("should return 0 when blend color is 0", () => {
      const result = xcolor("#808080").blend("#000000", "burn");
      expect(result.r()).toBe(0);
    });
  });

  describe("hardLight", () => {
    it("should apply hard light blend", () => {
      const result = xcolor("#808080").blend("#404040", "hardLight");
      expect(result).toBeInstanceOf(XColor);
    });

    it("should apply multiply when blend < 128", () => {
      // hardLight(128, 64): blend=64 < 128, so (2*128*64)/255 ≈ 64
      const result = xcolor("#808080").blend("#404040", "hardLight");
      expect(result.r()).toBeCloseTo(64, 0);
    });

    it("should apply screen when blend >= 128", () => {
      // hardLight(64, 192): blend=192 >= 128, so 255 - (2*(255-64)*(255-192))/255 ≈ 160
      const result = xcolor("#404040").blend("#c0c0c0", "hardLight");
      expect(result.r()).toBeGreaterThan(100);
    });
  });

  describe("softLight", () => {
    it("should apply soft light blend", () => {
      const result = xcolor("#808080").blend("#404040", "softLight");
      expect(result).toBeInstanceOf(XColor);
    });

    it("W3C standard: should darken when blend < 128", () => {
      // softLight with dark blend color should darken the base
      const result = xcolor("#808080").blend("#202020", "softLight");
      expect(result.r()).toBeLessThan(128);
    });

    it("W3C standard: should lighten when blend > 128", () => {
      // softLight with light blend color should lighten the base
      const result = xcolor("#808080").blend("#e0e0e0", "softLight");
      expect(result.r()).toBeGreaterThan(128);
    });

    it("W3C standard: should be identity when blend = 128", () => {
      // softLight with 50% gray should be approximately identity
      const result = xcolor("#808080").blend("#808080", "softLight");
      expect(result.r()).toBeCloseTo(128, 0);
    });

    it("should produce valid results for edge values", () => {
      // Black base
      const r1 = xcolor("#000000").blend("#808080", "softLight");
      expect(r1.r()).toBeGreaterThanOrEqual(0);
      expect(r1.r()).toBeLessThanOrEqual(255);
      // White base
      const r2 = xcolor("#ffffff").blend("#808080", "softLight");
      expect(r2.r()).toBeGreaterThanOrEqual(0);
      expect(r2.r()).toBeLessThanOrEqual(255);
    });
  });

  describe("difference", () => {
    it("should return absolute difference", () => {
      const result = xcolor("#ff0000").blend("#800000", "difference");
      expect(result.r()).toBe(127); // |255-128|
      expect(result.g()).toBe(0);
      expect(result.b()).toBe(0);
    });

    it("should return black for same colors", () => {
      const result = xcolor("#ff0000").blend("#ff0000", "difference");
      expect(result.r()).toBe(0);
      expect(result.g()).toBe(0);
      expect(result.b()).toBe(0);
    });
  });

  describe("exclusion", () => {
    it("should apply exclusion blend", () => {
      const result = xcolor("#808080").blend("#808080", "exclusion");
      expect(result).toBeInstanceOf(XColor);
    });

    it("should compute a + b - 2ab/255", () => {
      // exclusion(128, 128): 128 + 128 - (2*128*128)/255 ≈ 127.5 → clampByte → 127
      const result = xcolor("#808080").blend("#808080", "exclusion");
      expect(result.r()).toBe(127);
    });

    it("should return b when base is 0", () => {
      // exclusion(0, 128): 0 + 128 - 0 = 128
      const result = xcolor("#000000").blend("#808080", "exclusion");
      expect(result.r()).toBeCloseTo(128, 0);
    });

    it("should return 255-b when base is 255", () => {
      // exclusion(255, 128): 255 + 128 - (2*255*128)/255 = 255 + 128 - 256 = 127
      const result = xcolor("#ffffff").blend("#808080", "exclusion");
      expect(result.r()).toBeCloseTo(127, 0);
    });
  });

  describe("error handling", () => {
    it("should throw for unknown blend mode", () => {
      expect(() => {
        xcolor("#ff0000").blend("#0000ff", "unknown" as any);
      }).toThrow("[X-Color] Unknown blend mode: unknown");
    });
  });
});
