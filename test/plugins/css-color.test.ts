import hsvPluginForTest from "../../src/plugins/hsv";
import { xcolor as hsvFactoryForTest } from "../../src/core";
hsvFactoryForTest.use(hsvPluginForTest);
import { describe, expect, it } from "vitest";
import xcolor from "../../src";
import colorSpace, { convertColorSpace, formatColorSpace, fromColorSpace, parseCssColor } from "../../src/plugins/colorSpace";

describe("xcolor explicit CSS parsing", () => {
  it.each([
    ["rgb(255 0% 0 / 50%)", "#ff000080"],
    ["rgba(255, 0, 0)", "#ff0000"],
    ["hsl(1turn 100 50)", "#ff0000"],
    ["hsla(0, 100%, 50%, .5)", "#ff000080"],
    ["hwb(0 0 0)", "#ff0000"],
    ["rebeccapurple", "#663399"],
    ["#f008", "#ff000088"],
    ["transparent", "#00000000"],
    ["color(srgb-linear 0.21404114048223255 0 0)", "#800000"],
    [" LAB(120% 20 30 / 5) ", "#ffffff"],
    ["oklch(-.2 .3 1turn)", "#000000"],
  ])("parses CSS literal %s", (input, hex) => {
    expect(fromColorSpace(parseCssColor(input)!).toHex()).toBe(hex);
  });

  it.each([
    "rgb(10%, 20, 30)", "rgb(none, 0, 0)", "rgb(1, 2, 3 / .5)",
    "hsl(0, 100, 50)", "lab(50, 0, 0)", "hwb(0, 0%, 0%)",
    "color(srgb 1, 0, 0)", "color(unknown 1 0 0)", "color(srgb 1 0)",
    "rgb(1 2 3 4)", "rgb(1 2 3 /)", "rgb(1 2 3 / .5 / .2)",
    "rgb(1foo 2 3)", "rgb(1e999 0 0)", "hsl(50% 20% 30%)",
    "currentColor", "CanvasText", "var(--color)", "rgb(from red r g b)",
    "rgb(calc(1 + 2) 0 0)", "#ff", "ff0000", "hsv(0 100 100)",
    "rgb (1 2 3)", "rgb(1/**/ 2 3)", "color(srgb 1 0 0) trailing"
  ])("rejects unsupported or malformed strict input %s", input => {
    expect(parseCssColor(input)).toBeNull();
  });

  it.each([
    "rgb(none 10 none / none)", "hsl(none none 50%)", "hwb(none 0% none)",
    "lab(none 10 none)", "lch(50 none none / none)", "oklab(.5 none .2)",
    "oklch(none .2 none)", "color(display-p3 none .5 none / none)",
    "color(srgb-linear none none none)"
  ])("retains missing-channel semantics through serialization: %s", input => {
    const parsed = parseCssColor(input)!;
    const copy = JSON.stringify(parsed);
    expect(parsed.missing?.some(Boolean)).toBe(true);
    expect(parseCssColor(formatColorSpace(parsed))).toEqual(parsed);
    const resolved = convertColorSpace(parsed, parsed.space);
    expect(resolved.missing).toBeUndefined();
    parsed.missing?.slice(0, 3).forEach((missing, i) => {
      if (missing) expect(resolved.coordinates[i]).toBe(0);
    });
    if (parsed.missing?.[3]) expect(resolved.alpha).toBe(0);
    expect(JSON.stringify(parsed)).toBe(copy);
  });

  it("preserves wide coordinates and offers an explicit legacy syntax policy", () => {
    expect(parseCssColor("color(display-p3 -0.1 1.2 0)")!.coordinates).toEqual([-.1, 1.2, 0]);
    expect(parseCssColor("hsv(0 100 100)", { syntax: "loose" })!.space).toBe("hsv");
    expect(() => parseCssColor("red", { syntax: "bogus" as "strict" })).toThrow();
    expect(parseCssColor(null as unknown as string)).toBeNull();
  });

  it("adds linear RGB and none to registered inputs without replacing the strict API", () => {
    xcolor.use(colorSpace);
    expect(xcolor("color(srgb-linear .21404114048223255 0 0)").toHex()).toBe("#800000");
    expect(xcolor("rgb(none 255 0)").toHex()).toBe("#00ff00");
    expect(xcolor("#f00").toHex()).toBe("#ff0000");
    expect(parseCssColor("rgb(1, 2%, 3)")).toBeNull();
  });
});
