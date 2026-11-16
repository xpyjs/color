import { describe, expect, it } from "vitest";
import { linearToSrgb, srgbToLinear } from "../src/color-math";
import * as p3 from "../src/plugins/displayP3";
import * as proPhoto from "../src/plugins/proPhotoRgb";
import * as rec2020 from "../src/plugins/rec2020";

describe("xcolor extended transfer functions", () => {
  it.each([0.001, 0.02, 0.04045, 0.1, 0.5, 1, 1.2])("roundtrips signed sRGB channel %s", value => {
    expect(srgbToLinear(-value * 255)).toBeCloseTo(-srgbToLinear(value * 255), 12);
    expect(linearToSrgb(srgbToLinear(-value * 255))).toBeCloseTo(-value, 6);
    expect(linearToSrgb(srgbToLinear(value * 255))).toBeCloseTo(value, 6);
  });

  // Independent matrix/transfer reference vectors, with final sRGB clipping.
  // Rec.2020 retains this library's existing alpha/beta transfer curve.
  it.each([
    ["display-p3", [0, 132.34353031, 129.79001008]],
    ["prophoto-rgb", [0, 173.13035451, 147.07384027]],
    ["rec2020", [0, 154.27539546, 141.67503837]]
  ] as const)("converts negative %s coordinates without treating them as small signals", (space, expected) => {
    const input = `color(${space} -.5 .5 .5 / .1234)`;
    const rgb = space === "display-p3" ? p3.toSrgb(p3.parseWideColor(input)!)
      : space === "prophoto-rgb" ? proPhoto.toSrgb(proPhoto.parseWideColor(input)!)
      : rec2020.toSrgb(rec2020.parseWideColor(input)!);
    [rgb.r, rgb.g, rgb.b].forEach((value, i) => expect(value).toBeCloseTo(expected[i], 6));
    expect(rgb.a).toBe(0.1234);
  });
});
