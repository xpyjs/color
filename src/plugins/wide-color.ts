import { alphaSuffix, colorCoordinates } from "../tokens";

/** Coordinates stored without conversion to sRGB. */
export interface WideColorRecord<Space extends string> {
  readonly space: Space;
  readonly coordinates: readonly [number, number, number];
  readonly alpha: number;
}

export function parseCoordinates<Space extends string>(input: unknown, space: Space): WideColorRecord<Space> | null {
  if (typeof input !== "string") return null;
  const channels = colorCoordinates(input.trim(), space);
  if (!channels) return null;
  const [first, second, third, alpha] = channels;
  return { space, coordinates: [first, second, third], alpha: Math.max(0, Math.min(1, alpha)) };
}

/**
 * Format stored coordinates without passing through sRGB.
 * @param color - Wide-gamut color record
 * @returns A CSS color() string in the original color space
 */
export function formatWideColor(color: WideColorRecord<string>): string {
  return `color(${color.space} ${color.coordinates.join(" ")}${alphaSuffix(color.alpha)})`;
}
