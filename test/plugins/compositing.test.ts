import { describe, expect, it } from "vitest";
import xcolor from "../../src";
import blend, {type XColorCompositeOperator, type BlendMode} from "../../src/plugins/blend";
xcolor.use(blend);

describe("xcolor nonseparable blending and Porter–Duff", () => {
  it.each([
    ["clear",0,0,0], ["copy",.5,1,0], ["destination",.25,0,1],
    ["source-over",.625,.8,.2], ["destination-over",.625,.6,.4],
    ["source-in",.125,1,0], ["destination-in",.125,0,1],
    ["source-out",.375,1,0], ["destination-out",.125,0,1],
    ["source-atop",.25,.5,.5], ["destination-atop",.5,.75,.25],
    ["xor",.5,.75,.25], ["lighter",.75,2/3,1/3]
  ])("matches an independent coverage vector for %s", (operator,alpha,r,b) => {
    const destination = xcolor({r:0,g:0,b:255,a:.25},{useDecimal:true});
    const result = destination.composite({r:255,g:0,b:0,a:.5},operator as XColorCompositeOperator);
    expect(result.alpha()).toBeCloseTo(alpha as number,12);
    expect(result.red()/255).toBeCloseTo(r as number,12);
    expect(result.green()).toBe(0);
    expect(result.blue()/255).toBeCloseTo(b as number,12);
    expect(destination.blue()).toBe(255);
    expect(destination.alpha()).toBe(.25);
  });

  it("has source-over defaults, saturating additive composition and transparent-black zero coverage", () => {
    const destination = xcolor("#00f",{useDecimal:true});
    expect(destination.composite("#f008").toHex()).toBe(destination.blend("#f008").toHex());
    expect(destination.composite("#f00","lighter").toHex()).toBe("#ff00ff");
    expect(xcolor("#f000").composite("#00f0","xor").toRgb()).toEqual({r:0,g:0,b:0,a:0});
    expect(destination.composite("#fff","destination").toHex()).toBe("#0000ff");
  });

  it.each(["hue","color"] as BlendMode[])("matches the clipped blue-on-red %s vector", mode => {
    const result = xcolor("#f00",{useDecimal:true}).blend("#00f",mode);
    expect(result.red()/255).toBeCloseTo(.19/.89,12);
    expect(result.green()/255).toBeCloseTo(.19/.89,12);
    expect(result.blue()).toBeCloseTo(255,12);
  });

  it("matches luminosity and saturation vectors, including neutral ties", () => {
    expect(xcolor("#f00",{useDecimal:true}).blend("#00f","luminosity").red()/255).toBeCloseTo(.11/.3,12);
    expect(xcolor("#f00").blend("#00f","saturation").toHex()).toBe("#ff0000");
    expect(xcolor("#888").blend("#f00","saturation").toHex()).toBe("#888888");
    expect(xcolor("#f00").blend("#888","color").toHex()).toBe("#4d4d4d");
  });

  it.each(["hue","saturation","color","luminosity"] as BlendMode[])("handles alpha and preserves luminosity constraints for %s", mode => {
    const base = xcolor("#3a91d5",{useDecimal:true}), source = xcolor("#cc7832",{useDecimal:true});
    const result = base.blend(source,mode);
    const lum = (c:typeof base) => .3*c.red()+.59*c.green()+.11*c.blue();
    expect(lum(result)).toBeCloseTo(lum(mode === "luminosity" ? source : base),10);
    expect(base.blend(source.clone().alpha(0),mode).toHex()).toBe(base.toHex());
    expect(base.clone().alpha(0).blend(source,mode).toHex()).toBe(source.toHex());
    expect(base.clone().alpha(.25).blend(source.clone().alpha(.5),mode).alpha()).toBe(.625);
    expect(base.toHex()).toBe("#3a91d5");
  });

  it("rejects invalid inputs and unknown modes/operators", () => {
    expect(()=>xcolor("bogus").blend("#fff","hue")).toThrow();
    expect(()=>xcolor("#fff").blend("bogus","color")).toThrow();
    expect(()=>xcolor("#fff").composite("bogus")).toThrow();
    expect(()=>xcolor("#fff").composite("#000","bogus" as XColorCompositeOperator)).toThrow();
  });
});
