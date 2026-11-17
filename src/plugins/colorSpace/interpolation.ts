import type { XColorSpace, XColorSpaceRecord } from "./index";

export type Convert = (color: XColorSpaceRecord, space: XColorSpace) => XColorSpaceRecord;
export type HuePath = "shorter" | "longer" | "increasing" | "decreasing";
type Flags = [boolean, boolean, boolean, boolean];

function categories(space: XColorSpace): string[] {
  if (space === "lab" || space === "oklab") return ["L", "a", "b"];
  if (space === "lch" || space === "oklch") return ["L", "C", "H"];
  if (space === "hsl") return ["H", "C", "L"];
  if (space === "hsv") return ["H", "C", "V"];
  if (space === "hwb") return ["H", "W", "B"];
  return ["R", "G", "Bz"];
}

export function hueIndex(space: XColorSpace): number {
  return space === "lch" || space === "oklch" ? 2 : ["hsl", "hwb", "hsv"].includes(space) ? 0 : -1;
}

// Carry analogous missing components (including analogous sets) before powerless handling.
export function carryMissing(color: XColorSpaceRecord, space: XColorSpace, convert: Convert): XColorSpaceRecord {
  const result = convert(color, space);
  const from = categories(color.space), to = categories(space);
  const missing: Flags = [false, false, false, !!color.missing?.[3]];
  const remaining = from.map((_, i) => i).filter(i => !to.includes(from[i]));
  to.forEach((category, i) => {
    const source = from.indexOf(category);
    missing[i] = source >= 0 ? !!color.missing?.[source]
      : remaining.length > 0 && remaining.every(j => color.missing?.[j]);
  });
  const coordinates = result.coordinates.map((v, i) => missing[i] ? 0 : v) as [number, number, number];
  return { ...result, coordinates, ...(missing.some(Boolean) ? { missing } : {}) };
}

export function interpolateRecords(a: XColorSpaceRecord, b: XColorSpaceRecord, t: number, space: XColorSpace, hue: HuePath, convert: Convert): XColorSpaceRecord {
  const left = carryMissing(a, space, convert), right = carryMissing(b, space, convert);
  const av = [...left.coordinates, left.alpha], bv = [...right.coordinates, right.alpha];
  const am = [...(left.missing || [false, false, false, false])], bm = [...(right.missing || [false, false, false, false])];
  const h = hueIndex(space);
  // Fill non-hue components first: missing chroma is not a known zero chroma.
  for (let i = 0; i < 4; i++) {
    if (i === h) continue;
    if (am[i] && !bm[i]) av[i] = bv[i];
    if (bm[i] && !am[i]) bv[i] = av[i];
  }
  const powerless = (v: number[]) => space === "hsl" || space === "hsv" ? v[1] <= .001
    : space === "hwb" ? v[1] + v[2] >= 100
    : space === "oklch" ? v[1] <= .000004 : space === "lch" ? v[1] <= .000004 : false;
  if (h >= 0) {
    const unknownChroma = am[1] && bm[1];
    const unknownBlackness = space === "hwb" && am[2] && bm[2];
    am[h] = am[h] || (!unknownChroma && !unknownBlackness && powerless(av));
    bm[h] = bm[h] || (!unknownChroma && !unknownBlackness && powerless(bv));
  }
  const missing = am.map((v, i) => v && bm[i]) as Flags;
  for (let i = 0; i < 4; i++) {
    if (am[i]) av[i] = bm[i] ? 0 : bv[i];
    if (bm[i]) bv[i] = av[i];
  }
  if (h >= 0 && !missing[h]) {
    av[h] = (av[h] % 360 + 360) % 360;
    bv[h] = (bv[h] % 360 + 360) % 360;
    const difference = bv[h] - av[h];
    if (hue === "shorter") {
      if (difference > 180) av[h] += 360;
      else if (difference < -180) bv[h] += 360;
    } else if (hue === "longer") {
      if (difference > 0 && difference < 180) av[h] += 360;
      else if (difference <= 0 && difference > -180) bv[h] += 360;
    } else if (hue === "increasing" && bv[h] < av[h]) bv[h] += 360;
    else if (hue === "decreasing" && av[h] < bv[h]) av[h] += 360;
  }
  const alpha = av[3] * (1 - t) + bv[3] * t;
  const coordinates = av.slice(0, 3).map((v, i) => {
    if (missing[i]) return 0;
    if (i === h) return ((v * (1 - t) + bv[i] * t) % 360 + 360) % 360;
    if (missing[3]) return v * (1 - t) + bv[i] * t;
    return alpha === 0 ? 0 : (v * av[3] * (1 - t) + bv[i] * bv[3] * t) / alpha;
  }) as [number, number, number];
  return { space, coordinates, alpha, ...(missing.some(Boolean) ? { missing } : {}) };
}
