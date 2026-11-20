import hsvPluginForTest from "../src/plugins/hsv";
import { xcolor as hsvFactoryForTest } from "../src/core";
hsvFactoryForTest.use(hsvPluginForTest);
import { afterEach, describe, expect, it } from "vitest";
import xcolor, { XColorError, Logger, type XColor } from "../src";
import scale from "../src/plugins/scale";
import lab from "../src/plugins/lab";
import harmony from "../src/plugins/harmony";
import simulate from "../src/plugins/simulate";
import a11y from "../src/plugins/a11y";
xcolor.use(scale).use(lab).use(harmony).use(simulate).use(a11y);
afterEach(()=>xcolor.config({strict:false}));

describe("xcolor strict mode and structured errors", () => {
  it("keeps default invalid instances but strict construction rejects them", () => {
    const invalid = xcolor("invalid");
    expect(invalid.isValid()).toBe(false);
    expect(invalid.clone().lighten(10).isValid()).toBe(false);
    for (const input of ["invalid",invalid,NaN,null]) {
      try { xcolor(input as string,{strict:true}); expect.fail("should reject"); }
      catch(error) {
        expect(error).toBeInstanceOf(XColorError);
        expect(error).toMatchObject({name:"XColorError",code:"INVALID_INPUT",operation:"constructor"});
      }
    }
    expect(xcolor(undefined,{strict:true}).toHex()).toBe("#000000");
  });

  it.each([
    (c:XColor)=>c.red(NaN), (c:XColor)=>c.green(Infinity), (c:XColor)=>c.blue(-Infinity),
    (c:XColor)=>c.alpha(NaN), (c:XColor)=>c.hue(Infinity), (c:XColor)=>c.saturation(NaN),
    (c:XColor)=>c.lightness(NaN), (c:XColor)=>c.value(Infinity),
    (c:XColor)=>c.rgb(1,2,NaN), (c:XColor)=>c.hsl(20,50,NaN), (c:XColor)=>c.hsv(20,NaN,50),
    (c:XColor)=>c.lighten(NaN), (c:XColor)=>c.darken(Infinity), (c:XColor)=>c.brighten(NaN),
    (c:XColor)=>c.saturate(NaN), (c:XColor)=>c.desaturate(Infinity), (c:XColor)=>c.spin(NaN),
    (c:XColor)=>c.fade(NaN), (c:XColor)=>c.opaquer(Infinity), (c:XColor)=>c.mix("#fff",NaN),
    (c:XColor)=>c.tint(NaN), (c:XColor)=>c.shade(Infinity)
  ])("rejects nonfinite mutations before changing state (%#)", mutate => {
    const color = xcolor("#12345680",{strict:true});
    expect(()=>mutate(color)).toThrow(XColorError);
    expect(color.toHex()).toBe("#12345680");
    expect(color.isValid()).toBe(true);
  });

  it("preserves a valid strict color after failed replacement, and supports global opt-in", () => {
    const color = xcolor("#123456",{strict:true,useDecimal:true});
    expect(()=>color.hex("invalid")).toThrow(XColorError);
    expect(color.isValid()).toBe(true);
    expect(color.toHex()).toBe("#123456");
    expect(()=>color.clone().red(NaN)).toThrow(XColorError);
    expect(color.red(300).red()).toBe(255);
    xcolor.config({strict:true});
    expect(()=>xcolor("invalid")).toThrow(XColorError);
    expect(xcolor("invalid",{strict:false}).isValid()).toBe(false);
  });

  it("rejects invalid colors in derived computations without silently producing valid black", () => {
    const invalid = xcolor("invalid"), valid = xcolor("#123456");
    for (const action of [()=>valid.mix(invalid),()=>invalid.mix(valid),()=>valid.contrast(invalid),()=>invalid.brightness(),()=>invalid.luminance(),()=>invalid.triad(),()=>invalid.simulate("protanopia"),()=>invalid.scale(valid),()=>valid.at(invalid,0),()=>valid.scale(invalid),()=>valid.deltaE(invalid)]) {
      expect(action).toThrow(XColorError);
    }
    expect(valid.toHex()).toBe("#123456");
    expect(invalid.isReadable(valid)).toBe(false);
    expect(invalid.equals(valid)).toBe(false);
    expect(invalid.hex("#f00").isValid()).toBe(true);
  });

  it("exposes stable fields for existing plugin errors", () => {
    expect(Logger.createError("example")).toMatchObject({name:"XColorError",code:"INVALID_ARGUMENT",message:"[X-Color] example"});
    expect(Logger.createError("example")).toBeInstanceOf(Error);
  });
});
