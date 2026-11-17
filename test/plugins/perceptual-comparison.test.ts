import { describe, expect, it } from "vitest";
import { colorDifference, isColorSimilar, sortColors, deduplicateColors, parseCssColor, type XColorSpaceRecord, type XColorDifferenceMetric } from "../../src/plugins/colorSpace";

const lab = (l:number,a:number,b:number): XColorSpaceRecord => ({space:"lab",coordinates:[l,a,b],alpha:1});
// Sharma/Wu/Dalal supplementary data, https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/dataNprograms/ciede2000testdata.txt
const vectors = [
  [50,2.6772,-79.7751,50,0,-82.7485,2.0425],
  [50,3.1571,-77.2803,50,0,-82.7485,2.8615],
  [50,2.8361,-74.0200,50,0,-82.7485,3.4412],
  [50,-1.3802,-84.2814,50,0,-82.7485,1],
  [50,-1.1848,-84.8006,50,0,-82.7485,1],
  [50,-.9009,-85.5211,50,0,-82.7485,1],
  [50,0,0,50,-1,2,2.3669], [50,-1,2,50,0,0,2.3669],
  [50,2.49,-.001,50,-2.49,.0009,7.1792],
  [50,2.49,-.001,50,-2.49,.001,7.1792],
  [50,2.49,-.001,50,-2.49,.0011,7.2195],
  [50,2.49,-.001,50,-2.49,.0012,7.2195],
  [50,-.001,2.49,50,.0009,-2.49,4.8045],
  [50,-.001,2.49,50,.001,-2.49,4.8045],
  [50,-.001,2.49,50,.0011,-2.49,4.7461],
  [50,2.5,0,50,0,-2.5,4.3065],
  [50,2.5,0,73,25,-18,27.1492],
  [50,2.5,0,61,-5,29,22.8977],
  [50,2.5,0,56,-27,-3,31.9030],
  [50,2.5,0,58,24,15,19.4535],
  [50,2.5,0,50,3.1736,.5854,1],
  [50,2.5,0,50,3.2972,0,1],
  [50,2.5,0,50,1.8634,.5757,1],
  [50,2.5,0,50,3.2592,.3350,1],
  [60.2574,-34.0099,36.2677,60.4626,-34.1751,39.4387,1.2644],
  [63.0109,-31.0961,-5.8663,62.8187,-29.7946,-4.0864,1.2630],
  [61.2901,3.7196,-5.3901,61.4292,2.2480,-4.9620,1.8731],
  [35.0831,-44.1164,3.7933,35.0232,-40.0716,1.5901,1.8645],
  [22.7233,20.0904,-46.6940,23.0331,14.9730,-42.5619,2.0373],
  [36.4612,47.8580,18.3852,36.2715,50.5065,21.2231,1.4146],
  [90.8027,-2.0831,1.4410,91.1528,-1.6435,.0447,1.4441],
  [90.9257,-.5406,-.9208,88.6381,-.8985,-.7239,1.5381],
  [6.7747,-.2908,-2.4247,5.8714,-.0985,-2.2286,.6377],
  [2.0776,.0795,-1.1350,.9033,-.0636,-.5514,.9082]
];

describe("xcolor perceptual comparison", () => {
  it.each(vectors)("matches CIEDE2000 reference (%s, %s, %s)", (l1,a1,b1,l2,a2,b2,expected) => {
    const a = lab(l1,a1,b1), b = lab(l2,a2,b2);
    expect(colorDifference(a,b)).toBeCloseTo(expected,4);
    expect(colorDifference(b,a)).toBeCloseTo(expected,4);
    expect(colorDifference(a,a)).toBe(0);
  });

  it("uses full precision and metric-specific units without wide-gamut clipping", () => {
    expect(colorDifference(lab(50,0,0),lab(53,4,0),{metric:"cie76"})).toBe(5);
    const a = {space:"oklab" as const,coordinates:[.5,.1,.1] as const,alpha:1};
    const b = {...a,coordinates:[.53,.14,.1] as const};
    expect(colorDifference(a,b,{metric:"oklab"})).toBeCloseTo(.05,12);
    expect(colorDifference(parseCssColor("color(display-p3 1 0 0)")!,parseCssColor("red")!)).toBeGreaterThan(1);
    expect(colorDifference(lab(50,0,0),lab(50.00001,0,0))).toBeGreaterThan(0);
  });

  it("has configurable inclusive coordinate and alpha tolerances", () => {
    const a = lab(50,0,0), b = lab(53,4,0);
    expect(isColorSimilar(a,b,{metric:"cie76",tolerance:5})).toBe(true);
    expect(isColorSimilar(a,b,{metric:"cie76",tolerance:4.99})).toBe(false);
    expect(isColorSimilar(a,{...a,alpha:.5})).toBe(false);
    expect(isColorSimilar(a,{...a,alpha:.5},{alphaTolerance:.5})).toBe(true);
    expect(colorDifference(a,{...a,alpha:.5})).toBe(0);
    expect(isColorSimilar(a,a,{metric:"oklab"})).toBe(true);
  });

  it("sorts stably and keeps independent source-space records", () => {
    const a = parseCssColor("oklch(.8 .1 30)")!, b = parseCssColor("oklch(.2 .3 120)")!, c = parseCssColor("oklch(.8 .2 270)")!;
    const input = [a,b,c];
    expect(sortColors(input)).toEqual([b,a,c]);
    expect(sortColors(input,{descending:true})).toEqual([a,c,b]);
    expect(sortColors(input,{by:"chroma"})).toEqual([a,c,b]);
    expect(sortColors(input,{by:"hue"})).toEqual(input);
    expect(sortColors(input,{by:"distance",reference:b})[0]).toEqual(b);
    const result = sortColors(input);
    expect(result[0]).not.toBe(b);
    expect(result[0].coordinates).not.toBe(b.coordinates);
    expect(input).toEqual([a,b,c]);
  });

  it("deduplicates greedily with documented non-transitive tolerance", () => {
    const a = lab(50,0,0), b = lab(51.5,0,0), c = lab(53,0,0);
    const unique = deduplicateColors([a,b,c,a],{metric:"cie76",tolerance:2});
    expect(unique).toEqual([a,c]);
    expect(unique[0]).not.toBe(a);
    expect(deduplicateColors([a,{...a,alpha:.5}])).toHaveLength(2);
    expect(deduplicateColors([a,{...a,alpha:.5}],{alphaTolerance:1})).toHaveLength(1);
    expect(deduplicateColors([])).toEqual([]);
  });

  it("resolves missing values and rejects invalid inputs even for empty collections", () => {
    const missing = parseCssColor("lab(50 none none / none)")!;
    expect(colorDifference(missing,lab(50,0,0))).toBe(0);
    expect(sortColors([missing])[0].missing).toEqual(missing.missing);
    expect(()=>colorDifference(lab(NaN,0,0),lab(0,0,0))).toThrow();
    expect(()=>colorDifference(lab(50,0,0),lab(0,0,0),{metric:"bogus" as XColorDifferenceMetric})).toThrow();
    expect(()=>sortColors([],{by:"distance"})).toThrow();
    expect(()=>deduplicateColors([],{tolerance:-1})).toThrow();
    expect(()=>isColorSimilar(lab(0,0,0),lab(0,0,0),{alphaTolerance:2})).toThrow();
  });
});
