// =======================================
// Integration tests: Full end-to-end flows
// Validates that all modules work together correctly,
// including plugin loading, parsing pipeline, and output.
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import {
  XColor,
  xcolor,
  registerColorParser,
  parseFunctionalChannels,
  parseColor,
  rgbaToHex,
  round,
  Logger
} from "../src/index";
import type { XColorPlugin, XColorParser } from "../src/index";
import cmyk from "../src/plugins/cmyk";
import name from "../src/plugins/name";
import lab from "../src/plugins/lab";
import percentageRgb from "../src/plugins/percentageRgb";
import temperature from "../src/plugins/temperature";
import harmony from "../src/plugins/harmony";
import gradient from "../src/plugins/gradient";
import blend from "../src/plugins/blend";
import a11y from "../src/plugins/a11y";
import scale from "../src/plugins/scale";
import simulate from "../src/plugins/simulate";

// ---- Exports completeness ----

describe("exports completeness", () => {
  it("built-in plugins should export object-style metadata", () => {
    expect(cmyk.name).toBe("@xpyjs/color/plugins/cmyk");
    expect(typeof cmyk.install).toBe("function");
    expect(name.name).toBe("@xpyjs/color/plugins/name");
    expect(typeof name.install).toBe("function");
  });

  it("should export all parse functions from index", () => {
    expect(typeof registerColorParser).toBe("function");
    expect(typeof parseFunctionalChannels).toBe("function");
    expect(typeof parseColor).toBe("function");
  });

  it("should export all utility functions from index", () => {
    expect(typeof rgbaToHex).toBe("function");
    expect(typeof round).toBe("function");
    expect(typeof Logger).toBe("object");
    expect(typeof Logger.warn).toBe("function");
  });

  it("should export factory with all static methods", () => {
    expect(typeof xcolor).toBe("function");
    expect(typeof xcolor.use).toBe("function");
    expect(typeof xcolor.extend).toBe("function");
    expect(typeof xcolor.isColor).toBe("function");
    expect(typeof xcolor.is).toBe("function");
    expect(typeof xcolor.random).toBe("function");
  });

  it("registerColorParser should be usable by plugins", () => {
    // Simulate what a plugin does
    const parser: XColorParser = (value) => {
      if (value === "test-integration") return { r: 1, g: 2, b: 3, a: 1 };
      return null;
    };
    const unregister = registerColorParser(parser);
    const c = xcolor("test-integration" as any);
    expect(c.isValid()).toBe(true);
    expect(c.r()).toBe(1);
    unregister();
    const c2 = xcolor("test-integration" as any);
    expect(c2.isValid()).toBe(false);
  });

  it("parseFunctionalChannels should be usable by plugins", () => {
    // Simulate what cmyk plugin does
    const result = parseFunctionalChannels("custom(10, 20, 30 / 0.5)", "custom", 3);
    expect(result).toEqual({ channels: ["10", "20", "30"], alpha: "0.5" });
  });

  it("should support registering multiple object-style plugins", () => {
    const pluginA: XColorPlugin = {
      name: "@test/integration/plugin-a",
      install(_option, cls) {
        (cls.prototype as any).integrationPluginA = function () {
          return "A";
        };
      }
    };
    const pluginB: XColorPlugin = {
      name: "@test/integration/plugin-b",
      install(_option, cls) {
        (cls.prototype as any).integrationPluginB = function () {
          return "B";
        };
      }
    };

    xcolor.use(pluginA);
    xcolor.use(pluginB);

    const c = xcolor("#123456");
    expect((c as any).integrationPluginA()).toBe("A");
    expect((c as any).integrationPluginB()).toBe("B");
    delete (XColor.prototype as any).integrationPluginA;
    delete (XColor.prototype as any).integrationPluginB;
  });
});

// ---- Plugin loading & interaction ----

describe("full plugin integration", () => {
  beforeAll(() => {
    xcolor.use(cmyk);
    xcolor.use(name);
    xcolor.use(lab);
    xcolor.use(percentageRgb);
    xcolor.use(temperature);
    xcolor.use(harmony);
    xcolor.use(gradient);
    xcolor.use(blend);
    xcolor.use(a11y);
    xcolor.use(scale);
    xcolor.use(simulate);
  });

  // ---- name plugin: string parsing ----

  describe("name plugin string parsing", () => {
    it("should parse named colors after plugin loaded", () => {
      const c = xcolor("red" as any);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(0);
      expect(c.b()).toBe(0);
    });

    it("should parse mixed-case named colors", () => {
      const c = xcolor("DodgerBlue" as any);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(30);
      expect(c.g()).toBe(144);
      expect(c.b()).toBe(255);
    });

    it("should output a color name via toString('name')", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("name")).toBe("red");
    });

    it("should not conflict with hex parsing", () => {
      // "abc" could be mistaken for a name, but it's a valid 3-char hex
      const c = xcolor("#abc");
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(170);
      expect(c.g()).toBe(187);
      expect(c.b()).toBe(204);
    });
  });

  // ---- cmyk plugin: object + string parsing ----

  describe("cmyk plugin parsing", () => {
    it("should parse cmyk functional string", () => {
      const c = xcolor("cmyk(0, 100, 100, 0)" as any);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(0);
      expect(c.b()).toBe(0);
    });

    it("should parse cmyk object", () => {
      const c = xcolor({ c: 0, m: 100, y: 100, k: 0 } as any);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(255);
    });

    it("should output cmyk string", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("cmyk")).toBe("cmyk(0%, 100%, 100%, 0%)");
    });
  });

  // ---- Built-in types should not be broken by plugins ----

  describe("built-in parsing unaffected by plugins", () => {
    it("hex colors still work", () => {
      expect(xcolor("#ff8000").toHex()).toBe("#ff8000");
    });

    it("rgb() strings still work", () => {
      const c = xcolor("rgb(100, 200, 50)");
      expect(c.r()).toBe(100);
      expect(c.g()).toBe(200);
      expect(c.b()).toBe(50);
    });

    it("hsl() strings still work", () => {
      const c = xcolor("hsl(120, 100%, 50%)");
      expect(c.g()).toBe(255);
    });

    it("hsv() strings still work", () => {
      const c = xcolor("hsv(0, 100%, 100%)");
      expect(c.r()).toBe(255);
    });

    it("numeric input still works", () => {
      const c = xcolor(0xFF0000 as any);
      expect(c.r()).toBe(255);
    });

    it("object input still works", () => {
      const c = xcolor({ r: 255, g: 128, b: 0 });
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(128);
    });

    it("modern color(srgb) still works", () => {
      const c = xcolor("color(srgb 1 0 0)" as any);
      expect(c.r()).toBe(255);
    });
  });

  // ---- Pipeline ordering: first-match-wins, no conflict ----

  describe("pipeline ordering", () => {
    it("built-in hex should resolve before name plugin", () => {
      // "f00" is a valid 3-char hex — it should be parsed as hex, not a name
      const c = xcolor("f00" as any);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(255);
      expect(c.g()).toBe(0);
      expect(c.b()).toBe(0);
    });

    it("named color that looks like hex should resolve as hex if # prefix", () => {
      const c = xcolor("#bada55");
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(186);
    });

    it("rgb object should resolve before cmyk (rgb has priority)", () => {
      // An object with r,g,b should be parsed as RGB, not CMYK
      const c = xcolor({ r: 100, g: 50, b: 25 });
      expect(c.r()).toBe(100);
      expect(c.g()).toBe(50);
      expect(c.b()).toBe(25);
    });
  });

  // ---- Cross-plugin workflows ----

  describe("cross-plugin workflows", () => {
    it("create from name → convert to cmyk", () => {
      const c = xcolor("blue" as any);
      const cmykVal = (c as any).toCmyk();
      expect(cmykVal.c).toBe(100);
      expect(cmykVal.m).toBe(100);
      expect(cmykVal.y).toBe(0);
      expect(cmykVal.k).toBe(0);
    });

    it("create from cmyk string → get name", () => {
      const c = xcolor("cmyk(0, 100, 100, 0)" as any);
      expect((c as any).toName()).toBe("red");
    });

    it("create from name → get lab", () => {
      const c = xcolor("white" as any);
      const labVal = (c as any).toLab();
      expect(labVal.l).toBeCloseTo(100, 0);
    });

    it("create from name → get percentageRgb", () => {
      const c = xcolor("red" as any);
      const prgb = (c as any).toPercentageRgb();
      expect(prgb.r).toBe("100%");
      expect(prgb.g).toBe("0%");
    });

    it("create color → manipulate → query", () => {
      const c = xcolor("#ff0000")
        .lighten(20)
        .saturate(10);
      expect(c.isValid()).toBe(true);
      expect(c.isLight()).toBe(true);
      const hex = c.toHex();
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("clone preserves independence after plugin methods", () => {
      const c1 = xcolor("red" as any);
      const c2 = c1.clone();
      c2.blue(255);
      expect(c1.b()).toBe(0);
      expect(c2.b()).toBe(255);
    });
  });

  // ---- Multi-format toString chain ----

  describe("multi-format toString chain", () => {
    it("should support all string formats on same color", () => {
      const c = xcolor("#ff8000");
      expect(c.toString("hex")).toBe("#ff8000");
      expect(c.toString("rgb")).toBe("rgb(255, 128, 0)");
      expect(c.toString("hsl")).toMatch(/^hsl\(/);
      expect(c.toString("hsv")).toMatch(/^hsv\(/);
      expect(c.toString("cmyk")).toMatch(/^cmyk\(/);
      expect(c.toString("percentageRgb")).toMatch(/^rgba?\(\d+%/);
    });

    it("default toString for opaque color is hex", () => {
      expect(xcolor("#ff0000").toString()).toBe("#ff0000");
    });

    it("default toString for transparent color is rgba", () => {
      expect(xcolor("rgba(255, 0, 0, 0.5)").toString()).toBe("rgba(255, 0, 0, 0.5)");
    });
  });

  // ---- Chaining with plugins ----

  describe("method chaining with plugins", () => {
    it("should chain built-in operations", () => {
      const c = xcolor("#ff0000")
        .lighten(10)
        .darken(5)
        .saturate(10)
        .red(200);
      expect(c.isValid()).toBe(true);
      expect(c.r()).toBe(200);
    });

    it("should chain temperature set/get", () => {
      const c = xcolor("#ff0000");
      const temp = (c as any).temperature();
      expect(typeof temp).toBe("number");
      expect(temp).toBeGreaterThan(0);
    });
  });

  // ---- Edge cases ----

  describe("edge cases", () => {
    it("invalid input remains invalid after all plugins loaded", () => {
      const c = xcolor("not-a-color-for-sure" as any);
      expect(c.isValid()).toBe(false);
    });

    it("empty string remains invalid", () => {
      const c = xcolor("" as any);
      expect(c.isValid()).toBe(false);
    });

    it("undefined/null default to black and are valid", () => {
      expect(xcolor().r()).toBe(0);
      expect(xcolor().isValid()).toBe(true);
      expect(xcolor(null as any).isValid()).toBe(true);
    });

    it("xcolor.random() produces valid colors", () => {
      for (let i = 0; i < 10; i++) {
        const c = xcolor.random();
        expect(c.isValid()).toBe(true);
        expect(c.r()).toBeGreaterThanOrEqual(0);
        expect(c.r()).toBeLessThanOrEqual(255);
      }
    });

    it("xcolor.isColor() works correctly", () => {
      const c = xcolor("#ff0000");
      expect(xcolor.isColor(c)).toBe(true);
      expect(xcolor.isColor("#ff0000")).toBe(false);
      expect(xcolor.isColor(123)).toBe(false);
    });

    it("duplicate plugin registration is a no-op", () => {
      // Should not throw or create side effects
      XColor.use(cmyk);
      XColor.use(name);
      const c = xcolor("red" as any);
      expect(c.r()).toBe(255);
    });
  });
});

// ---- Build output simulation ----
// These tests verify the same patterns that would occur
// when using the built dist/ output.

describe("build output patterns", () => {
  it("CJS-style: all named exports accessible on the module", () => {
    // Simulate what a CJS consumer sees
    const mod = {
      xcolor,
      XColor,
      registerColorParser,
      parseFunctionalChannels,
      parseColor,
      rgbaToHex,
      round,
      Logger
    };

    expect(typeof mod.xcolor).toBe("function");
    expect(typeof mod.registerColorParser).toBe("function");
    expect(typeof mod.parseFunctionalChannels).toBe("function");
    expect(typeof mod.parseColor).toBe("function");
    expect(typeof mod.rgbaToHex).toBe("function");
    expect(typeof mod.round).toBe("function");
    expect(typeof mod.Logger).toBe("object");
  });

  it("UMD-style: plugin can call registerColorParser from global", () => {
    // Simulate the UMD pattern where plugins access utils
    // via the global object (e.g()., window.xcolor.registerColorParser)
    const global: Record<string, any> = {};
    global.xcolor = xcolor;
    global.xcolor.registerColorParser = registerColorParser;
    global.xcolor.parseFunctionalChannels = parseFunctionalChannels;
    global.xcolor.rgbaToHex = rgbaToHex;
    global.xcolor.round = round;

    // Plugin code would do something like:
    const pluginRegister = global.xcolor.registerColorParser;
    expect(typeof pluginRegister).toBe("function");

    const unregister = pluginRegister((value: any) => {
      if (value === "umd-test") return { r: 42, g: 42, b: 42, a: 1 };
      return null;
    });

    const c = xcolor("umd-test" as any);
    expect(c.isValid()).toBe(true);
    expect(c.r()).toBe(42);

    unregister();
  });

  it("ESM re-export: plugin imports match index exports", () => {
    // These imports should all resolve correctly
    // (this is a compile-time check as well)
    expect(registerColorParser).toBeDefined();
    expect(parseFunctionalChannels).toBeDefined();
    expect(parseColor).toBeDefined();
  });
});

// ---- End-to-end multi-plugin workflows ----

describe("end-to-end workflows", () => {
  beforeAll(() => {
    XColor.use(cmyk);
    XColor.use(name);
    XColor.use(lab);
    XColor.use(percentageRgb);
    XColor.use(temperature);
    XColor.use(harmony);
    XColor.use(gradient);
    XColor.use(blend);
    XColor.use(a11y);
    XColor.use(scale);
    XColor.use(simulate);
  });

  describe("full pipeline: parse → manipulate → convert → plugin → output", () => {
    it("hex → lighten → toHsl → toCmyk → toString", () => {
      const c = xcolor("#cc3366");
      const lightened = c.clone().lighten(20);
      expect(lightened.isValid()).toBe(true);
      const hsl = lightened.toHsl();
      expect(hsl.h).toBeDefined();
      const cmykVal = (lightened as any).toCmyk();
      expect(cmykVal.c).toBeDefined();
      const str = lightened.toString("cmyk");
      expect(str).toMatch(/^cmyk\(/);
    });

    it("rgb string → blend → simulate → lab deltaE", () => {
      const c1 = xcolor("rgb(200, 100, 50)");
      const blended = (c1 as any).blend("#0000ff", "screen");
      const simulated = (blended as any).simulate("deuteranopia");
      const delta = (simulated as any).deltaE("#ff0000");
      expect(typeof delta).toBe("number");
      expect(delta).toBeGreaterThan(0);
    });
  });

  describe("multi-plugin chain: name → harmony → scale → blend", () => {
    it("should chain across multiple plugins", () => {
      const base = xcolor("red" as any);
      const comp = (base as any).complement();
      expect(comp.isValid()).toBe(true);

      const scaled = (comp as any).scale("#ffffff", { steps: 3 });
      expect(scaled).toHaveLength(3);

      const blended = (scaled[1] as any).blend("#888888", "overlay");
      expect(blended.isValid()).toBe(true);
      expect(blended.toHex()).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe("multi-plugin chain: cmyk → lab → a11y", () => {
    it("should parse cmyk, compare with lab, check a11y", () => {
      const c = xcolor("cmyk(0, 100, 100, 0)" as any);
      expect(c.isValid()).toBe(true);

      const labVal = (c as any).toLab();
      expect(labVal.l).toBeGreaterThan(0);

      const readable = (c as any).isReadable("#ffffff");
      expect(typeof readable).toBe("boolean");
    });
  });

  describe("multi-plugin chain: temperature → simulate → output", () => {
    it("should set temperature, simulate, and output", () => {
      const c = xcolor("#000").temperature(3000);
      expect(c.isValid()).toBe(true);

      const simulated = (c as any).simulate("protanopia");
      expect(simulated.isValid()).toBe(true);

      const hex = simulated.toHex();
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe("state isolation", () => {
    it("plugin operations should not pollute original instance", () => {
      const original = xcolor("#ff0000");
      const originalHex = original.toHex();

      // Run various plugin operations
      (original as any).complement();
      (original as any).triad();
      (original as any).gradient("#0000ff", 5);
      (original as any).scale("#00ff00", { steps: 3 });
      (original as any).blend("#0000ff", "multiply");
      (original as any).simulate("protanopia");

      // Original should be unchanged
      expect(original.toHex()).toBe(originalHex);
    });

    it("clone should be fully independent after plugin methods", () => {
      const c1 = xcolor("#ff8800");
      const c2 = c1.clone();

      c2.lighten(50);
      (c2 as any).temperature(2000);

      expect(c1.toHex()).toBe("#ff8800");
      expect(c2.toHex()).not.toBe("#ff8800");
    });
  });

  describe("batch consistency", () => {
    it("should produce consistent results for 100+ colors", () => {
      const testColors = [
        "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
        "#ffff00", "#ff00ff", "#00ffff", "#808080", "#c0c0c0"
      ];

      // Generate 100+ colors from base set via gradients
      const allColors: InstanceType<typeof XColor>[] = [];
      for (let i = 0; i < testColors.length; i++) {
        const next = testColors[(i + 1) % testColors.length];
        const grad = xcolor(testColors[i]).gradient(next, 12);
        allColors.push(...grad);
      }

      expect(allColors.length).toBeGreaterThanOrEqual(100);

      for (const c of allColors) {
        expect(c.isValid()).toBe(true);
        expect(c.red()).toBeGreaterThanOrEqual(0);
        expect(c.red()).toBeLessThanOrEqual(255);
        expect(c.green()).toBeGreaterThanOrEqual(0);
        expect(c.green()).toBeLessThanOrEqual(255);
        expect(c.blue()).toBeGreaterThanOrEqual(0);
        expect(c.blue()).toBeLessThanOrEqual(255);
        expect(c.alpha()).toBeGreaterThanOrEqual(0);
        expect(c.alpha()).toBeLessThanOrEqual(1);

        // toString should not throw
        expect(c.toHex()).toMatch(/^#[0-9a-f]{6,8}$/);
        expect(c.toRgbString()).toMatch(/^rgba?\(/);
      }
    });
  });

  describe("useDecimal propagation through plugins", () => {
    it("gradient should propagate opts to result instances", () => {
      const c = new XColor("#ff0000", { useDecimal: true });
      const grad = (c as any).gradient("#0000ff", 3);
      expect(grad).toHaveLength(3);
      // useDecimal preserves fractional values, integer inputs stay integer
      expect(grad[0].red()).toBe(255);
      expect(grad[2].blue()).toBe(255);
      expect(grad[0].toRgb().r).toBe(255);
      // All should be valid
      for (const g of grad) {
        expect(g.isValid()).toBe(true);
      }
    });

    it("scale should propagate opts to result instances", () => {
      const c = new XColor("#ff8000", { useDecimal: true });
      const scaled = (c as any).scale("#0000ff", { steps: 3 });
      expect(scaled).toHaveLength(3);
      expect(scaled[0].red()).toBe(255);
      expect(scaled[2].blue()).toBe(255);
      expect(scaled[0].toRgb().r).toBe(255);
      expect(scaled[1].red()).toBeGreaterThanOrEqual(0);
      expect(scaled[1].red()).toBeLessThanOrEqual(255);
    });

    it("scale should propagate useDecimal option in HSL space", () => {
      const c = new XColor("#ff0000", { useDecimal: true });
      const scaled = (c as any).scale("#0000ff", { steps: 3, space: "hsl" });
      expect(scaled).toHaveLength(3);
      expect(scaled[0].isValid()).toBe(true);
      expect(scaled[2].isValid()).toBe(true);
    });

    it("simulate should propagate useDecimal option", () => {
      const c = new XColor("#ff8040", { useDecimal: true });
      const sim = (c as any).simulate("protanopia");
      // The simulated color should preserve useDecimal
      expect(sim.isValid()).toBe(true);
    });

    it("useDecimal chain: gradient → scale → all propagated", () => {
      const c = new XColor("#ff0000", { useDecimal: true });
      const grad = (c as any).gradient("#0000ff", 3);
      const scaled = (grad[1] as any).scale("#00ff00", { steps: 3 });
      // All colors in the final scale should be valid
      for (const sc of scaled) {
        expect(sc.isValid()).toBe(true);
        expect(sc.red()).toBeGreaterThanOrEqual(0);
        expect(sc.red()).toBeLessThanOrEqual(255);
      }
    });
  });

  describe("parse roundtrip: toString → parse back", () => {
    it("hex → toString('hex') → parse → same color", () => {
      const c = xcolor("#ff8040");
      const str = c.toString("hex");
      const c2 = xcolor(str);
      expect(c2.toHex()).toBe(c.toHex());
    });

    it("rgb → toRgbString → parse → same color", () => {
      const c = xcolor("#ff8040");
      const str = c.toRgbString();
      const c2 = xcolor(str);
      expect(c2.r()).toBe(c.r());
      expect(c2.g()).toBe(c.g());
      expect(c2.b()).toBe(c.b());
    });

    it("rgba with alpha → toRgbString → parse → same color", () => {
      const c = xcolor("rgba(255, 128, 64, 0.5)");
      const str = c.toRgbString();
      const c2 = xcolor(str);
      expect(c2.r()).toBe(255);
      expect(c2.g()).toBe(128);
      expect(c2.b()).toBe(64);
      expect(c2.alpha()).toBeCloseTo(0.5, 2);
    });

    it("hsl → toString('hsl') → parse → approximately same color", () => {
      const c = xcolor("hsl(120, 100%, 50%)");
      const str = c.toString("hsl");
      const c2 = xcolor(str);
      expect(c2.r()).toBeCloseTo(c.r(), 0);
      expect(c2.g()).toBeCloseTo(c.g(), 0);
      expect(c2.b()).toBeCloseTo(c.b(), 0);
    });

    it("hsv → toString('hsv') → parse → approximately same color", () => {
      const c = xcolor("hsv(240, 100%, 100%)");
      const str = c.toString("hsv");
      const c2 = xcolor(str);
      expect(c2.r()).toBeCloseTo(c.r(), 0);
      expect(c2.g()).toBeCloseTo(c.g(), 0);
      expect(c2.b()).toBeCloseTo(c.b(), 0);
    });

    it("cmyk → toString('cmyk') → parse → same color", () => {
      const c = xcolor("#ff0000");
      const str = c.toString("cmyk");
      const c2 = xcolor(str as any);
      expect(c2.r()).toBe(255);
      expect(c2.g()).toBe(0);
      expect(c2.b()).toBe(0);
    });
  });
});
