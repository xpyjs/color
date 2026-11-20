import { Logger } from "@xpyjs/color";
import type { XColorSpaceRecord } from "./index";
import type { Convert } from "./interpolation";

/** Distance units: CIE Lab ΔE76/ΔE2000 or unscaled OKLab Euclidean distance. */
export type XColorDifferenceMetric = "cie76" | "ciede2000" | "oklab";
export interface XColorDifferenceOptions {
  /** Default ciede2000. Alpha does not participate in coordinate distance. */
  metric?: XColorDifferenceMetric;
}
export interface XColorSimilarityOptions extends XColorDifferenceOptions {
  /** Inclusive distance limit, default 2 for CIE metrics or .02 for OKLab. */
  tolerance?: number;
  /** Inclusive alpha difference limit, default 0 (identical alpha). */
  alphaTolerance?: number;
}
export interface XColorSortOptions extends XColorDifferenceOptions {
  /** Default lightness. Lightness/chroma/hue use OKLCh; distance requires reference. */
  by?: "lightness" | "chroma" | "hue" | "distance";
  /** Required when by is distance. */
  reference?: XColorSpaceRecord;
  /** Reverse primary order; equal keys still retain input order. Default false. */
  descending?: boolean;
}

const radians = Math.PI / 180;
const cos = (angle: number) => Math.cos(angle * radians);
const sin = (angle: number) => Math.sin(angle * radians);
const seventhRatio = (c: number) => 1 / (1 + (25 / c) ** 7);

// Sharma, Wu & Dalal (2005), standard viewing conditions kL = kC = kH = 1.
function ciede2000(left: readonly number[], right: readonly number[]): number {
  const [l1,a1,b1] = left, [l2,a2,b2] = right;
  const c1 = Math.hypot(a1,b1), c2 = Math.hypot(a2,b2);
  const g = .5 * (1 - Math.sqrt(seventhRatio((c1+c2)/2)));
  const ap1 = (1+g)*a1, ap2 = (1+g)*a2;
  const cp1 = Math.hypot(ap1,b1), cp2 = Math.hypot(ap2,b2);
  const hue = (a: number, b: number) => a === 0 && b === 0 ? 0 : (Math.atan2(b,a)/radians+360)%360;
  const h1 = hue(ap1,b1), h2 = hue(ap2,b2);
  const dl = l2-l1, dc = cp2-cp1;
  let dh = h2-h1;
  if (cp1*cp2 === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2*Math.sqrt(cp1*cp2)*sin(dh/2);
  const lm = (l1+l2)/2, cm = (cp1+cp2)/2;
  let hm = (h1+h2)/2;
  if (cp1*cp2 === 0) hm = h1+h2;
  else if (Math.abs(h1-h2)>180) hm += h1+h2<360 ? 180 : -180;
  const t = 1-.17*cos(hm-30)+.24*cos(2*hm)+.32*cos(3*hm+6)-.2*cos(4*hm-63);
  const sl = 1+.015*(lm-50)**2/Math.sqrt(20+(lm-50)**2);
  const sc = 1+.045*cm, sh = 1+.015*cm*t;
  const rt = -2*Math.sqrt(seventhRatio(cm))*sin(60*Math.exp(-(((hm-275)/25)**2)));
  const x = dl/sl, y = dc/sc, z = dH/sh;
  return Math.sqrt(Math.max(0,x*x+y*y+z*z+rt*y*z));
}

function metric(options: XColorDifferenceOptions): XColorDifferenceMetric {
  const value = options.metric ?? "ciede2000";
  if (!["cie76","ciede2000","oklab"].includes(value)) throw Logger.createError("Unknown color difference metric");
  return value;
}

export function difference(a: XColorSpaceRecord, b: XColorSpaceRecord, options: XColorDifferenceOptions, convert: Convert): number {
  const method = metric(options), space = method === "oklab" ? "oklab" : "lab";
  const left = convert(a,space).coordinates, right = convert(b,space).coordinates;
  const distance = method === "ciede2000" ? ciede2000(left,right) : Math.hypot(...left.map((v,i)=>v-right[i]));
  if (!Number.isFinite(distance)) throw Logger.createError("Color difference overflow");
  return distance;
}

function limits(options: XColorSimilarityOptions): [number,number] {
  const method = metric(options);
  const tolerance = options.tolerance ?? (method === "oklab" ? .02 : 2), alpha = options.alphaTolerance ?? 0;
  if (!Number.isFinite(tolerance) || tolerance < 0 || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) throw Logger.createError("Invalid color similarity tolerance");
  return [tolerance,alpha];
}

export function similar(a: XColorSpaceRecord, b: XColorSpaceRecord, options: XColorSimilarityOptions, convert: Convert): boolean {
  const [tolerance,alpha] = limits(options);
  const distance = difference(a,b,options,convert);
  return distance <= tolerance && Math.abs((a.missing?.[3] ? 0 : a.alpha)-(b.missing?.[3] ? 0 : b.alpha)) <= alpha;
}

function copy(color: XColorSpaceRecord, convert: Convert): XColorSpaceRecord {
  const result = convert(color,color.space);
  return {...result, ...(color.missing ? {missing:[...color.missing] as [boolean,boolean,boolean,boolean]} : {})};
}

export function sort(colors: readonly XColorSpaceRecord[], options: XColorSortOptions, convert: Convert): XColorSpaceRecord[] {
  metric(options);
  const by = options.by ?? "lightness";
  if (!["lightness","chroma","hue","distance"].includes(by) || (by === "distance" && !options.reference)) throw Logger.createError("Invalid perceptual sort options");
  if (by === "distance") convert(options.reference!, "lab");
  const channel = by === "lightness" ? 0 : by === "chroma" ? 1 : 2;
  return colors.map((color,index)=>({color:copy(color,convert),index,key:by === "distance" ? difference(color,options.reference!,options,convert) : convert(color,"oklch").coordinates[channel]}))
    .sort((a,b)=>(options.descending ? b.key-a.key : a.key-b.key) || a.index-b.index).map(item=>item.color);
}

export function deduplicate(colors: readonly XColorSpaceRecord[], options: XColorSimilarityOptions, convert: Convert): XColorSpaceRecord[] {
  limits(options);
  const unique: XColorSpaceRecord[] = [];
  for (const color of colors) {
    const candidate = copy(color,convert);
    if (!unique.some(kept=>similar(candidate,kept,options,convert))) unique.push(candidate);
  }
  return unique;
}
