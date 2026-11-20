import { describe, expect, it } from "vitest";
import xcolor from "../../src";
import hsv from "../../src/plugins/hsv";

describe("xcolor optional HSV plugin", () => {
  it("requires explicit registration and restores HSV behavior on existing instances", () => {
    const color = xcolor("#008000", { strict: true });
    expect(typeof color.toHsv).toBe("undefined");
    expect(xcolor.isValidInput("hsv(120 100% 100%)")).toBe(false);
    expect(xcolor.isValidInput({ h: 120, s: 100, v: 100 })).toBe(false);
    xcolor.use(hsv);
    expect(color.value(100)).toBe(color);
    expect(color.toHex()).toBe("#00ff00");
    expect(xcolor("hsva(120,100%,100%,.25)").toString("hsv")).toBe("hsva(120, 100%, 100%, 0.25)");
    expect(xcolor({ h: 120, s: 100, v: 100 }).toHex()).toBe("#00ff00");
    const before = color.toHex();
    expect(() => color.hsv(120, NaN, 50)).toThrow();
    expect(color.toHex()).toBe(before);
    xcolor.use(hsv);
    expect(color.v(50).toHsvArray()).toEqual([120, 100, 50.2, 1]);
  });
});
