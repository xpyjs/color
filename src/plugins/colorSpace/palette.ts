import { Logger, relativeLuminance } from "@xpyjs/color";
import { compositeRgb, luminanceRatio } from "../../color-math";
import type { XColorSpaceRecord } from "./index";
import type { Convert } from "./interpolation";

/** Perceptual shade generation with optional display-contrast constraints. */
export interface XColorPerceptualPaletteOptions {
  /** Shade numbers in [50,950], default [50,100,200,...,900,950]. Order/duplicates are preserved. */
  shades?: readonly number[];
  /** Validate the final mapped sRGB colors against an opaque background. */
  contrast?: {
    background: XColorSpaceRecord;
    /** Required ratio in [1,21], default 4.5. */
    target?: number;
    /** Only these shade numbers are constrained; default all requested shades. */
    shades?: readonly number[];
    /** throw (default) rejects unmet constraints; report returns explicit per-shade outcomes. */
    policy?: "throw" | "report";
  };
}

/** One independently generated shade, before and after sRGB gamut mapping. */
export interface XColorPerceptualShade {
  shade: number;
  /** OKLCh target: fixed hue, piecewise-linear lightness/chroma through white/base/black. */
  source: XColorSpaceRecord;
  /** Display sRGB record, mapped by reducing OKLCh chroma, preserving alpha. */
  color: XColorSpaceRecord;
  /** Present only for constrained shade levels. */
  contrast?: {ratio:number; target:number; passes:boolean};
}

export function perceptualPalette(base: XColorSpaceRecord, options: XColorPerceptualPaletteOptions, convert: Convert, map: (color:XColorSpaceRecord)=>XColorSpaceRecord): XColorPerceptualShade[] {
  const shades = options.shades ?? [50,100,200,300,400,500,600,700,800,900,950];
  const validShade = (value:number) => Number.isFinite(value) && value >= 50 && value <= 950;
  if (!Array.isArray(shades) || shades.length > 10000 || !shades.every(validShade)) throw Logger.createError("Invalid perceptual palette shades");
  const normalized = convert(base,"oklch");
  const [l,c,h] = normalized.coordinates;
  if (l < 0 || l > 1 || c < 0) throw Logger.createError("Perceptual palette requires lightness in [0,1] and nonnegative chroma");
  const constraint = options.contrast;
  const target = constraint?.target ?? 4.5;
  const policy = constraint?.policy ?? "throw";
  if (constraint && (!Number.isFinite(target) || target < 1 || target > 21 || !["throw","report"].includes(policy) ||
      (constraint.shades !== undefined && (!Array.isArray(constraint.shades) || !constraint.shades.every(validShade))))) throw Logger.createError("Invalid palette contrast constraint");
  const background = constraint ? map(constraint.background) : null;
  if (background && background.alpha !== 1) throw Logger.createError("Palette contrast requires an opaque background");
  const rgb = (color:XColorSpaceRecord) => ({r:color.coordinates[0]*255,g:color.coordinates[1]*255,b:color.coordinates[2]*255});
  return shades.map(shade => {
    const light = shade <= 500;
    const t = light ? (shade-50)/450 : (shade-500)/450;
    const source: XColorSpaceRecord = {space:"oklch",coordinates:[light ? 1+(l-1)*t : l*(1-t),light ? c*t : c*(1-t),h],alpha:normalized.alpha};
    const color = map(source);
    const entry: XColorPerceptualShade = {shade,source,color};
    if (constraint && background && (constraint.shades === undefined || constraint.shades.includes(shade))) {
      const bg = rgb(background), visible = compositeRgb(rgb(color),color.alpha,bg);
      const ratio = luminanceRatio(relativeLuminance(visible.r,visible.g,visible.b),relativeLuminance(bg.r,bg.g,bg.b));
      entry.contrast = {ratio,target,passes:ratio >= target};
      if (policy === "throw" && ratio < target) throw Logger.createError(`Palette shade ${shade} does not meet contrast ${target}`);
    }
    return entry;
  });
}
