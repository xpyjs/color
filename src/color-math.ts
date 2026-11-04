export function interpolate(start: number, end: number, position: number): number {
  return start * (1 - position) + end * position;
}

export function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgb(c: number): number {
  return c <= 0.0031308
    ? c * 12.92
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export type Mat3 = [number, number, number, number, number, number, number, number, number];

export function mat3Mul(m: Mat3, x: number, y: number, z: number): [number, number, number] {
  return [
    m[0] * x + m[1] * y + m[2] * z,
    m[3] * x + m[4] * y + m[5] * z,
    m[6] * x + m[7] * y + m[8] * z
  ];
}

export const SRGB_TO_XYZ: Mat3 = [
  0.4123907993, 0.3575843394, 0.1804807884,
  0.2126390059, 0.7151686788, 0.0721923154,
  0.0193308187, 0.1191947798, 0.9505321522
];

export const XYZ_TO_SRGB: Mat3 = [
  3.2409699419, -1.5373831776, -0.4986107603,
  -0.9692436363, 1.8759675015, 0.0415550574,
  0.0556300797, -0.2039769589, 1.0569715142
];

export const D65_TO_D50: Mat3 = [
  1.0479298208405488, 0.022946793341019088, -0.05019222954313557,
  0.029627815688159344, 0.990434484573249, -0.01707382502938514,
  -0.009243058152591178, 0.015055144896577895, 0.7521316354775848
];

export const D50_TO_D65: Mat3 = [
  0.9554734527042182, -0.023098536874261423, 0.0632593086610217,
  -0.028369706963208136, 1.0099954580058226, 0.021041398966943008,
  0.012314001688319899, -0.020507696433477912, 1.3303659366080753
];

export function rgbToOklab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const l_ = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m_ = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s_ = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const l1 = Math.cbrt(l_);
  const m1 = Math.cbrt(m_);
  const s1 = Math.cbrt(s_);

  return {
    l: 0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1,
    a: 1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1,
    b: 0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1
  };
}

export function oklabToRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const l1 = L + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = L - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = L - 0.0894841775 * a - 1.2914855480 * b;

  const l_ = l1 * l1 * l1;
  const m_ = m1 * m1 * m1;
  const s_ = s1 * s1 * s1;

  const rl = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gl = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  return {
    r: linearToSrgb(rl) * 255,
    g: linearToSrgb(gl) * 255,
    b: linearToSrgb(bl) * 255
  };
}

export function oklabToOklch(l: number, a: number, b: number): { l: number; c: number; h: number } {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return { l, c, h };
}

export function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  const hRad = h * Math.PI / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return oklabToRgb(l, a, b);
}

export function luminanceRatio(first: number, second: number): number {
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
