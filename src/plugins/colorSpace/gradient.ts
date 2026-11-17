import { Logger } from "@xpyjs/color";
import type { XColorSpace, XColorSpaceRecord } from "./index";
import { carryMissing, hueIndex, interpolateRecords, type Convert, type HuePath } from "./interpolation";

/** A source color at an optional normalized position. */
export interface XColorGradientStop {
  color: XColorSpaceRecord;
  /** Position in [0, 1]. Omitted positions are distributed between their neighbors. */
  position?: number;
}

/** Controls coordinate interpolation and the input data domain. */
export interface XColorGradientOptions {
  /** Interpolation space, default oklab. Output stays in this space without gamut clipping. */
  space?: XColorSpace;
  /** Polar hue path, default shorter. Explicit paths require a polar space. */
  hue?: HuePath;
  /** Increasing finite data-domain endpoints, default [0, 1]. */
  domain?: readonly [number, number];
}

/** Immutable scale configuration; each query returns independent coordinate records. */
export interface XColorGradient {
  /** Sample a finite data value; values outside the domain clamp to the nearest endpoint. */
  at(value: number): XColorSpaceRecord;
  /** Sample uniformly across the domain, including endpoints; count defaults to 5, range 2–10000. */
  colors(count?: number): XColorSpaceRecord[];
}

export function buildGradient(stops: readonly XColorGradientStop[], options: XColorGradientOptions, convert: Convert): XColorGradient {
  if (!Array.isArray(stops) || stops.length < 2 || stops.length > 10000) throw Logger.createError("Gradient requires 2–10000 stops");
  const space = options.space ?? "oklab", hue = options.hue ?? "shorter";
  if (!["shorter", "longer", "increasing", "decreasing"].includes(hue) || (options.hue !== undefined && hueIndex(space) < 0)) throw Logger.createError("Invalid gradient hue path");
  const domain = options.domain ?? [0, 1];
  if (!Array.isArray(domain) || domain.length !== 2 || !domain.every(Number.isFinite) || domain[0] >= domain[1] || !Number.isFinite(domain[1] - domain[0])) throw Logger.createError("Invalid gradient domain");
  const [min, max] = domain;
  const colors = stops.map(stop => carryMissing(stop.color, space, convert));
  const positions = stops.map(stop => stop.position);
  if (positions[0] === undefined) positions[0] = 0;
  if (positions[positions.length - 1] === undefined) positions[positions.length - 1] = 1;
  let previous = -1;
  positions.forEach(position => {
    if (position === undefined) return;
    if (!Number.isFinite(position) || position < 0 || position > 1 || position < previous) throw Logger.createError("Gradient positions must increase within [0, 1]");
    previous = position;
  });
  let anchor = 0;
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] === undefined) continue;
    const start = positions[anchor]!, end = positions[i]!;
    for (let j = anchor + 1; j < i; j++) positions[j] = start + (end - start) * (j - anchor) / (i - anchor);
    anchor = i;
  }
  const copy = (color: XColorSpaceRecord) => carryMissing(color, space, convert);
  const at = (value: number): XColorSpaceRecord => {
    if (!Number.isFinite(value)) throw Logger.createError("Gradient sample must be finite");
    const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    if (t < positions[0]!) return copy(colors[0]);
    // Upper bound gives the last stop at duplicate positions (right-continuous hard stops).
    let low = 0, high = positions.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (positions[mid]! <= t) low = mid + 1;
      else high = mid;
    }
    const left = low - 1;
    if (left >= colors.length - 1) return copy(colors[colors.length - 1]);
    return interpolateRecords(colors[left], colors[left + 1], (t - positions[left]!) / (positions[left + 1]! - positions[left]!), space, hue, convert);
  };
  return {
    at,
    colors(count = 5) {
      if (!Number.isInteger(count) || count < 2 || count > 10000) throw Logger.createError("Gradient sample count must be an integer from 2 to 10000");
      return Array.from({length: count}, (_, i) => at(i === count - 1 ? max : min + (max - min) * (i / (count - 1))));
    }
  };
}
