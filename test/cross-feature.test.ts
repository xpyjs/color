import { describe, expect, it } from "vitest";
import xcolor from "../src";
import blend from "../src/plugins/blend";
import palette from "../src/plugins/palette";
import hwb from "../src/plugins/hwb";
import { createTheme } from "../src/plugins/theme";
import { adjustContrast, auditContrastPairs } from "../src/plugins/a11y";
import colorSpace, { convertColorSpace, parseCssColor, formatColorSpace, fromColorSpace, createColorGradient, generatePerceptualPalette, type XColorSpace, type XColorSpaceRecord } from "../src/plugins/colorSpace";

xcolor.use(blend).use(palette).use(colorSpace).use(hwb);
const spaces:XColorSpace[] = ["srgb","srgb-linear","display-p3","a98-rgb","prophoto-rgb","rec2020","xyz","xyz-d65","xyz-d50","lab","lch","oklab","oklch","hsl","hsv","hwb"];
let seed = 123456789;
const random = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
const samples:XColorSpaceRecord[] = Array.from({length:24},()=>({space:"srgb",coordinates:[random(),random(),random()],alpha:random()}));

describe("xcolor cross-feature invariants", () => {
  it.each(spaces)("round-trips seeded finite sRGB samples through %s", space => {
    for (const sample of samples) {
      const converted = convertColorSpace(sample,space);
      const roundtrip = convertColorSpace(converted,"srgb");
      roundtrip.coordinates.forEach((value,i)=>expect(Math.abs(value-sample.coordinates[i])).toBeLessThan(5e-6));
      expect(roundtrip.alpha).toBe(sample.alpha);
      if (space !== "hsv") {
        const parsed = parseCssColor(formatColorSpace(converted))!;
        expect(parsed).not.toBeNull();
        const reparsed = convertColorSpace(parsed,"srgb");
        reparsed.coordinates.forEach((value,i)=>expect(Math.abs(value-sample.coordinates[i])).toBeLessThan(5e-6));
        expect(reparsed.alpha).toBe(sample.alpha);
      }
    }
  });

  it("matches independent linear-sRGB and D65/D50 white references", () => {
    const red = parseCssColor("color(srgb-linear 1 0 0)")!;
    const xyz = convertColorSpace(red,"xyz-d65");
    [0.4123907993,0.2126390059,0.0193308187].forEach((value,i)=>expect(xyz.coordinates[i]).toBeCloseTo(value,7));
    const white = convertColorSpace(parseCssColor("#fff")!,"xyz-d50");
    [.9642956764,1,.8251046025].forEach((value,i)=>expect(white.coordinates[i]).toBeCloseTo(value,6));
  });

  it("preserves a gradient when a sampled midpoint becomes an additional stop", () => {
    const a = parseCssColor("oklab(.3 .08 -.05 / .3)")!, b = parseCssColor("oklab(.8 -.07 .1 / .9)")!;
    const original = createColorGradient([{color:a},{color:b}]);
    const split = createColorGradient([{color:a},{color:original.at(.5),position:.5},{color:b}]);
    for (const t of [.1,.25,.49,.51,.75,.9]) {
      const left = original.at(t), right = split.at(t);
      left.coordinates.forEach((value,i)=>expect(value).toBeCloseTo(right.coordinates[i],12));
      expect(left.alpha).toBeCloseTo(right.alpha,12);
    }
  });

  it("keeps source-over associative at full precision", () => {
    for (let i=0;i<samples.length;i+=3) {
      const [a,b,c] = samples.slice(i,i+3).map(value=>fromColorSpace(value,{useDecimal:true,strict:true}));
      const left = a.composite(b).composite(c), right = a.composite(b.composite(c));
      [left.red(),left.green(),left.blue(),left.alpha()].forEach((value,index)=>expect(value).toBeCloseTo([right.red(),right.green(),right.blue(),right.alpha()][index],10));
      expect(left.clone().red(12.345).red()).toBe(12.345);
      expect(()=>left.clone().red(NaN)).toThrow();
    }
  });

  it("keeps palette subset assignments and options after composition", () => {
    const base = xcolor("#123456",{useDecimal:true,strict:true}).composite("#abcdef80").alpha(.34567);
    const full = base.palette({type:"linear",shades:[100,500,900]});
    const subset = base.palette({type:"linear",shades:[900,100]});
    expect(subset.map(c=>c.toHex())).toEqual([full[2].toHex(),full[0].toHex()]);
    for (const color of full) {
      expect(color.alpha()).toBe(.34567);
      expect(()=>color.red(NaN)).toThrow();
    }
    for (const sample of samples) {
      const shades = generatePerceptualPalette(sample);
      for (let i=1;i<shades.length;i++) expect(convertColorSpace(shades[i].color,"oklab").coordinates[0]).toBeLessThanOrEqual(convertColorSpace(shades[i-1].color,"oklab").coordinates[0]+1e-6);
    }
  });

  it("audits adjusted theme pairs independently in light and dark snapshots", () => {
    const theme = createTheme({colors:{text:"#888",surface:"#eee"},darkMode:"class"});
    for (const mode of ["light","dark"] as const) {
      const vars = theme.getVars(mode), before = {...vars};
      const adjusted = adjustContrast(vars["--x-text"],vars["--x-surface"],{target:4.5});
      const audited = auditContrastPairs({...vars,"--x-text":adjusted.color},[{foreground:"--x-text",background:"--x-surface"}]);
      expect(adjusted.met).toBe(true);
      expect(audited[0].passes).toBe(true);
      expect(theme.getVars(mode)).toEqual(before);
    }
  });

  it("normalizes over-range HWB whiteness and blackness together", () => {
    const result = convertColorSpace(parseCssColor("hwb(120 200% 100% / .4)")!,"srgb");
    result.coordinates.forEach(value=>expect(value).toBeCloseTo(2/3,8));
    expect(result.alpha).toBe(.4);
    expect(xcolor("hwb(120 200% 100% / .4)").toHex()).toBe("#aaaaaa66");
  });
});
