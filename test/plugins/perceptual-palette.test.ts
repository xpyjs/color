import { describe, expect, it } from "vitest";
import { generatePerceptualPalette, parseCssColor, convertColorSpace, inGamut, colorDifference } from "../../src/plugins/colorSpace";
const color = (input:string) => parseCssColor(input)!;

describe("xcolor perceptual palettes", () => {
  it.each(["red","lime","blue","#010203","black","white","color(display-p3 1 0 0)"])("has stable monotonic targets and display lightness for %s", input => {
    const source = color(input);
    const palette = generatePerceptualPalette(source);
    expect(palette).toHaveLength(11);
    expect(palette[0].source.coordinates[0]).toBe(1);
    expect(palette[10].source.coordinates[0]).toBe(0);
    palette.forEach((entry,i)=>{
      expect(inGamut(entry.color)).toBe(true);
      if (i > 0) {
        expect(entry.source.coordinates[0]).toBeLessThanOrEqual(palette[i-1].source.coordinates[0]);
        expect(convertColorSpace(entry.color,"oklab").coordinates[0]).toBeLessThanOrEqual(convertColorSpace(palette[i-1].color,"oklab").coordinates[0]+1e-6);
      }
    });
    const subset = generatePerceptualPalette(source,{shades:[950,500,100,500]});
    expect(subset.map(entry=>entry.color)).toEqual([palette[10].color,palette[5].color,palette[1].color,palette[5].color]);
    expect(subset[1].color).not.toBe(subset[3].color);
  });

  it("uses equal perceptual steps on either fixed-hue segment before mapping", () => {
    const palette = generatePerceptualPalette(color("oklch(.6 .15 40)"),{shades:[100,200,300,600,700,800]});
    const delta = (a:number,b:number) => colorDifference(palette[a].source,palette[b].source,{metric:"oklab"});
    expect(delta(0,1)).toBeCloseTo(delta(1,2),12);
    expect(delta(3,4)).toBeCloseTo(delta(4,5),12);
    expect(palette.every(entry=>entry.source.coordinates[2] === 40)).toBe(true);
  });

  it("preserves alpha and source records", () => {
    const source = color("oklch(.6 .15 40 / .123456)");
    const before = JSON.stringify(source);
    const palette = generatePerceptualPalette(source);
    expect(palette.every(entry=>entry.color.alpha === source.alpha && entry.source.alpha === source.alpha)).toBe(true);
    expect(JSON.stringify(source)).toBe(before);
    expect(generatePerceptualPalette(source,{shades:[]})).toEqual([]);
  });

  it("enforces display contrast and can report individual failures", () => {
    const base = color("red"), background = color("white");
    const passing = generatePerceptualPalette(base,{shades:[900,950],contrast:{background,target:4.5}});
    expect(passing.every(entry=>entry.contrast!.passes)).toBe(true);
    expect(()=>generatePerceptualPalette(base,{contrast:{background}})).toThrow(/shade 50/);
    const report = generatePerceptualPalette(base,{contrast:{background,policy:"report",shades:[50,950]}});
    expect(report[0].contrast!.passes).toBe(false);
    expect(report[10].contrast!.passes).toBe(true);
    expect(report[5].contrast).toBeUndefined();
    const translucent = generatePerceptualPalette(color("rgb(0 0 0 / .1)"),{shades:[950],contrast:{background,policy:"report"}});
    expect(translucent[0].contrast!.passes).toBe(false);
  });

  it("rejects invalid shades, bases and constraints", () => {
    for (const shade of [0,1000,NaN]) expect(()=>generatePerceptualPalette(color("red"),{shades:[shade]})).toThrow();
    expect(()=>generatePerceptualPalette({space:"oklch",coordinates:[2,.1,30],alpha:1})).toThrow();
    expect(()=>generatePerceptualPalette(color("red"),{contrast:{background:color("#fff8")}})).toThrow();
    expect(()=>generatePerceptualPalette(color("red"),{contrast:{background:color("white"),target:22}})).toThrow();
  });
});
