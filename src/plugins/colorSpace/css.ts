import { hueToken, numericToken } from "../../tokens";
import { NAMED_COLORS } from "../name/constants";
import type { XColorSpace, XColorSpaceRecord } from "./index";

const RGB_SPACES = ["srgb", "srgb-linear", "display-p3", "a98-rgb", "prophoto-rgb", "rec2020", "xyz", "xyz-d65", "xyz-d50"];
const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));

// A bounded CSS literal parser, independent of global parser registrations.
// Expressions, escapes, comments, system colors and custom profiles need a CSS context.
export function parseCssLiteral(input: string): XColorSpaceRecord | null {
  if (typeof input !== "string") return null;
  const text = input.trim().toLowerCase();
  if (text === "transparent") return { space: "srgb", coordinates: [0, 0, 0], alpha: 0 };
  const named = Object.prototype.hasOwnProperty.call(NAMED_COLORS, text) ? NAMED_COLORS[text] : undefined;
  if (named || /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.test(text)) {
    let hex = (named || text).slice(1);
    if (hex.length <= 4) hex = hex.split("").map(v => v + v).join("");
    const channel = (index: number) => parseInt(hex.slice(index, index + 2), 16) / 255;
    return { space: "srgb", coordinates: [channel(0), channel(2), channel(4)], alpha: hex.length === 8 ? channel(6) : 1 };
  }
  const match = /^([a-z]+)\(([^()]*)\)$/.exec(text);
  if (!match) return null;
  const name = match[1];
  let body = match[2].trim();
  let space: XColorSpace;
  if (name === "color") {
    const tagged = /^([\w-]+)\s+(.+)$/.exec(body);
    if (!tagged || !RGB_SPACES.includes(tagged[1])) return null;
    space = tagged[1] as XColorSpace;
    body = tagged[2];
  } else if (["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch"].includes(name)) {
    space = name === "rgb" || name === "rgba" ? "srgb" : name === "hsla" ? "hsl" : name as XColorSpace;
  } else return null;

  const legacy = body.includes(",");
  let channels: string[], alphaToken: string | undefined;
  if (legacy) {
    if (!["rgb", "rgba", "hsl", "hsla"].includes(name) || body.includes("/")) return null;
    const parts = body.split(",").map(v => v.trim());
    if (parts.length !== 3 && parts.length !== 4) return null;
    channels = parts.slice(0, 3);
    alphaToken = parts[3];
    if (parts.includes("none")) return null;
    if (space === "srgb" && channels.some(v => v.endsWith("%")) && !channels.every(v => v.endsWith("%"))) return null;
    if (space === "hsl" && !channels.slice(1).every(v => v.endsWith("%"))) return null;
  } else {
    const parts = body.split("/");
    if (parts.length > 2) return null;
    channels = parts[0].trim().split(/\s+/);
    alphaToken = parts[1]?.trim();
    if (channels.length !== 3) return null;
  }
  const missing = [...channels, alphaToken].map(v => v === "none") as [boolean, boolean, boolean, boolean];
  const token = (index: number, scale: number, hue = false): number => {
    if (missing[index]) return 0;
    return hue ? hueToken(channels[index]) : numericToken(channels[index], scale);
  };
  let values: [number, number, number];
  if (name === "rgb" || name === "rgba") {
    values = [0, 1, 2].map(i => clamp(token(i, 255), 255) / 255) as typeof values;
  } else if (space === "hsl" || space === "hwb") {
    values = [token(0, 0, true), Math.max(0, token(1, 100)), token(2, 100)];
    if (space === "hwb") values[2] = Math.max(0, values[2]);
  } else if (name !== "color") {
    const ok = space.startsWith("ok"), polar = space.endsWith("lch");
    values = [clamp(token(0, ok ? 1 : 100), ok ? 1 : 100), token(1, ok ? .4 : polar ? 150 : 125), token(2, ok ? .4 : 125, polar)];
    if (polar) values[1] = Math.max(0, values[1]);
  } else values = [token(0, 1), token(1, 1), token(2, 1)];
  const alpha = missing[3] ? 0 : alphaToken === undefined ? 1 : clamp(numericToken(alphaToken, 1), 1);
  if (![...values, alpha].every(Number.isFinite)) return null;
  return { space, coordinates: values, alpha, ...(missing.some(Boolean) ? { missing } : {}) };
}
