// =======================================
// Tests: Core xcolor class
// =======================================

import { describe, it, expect, vi } from "vitest";
import { XColor, xcolor } from "../src/core";

describe("xcolor constructor", () => {
  it("should create from hex string", () => {
    const c = new XColor("#ff0000");
    expect(c.r()).toBe(255);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
    expect(c.a()).toBe(1);
  });

  it("should create from 3-char hex", () => {
    const c = new XColor("#f00");
    expect(c.r()).toBe(255);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
  });

  it("should create from 8-char hex with alpha", () => {
    const c = new XColor("#ff000080");
    expect(c.r()).toBe(255);
    expect(c.a()).toBeCloseTo(0.502, 1);
  });

  it("should create from rgb string", () => {
    const c = new XColor("rgb(100, 150, 200)");
    expect(c.r()).toBe(100);
    expect(c.g()).toBe(150);
    expect(c.b()).toBe(200);
  });

  it("should create from rgba string", () => {
    const c = new XColor("rgba(100, 150, 200, 0.5)");
    expect(c.r()).toBe(100);
    expect(c.a()).toBe(0.5);
  });

  it("should create from hsl string", () => {
    const c = new XColor("hsl(0, 100%, 50%)");
    expect(c.r()).toBe(255);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
  });

  it("should not parse named color without name plugin", () => {
    const c = new XColor("red");
    expect(c.isValid()).toBe(false);
  });

  it("should create from RGBA object", () => {
    const c = new XColor({ r: 100, g: 150, b: 200, a: 0.8 });
    expect(c.r()).toBe(100);
    expect(c.g()).toBe(150);
    expect(c.b()).toBe(200);
    expect(c.a()).toBe(0.8);
  });

  it("should create from partial object", () => {
    const c = new XColor({ r: 255 });
    expect(c.r()).toBe(255);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
    expect(c.a()).toBe(1);
  });

  it("should create from HSLA object", () => {
    const c = new XColor({ h: 120, s: 100, l: 50, a: 0.25 });
    expect(c.r()).toBe(0);
    expect(c.g()).toBe(255);
    expect(c.b()).toBe(0);
    expect(c.a()).toBe(0.25);
  });

  it("should create from HSVA object", () => {
    const c = new XColor({ h: 240, s: 100, v: 100, a: 0.75 });
    expect(c.r()).toBe(0);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(255);
    expect(c.a()).toBe(0.75);
  });

  it("should create from number", () => {
    const c = new XColor(0xFF0000);
    expect(c.r()).toBe(255);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
  });

  it("should create from another xcolor instance", () => {
    const original = new XColor("#ff0000");
    const copy = new XColor(original);
    expect(copy.r()).toBe(255);
    expect(copy.g()).toBe(0);
    expect(copy.b()).toBe(0);
  });

  it("should default to black when no argument", () => {
    const c = new XColor();
    expect(c.r()).toBe(0);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
    expect(c.a()).toBe(1);
    expect(c.isValid()).toBe(true);
  });

  it("should default to black for null", () => {
    const c = new XColor(null as any);
    expect(c.isValid()).toBe(true);
    expect(c.r()).toBe(0);
  });

  it("should mark invalid colors", () => {
    const c = new XColor("not-a-color");
    expect(c.isValid()).toBe(false);
    expect(c.r()).toBe(0);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
  });
});

describe("xcolor channel get/set", () => {
  it("should get/set red", () => {
    const c = new XColor("#000000");
    expect(c.red()).toBe(0);
    c.red(128);
    expect(c.red()).toBe(128);
    expect(c.r()).toBe(128);
  });

  it("should get/set green", () => {
    const c = new XColor("#000000");
    c.green(200);
    expect(c.green()).toBe(200);
    expect(c.g()).toBe(200);
  });

  it("should get/set blue", () => {
    const c = new XColor("#000000");
    c.blue(100);
    expect(c.blue()).toBe(100);
    expect(c.b()).toBe(100);
  });

  it("should get/set alpha", () => {
    const c = new XColor("#ff0000");
    expect(c.alpha()).toBe(1);
    c.alpha(0.5);
    expect(c.alpha()).toBe(0.5);
    expect(c.a()).toBe(0.5);
  });

  it("should clamp channel values", () => {
    const c = new XColor("#000000");
    c.red(300);
    expect(c.red()).toBe(255);
    c.green(-10);
    expect(c.green()).toBe(0);
    c.alpha(2);
    expect(c.alpha()).toBe(1);
    c.alpha(-1);
    expect(c.alpha()).toBe(0);
  });

  it("should support chaining on set", () => {
    const c = new XColor("#000000");
    const result = c.red(255).green(128).blue(64).alpha(0.5);
    expect(result).toBe(c);
    expect(c.r()).toBe(255);
    expect(c.g()).toBe(128);
    expect(c.b()).toBe(64);
    expect(c.a()).toBe(0.5);
  });
});

describe("xcolor hue/saturation/lightness", () => {
  it("should get hue", () => {
    const c = new XColor("#ff0000");
    expect(c.hue()).toBe(0);
  });

  it("should set hue", () => {
    const c = new XColor("#ff0000");
    c.hue(120);
    expect(c.g()).toBe(255);
    expect(c.r()).toBe(0);
  });

  it("should handle negative hue (wrapping)", () => {
    const c = new XColor("#ff0000");
    c.hue(-60);
    expect(c.hue()).toBeCloseTo(300, 0);
  });

  it("should get saturation", () => {
    const c = new XColor("#ff0000");
    expect(c.saturation()).toBe(100);
  });

  it("should set saturation", () => {
    const c = new XColor("#ff0000");
    c.saturation(50);
    expect(c.saturation()).toBeCloseTo(50, 0);
  });

  it("should get lightness", () => {
    const c = new XColor("#ff0000");
    expect(c.lightness()).toBe(50);
  });

  it("should set lightness", () => {
    const c = new XColor("#ff0000");
    c.lightness(75);
    expect(c.lightness()).toBeCloseTo(75, 0);
  });
});

describe("xcolor output methods", () => {
  describe("toHex", () => {
    it("should output #RRGGBB", () => {
      expect(new XColor("#ff0000").toHex()).toBe("#ff0000");
    });

    it("should output #RGB when allowed", () => {
      expect(new XColor("#ff0000").toHex(true)).toBe("#f00");
    });

    it("should output #RRGGBBAA when alpha < 1", () => {
      const c = new XColor("rgba(255, 0, 0, 0.5)");
      expect(c.toHex()).toBe("#ff000080");
    });

    it("should force alpha when requested", () => {
      expect(new XColor("#ff0000").toHex(false, true)).toBe("#ff0000ff");
    });
  });

  describe("toHexString", () => {
    it("should be alias for toHex", () => {
      const c = new XColor("#ff0000");
      expect(c.toHexString()).toBe(c.toHex());
    });
  });

  describe("toRgb", () => {
    it("should output RGBA object", () => {
      const rgb = new XColor("#ff8000").toRgb();
      expect(rgb).toEqual({ r: 255, g: 128, b: 0, a: 1 });
    });

    it("should include alpha", () => {
      const c = new XColor("rgba(255, 0, 0, 0.5)");
      expect(c.toRgb().a).toBe(0.5);
    });
  });

  describe("toRgbString", () => {
    it("should output rgb() when alpha is 1", () => {
      expect(new XColor("#ff0000").toRgbString()).toBe("rgb(255, 0, 0)");
    });

    it("should output rgba() when alpha < 1", () => {
      expect(new XColor("rgba(255, 0, 0, 0.5)").toRgbString()).toBe("rgba(255, 0, 0, 0.5)");
    });
  });

  describe("toRgbArray", () => {
    it("should output [r, g, b, a]", () => {
      expect(new XColor("#ff8000").toRgbArray()).toEqual([255, 128, 0, 1]);
    });
  });

  describe("toHsl", () => {
    it("should output HSLA object", () => {
      const hsl = new XColor("#ff0000").toHsl();
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
      expect(hsl.a).toBe(1);
    });
  });

  describe("toHslString", () => {
    it("should output hsl() when alpha is 1", () => {
      expect(new XColor("#ff0000").toHslString()).toBe("hsl(0, 100%, 50%)");
    });

    it("should output hsla() when alpha < 1", () => {
      expect(new XColor("rgba(255, 0, 0, 0.5)").toHslString()).toBe("hsla(0, 100%, 50%, 0.5)");
    });
  });

  describe("toHsv", () => {
    it("should output HSVA object", () => {
      const hsv = new XColor("#ff0000").toHsv();
      expect(hsv.h).toBe(0);
      expect(hsv.s).toBe(100);
      expect(hsv.v).toBe(100);
      expect(hsv.a).toBe(1);
    });
  });

  describe("toHsvString", () => {
    it("should output hsv() when alpha is 1", () => {
      expect(new XColor("#ff0000").toHsvString()).toBe("hsv(0, 100%, 100%)");
    });

    it("should output hsva() when alpha < 1", () => {
      expect(new XColor("rgba(255, 0, 0, 0.5)").toHsvString()).toBe("hsva(0, 100%, 100%, 0.5)");
    });
  });

  describe("toNumber", () => {
    it("should output integer value", () => {
      expect(new XColor("#ff0000").toNumber()).toBe(0xFF0000);
      expect(new XColor("#000000").toNumber()).toBe(0);
      expect(new XColor("#ffffff").toNumber()).toBe(0xFFFFFF);
    });
  });

  describe("toObject", () => {
    it("should be alias for toRgb", () => {
      const c = new XColor("#ff0000");
      expect(c.toObject()).toEqual(c.toRgb());
    });
  });

  describe("toString", () => {
    it("should default to hex for opaque colors", () => {
      expect(new XColor("#ff0000").toString()).toBe("#ff0000");
    });

    it("should default to rgba for transparent colors", () => {
      expect(new XColor("rgba(255, 0, 0, 0.5)").toString()).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("should support hex format", () => {
      expect(new XColor("#ff0000").toString("hex")).toBe("#ff0000");
    });

    it("should support hex3 format", () => {
      expect(new XColor("#ff0000").toString("hex3")).toBe("#f00");
    });

    it("should support hex8 format", () => {
      expect(new XColor("#ff0000").toString("hex8")).toBe("#ff0000ff");
    });

    it("should support rgb format", () => {
      expect(new XColor("#ff0000").toString("rgb")).toBe("rgb(255, 0, 0)");
    });

    it("should support hsl format", () => {
      expect(new XColor("#ff0000").toString("hsl")).toBe("hsl(0, 100%, 50%)");
    });

    it("should support hsv format", () => {
      expect(new XColor("#ff0000").toString("hsv")).toBe("hsv(0, 100%, 100%)");
    });

    it("should fallback to hex for unsupported custom format in core", () => {
      expect(new XColor("#f1f2f3").toString("name" as any)).toBe("#f1f2f3");
    });
  });
});

describe("xcolor manipulation methods", () => {
  describe("lighten", () => {
    it("should lighten color", () => {
      const c = new XColor("#ff0000");
      c.lighten(20);
      expect(c.lightness()).toBeCloseTo(70, 0);
    });

    it("should not exceed 100% lightness", () => {
      const c = new XColor("#ff0000");
      c.lighten(200);
      expect(c.lightness()).toBeCloseTo(100, 0);
    });

    it("should default to 10", () => {
      const c = new XColor("#ff0000");
      c.lighten();
      expect(c.lightness()).toBeCloseTo(60, 0);
    });
  });

  describe("darken", () => {
    it("should darken color", () => {
      const c = new XColor("#ff0000");
      c.darken(20);
      expect(c.lightness()).toBeCloseTo(30, 0);
    });

    it("should not go below 0%", () => {
      const c = new XColor("#ff0000");
      c.darken(200);
      expect(c.lightness()).toBe(0);
    });
  });

  describe("brighten", () => {
    it("should brighten color (additive towards white)", () => {
      const c = new XColor("#800000");
      const before = c.r();
      c.brighten(50);
      expect(c.r()).toBeGreaterThan(before);
    });

    it("should be chainable", () => {
      const c = new XColor("#800000");
      expect(c.brighten(10)).toBe(c);
    });
  });

  describe("saturate", () => {
    it("should increase saturation", () => {
      const c = new XColor("#bf4040");
      const before = c.saturation();
      c.saturate(20);
      expect(c.saturation()).toBeGreaterThan(before);
    });
  });

  describe("desaturate", () => {
    it("should decrease saturation", () => {
      const c = new XColor("#ff0000");
      c.desaturate(50);
      expect(c.saturation()).toBeCloseTo(50, 0);
    });
  });

  describe("grayscale", () => {
    it("should fully desaturate", () => {
      const c = new XColor("#ff0000");
      c.grayscale();
      expect(c.saturation()).toBe(0);
    });

    it("should result in equal RGB channels", () => {
      const c = new XColor("#ff0000");
      c.grayscale();
      expect(c.r()).toBe(c.g());
      expect(c.g()).toBe(c.b());
    });
  });

  describe("spin/rotate", () => {
    it("should rotate hue", () => {
      const c = new XColor("#ff0000");
      c.spin(120);
      expect(c.hue()).toBeCloseTo(120, 0);
    });

    it("should handle negative degrees", () => {
      const c = new XColor("#ff0000");
      c.spin(-120);
      expect(c.hue()).toBeCloseTo(240, 0);
    });

    it("should wrap around 360", () => {
      const c = new XColor("#ff0000");
      c.spin(360);
      expect(c.hue()).toBeCloseTo(0, 0);
    });

    it("rotate should be alias for spin", () => {
      const c1 = new XColor("#ff0000");
      const c2 = new XColor("#ff0000");
      c1.spin(120);
      c2.rotate(120);
      expect(c1.toHex()).toBe(c2.toHex());
    });
  });

  describe("negate/invert", () => {
    it("should negate color", () => {
      const c = new XColor("#ff0000");
      c.negate();
      expect(c.r()).toBe(0);
      expect(c.g()).toBe(255);
      expect(c.b()).toBe(255);
    });

    it("should be idempotent when applied twice", () => {
      const c = new XColor("#ff8040");
      const original = c.toHex();
      c.negate().negate();
      expect(c.toHex()).toBe(original);
    });

    it("invert should be alias for negate", () => {
      const c1 = new XColor("#ff0000");
      const c2 = new XColor("#ff0000");
      c1.negate();
      c2.invert();
      expect(c1.toHex()).toBe(c2.toHex());
    });
  });

  describe("fade", () => {
    it("should decrease opacity", () => {
      const c = new XColor("#ff0000");
      c.fade(50);
      expect(c.a()).toBe(0.5);
    });

    it("should not go below 0", () => {
      const c = new XColor("#ff0000");
      c.fade(200);
      expect(c.a()).toBe(0);
    });
  });

  describe("opaquer", () => {
    it("should increase opacity", () => {
      const c = new XColor("rgba(255, 0, 0, 0.5)");
      c.opaquer(30);
      expect(c.a()).toBeCloseTo(0.8, 1);
    });

    it("should not exceed 1", () => {
      const c = new XColor("rgba(255, 0, 0, 0.5)");
      c.opaquer(200);
      expect(c.a()).toBe(1);
    });
  });

  describe("tint", () => {
    it("should mix with white", () => {
      const c = new XColor("#000000");
      c.tint(50);
      expect(c.r()).toBeCloseTo(128, 0);
      expect(c.g()).toBeCloseTo(128, 0);
      expect(c.b()).toBeCloseTo(128, 0);
    });

    it("should default to 50%", () => {
      const c = new XColor("#ff0000");
      c.tint();
      expect(c.r()).toBeCloseTo(255, 0);
      expect(c.g()).toBeCloseTo(128, 0);
      expect(c.b()).toBeCloseTo(128, 0);
    });
  });

  describe("shade", () => {
    it("should mix with black", () => {
      const c = new XColor("#ffffff");
      c.shade(50);
      expect(c.r()).toBeCloseTo(128, 0);
      expect(c.g()).toBeCloseTo(128, 0);
      expect(c.b()).toBeCloseTo(128, 0);
    });
  });
});

describe("xcolor query methods", () => {
  describe("isLight/isDark", () => {
    it("should identify white as light", () => {
      expect(new XColor("#ffffff").isLight()).toBe(true);
      expect(new XColor("#ffffff").isDark()).toBe(false);
    });

    it("should identify black as dark", () => {
      expect(new XColor("#000000").isLight()).toBe(false);
      expect(new XColor("#000000").isDark()).toBe(true);
    });

    it("should identify yellow as light", () => {
      expect(new XColor("#ffff00").isLight()).toBe(true);
    });

    it("should identify dark blue as dark", () => {
      expect(new XColor("#000080").isDark()).toBe(true);
    });
  });

  describe("brightness", () => {
    it("should return 0 for black", () => {
      expect(new XColor("#000000").brightness()).toBe(0);
    });

    it("should return 255 for white", () => {
      expect(new XColor("#ffffff").brightness()).toBe(255);
    });
  });

  describe("luminance", () => {
    it("should return 0 for black", () => {
      expect(new XColor("#000000").luminance()).toBe(0);
    });

    it("should return ~1 for white", () => {
      expect(new XColor("#ffffff").luminance()).toBeCloseTo(1, 2);
    });
  });

  describe("contrast", () => {
    it("should return 21 for black vs white", () => {
      expect(new XColor("#000000").contrast("#ffffff")).toBe(21);
    });

    it("should return 1 for same color", () => {
      expect(new XColor("#ff0000").contrast("#ff0000")).toBe(1);
    });

    it("should accept xcolor instance", () => {
      const red = new XColor("#ff0000");
      const white = new XColor("#ffffff");
      expect(red.contrast(white)).toBeGreaterThan(1);
    });
  });

  describe("equals", () => {
    it("should return true for same colors", () => {
      expect(new XColor("#ff0000").equals("#ff0000")).toBe(true);
      expect(new XColor("#ff0000").equals({ r: 255, g: 0, b: 0 })).toBe(true);
    });

    it("should return false for different colors", () => {
      expect(new XColor("#ff0000").equals("#00ff00")).toBe(false);
    });

    it("should consider alpha", () => {
      expect(new XColor("#ff0000").equals("rgba(255,0,0,0.5)")).toBe(false);
    });
  });
});

describe("xcolor mixing", () => {
  describe("mix", () => {
    it("should mix two colors at 50%", () => {
      const c = new XColor("#ff0000");
      c.mix("#0000ff", 50);
      expect(c.r()).toBeCloseTo(128, 0);
      expect(c.g()).toBe(0);
      expect(c.b()).toBeCloseTo(128, 0);
    });

    it("should handle 0% (no change)", () => {
      const c = new XColor("#ff0000");
      c.mix("#0000ff", 0);
      expect(c.r()).toBe(255);
      expect(c.b()).toBe(0);
    });

    it("should handle 100% (fully other)", () => {
      const c = new XColor("#ff0000");
      c.mix("#0000ff", 100);
      expect(c.r()).toBe(0);
      expect(c.b()).toBe(255);
    });

    it("should mix alpha values", () => {
      const c = new XColor("rgba(255, 0, 0, 1)");
      c.mix("rgba(0, 0, 255, 0)", 50);
      expect(c.a()).toBeCloseTo(0.5, 1);
    });

    it("should be chainable", () => {
      const c = new XColor("#ff0000");
      expect(c.mix("#0000ff")).toBe(c);
    });

    it("should default to 50%", () => {
      const c1 = new XColor("#ff0000");
      c1.mix("#0000ff");
      const c2 = new XColor("#ff0000");
      c2.mix("#0000ff", 50);
      expect(c1.toHex()).toBe(c2.toHex());
    });
  });
});

describe("xcolor utility", () => {
  describe("clone", () => {
    it("should create independent copy", () => {
      const original = new XColor("#ff0000");
      const cloned = original.clone();
      cloned.red(0);
      expect(original.r()).toBe(255);
      expect(cloned.r()).toBe(0);
    });

    it("should preserve all channels", () => {
      const original = new XColor("rgba(100, 150, 200, 0.5)");
      const cloned = original.clone();
      expect(cloned.r()).toBe(100);
      expect(cloned.g()).toBe(150);
      expect(cloned.b()).toBe(200);
      expect(cloned.a()).toBe(0.5);
    });
  });

  describe("isValid", () => {
    it("should be true for valid colors", () => {
      expect(new XColor("#ff0000").isValid()).toBe(true);
      expect(new XColor({ r: 0, g: 0, b: 0 }).isValid()).toBe(true);
    });

    it("should be false for invalid colors", () => {
      expect(new XColor("invalid").isValid()).toBe(false);
    });
  });
});

describe("xcolor static methods", () => {
  describe("isColor", () => {
    it("should return true for xcolor instances", () => {
      expect(xcolor.isColor(new XColor("#ff0000"))).toBe(true);
    });

    it("should return false for non-xcolor values", () => {
      expect(xcolor.isColor("#ff0000")).toBe(false);
      expect(xcolor.isColor(null)).toBe(false);
      expect(xcolor.isColor(42)).toBe(false);
      expect(xcolor.isColor({})).toBe(false);
    });
  });

  describe("random", () => {
    it("should return a valid xcolor instance", () => {
      const c = xcolor.random();
      expect(c).toBeInstanceOf(XColor);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBeGreaterThanOrEqual(0);
      expect(c.r()).toBeLessThanOrEqual(255);
    });

    it("should generate different colors (usually)", () => {
      const colors = Array.from({ length: 10 }, () => xcolor.random().toHex());
      const unique = new Set(colors);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe("extend", () => {
    it("should call install and pass options", () => {
      let called = false;
      const result = xcolor.use({
        name: "@test/core/plugin-basic",
        install(option, cls, factory) {
          called = true;
          expect(option).toEqual({ test: true });
          expect(cls).toBe(XColor);
          expect(typeof factory).toBe("function");
          (cls.prototype as any).pluginBasicMethod = function () {
            return "works";
          };
        }
      }, { test: true });

      expect(result).toBe(XColor);
      expect(called).toBe(true);
      expect((xcolor("#f00") as any).pluginBasicMethod()).toBe("works");
      delete (XColor.prototype as any).pluginBasicMethod;
    });

    it("should override same-name plugin with warning", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      xcolor.extend({
        name: "@test/core/plugin-override",
        install(_option, cls) {
          (cls.prototype as any).overrideMethod = () => "v1";
        }
      });
      expect((xcolor("#f00") as any).overrideMethod()).toBe("v1");
      expect(warnSpy).not.toHaveBeenCalled();

      xcolor.extend({
        name: "@test/core/plugin-override",
        install(_option, cls) {
          (cls.prototype as any).overrideMethod = () => "v2";
        }
      });
      expect((xcolor("#f00") as any).overrideMethod()).toBe("v2");
      expect(warnSpy).toHaveBeenCalledWith(
        "[X-Color]",
        expect.stringContaining("@test/core/plugin-override")
      );

      warnSpy.mockRestore();
      delete (XColor.prototype as any).overrideMethod;
    });

    it("should reject non-object plugins", () => {
      expect(() => xcolor.extend((() => {}) as any)).toThrow(/name, install/);
      expect(() => xcolor.extend("plugin" as any)).toThrow(/name, install/);
      expect(() => xcolor.extend(null as any)).toThrow(/name, install/);
    });

    it("should reject plugins with missing or empty name", () => {
      expect(() => xcolor.extend({} as any)).toThrow(/name, install/);
      expect(() => xcolor.extend({ name: "   ", install() {} } as any)).toThrow(/non-empty name/);
    });

    it("should allow arbitrary metadata fields on plugin", () => {
      const myPlugin = {
        name: "@test/core/plugin-meta",
        version: "2.0.0",
        author: "test",
        install() {}
      };
      xcolor.use(myPlugin);
      expect(myPlugin.version).toBe("2.0.0");
      expect(myPlugin.author).toBe("test");
    });
  });
});

describe("xcolor factory function", () => {
  it("should create xcolor instance", () => {
    const c = xcolor("#ff0000");
    expect(c).toBeInstanceOf(XColor);
    expect(c.r()).toBe(255);
  });

  it("should clone when passed a xcolor instance", () => {
    const original = xcolor("#ff0000");
    const cloned = xcolor(original);
    cloned.red(0);
    expect(original.r()).toBe(255);
    expect(cloned.r()).toBe(0);
  });

  it("should have extend method", () => {
    expect(typeof xcolor.extend).toBe("function");
  });

  it("should have isColor method", () => {
    expect(typeof xcolor.isColor).toBe("function");
    expect(xcolor.isColor(xcolor("#fff"))).toBe(true);
  });

  it("should have random method", () => {
    expect(typeof xcolor.random).toBe("function");
    expect(xcolor.random()).toBeInstanceOf(XColor);
  });

  it("should create default black when no args", () => {
    const c = xcolor();
    expect(c.r()).toBe(0);
    expect(c.g()).toBe(0);
    expect(c.b()).toBe(0);
    expect(c.isValid()).toBe(true);
  });
});

// =======================================
// Tests: Method aliases
// =======================================

describe("xcolor method aliases", () => {
  describe("channel aliases r/g/b", () => {
    it("r() should get red channel like red()", () => {
      const c = xcolor("#ff8040");
      expect(c.r()).toBe(c.red());
      expect(c.r()).toBe(255);
    });

    it("r(value) should set red channel like red(value)", () => {
      const c1 = xcolor("#ff0000");
      const c2 = xcolor("#ff0000");
      c1.red(128);
      c2.r(128);
      expect(c1.toHex()).toBe(c2.toHex());
    });

    it("g() should get green channel like green()", () => {
      const c = xcolor("#ff8040");
      expect(c.g()).toBe(c.green());
      expect(c.g()).toBe(128);
    });

    it("g(value) should set green channel like green(value)", () => {
      const c = xcolor("#000000");
      c.g(200);
      expect(c.green()).toBe(200);
    });

    it("b() should get blue channel like blue()", () => {
      const c = xcolor("#ff8040");
      expect(c.b()).toBe(c.blue());
      expect(c.b()).toBe(64);
    });

    it("b(value) should set blue channel like blue(value)", () => {
      const c = xcolor("#000000");
      c.b(100);
      expect(c.blue()).toBe(100);
    });

    it("r/g/b should be chainable", () => {
      const c = xcolor("#000000");
      c.r(255).g(128).b(64);
      expect(c.toHex()).toBe("#ff8040");
    });
  });

  describe("a() alias for alpha()", () => {
    it("a() should get alpha like alpha()", () => {
      const c = xcolor("rgba(255, 0, 0, 0.5)");
      expect(c.a()).toBe(c.alpha());
      expect(c.a()).toBeCloseTo(0.5);
    });

    it("a(value) should set alpha like alpha(value)", () => {
      const c = xcolor("#ff0000");
      c.a(0.3);
      expect(c.alpha()).toBeCloseTo(0.3);
    });

    it("a() should be chainable when setting", () => {
      const c = xcolor("#ff0000");
      expect(c.a(0.5)).toBe(c);
      expect(c.a()).toBe(0.5);
    });
  });

  describe("opacity() alias for alpha()", () => {
    it("opacity() should get alpha like alpha()", () => {
      const c = xcolor("rgba(255, 0, 0, 0.5)");
      expect(c.opacity()).toBe(c.alpha());
      expect(c.opacity()).toBeCloseTo(0.5);
    });

    it("opacity(value) should set alpha like alpha(value)", () => {
      const c = xcolor("#ff0000");
      c.opacity(0.3);
      expect(c.alpha()).toBeCloseTo(0.3);
    });

    it("opacity() should be chainable when setting", () => {
      const c = xcolor("#ff0000");
      expect(c.opacity(0.5)).toBe(c);
      expect(c.a()).toBe(0.5);
    });

    it("opacity() should return same as a() and alpha()", () => {
      const c = xcolor("rgba(100, 200, 50, 0.75)");
      expect(c.opacity()).toBe(c.a());
      expect(c.opacity()).toBe(c.alpha());
    });
  });

  describe("HSL aliases h/s/l", () => {
    it("h() should get hue like hue()", () => {
      const c = xcolor("#ff0000");
      expect(c.h()).toBe(c.hue());
    });

    it("h(value) should set hue like hue(value)", () => {
      const c1 = xcolor("#ff0000");
      const c2 = xcolor("#ff0000");
      c1.hue(120);
      c2.h(120);
      expect(c1.toHex()).toBe(c2.toHex());
    });

    it("s() should get saturation like saturation()", () => {
      const c = xcolor("#ff0000");
      expect(c.s()).toBe(c.saturation());
    });

    it("s(value) should set saturation like saturation(value)", () => {
      const c1 = xcolor("#ff0000");
      const c2 = xcolor("#ff0000");
      c1.saturation(50);
      c2.s(50);
      expect(c1.toHex()).toBe(c2.toHex());
    });

    it("l() should get lightness like lightness()", () => {
      const c = xcolor("#ff0000");
      expect(c.l()).toBe(c.lightness());
    });

    it("l(value) should set lightness like lightness(value)", () => {
      const c1 = xcolor("#ff0000");
      const c2 = xcolor("#ff0000");
      c1.lightness(70);
      c2.l(70);
      expect(c1.toHex()).toBe(c2.toHex());
    });
  });

  describe("HSV value() and v() alias", () => {
    it("value() should get HSV value channel", () => {
      const c = xcolor("#ff0000");
      expect(c.value()).toBe(100);
    });

    it("value() should return correct value for dark color", () => {
      const c = xcolor("#800000");
      // #800000 => R=128 => V ≈ 50.2
      expect(c.value()).toBeCloseTo(50.2, 0);
    });

    it("value(val) should set HSV value channel", () => {
      const c = xcolor("#800000");
      c.value(100);
      expect(c.toHex()).toBe("#ff0000");
    });

    it("value() should be chainable when setting", () => {
      const c = xcolor("#800000");
      expect(c.value(100)).toBe(c);
    });

    it("value() should clamp to 0-100", () => {
      const c = xcolor("#ff0000");
      c.value(0);
      expect(c.toHex()).toBe("#000000");
    });

    it("v() should get value like value()", () => {
      const c = xcolor("#ff0000");
      expect(c.v()).toBe(c.value());
    });

    it("v(val) should set value like value(val)", () => {
      const c1 = xcolor("#800000");
      const c2 = xcolor("#800000");
      c1.value(100);
      c2.v(100);
      expect(c1.toHex()).toBe(c2.toHex());
    });

    it("v() should be chainable when setting", () => {
      const c = xcolor("#800000");
      expect(c.v(100)).toBe(c);
    });
  });

  describe("greyscale alias", () => {
    it("greyscale() should produce same result as grayscale()", () => {
      const c1 = xcolor("#ff0000").grayscale();
      const c2 = xcolor("#ff0000").greyscale();
      expect(c1.toHex()).toBe(c2.toHex());
    });
  });

  describe("fadeIn/fadeOut aliases", () => {
    it("fadeOut() should be equivalent to fade()", () => {
      const c1 = xcolor("#ff0000");
      const c2 = xcolor("#ff0000");
      c1.fade(30);
      c2.fadeOut(30);
      expect(c1.alpha()).toBeCloseTo(c2.alpha());
    });

    it("fadeIn() should be equivalent to opaquer()", () => {
      const c1 = xcolor("rgba(255, 0, 0, 0.5)");
      const c2 = xcolor("rgba(255, 0, 0, 0.5)");
      c1.opaquer(30);
      c2.fadeIn(30);
      expect(c1.alpha()).toBeCloseTo(c2.alpha());
    });
  });
});

// =======================================
// Tests: Compound Getter/Setter methods
// =======================================

describe("xcolor compound Getter/Setter", () => {
  describe("rgb()", () => {
    it("rgb() without args should return RGBA object (same as toRgb)", () => {
      const c = xcolor("#ff8040");
      expect(c.rgb()).toEqual(c.toRgb());
      expect(c.rgb()).toEqual({ r: 255, g: 128, b: 64, a: 1 });
    });

    it("rgb(r, g, b) should set channels and return this", () => {
      const c = xcolor("#000000");
      const result = c.rgb(255, 128, 64);
      expect(result).toBe(c);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(128);
      expect(c.b()).toBe(64);
      expect(c.a()).toBe(1); // alpha unchanged
    });

    it("rgb(r, g, b, a) should set all channels", () => {
      const c = xcolor("#000000");
      c.rgb(255, 128, 64, 0.5);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(128);
      expect(c.b()).toBe(64);
      expect(c.a()).toBe(0.5);
    });

    it("rgb() setter should support chaining", () => {
      const c = xcolor("#000").rgb(255, 0, 0).lighten(10);
      expect(c.r()).toBeGreaterThan(0);
    });

    it("rgb() setter should clamp values", () => {
      const c = xcolor("#000").rgb(300, -10, 500);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(0);
      expect(c.b()).toBe(255);
    });

    it("rgb(r) should keep existing g/b as fallback", () => {
      const c = xcolor("#112233");
      c.rgb(255);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(34);
      expect(c.b()).toBe(51);
    });
  });

  describe("hsl()", () => {
    it("hsl() without args should return HSLA object (same as toHsl)", () => {
      const c = xcolor("#ff0000");
      expect(c.hsl()).toEqual(c.toHsl());
    });

    it("hsl(h, s, l) should set channels and return this", () => {
      const c = xcolor("#000000");
      const result = c.hsl(120, 100, 50);
      expect(result).toBe(c);
      expect(c.g()).toBe(255);
      expect(c.r()).toBe(0);
    });

    it("hsl(h, s, l, a) should set all channels including alpha", () => {
      const c = xcolor("#000000");
      c.hsl(0, 100, 50, 0.5);
      expect(c.r()).toBe(255);
      expect(c.a()).toBe(0.5);
    });

    it("hsl() setter should support chaining", () => {
      const c = xcolor("#000").hsl(0, 100, 50).negate();
      expect(c.r()).toBe(0);
      expect(c.g()).toBe(255);
      expect(c.b()).toBe(255);
    });

    it("hsl(h) should fallback to current s/l", () => {
      const c = xcolor("hsl(0, 80%, 40%)");
      c.hsl(180);
      expect(c.saturation()).toBeCloseTo(80, 0);
      expect(c.lightness()).toBeCloseTo(40, 0);
    });
  });

  describe("hsv()", () => {
    it("hsv() without args should return HSVA object (same as toHsv)", () => {
      const c = xcolor("#ff0000");
      expect(c.hsv()).toEqual(c.toHsv());
    });

    it("hsv(h, s, v) should set channels and return this", () => {
      const c = xcolor("#000000");
      const result = c.hsv(0, 100, 100);
      expect(result).toBe(c);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(0);
    });

    it("hsv(h, s, v, a) should set all channels including alpha", () => {
      const c = xcolor("#000000");
      c.hsv(0, 100, 100, 0.3);
      expect(c.r()).toBe(255);
      expect(c.a()).toBeCloseTo(0.3);
    });

    it("hsv() setter should support chaining", () => {
      const result = xcolor("#000").hsv(120, 100, 100).toHex();
      expect(result).toBe("#00ff00");
    });

    it("hsv(h) should fallback to current s/v", () => {
      const c = xcolor("hsv(0, 60%, 70%)");
      c.hsv(240);
      expect(c.toHsv().s).toBeCloseTo(60, 0);
      expect(c.toHsv().v).toBeCloseTo(70, 0);
    });
  });

  describe("hex()", () => {
    it("hex() without args should return hex string (same as toHex)", () => {
      const c = xcolor("#ff0000");
      expect(c.hex()).toBe(c.toHex());
      expect(c.hex()).toBe("#ff0000");
    });

    it("hex(value) should set color from hex string and return this", () => {
      const c = xcolor("#000000");
      const result = c.hex("#ff8000");
      expect(result).toBe(c);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(128);
      expect(c.b()).toBe(0);
    });

    it("hex() setter should support chaining", () => {
      const c = xcolor("#000").hex("#ff0000").lighten(10);
      expect(c.lightness()).toBeCloseTo(60, 0);
    });

    it("hex() setter should throw for named colors without name plugin", () => {
      const c = xcolor("#000");
      expect(() => c.hex("red")).toThrow("[X-Color] Invalid hex value: red");
      expect(c.isValid()).toBe(false);
    });

    it("hex() should throw on invalid input and mark invalid", () => {
      const c = xcolor("#000");
      expect(() => c.hex("invalid-hex")).toThrow("[X-Color] Invalid hex value: invalid-hex");
      expect(c.isValid()).toBe(false);
    });
  });
});

describe("plugin dedupe", () => {
  it("should dedupe plugin registration", () => {
    let count = 0;
    const plugin = {
      name: "@test/core/dedupe-flag",
      install(_opt: unknown, cls: any) {
        count++;
        cls.prototype.__dedupeFlag = true;
      }
    };

    xcolor.use(plugin);
    xcolor.use(plugin);
    // Second call triggers override (install runs again) + warnings
    expect(count).toBe(2);
    expect((xcolor("#f00") as any).__dedupeFlag).toBe(true);
  });
});

// =======================================
// XColorOptions tests
// =======================================

describe("XColorOptions", () => {
  describe("useDecimal", () => {
    it("should round RGB channels by default (useDecimal off)", () => {
      const c = new XColor("#ff0000");
      c.red(127.6);
      expect(c.r()).toBe(128); // rounded
    });

    it("should keep fractional RGB when useDecimal is true", () => {
      const c = new XColor("#ff0000", { useDecimal: true });
      c.red(127.6);
      expect(c.r()).toBe(127.6); // not rounded
    });

    it("should keep fractional green when useDecimal is true", () => {
      const c = new XColor("#000", { useDecimal: true });
      c.green(100.5);
      expect(c.g()).toBe(100.5);
    });

    it("should keep fractional blue when useDecimal is true", () => {
      const c = new XColor("#000", { useDecimal: true });
      c.blue(200.3);
      expect(c.b()).toBeCloseTo(200.3);
    });

    it("should keep fractional values in rgb() setter", () => {
      const c = new XColor("#000", { useDecimal: true });
      c.rgb(100.1, 200.2, 50.5);
      expect(c.r()).toBeCloseTo(100.1);
      expect(c.g()).toBeCloseTo(200.2);
      expect(c.b()).toBeCloseTo(50.5);
    });

    it("should keep fractional values in brighten()", () => {
      const c = new XColor("#808080", { useDecimal: true });
      c.brighten(10);
      // With decimal, values may not be integer
      expect(c.r()).not.toBe(Math.round(c.r()));
    });

    it("should keep fractional values in mix()", () => {
      const c = new XColor("#ff0000", { useDecimal: true });
      c.mix("#0000ff", 33);
      // With 33% mix, values are likely fractional
      expect(c.r() % 1).not.toBe(0);
    });

    it("clone() should preserve useDecimal option", () => {
      const c = new XColor("#ff0000", { useDecimal: true });
      const c2 = c.clone();
      c2.red(127.6);
      expect(c2.r()).toBe(127.6); // option inherited
    });

    it("copy constructor should inherit opts", () => {
      const c1 = new XColor("#ff0000", { useDecimal: true });
      const c2 = new XColor(c1);
      c2.red(127.6);
      expect(c2.r()).toBe(127.6);
    });

    it("copy constructor should allow overriding opts", () => {
      const c1 = new XColor("#ff0000", { useDecimal: true });
      const c2 = new XColor(c1, { useDecimal: false });
      c2.red(127.6);
      expect(c2.r()).toBe(128); // rounded because overridden
    });

    it("xcolor factory should accept opts", () => {
      const c = xcolor("#ff0000", { useDecimal: true });
      c.red(127.6);
      expect(c.r()).toBe(127.6);
    });
  });
});
