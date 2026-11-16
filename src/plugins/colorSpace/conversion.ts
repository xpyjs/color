import { D50_TO_D65, D65_TO_D50, SRGB_TO_XYZ, XYZ_TO_SRGB, mat3Mul, linearToSrgb, srgbToLinear, rgbToOklab, oklabToRgb, type Mat3 } from "../../color-math";
import { hslToRgb, hsvToRgb, rgbToHsl, rgbToHsv } from "@xpyjs/color";

export type Coordinates = [number, number, number];
export type RGBSpace = "srgb" | "srgb-linear" | "display-p3" | "a98-rgb" | "prophoto-rgb" | "rec2020";
export type ColorSpace = RGBSpace | "xyz" | "xyz-d65" | "xyz-d50" | "lab" | "lch" | "oklab" | "oklch" | "hsl" | "hsv";

const P3: Mat3 = [.4865709486,.2656676932,.1982172852,.2289745641,.6917385218,.0792869141,0,.0451133819,1.0439443689];
const A98: Mat3 = [.5766690429,.1855582379,.1882286462,.2973449753,.6273635663,.0752914585,.0270313614,.0706888525,.9913375368];
const PRO: Mat3 = [.7977604896,.1351917082,.0313493495,.2880711282,.7118432178,.000085654,0,0,.8251046026];
const REC: Mat3 = [.6369580484,.1446169036,.1688809752,.262700212,.6779980715,.0593017165,0,.028072693,1.0609850577];
const WHITE = [.9642956764, 1, .8251046025];
const signedPower = (v: number, power: number) => Math.sign(v) * Math.abs(v) ** power;
const map = (v: readonly number[], fn: (n: number) => number): Coordinates => v.map(fn) as Coordinates;
const mul = (m: Mat3, v: readonly number[]): Coordinates => mat3Mul(m, v[0], v[1], v[2]);

function inverse([a,b,c,d,e,f,g,h,i]: Mat3): Mat3 {
  const det = a * (e*i-f*h) - b * (d*i-f*g) + c * (d*h-e*g);
  return [e*i-f*h,c*h-b*i,b*f-c*e,f*g-d*i,a*i-c*g,c*d-a*f,d*h-e*g,b*g-a*h,a*e-b*d].map(v=>v/det) as Mat3;
}

const matrices: Record<RGBSpace, Mat3> = { srgb: SRGB_TO_XYZ, "srgb-linear": SRGB_TO_XYZ, "display-p3": P3, "a98-rgb": A98, "prophoto-rgb": PRO, rec2020: REC };
const inverses = {} as Record<RGBSpace, Mat3>;
for (const name of Object.keys(matrices) as RGBSpace[]) inverses[name] = inverse(matrices[name]);
const recAlpha = 1.09929682680944, recBeta = .018053968510807;

export function isRgbSpace(space: string): space is RGBSpace {
  return Object.prototype.hasOwnProperty.call(matrices, space);
}

function decode(v: number, space: RGBSpace): number {
  if (space === "srgb-linear") return v;
  if (space === "a98-rgb") return signedPower(v, 563 / 256);
  if (space === "prophoto-rgb") return Math.abs(v) <= 16/512 ? v/16 : signedPower(v, 1.8);
  if (space === "rec2020") return Math.abs(v) < recBeta*4.5 ? v/4.5 : Math.sign(v)*((Math.abs(v)+recAlpha-1)/recAlpha)**(1/.45);
  return srgbToLinear(v * 255);
}

function encode(v: number, space: RGBSpace): number {
  if (space === "srgb-linear") return v;
  if (space === "a98-rgb") return signedPower(v, 256 / 563);
  if (space === "prophoto-rgb") return Math.abs(v) <= 1/512 ? v*16 : signedPower(v, 1/1.8);
  if (space === "rec2020") return Math.abs(v) < recBeta ? v*4.5 : Math.sign(v)*(recAlpha*Math.abs(v)**.45-(recAlpha-1));
  return linearToSrgb(v);
}

function cartesian([l,c,h]: readonly number[]): Coordinates {
  return [l, c * Math.cos(h*Math.PI/180), c * Math.sin(h*Math.PI/180)];
}

function polar([l,a,b]: readonly number[]): Coordinates {
  const c = Math.hypot(a,b);
  return [l,c,c < 1e-12 ? 0 : (Math.atan2(b,a)*180/Math.PI+360)%360];
}

/** Unclipped conversion through XYZ D65. Lab/LCH coordinates use D50. */
export function toXyzD65(space: ColorSpace, coordinates: readonly number[]): Coordinates {
  if (space === "hsl" || space === "hsv") {
    const convert = space === "hsl" ? hslToRgb : hsvToRgb;
    const hue = ((coordinates[0] % 360) + 360) % 360;
    const rgb = convert(hue, coordinates[1], coordinates[2], true);
    return mul(SRGB_TO_XYZ, [rgb.r, rgb.g, rgb.b].map(srgbToLinear));
  }
  if (isRgbSpace(space)) {
    const xyz = mul(matrices[space], map(coordinates, v => decode(v, space)));
    return space === "prophoto-rgb" ? mul(D50_TO_D65, xyz) : xyz;
  }
  if (space === "xyz" || space === "xyz-d65") return [...coordinates] as Coordinates;
  if (space === "xyz-d50") return mul(D50_TO_D65, coordinates);
  const value = space === "lch" || space === "oklch" ? cartesian(coordinates) : coordinates;
  if (space === "oklab" || space === "oklch") {
    const rgb = oklabToRgb(value[0], value[1], value[2]);
    return mul(SRGB_TO_XYZ, [rgb.r, rgb.g, rgb.b].map(srgbToLinear));
  }
  const fy = (value[0]+16)/116;
  const fInv = (v: number) => v > 6/29 ? v**3 : 3*(6/29)**2*(v-4/29);
  const xyz = [fy+value[1]/500, fy, fy-value[2]/200].map((v,i)=>fInv(v)*WHITE[i]);
  return mul(D50_TO_D65, xyz);
}

/** Convert XYZ D65 into a target space without rounding or clipping. */
export function fromXyzD65(space: ColorSpace, xyz: readonly number[]): Coordinates {
  if (space === "hsl" || space === "hsv") {
    const rgb = map(mul(XYZ_TO_SRGB, xyz), v=>linearToSrgb(v)*255);
    if (space === "hsl") {
      const value = rgbToHsl(...rgb, true);
      return [value.h, value.s, value.l];
    }
    const value = rgbToHsv(...rgb, true);
    return [value.h, value.s, value.v];
  }
  if (isRgbSpace(space)) {
    const adapted = space === "prophoto-rgb" ? mul(D65_TO_D50, xyz) : xyz;
    return map(mul(inverses[space], adapted), v => encode(v, space));
  }
  if (space === "xyz" || space === "xyz-d65") return [...xyz] as Coordinates;
  if (space === "xyz-d50") return mul(D65_TO_D50, xyz);
  if (space === "oklab" || space === "oklch") {
    const rgb = map(mul(XYZ_TO_SRGB, xyz), v=>linearToSrgb(v)*255);
    const lab = rgbToOklab(...rgb);
    const value: Coordinates = [lab.l,lab.a,lab.b];
    return space === "oklch" ? polar(value) : value;
  }
  const adapted = mul(D65_TO_D50, xyz);
  const f = adapted.map((v,i)=>v/WHITE[i]).map(v=>v>(6/29)**3 ? Math.cbrt(v) : v/(3*(6/29)**2)+4/29);
  const lab: Coordinates = [116*f[1]-16,500*(f[0]-f[1]),200*(f[1]-f[2])];
  return space === "lch" ? polar(lab) : lab;
}
