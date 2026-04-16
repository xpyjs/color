// =======================================
// Tests: Index exports
// =======================================

import { describe, it, expect } from "vitest";
import xcolor, {
  XColor,
  xcolor as namedXcolor,
  clamp,
  round,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  relativeLuminance,
  contrastRatio
} from "../src/index";
import type { RGBA, HSLA, HSVA, XColorInput, XColorPlugin } from "../src/index";

describe("index exports", () => {
  it("should export default xcolor factory", () => {
    expect(typeof xcolor).toBe("function");
    const c = xcolor("#ff0000");
    expect(c).toBeInstanceOf(XColor);
  });

  it("should export named xcolor", () => {
    expect(typeof namedXcolor).toBe("function");
    expect(namedXcolor).toBe(xcolor);
  });

  it("should export XColor class", () => {
    expect(typeof XColor).toBe("function");
    const c = new XColor("#ff0000");
    expect(c.r()).toBe(255);
  });

  it("should export utility functions", () => {
    expect(typeof clamp).toBe("function");
    expect(typeof round).toBe("function");
    expect(typeof rgbToHsl).toBe("function");
    expect(typeof hslToRgb).toBe("function");
    expect(typeof rgbToHsv).toBe("function");
    expect(typeof hsvToRgb).toBe("function");
    expect(typeof relativeLuminance).toBe("function");
    expect(typeof contrastRatio).toBe("function");
  });

  it("should work with types (compilation check)", () => {
    const rgba: RGBA = { r: 255, g: 0, b: 0, a: 1 };
    const hsla: HSLA = { h: 0, s: 100, l: 50, a: 1 };
    const hsva: HSVA = { h: 0, s: 100, v: 100, a: 1 };
    const input: XColorInput = "#ff0000";
    const plugin: XColorPlugin = {
      name: "@test/index/compile-check",
      install() {}
    };
    const objectPlugin: XColorPlugin = {
      name: "@test/index/object-plugin",
      install() {}
    };
    expect(rgba.r).toBe(255);
    expect(hsla.h).toBe(0);
    expect(hsva.v).toBe(100);
    expect(input).toBe("#ff0000");
    expect(typeof plugin.install).toBe("function");
    expect(objectPlugin.name).toBe("@test/index/object-plugin");
  });
});
