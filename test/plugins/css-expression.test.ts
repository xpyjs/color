import { describe, expect, it } from "vitest";
import { resolveCssColor, parseCssColor, formatColorSpace, fromColorSpace } from "../../src/plugins/colorSpace";

describe("xcolor CSS expressions", () => {
  it.each([
    ["color-mix(in srgb, red, blue)", "#800080"],
    ["color-mix(in srgb, red 25%, blue)", "#4000bf"],
    ["color-mix(in srgb, red, blue 25%)", "#bf0040"],
    ["color-mix(in srgb, red 20%, blue 20%)", "#80008066"],
    ["color-mix(in srgb, red 80%, blue 80%)", "#800080"],
    ["color-mix(in srgb-linear, black, white)", "#bcbcbc"],
    ["color-mix(in srgb, rgb(255 0 0 / 0), blue)", "#0000ff80"],
    ["color-mix(in srgb, color-mix(in srgb, red, blue), white)", "#bf80bf"],
    ["rgb(from #804020 r g b)", "#804020"],
    ["rgb(from #804020 calc(r * 2) calc(g + 16) b / .5)", "#ff502080"],
    ["hsl(from red calc(h + 120) s l)", "#00ff00"],
    ["hwb(from red h w b)", "#ff0000"],
    ["rgb(from rgb(128 0 0 / .4) r 0 0)", "#80000066"],
    ["rgb(from red calc((r - 55) / 2) 0 0)", "#640000"],
  ])("resolves %s", (input, hex) => {
    expect(fromColorSpace(resolveCssColor(input)!).toHex()).toBe(hex);
  });

  it("matches the CSS Color 5 premultiplied-alpha example", () => {
    const result = resolveCssColor("color-mix(in srgb, rgb(100% 0% 0% / .7) 20%, rgb(0% 100% 0% / .2) 60%)")!;
    expect(result.alpha).toBeCloseTo(.26, 12);
    expect(result.coordinates[0]).toBeCloseTo(.175 / .325, 12);
    expect(result.coordinates[1]).toBeCloseTo(.15 / .325, 12);
  });

  it.each([
    ["shorter", 0], ["longer", 180], ["increasing", 0], ["decreasing", 180]
  ])("supports %s hue paths", (path, expected) => {
    const result = resolveCssColor(`color-mix(in oklch ${path} hue, oklch(.5 .2 350), oklch(.5 .2 10))`)!;
    expect(result.coordinates).toEqual([.5, .2, expected]);
  });

  it("carries missing components and neutral hues before interpolation", () => {
    expect(formatColorSpace(resolveCssColor("color-mix(in oklch, oklch(.5 .2 none), oklch(.7 .1 120))")!)).toBe("oklch(0.6 0.15000000000000002 120)");
    const missing = resolveCssColor("color-mix(in lab, lab(50 none none / none), lab(70 none none / none))")!;
    expect(missing.missing).toEqual([false, true, true, true]);
    expect(missing.coordinates[0]).toBe(60);
    const missingChroma = resolveCssColor("color-mix(in oklch, oklch(.5 none 30), oklch(.5 .2 90))")!;
    expect(missingChroma.coordinates[2]).toBe(60);
    expect(resolveCssColor("color-mix(in hsl, hsl(0 0 50), hsl(120 100 50))")!.coordinates[0]).toBe(120);
    expect(resolveCssColor("color-mix(in lch, lab(50 none none), lch(50 none none))")!.missing).toEqual([false, true, true, false]);
  });

  it("preserves wide coordinates and relative missing values", () => {
    const wide = resolveCssColor("color(from color(display-p3 1 0 0 / .4) srgb r g b)")!;
    expect(wide.coordinates[0]).toBeGreaterThan(1);
    expect(wide.coordinates[1]).toBeLessThan(0);
    expect(wide.alpha).toBe(.4);
    const relative = resolveCssColor("oklch(from lab(50 none none / none) l c h)")!;
    expect(relative.missing).toEqual([false, true, true, true]);
    expect(resolveCssColor("lab(from lab(50 10 20) calc(l + 100) a b)")!.coordinates[0]).toBe(150);
    expect(resolveCssColor("rgb(from red r g b / calc(alpha * 2))")!.alpha).toBe(1);
  });

  it("uses explicit currentColor and case-sensitive custom properties", () => {
    const context = { currentColor: "#123456", variables: { "--Brand": "red", "--alias": "var(--Brand)" } };
    expect(fromColorSpace(resolveCssColor("currentColor", context)!).toHex()).toBe("#123456");
    expect(fromColorSpace(resolveCssColor("rgb(from var(--alias) r g b)", context)!).toHex()).toBe("#ff0000");
    expect(fromColorSpace(resolveCssColor("var(--brand, blue)", context)!).toHex()).toBe("#0000ff");
    expect(resolveCssColor("var(--brand)", context)).toBeNull();
    expect(resolveCssColor("currentColor")).toBeNull();
    const record = parseCssColor("lab(50 none none)")!;
    const result = resolveCssColor("var(--color)", {variables:{"--color":record}})!;
    expect(result).toEqual(record);
    expect(result.coordinates).not.toBe(record.coordinates);
  });

  it.each([
    "color-mix(in srgb, red 0%, blue 0%)", "color-mix(in srgb, red -1%, blue)",
    "color-mix(in srgb, red 101%, blue)", "color-mix(in srgb longer hue, red, blue)",
    "color-mix(in nonsense, red, blue)", "color-mix(in srgb, red, blue, green)",
    "color-mix(in srgb, red 1, blue)", "color-mix(in hsv, red, blue)",
    "rgb(from red r g)", "rgb(from red r g b /)", "rgb(from red r g b / 1 extra)",
    "rgb(from red calc(r / 0) g b)", "rgb(from red calc(r + bogus) g b)",
    "rgb(from red calc(Math.random()) g b)", "rgb(from red calc(r + 10%) g b)",
    "rgb(from red r g b / alpha extra)", "color(from red lab l a b)",
    "var(--missing)", "var(bad, red)", "var(--a, red, blue)",
    "color-mix(in srgb, rgb(1 2 3, blue)", "rgb(from red r g b))"
  ])("rejects malformed or unsupported expressions %s", input => {
    expect(resolveCssColor(input)).toBeNull();
  });

  it("bounds cycles, nesting and expression sizes", () => {
    expect(resolveCssColor("var(--a)", {variables:{"--a":"var(--b)","--b":"var(--a)"}})).toBeNull();
    expect(resolveCssColor("currentColor", {currentColor:"currentColor"})).toBeNull();
    expect(resolveCssColor("var(--x,".repeat(40) + "red" + ")".repeat(40))).toBeNull();
    expect(resolveCssColor(" ".repeat(16385))).toBeNull();
    expect(resolveCssColor("rgb(from red calc(" + "(".repeat(40) + "r" + ")".repeat(40) + ") g b)")).toBeNull();
    expect(resolveCssColor("var(--x)", {variables:{"--x":{space:"lab",coordinates:[NaN,0,0],alpha:1}}})).toBeNull();
  });
});
