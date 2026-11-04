import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import xcolor, { defineMethod, Logger, normalizeSteps, parseColor, registerColorParser, registerStringFormatter } from "@xpyjs/color";
import a11y from "@xpyjs/color/plugins/a11y";
import blend from "@xpyjs/color/plugins/blend";
import cmyk from "@xpyjs/color/plugins/cmyk";
import displayP3, { formatWideColor, parseWideColor, toSrgb } from "@xpyjs/color/plugins/displayP3";
import * as a98 from "@xpyjs/color/plugins/a98Rgb";
import * as proPhoto from "@xpyjs/color/plugins/proPhotoRgb";
import * as rec from "@xpyjs/color/plugins/rec2020";
import * as xyzRecords from "@xpyjs/color/plugins/xyz";
import gradient from "@xpyjs/color/plugins/gradient";
import harmony from "@xpyjs/color/plugins/harmony";
import hwb from "@xpyjs/color/plugins/hwb";
import lab from "@xpyjs/color/plugins/lab";
import oklab from "@xpyjs/color/plugins/oklab";
import palette from "@xpyjs/color/plugins/palette";
import scale, { type ScaleEasing } from "@xpyjs/color/plugins/scale";
import simulate, { type SimulateMode } from "@xpyjs/color/plugins/simulate";
import theme, { generateTheme } from "@xpyjs/color/plugins/theme";
import xyz from "@xpyjs/color/plugins/xyz";

beforeAll(() => {
  xcolor.use(a11y).use(blend).use(cmyk).use(displayP3).use(gradient)
    .use(harmony).use(hwb).use(lab).use(oklab).use(palette).use(scale).use(simulate).use(xyz);
});

afterEach(() => vi.unstubAllGlobals());

describe("xcolor published behavior regressions", () => {
  it.each([
    1.5, "rgb(nope 0 0)", "rgb(1,,2,3)", "rgb(1 2 3 / 1 / .5)",
    "rgb(1 2 3 / 50px)", "hsl(5deg 1turn 50%)",
    "color(display-p31 0 0)", "color(display-p3 1 0 0 9)",
    "color(display-p3 1 0 0 / .2 / .7)", "cmyk(1% 2bad 3% 4%)"
  ])("rejects malformed input %s", (input) => {
    expect(xcolor(input).isValid()).toBe(false);
  });

  it("diagnoses cyclic objects and rejects invalid values in comparisons", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(parseColor(cyclic)).toBeNull();
    expect(xcolor("#000").equals("invalid")).toBe(false);
  });

  it.each([
    ["color(srgb 50% 0 0)", "color(srgb .5 0 0)"],
    ["color(display-p3 25% 10% 5%)", "color(display-p3 .25 .1 .05)"],
    ["color(xyz-d50 25% 30% 10%)", "color(xyz-d50 .25 .3 .1)"],
    ["hwb(.5turn 0% 0%)", "hwb(180 0% 0%)"],
    ["oklab(50% 10% -10%)", "oklab(.5 .04 -.04)"],
    ["oklch(50% 10% .5turn)", "oklch(.5 .04 180)"],
    ["lab(50% 20% -20%)", "lab(50 25 -25)"],
    ["lch(50% 20% .5turn)", "lch(50 30 180)"]
  ])("normalizes CSS units in %s", (input, equivalent) => {
    const color = xcolor(input);
    expect(color.isValid()).toBe(true);
    expect(color.equals(equivalent)).toBe(true);
  });

  it("retains decimal precision through parsing, cloning and interpolation", () => {
    const options = { useDecimal: true };
    const color = xcolor("rgb(12.5 34.567 56.789)", options);
    const target = xcolor({ r: 23.5, g: 0, b: 0 }, options);
    expect(color.red()).toBe(12.5);
    expect(target.red()).toBe(23.5);
    expect(xcolor(color, { useDecimal: false }).red()).toBe(13);
    expect(xcolor("hsl(0 0% 50%)", options).red()).toBe(127.5);
    expect(color.at(target, 0, { space: "hsl" }).toRgb()).toEqual(color.toRgb());
    expect(color.at(target, 1, { space: "hsl" }).toRgb()).toEqual(target.toRgb());
    expect(color.gradient(target, 3)[1].green()).toBeCloseTo(17.2835);
  });

  it.each(["rgb", "hsl", "hsv", "lab", "lch", "oklab", "oklch", "hwb", "xyz", "displayP3", "cmyk"] as const)(
    "retains alpha in %s strings", (format) => {
      expect(xcolor(xcolor("#f00").alpha(0.999).toString(format)).alpha()).toBe(0.999);
    }
  );

  it("keeps alpha consistent across object, array, and string serializers", () => {
    const color = xcolor("#f00").alpha(0.995);
    expect(color.toRgb().a).toBe(0.995);
    expect(color.toRgbArray()[3]).toBe(0.995);
    expect(color.toHsl().a).toBe(0.995);
    expect(color.toHsv().a).toBe(0.995);
    expect(color.toRgbString()).toContain("0.995");
    expect(color.toHslString()).toContain("0.995");
    expect(color.toHsvString()).toContain("0.995");
  });

  it("blends alpha before applying source-over and preserves the transparent-source identity", () => {
    expect(xcolor("#f000").blend("#00f", "multiply").toHex()).toBe("#0000ff");
    expect(xcolor("#f008").blend("#00f0", "multiply").toHex()).toBe("#ff000088");
    const composite = xcolor("#f00").alpha(0.5).blend(xcolor("#00f").alpha(0.5), "multiply");
    expect(composite.toRgb()).toEqual({ r: 85, g: 0, b: 85, a: 0.75 });
  });

  it("uses exact WCAG thresholds and chooses the better black/white fallback", () => {
    const gray = xcolor({ r: 118.657, g: 118.657, b: 118.657 }, { useDecimal: true });
    expect(gray.contrast("#fff")).toBe(4.5);
    expect(gray.isReadable("#fff")).toBe(false);
    expect(gray.wcagLevel("#fff").level).toBe("FAIL");
    expect(xcolor("#f00").mostReadable([]).toHex()).toBe("#000000");
  });

  it("guards generation sizes, angles, and inherited mode keys", () => {
    const color = xcolor("#f00");
    expect(color.analogous(Infinity)).toHaveLength(6);
    expect(color.analogous(3, 0)[1].toHex()).toBe(color.clone().spin(12).toHex());
    expect(color.monochromatic(2.5)).toHaveLength(2);
    expect(color.spin(NaN).toHex()).toBe("#ff0000");
    expect(color.at("#00f", 0.5, { easing: "toString" as ScaleEasing }).toHex()).toBe("#800080");
    expect(color.simulate("toString" as SimulateMode).toHex()).toBe(color.toHex());
    expect(() => color.blend("#00f", "toString" as never)).toThrow("Unknown blend mode");
  });

  it("replaces plugin registrations on success and rolls them back on failure", () => {
    const cleanup = vi.fn();
    function plugin(value: number, fail = false) {
      return {
        name: "replace-regression",
        install(_option: unknown, cls: typeof import("@xpyjs/color").XColor) {
          registerColorParser((input) => input === "replace-regression" ? { r: value, g: 0, b: 0, a: 1 } : null);
          registerStringFormatter(cls, "replace-regression", () => String(value));
          if (fail) throw new Error("installation failed");
          return cleanup;
        }
      };
    }
    const color = xcolor("#f00");
    xcolor.use(plugin(12));
    xcolor.use(plugin(24));
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(() => xcolor.use(plugin(99, true))).toThrow("installation failed");
    expect(xcolor("replace-regression").red()).toBe(24);
    expect(color.toString("replace-regression" as never)).toBe("24");
  });

  it("keeps a valid theme and injected CSS when an update fails", () => {
    xcolor.use(theme, {
      colors: { primary: { DEFAULT: "#456", hover: "#abc8", text: "var(--custom)" } },
      darkMode: "class",
      format: "rgb",
      shades: []
    });
    const initial = xcolor.getThemeCss();
    expect(initial).toContain("rgba(170, 187, 204, 0.5333)");
    expect(initial).toContain("var(--custom)");
    expect(initial).not.toContain(".dark");
    xcolor.getThemeVars()["--x-primary"] = "invalid";
    expect(xcolor.getThemeVars()["--x-primary"]).toBe("#445566");

    const style = { textContent: "" };
    vi.stubGlobal("document", { getElementById: () => style });
    xcolor.injectTheme();
    expect(() => xcolor.updateTheme({ shades: [500], type: () => [] })).toThrow("one valid XColor per shade");
    expect(style.textContent).toBe(initial);
    expect(xcolor.getThemeCss()).toBe(initial);
    xcolor.updateTheme({ colors: { primary: "#f00" }, derive: { chromaScale: 0 } });
    expect(style.textContent).toBe(xcolor.getThemeCss());
    const derived = xcolor(xcolor.getThemeVars()["--x-success"]);
    expect(derived.red()).toBe(derived.green());
    expect(derived.green()).toBe(derived.blue());
  });

  it("uses shade values to classify linear shades when 500 is absent", () => {
    const [light, dark] = xcolor("#f00").palette({ type: "linear", shades: [100, 900] });
    expect(light.toHex()).toBe("#ffffff");
    expect(dark.toHex()).toBe("#000000");
  });
  it("keeps parser order and rolls back methods on failed replacement", () => {
    const parser = (red: number) => (input: unknown) =>
      input === "priority-regression" ? { r: red, g: 0, b: 0, a: 1 } : null;
    const first = (red: number, fail = false) => ({
      name: "first-priority-regression",
      install(_option: unknown, cls: typeof import("@xpyjs/color").XColor) {
        registerColorParser(parser(red));
        defineMethod(cls, "rollbackCheck", () => red);
        if (fail) {
          defineMethod(cls, "rollbackNew", () => red);
          throw new Error("rollback");
        }
      }
    });
    xcolor.use(first(10));
    xcolor.use({ name: "second-priority-regression", install() { registerColorParser(parser(20)); } });
    xcolor.use(first(30));
    expect(() => xcolor.use(first(40, true))).toThrow("rollback");
    expect(xcolor("priority-regression").red()).toBe(30);
    const color = xcolor("#f00") as unknown as { rollbackCheck: () => number };
    expect(color.rollbackCheck()).toBe(30);
    expect("rollbackNew" in color).toBe(false);
  });

  it("rejects invalid colors in accessibility decisions", () => {
    const white = xcolor("#fff");
    const invalid = xcolor("bogus");
    expect(white.isReadable("bogus")).toBe(false);
    expect(invalid.isReadable(white)).toBe(false);
    expect(() => white.wcagLevel(invalid)).toThrow("Invalid color");
    expect(() => invalid.mostReadable([white])).toThrow("Invalid base color");
    expect(white.mostReadable([invalid, "#000"]).toHex()).toBe("#000000");
  });

  it("handles dodge and burn extremes and normal source-over", () => {
    expect(xcolor("#000").blend("#fff", "dodge").toHex()).toBe("#000000");
    expect(xcolor("#fff").blend("#000", "burn").toHex()).toBe("#ffffff");
    expect(xcolor("#fff").blend("rgb(0 0 0 / .5)", "burn").toHex()).toBe("#ffffff");
    expect(xcolor("#444").blend("#888", "dodge").red()).toBe(146);
    const result = xcolor("#f00").alpha(.5).blend(xcolor("#00f").alpha(.5), "normal");
    expect(result.toRgb()).toEqual({ r: 85, g: 0, b: 170, a: .75 });
  });

  it("resolves scale targets once and preserves neutral 950 shades", () => {
    const parse = vi.fn((value: unknown) => value === "scale-target" ? { r: 0, g: 0, b: 255, a: 1 } : null);
    const unregister = registerColorParser(parse);
    try {
      expect(xcolor("#f00").scale("scale-target")).toHaveLength(5);
      expect(parse).toHaveBeenCalledTimes(1);
    } finally {
      unregister();
    }
    expect(normalizeSteps(undefined, NaN)).toBe(5);
    expect(xcolor("#888").palette({ shades: [950] })[0].toHex()).toMatch(/^#([\da-f]{2})\1\1$/);
  });

  it("supports linear sRGB, OKLab and opt-in premultiplied coordinates", () => {
    const black = xcolor("#000");
    expect(black.at("#fff", .5, { space: "srgb-linear" }).toHex()).toBe("#bcbcbc");
    expect(black.at("#fff", .5, { space: "oklab" }).toHex()).toBe("#636363");
    const transparent = xcolor("#f000");
    expect(transparent.at("#00f", .5).toHex()).toBe("#80008080");
    expect(transparent.at("#00f", .5, { premultiplyAlpha: true }).toHex()).toBe("#0000ff80");
    expect(transparent.at("#00f0", .5, { space: "hsl", premultiplyAlpha: true }).alpha()).toBe(0);
  });

  it("validates inputs silently and exposes HSL and HSV tuples", () => {
    const warning = vi.spyOn(Logger, "warn");
    const unregister = registerColorParser((value) => {
      if (value === "test-validation-error") throw new Error("validation error");
      return null;
    });
    try {
      expect(xcolor.isValidInput("test-validation-error")).toBe(false);
      expect(xcolor.isValidInput("#f00")).toBe(true);
      expect(xcolor.isValidInput(undefined)).toBe(false);
      expect(xcolor.isValidInput(xcolor("#f00"))).toBe(true);
      expect(warning).not.toHaveBeenCalled();
    } finally {
      unregister();
      warning.mockRestore();
    }
    const color = xcolor("#f00").alpha(.5);
    expect(color.toHslArray()).toEqual([0, 100, 50, .5]);
    expect(color.toHsvArray()).toEqual([0, 100, 100, .5]);
  });

  it("generates isolated themes and synchronizes existing styles on reinstall", () => {
    xcolor.use(theme, { colors: { primary: "#f00" } });
    expect(() => xcolor.use(theme, { colors: { primary: "#fff" }, type: () => [] })).toThrow();
    expect(xcolor.getThemeVars()["--x-primary"]).toBe("#ff0000");
    const style = { textContent: "" };
    vi.stubGlobal("document", { getElementById: () => style });
    xcolor.injectTheme();
    expect(generateTheme({ colors: { primary: "#0f0" } }).vars["--x-primary"]).toBe("#00ff00");
    expect(style.textContent).toContain("--x-primary: #ff0000");
    expect(() => xcolor.use(theme, { colors: { primary: "#fff" }, type: () => [] })).toThrow();
    expect(xcolor.getThemeVars()["--x-primary"]).toBe("#ff0000");
    xcolor.use(theme, { colors: { primary: "#0f0" } });
    expect(style.textContent).toContain("--x-primary: #00ff00");
    xcolor.updateTheme({ colors: { primary: "#00f" } });
    expect(style.textContent).toBe(xcolor.getThemeCss());
  });

  it("supports an explicit D50 Lab pipeline and retains D65 by default", () => {
    xcolor.use(lab, { whitePoint: "D50" });
    try {
      const red = xcolor("#f00");
      expect(red.toLab().l).toBeCloseTo(54.29, 2);
      expect(xcolor(red.toLabString()).toHex()).toBe("#ff0000");
      expect(xcolor(red.toLchString()).toHex()).toBe("#ff0000");
    } finally {
      xcolor.use(lab);
    }
    expect(xcolor("#f00").toLab().l).toBe(53.24);
  });

  it("retains wide-gamut coordinates until the caller explicitly clips to sRGB", () => {
    const source = "color(display-p3 1 .4 0 / .3)";
    const color = parseWideColor(source)!;
    expect(color).toEqual({ space: "display-p3", coordinates: [1, .4, 0], alpha: .3 });
    expect(parseWideColor(formatWideColor(color))).toEqual(color);
    expect(xcolor(toSrgb(color)).toHex()).toBe(xcolor(source).toHex());
    expect(xcolor(source).toDisplayP3().r).not.toBeCloseTo(color.coordinates[0]);
    expect(parseWideColor("color(rec2020 1 0 0)")).toBeNull();
  });

  it("keeps the original wide space and signed coordinates in every wide plugin", () => {
    const sources = [
      [a98.parseWideColor, "a98-rgb"],
      [proPhoto.parseWideColor, "prophoto-rgb"],
      [rec.parseWideColor, "rec2020"],
      [xyzRecords.parseWideColor, "xyz-d50"],
      [xyzRecords.parseWideColor, "xyz"]
    ] as const;
    for (const [parse, space] of sources) {
      const color = parse(`color(${space} 1.2 -.2 25% / 40%)`)!;
      expect(color).toEqual({ space, coordinates: [1.2, -.2, .25], alpha: .4 });
      expect(parse(formatWideColor(color))).toEqual(color);
    }
  });

});
