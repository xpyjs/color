/** Parse one complete, finite color component, scaling percentages when allowed. */
export function numericToken(value: unknown, percentScale?: number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value !== "string") return NaN;
  const match = value.trim().match(/^([+-]?(?:\d*\.\d+|\d+)(?:e[+-]?\d+)?)(%)?$/i);
  if (!match || (match[2] && percentScale === undefined)) return NaN;
  const number = Number(match[1]);
  if (!Number.isFinite(number)) return NaN;
  return match[2] ? (number / 100) * percentScale! : number;
}

/** Convert a finite hue token into degrees in [0, 360). */
export function hueToken(value: unknown): number {
  const match = typeof value === "string" ? value.trim().match(/^(.*?)(deg|grad|rad|turn)$/i) : null;
  const angle = numericToken(match ? match[1] : value);
  const unit = match?.[2].toLowerCase();
  const degrees = unit === "turn" ? angle * 360 : unit === "grad" ? angle * 0.9
    : unit === "rad" ? angle * (180 / Math.PI) : angle;
  return ((degrees % 360) + 360) % 360;
}

/** Parse CSS color() coordinates with an exact color space name and arity. */
export function colorCoordinates(value: string, space: string): number[] | null {
  const match = /^color\(\s*([\w-]+)\s+([^/]+?)(?:\s*\/\s*([^/]+?))?\s*\)$/i.exec(value);
  if (!match || match[1].toLowerCase() !== space) return null;
  const channels = match[2].trim().split(/\s+/).map((token) => numericToken(token, 1));
  const alpha = match[3] === undefined ? 1 : numericToken(match[3], 1);
  return channels.length === 3 && [...channels, alpha].every(Number.isFinite)
    ? [...channels, alpha]
    : null;
}

export function alphaSuffix(alpha: number): string {
  return alpha < 1 ? ` / ${alpha}` : "";
}
