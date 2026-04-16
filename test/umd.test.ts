// =======================================
// Tests: UMD entry (src/umd.ts)
// Validates that the UMD bundle correctly exposes
// all properties on the default export object.
// =======================================

import { describe, it, expect } from "vitest";
import exp from "../src/umd";

describe("UMD export", () => {
  describe("core", () => {
    it("should export xcolor as a callable function", () => {
      expect(typeof exp).toBe("function");
      const c = exp("#ff0000");
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(255);
    });

    it("should export XColor class", () => {
      expect(exp.XColor).toBeDefined();
      expect(typeof exp.XColor).toBe("function");
      const c = new (exp.XColor as any)("#00ff00");
      expect(c.isValid()).toBe(true);
    });
  });

  describe("parsing functions", () => {
    it("should export parseColor", () => {
      expect(typeof exp.parseColor).toBe("function");
      const result = (exp.parseColor as any)("#ff0000");
      expect(result).toBeTruthy();
      expect(result.r).toBe(255);
    });

    it("should export registerColorParser", () => {
      expect(typeof exp.registerColorParser).toBe("function");
      const unreg = (exp.registerColorParser as any)((v: any) => null);
      expect(typeof unreg).toBe("function");
      unreg(); // cleanup
    });

    it("should export parseFunctionalChannels", () => {
      expect(typeof exp.parseFunctionalChannels).toBe("function");
      const result = (exp.parseFunctionalChannels as any)("rgb(10, 20, 30)", "rgb", 3);
      expect(result).toBeTruthy();
      expect(result.channels).toHaveLength(3);
    });

    it("should export parseRgbChannel", () => {
      expect(typeof exp.parseRgbChannel).toBe("function");
    });

    it("should export parseAlphaChannel", () => {
      expect(typeof exp.parseAlphaChannel).toBe("function");
    });

    it("should export parsePercent", () => {
      expect(typeof exp.parsePercent).toBe("function");
    });

    it("should export parseHue", () => {
      expect(typeof exp.parseHue).toBe("function");
    });
  });

  describe("utility functions", () => {
    it("should export clamp", () => {
      expect(typeof exp.clamp).toBe("function");
      expect((exp.clamp as any)(300, 0, 255)).toBe(255);
    });

    it("should export round", () => {
      expect(typeof exp.round).toBe("function");
      expect((exp.round as any)(3.14159, 2)).toBe(3.14);
    });

    it("should export clampByte", () => {
      expect(typeof exp.clampByte).toBe("function");
      expect((exp.clampByte as any)(300)).toBe(255);
    });

    it("should export normalizeSteps", () => {
      expect(typeof exp.normalizeSteps).toBe("function");
      expect((exp.normalizeSteps as any)(1)).toBe(2);
    });

    it("should export rgbaToHex", () => {
      expect(typeof exp.rgbaToHex).toBe("function");
      expect((exp.rgbaToHex as any)(255, 0, 0, 1)).toBe("#ff0000");
    });

    it("should export color space conversions", () => {
      expect(typeof exp.rgbToHsl).toBe("function");
      expect(typeof exp.hslToRgb).toBe("function");
      expect(typeof exp.rgbToHsv).toBe("function");
      expect(typeof exp.hsvToRgb).toBe("function");
    });

    it("should export luminance/contrast functions", () => {
      expect(typeof exp.relativeLuminance).toBe("function");
      expect(typeof exp.contrastRatio).toBe("function");
    });

    it("should export Logger", () => {
      expect(typeof exp.Logger).toBe("object");
      expect(typeof (exp.Logger as any).warn).toBe("function");
      expect(typeof (exp.Logger as any).error).toBe("function");
      expect(typeof (exp.Logger as any).createError).toBe("function");
    });
  });

  describe("plugin access via UMD global", () => {
    it("should allow plugin to register custom parser via global", () => {
      const register = exp.registerColorParser as any;
      const unreg = register((value: any) => {
        if (value === "umd-custom") return { r: 42, g: 84, b: 126, a: 1 };
        return null;
      });

      const c = exp("umd-custom" as any);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(42);
      expect(c.g()).toBe(84);
      expect(c.b()).toBe(126);

      unreg();
    });

    it("should allow plugin loading via use/extend", () => {
      expect(typeof exp.use).toBe("function");
      expect(typeof exp.extend).toBe("function");
    });
  });
});
