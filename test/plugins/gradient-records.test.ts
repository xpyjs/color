import { describe, expect, it } from "vitest";
import { createColorGradient, parseCssColor, fromColorSpace, type XColorSpace, type XColorGradientOptions } from "../../src/plugins/colorSpace";

const color = (input: string) => parseCssColor(input)!;
const stop = (input: string, position?: number) => ({color: color(input), position});
const hex = (input: ReturnType<typeof color>) => fromColorSpace(input).toHex();

describe("xcolor multi-stop coordinate gradients", () => {
  it("interpolates three stops with a domain and explicit anchor", () => {
    const gradient = createColorGradient([stop("red", 0), stop("lime", .25), stop("blue", 1)], {space:"srgb",domain:[10,110]});
    expect(hex(gradient.at(10))).toBe("#ff0000");
    expect(hex(gradient.at(35))).toBe("#00ff00");
    expect(hex(gradient.at(72.5))).toBe("#008080");
    expect(hex(gradient.at(-100))).toBe("#ff0000");
    expect(hex(gradient.at(200))).toBe("#0000ff");
  });

  it("distributes omitted positions, supports padded ends and right-continuous hard stops", () => {
    const gradient = createColorGradient([stop("red"),stop("lime"),stop("blue",.8),stop("white")],{space:"srgb"});
    expect(hex(gradient.at(.4))).toBe("#00ff00");
    expect(hex(gradient.at(.8))).toBe("#0000ff");
    const hard = createColorGradient([stop("red",.2),stop("red",.5),stop("blue",.5),stop("blue",.8)],{space:"srgb"});
    expect(hex(hard.at(0))).toBe("#ff0000");
    expect(hex(hard.at(.4999))).toBe("#ff0000");
    expect(hex(hard.at(.5))).toBe("#0000ff");
    expect(hex(hard.at(1))).toBe("#0000ff");
    const duplicate = createColorGradient([stop("red",0),stop("blue",0)],{space:"srgb"});
    expect(hex(duplicate.at(0))).toBe("#0000ff");
  });

  it.each(["lab", "lch", "oklab", "oklch", "srgb-linear", "display-p3"] as XColorSpace[])("supports unclipped %s output", space => {
    const gradient = createColorGradient([stop("color(display-p3 1 0 0)"),stop("color(display-p3 0 1 0)")],{space});
    expect(gradient.at(.5).space).toBe(space);
    expect(gradient.colors(3)).toHaveLength(3);
    expect(gradient.colors(3)[1]).toEqual(gradient.at(.5));
    if (space === "display-p3") expect(gradient.at(.5).coordinates).toEqual([.5,.5,0]);
  });

  it("uses OKLab by default and shares polar hue and alpha rules", () => {
    expect(createColorGradient([stop("red"),stop("blue")]).at(.5).space).toBe("oklab");
    const hue = createColorGradient([stop("oklch(.5 .2 350)"),stop("oklch(.5 .2 10)")],{space:"oklch",hue:"longer"});
    expect(hue.at(.5).coordinates).toEqual([.5,.2,180]);
    const alpha = createColorGradient([stop("rgb(255 0 0 / 0)"),stop("blue")],{space:"srgb"});
    expect(hex(alpha.at(.5))).toBe("#0000ff80");
    const missing = createColorGradient([stop("oklch(.5 .2 none / none)"),stop("oklch(.7 .2 120 / .5)")],{space:"oklch"});
    expect(missing.at(.5).coordinates[2]).toBe(120);
    expect(missing.at(.5).alpha).toBe(.5);
  });

  it("snapshots inputs and returns independent samples", () => {
    const input = [stop("red"),stop("blue")];
    const domain: [number,number] = [0,1];
    const gradient = createColorGradient(input,{space:"srgb",domain});
    (input[0].color.coordinates as number[])[0] = 0;
    input[1].position = .1;
    domain[1] = 2;
    const sample = gradient.at(.5);
    (sample.coordinates as number[])[0] = 0;
    expect(hex(gradient.at(.5))).toBe("#800080");
    expect(gradient.colors()).toHaveLength(5);
    expect(hex(gradient.colors()[4])).toBe("#0000ff");
    expect(createColorGradient([stop("red"),stop("blue")],{domain:[0,Number.MAX_VALUE]}).colors(5)).toHaveLength(5);
  });

  it.each([
    {domain:[0,0]}, {domain:[1,0]}, {domain:[0,Infinity]}, {domain:[-Number.MAX_VALUE,Number.MAX_VALUE]},
    {space:"bogus"}, {space:"lab",hue:"shorter"}, {space:"hsl",hue:"bogus"}
  ])("rejects invalid options %j", options => {
    expect(()=>createColorGradient([stop("red"),stop("blue")],options as XColorGradientOptions)).toThrow();
  });

  it("rejects malformed stops, positions and sample requests", () => {
    expect(()=>createColorGradient([])).toThrow();
    expect(()=>createColorGradient([stop("red")])).toThrow();
    expect(()=>createColorGradient([stop("red",.8),stop("blue",.2)])).toThrow();
    for (const position of [-1,2,NaN,Infinity]) expect(()=>createColorGradient([stop("red",position),stop("blue")])).toThrow();
    const gradient = createColorGradient([stop("red"),stop("blue")]);
    expect(()=>gradient.at(NaN)).toThrow();
    expect(()=>gradient.at(Infinity)).toThrow();
    for (const count of [0,1,1.5,10001,NaN]) expect(()=>gradient.colors(count)).toThrow();
  });
});
