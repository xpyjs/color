import { describe, expect, it } from "vitest";
import xcolor from "../../src";
import colorSpace, { convertColorSpace, parseColorSpace, formatColorSpace, inGamut, mapToGamut, type XColorSpace } from "../../src/plugins/colorSpace";
import { parseWideColor } from "../../src/plugins/displayP3";

const spaces: XColorSpace[] = ["srgb","srgb-linear","display-p3","a98-rgb","prophoto-rgb","rec2020","xyz","xyz-d65","xyz-d50","lab","lch","oklab","oklch"];

describe("xcolor coordinate records", () => {
  it.each(["hsl", "hsv", "lab", "oklab", "xyz-d50", "srgb"] as const)("keeps tiny alpha and dark RGB detail through full-precision %s output", space => {
    xcolor.use(colorSpace);
    const source = xcolor({ r:1.25,g:2.5,b:3.75,a:.000123456789 }, { useDecimal:true });
    const record = source.toColorSpace(space);
    const serialized = formatColorSpace(record);
    const recovered = convertColorSpace(parseColorSpace(serialized)!, "srgb");
    recovered.coordinates.forEach((v,i)=>expect(v*255).toBeCloseTo([1.25,2.5,3.75][i],5));
    expect(recovered.alpha).toBe(.000123456789);
  });

  it("rounds only when explicitly requested and leaves the source intact", () => {
    const source = parseColorSpace("oklab(.1234567 .2345678 -.3456789 / .1234567)")!;
    expect(formatColorSpace(source,{precision:3})).toBe("oklab(0.123 0.235 -0.346 / 0.123)");
    expect(formatColorSpace(source,{precision:"full"})).toBe(formatColorSpace(source));
    expect(source.alpha).toBe(.1234567);
    for (const precision of [-1,16,1.5,NaN,Infinity]) expect(()=>formatColorSpace(source,{precision})).toThrow("precision");
  });

  it("preserves the original hex alpha byte through the record serialization path", () => {
    xcolor.use(colorSpace);
    const source = xcolor("#12345601");
    expect(xcolor(formatColorSpace(source.toColorSpace())).toHex()).toBe("#12345601");
    expect(xcolor(formatColorSpace(xcolor("#010203").toColorSpace("hsl"))).toHex()).toBe("#010203");
  });

  it.each(spaces)("roundtrips wide signed coordinates through %s without clipping", space => {
    const source = parseWideColor("color(display-p3 1.1 -.2 .4 / .1234)")!;
    const result = convertColorSpace(convertColorSpace(source, space), "display-p3");
    result.coordinates.forEach((v,i)=>expect(v).toBeCloseTo(source.coordinates[i], 5));
    expect(result.alpha).toBe(0.1234);
    expect(source.coordinates).toEqual([1.1,-.2,.4]);
  });

  it("detects wide gamut and clips only on explicit request", () => {
    const source = parseColorSpace("color(display-p3 1 0 0 / .25)")!;
    expect(inGamut(source, "display-p3")).toBe(true);
    expect(inGamut(source)).toBe(false);
    const srgb = convertColorSpace(source,"srgb");
    expect(srgb.coordinates[0]).toBeGreaterThan(1);
    expect(srgb.coordinates[1]).toBeLessThan(0);
    const mapped = mapToGamut(source);
    expect(mapped.coordinates).toEqual([1,0,0]);
    expect(mapped.alpha).toBe(.25);
    expect(formatColorSpace(source)).toBe("color(display-p3 1 0 0 / 0.25)");
  });

  it.each(["srgb", "display-p3", "rec2020"] as const)("reduces OKLCh chroma into %s while preserving lightness and hue", target => {
    const source = parseColorSpace("oklch(.65 .5 40 / .35)")!;
    const mapped = mapToGamut(source, target, "oklch-chroma");
    expect(inGamut(mapped,target)).toBe(true);
    const lch = convertColorSpace(mapped,"oklch");
    expect(lch.coordinates[0]).toBeCloseTo(.65,5);
    expect(lch.coordinates[1]).toBeLessThan(.5);
    expect(lch.coordinates[2]).toBeCloseTo(40,3);
    expect(mapped.alpha).toBe(.35);
  });

  it("maps black/white endpoints and returns independent copies", () => {
    expect(mapToGamut(parseColorSpace("oklab(1.2 .4 .4)")!,"srgb","oklch-chroma").coordinates).toEqual([1,1,1]);
    expect(mapToGamut(parseColorSpace("oklab(-.2 .4 .4)")!,"srgb","oklch-chroma").coordinates).toEqual([0,0,0]);
    const source = parseColorSpace("#123456")!;
    const copy = convertColorSpace(source,"srgb");
    expect(copy).toEqual(source);
    expect(copy.coordinates).not.toBe(source.coordinates);
    expect(mapToGamut(source,"srgb","oklch-chroma").coordinates).toEqual(source.coordinates);
  });

  it.each(["lab(50% 20% -20% / 25%)", "lch(50% 20% .5turn)", "oklab(50% 10% -10%)", "oklch(50% 10% 180)", "color(xyz-d50 .2 .3 .4)", "color(srgb-linear .2 .3 .4)"])("serializes %s without losing coordinates", input => {
    const parsed = parseColorSpace(input)!;
    expect(parsed).not.toBeNull();
    expect(parseColorSpace(formatColorSpace(parsed))).toEqual(parsed);
  });

  it("uses D50 Lab reference coordinates and offers an opt-in instance bridge", () => {
    const red = parseColorSpace("#ff0000")!;
    const lab = convertColorSpace(red,"lab");
    expect(lab.coordinates[0]).toBeCloseTo(54.29,2);
    expect(lab.coordinates[1]).toBeCloseTo(80.8,1);
    expect(lab.coordinates[2]).toBeCloseTo(69.89,1);
    xcolor.use(colorSpace);
    expect(xcolor("#f00").alpha(.1234).toColorSpace("lab").coordinates).toEqual(lab.coordinates);
    expect(xcolor("#f00").alpha(.1234).toColorSpace().alpha).toBe(.1234);
    expect(()=>xcolor("bogus").toColorSpace()).toThrow("Invalid source");
  });

  it("rejects malformed syntax and records", () => {
    for (const input of ["bogus", "oklab(50% bad 0)", "color(display-p3 1 2)", "oklch(.5 .2 nope)"]) expect(parseColorSpace(input)).toBeNull();
    const source = parseColorSpace("#f00")!;
    expect(()=>convertColorSpace({...source,alpha:NaN},"srgb")).toThrow();
    expect(()=>convertColorSpace(source,"bogus" as XColorSpace)).toThrow();
    expect(()=>convertColorSpace({...source,coordinates:[1e308,1e308,1e308]},"xyz")).toThrow(/overflow/);
    expect(()=>inGamut(source,"srgb",-1)).toThrow();
    expect(()=>mapToGamut(source,"lab" as never)).toThrow();
    expect(()=>mapToGamut(source,"srgb","bogus" as never)).toThrow();
  });
});
