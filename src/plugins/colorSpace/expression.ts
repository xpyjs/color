import { numericToken, hueToken } from "../../tokens";
import { parseCssLiteral } from "./css";
import { carryMissing, hueIndex, interpolateRecords, type Convert, type HuePath } from "./interpolation";
import type { XColorSpace, XColorSpaceRecord } from "./index";

/** Explicit environment for a standalone CSS expression; no DOM access occurs. */
export interface XColorCssContext {
  /** Resolved currentColor input; omitted values remain unresolved. */
  currentColor?: string | XColorSpaceRecord;
  /** Whole-color custom properties, with case-sensitive names including --. */
  variables?: Readonly<Record<string, string | XColorSpaceRecord>>;
}

// Split only at the outer level, preserving nested function arguments.
function split(text: string, separator: "comma" | "space"): string[] | null {
  let depth = 0, start = 0;
  const parts: string[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    if (depth < 0 || depth > 32) return null;
    if (depth === 0 && (separator === "comma" ? text[i] === "," : /\s/.test(text[i]) || text[i] === "/")) {
      const part = text.slice(start, i).trim();
      if (separator === "comma" || part) parts.push(part);
      if (separator === "space" && text[i] === "/") parts.push("/");
      start = i + 1;
    }
  }
  if (depth !== 0) return null;
  const tail = text.slice(start).trim();
  if (tail || separator === "comma") parts.push(tail);
  return parts;
}

// Numeric calc subset: channel keywords, finite numbers, + - * / and parentheses.
// No eval, property access, arbitrary functions, dimensions or percentages in calc.
function arithmetic(text: string, variables: Record<string, number>): number {
  const tokens: string[] = [];
  let rest = text.trim();
  while (rest) {
    const token = /^(?:\d*\.\d+|\d+)(?:e[+-]?\d+)?|^[a-z]+|^[()+*/-]/i.exec(rest)?.[0];
    if (!token || tokens.length >= 256) return NaN;
    tokens.push(token.toLowerCase());
    rest = rest.slice(token.length).replace(/^\s+/, "");
  }
  let cursor = 0, depth = 0;
  const primary = (): number => {
    if (++depth > 32) return NaN;
    const token = tokens[cursor++];
    let value: number;
    if (token === "+" || token === "-") value = (token === "-" ? -1 : 1) * primary();
    else if (token === "(") {
      value = sum();
      if (tokens[cursor++] !== ")") value = NaN;
    } else value = Object.prototype.hasOwnProperty.call(variables, token) ? variables[token] : numericToken(token);
    depth--;
    return value;
  };
  const product = (): number => {
    let value = primary();
    while (tokens[cursor] === "*" || tokens[cursor] === "/") {
      const op = tokens[cursor++], rhs = primary();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  };
  const sum = (): number => {
    let value = product();
    while (tokens[cursor] === "+" || tokens[cursor] === "-") {
      const op = tokens[cursor++], rhs = product();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  };
  const value = sum();
  return cursor === tokens.length && Number.isFinite(value) ? value : NaN;
}

const CSS_SPACES: XColorSpace[] = ["srgb", "srgb-linear", "display-p3", "a98-rgb", "prophoto-rgb", "rec2020", "xyz", "xyz-d65", "xyz-d50", "lab", "lch", "oklab", "oklch", "hsl", "hwb"];

export function evaluateCssExpression(input: string, context: XColorCssContext, convert: Convert): XColorSpaceRecord | null {
  let operations = 0;
  const resolve = (value: string | XColorSpaceRecord, depth: number): XColorSpaceRecord | null => {
    if (depth > 32 || ++operations > 256) return null;
    if (typeof value !== "string") {
      // Validation and a defensive copy, preserving explicit missing flags.
      const checked = convert(value, value.space);
      return { ...checked, ...(value.missing ? { missing: [...value.missing] as [boolean, boolean, boolean, boolean] } : {}) };
    }
    if (value.length > 16384) return null;
    const text = value.trim();
    const literal = parseCssLiteral(text);
    if (literal) return literal;
    if (text.toLowerCase() === "currentcolor") return context.currentColor === undefined ? null : resolve(context.currentColor, depth + 1);
    const fn = /^([a-z-]+)\(([\s\S]*)\)$/i.exec(text);
    if (!fn) return null;
    const name = fn[1].toLowerCase(), body = fn[2];
    if (name === "var") {
      const args = split(body, "comma");
      if (!args || args.length > 2 || !/^--[\w-]+$/.test(args[0])) return null;
      if (context.variables && Object.prototype.hasOwnProperty.call(context.variables, args[0])) {
        return resolve(context.variables[args[0]], depth + 1);
      }
      return args.length === 2 ? resolve(args[1], depth + 1) : null;
    }
    if (name === "color-mix") {
      const args = split(body, "comma");
      if (!args || args.length !== 3) return null;
      const head = /^in\s+([\w-]+)(?:\s+(shorter|longer|increasing|decreasing)\s+hue)?$/i.exec(args[0]);
      const space = head?.[1].toLowerCase() as XColorSpace;
      if (!head || !CSS_SPACES.includes(space) || (head[2] && hueIndex(space) < 0)) return null;
      const stop = (arg: string) => {
        const tokens = split(arg, "space");
        if (!tokens || tokens.length < 1 || tokens.length > 2) return null;
        const color = resolve(tokens[0], depth + 1);
        const weight = tokens[1] === undefined ? undefined : tokens[1].endsWith("%") ? numericToken(tokens[1], 1) : NaN;
        return color && (weight === undefined || (Number.isFinite(weight) && weight >= 0 && weight <= 1)) ? { color, weight } : null;
      };
      const a = stop(args[1]), b = stop(args[2]);
      if (!a || !b) return null;
      const aw = a.weight ?? (b.weight === undefined ? .5 : 1 - b.weight);
      const bw = b.weight ?? (a.weight === undefined ? .5 : 1 - a.weight);
      const total = aw + bw;
      if (total <= 0) return null;
      const mixed = interpolateRecords(a.color, b.color, bw / total, space, (head[2]?.toLowerCase() || "shorter") as HuePath, convert);
      return { ...mixed, alpha: mixed.alpha * Math.min(1, total) };
    }
    if (!["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"].includes(name)) return null;
    const tokens = split(body, "space");
    if (!tokens || tokens.shift()?.toLowerCase() !== "from") return null;
    const originText = tokens.shift();
    if (!originText) return null;
    const origin = resolve(originText, depth + 1);
    if (!origin) return null;
    const space = (name === "color" ? tokens.shift()?.toLowerCase() : name === "rgb" || name === "rgba" ? "srgb" : name === "hsla" ? "hsl" : name) as XColorSpace;
    if (!CSS_SPACES.includes(space) || (name === "color" && ["lab", "lch", "oklab", "oklch", "hsl", "hwb"].includes(space))) return null;
    if (tokens.length !== 3 && (tokens.length !== 5 || tokens[3] !== "/")) return null;
    const source = carryMissing(origin, space, convert);
    const rgb = name === "rgb" || name === "rgba", polar = space.endsWith("lch"), ok = space.startsWith("ok");
    const h = hueIndex(space);
    const names = space === "hsl" ? ["h", "s", "l"] : space === "hwb" ? ["h", "w", "b"]
      : space === "lab" || space === "oklab" ? ["l", "a", "b"] : polar ? ["l", "c", "h"]
      : space.startsWith("xyz") ? ["x", "y", "z"] : ["r", "g", "b"];
    const variables: Record<string, number> = { alpha: source.alpha };
    names.forEach((key, i) => { variables[key] = source.coordinates[i] * (rgb ? 255 : 1); });
    const scales = rgb ? [255, 255, 255] : space === "hsl" || space === "hwb" ? [0, 100, 100]
      : space === "lab" || space === "oklab" || polar ? [ok ? 1 : 100, ok ? .4 : polar ? 150 : 125, ok ? .4 : 125] : [1, 1, 1];
    const missing = [false, false, false, false] as [boolean, boolean, boolean, boolean];
    const component = (token: string, i: number): number => {
      const lower = token.toLowerCase();
      if (lower === "none") { missing[i] = true; return 0; }
      if (Object.prototype.hasOwnProperty.call(variables, lower)) {
        const index = lower === "alpha" ? 3 : names.indexOf(lower);
        missing[i] = !!source.missing?.[index];
        return variables[lower];
      }
      const calc = /^calc\(([\s\S]*)\)$/i.exec(token);
      return calc ? arithmetic(calc[1], variables) : i === h ? hueToken(token) : numericToken(token, i === 3 ? 1 : scales[i]);
    };
    const coordinates = tokens.slice(0, 3).map((token, i) => component(token, i) / (rgb ? 255 : 1)) as [number, number, number];
    let alpha = source.alpha;
    if (tokens.length === 5) alpha = component(tokens[4], 3);
    else missing[3] = !!source.missing?.[3];
    if (![...coordinates, alpha].every(Number.isFinite)) return null;
    return { space, coordinates, alpha: Math.max(0, Math.min(1, alpha)), ...(missing.some(Boolean) ? { missing } : {}) };
  };
  try { return typeof input === "string" ? resolve(input, 0) : null; }
  catch { return null; }
}
