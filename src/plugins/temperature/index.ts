// =======================================
// Plugin: temperature - RGB/Kelvin conversion
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import { clamp, defineMethod } from "@xpyjs/color";

/**
 * Convert a color temperature in Kelvin to an approximate RGB color.
 *
 * Uses Tanner Helland's empirical algorithm (curve-fitted from Planckian locus data).
 * The input is clamped to `[1000, 40000]` Kelvin:
 * - 1000–2000 K → warm candlelight / fire
 * - 2700–3000 K → warm white incandescent bulb
 * - 5000–6500 K → neutral daylight
 * - 10000+ K    → cool blue sky
 *
 * @param kelvin - Color temperature in Kelvin (clamped to `1000–40000`)
 * @returns Approximate RGB representation of the blackbody color
 */
function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  const k = clamp(kelvin, 1000, 40000) / 100;

  let r: number;
  let g: number;
  let b: number;

  if (k <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(k) - 161.1195681661;
    b = k <= 19 ? 0 : 138.5177312231 * Math.log(k - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(k - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(k - 60, -0.0755148492);
    b = 255;
  }

  return {
    r: Math.round(clamp(r, 0, 255)),
    g: Math.round(clamp(g, 0, 255)),
    b: Math.round(clamp(b, 0, 255))
  };
}

/**
 * Estimate the color temperature in Kelvin that best matches an RGB color.
 *
 * Scans the `[1000, 40000]` Kelvin range and returns the temperature whose
 * {@link kelvinToRgb} output has the smallest RGB distance from the input.
 * Neutral grays have no meaningful hue, so they resolve to the D65 daylight
 * reference (6500 K). The result is approximate and best suited for colors
 * near the Planckian locus (warm whites, neutral whites, cool blues).
 *
 * @param r - Red channel (0–255)
 * @param g - Green channel (0–255)
 * @param b - Blue channel (0–255)
 * @returns Estimated color temperature in Kelvin (`1000–40000`)
 */
function rgbToKelvin(r: number, g: number, b: number): number {
  if (r === g && g === b) return 6500;

  const distanceAt = (kelvin: number): number => {
    const rgb = kelvinToRgb(kelvin);
    return (rgb.r - r) ** 2 + (rgb.g - g) ** 2 + (rgb.b - b) ** 2;
  };

  let best = 6500;
  let bestDistance = Infinity;

  // Coarse scan, then refine around the best candidate for 1 K precision.
  for (let kelvin = 1000; kelvin <= 40000; kelvin += 100) {
    const distance = distanceAt(kelvin);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = kelvin;
    }
  }
  for (let kelvin = Math.max(1000, best - 100); kelvin <= Math.min(40000, best + 100); kelvin++) {
    const distance = distanceAt(kelvin);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = kelvin;
    }
  }

  return best;
}

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Get estimated color temperature in Kelvin.
     * @returns Temperature in Kelvin (1000-40000)
     * @example
     * ```ts
     * xcolor('#ff8000').temperature() // ~1800
     * ```
     */
    temperature(): number;
    /**
     * Set color by Kelvin temperature (clamped to 1000-40000).
     * @param kelvin - Temperature in Kelvin
     * @returns Current instance for chaining
     * @example
     * ```ts
     * xcolor('#000').temperature(6500).toHex() // daylight white
     * xcolor('#000').temperature(2700).toHex() // warm white
     * ```
     */
    temperature(kelvin: number): this;
  }
}

const temperature: XColorPlugin = {
  name: "@xpyjs/color/plugins/temperature",
  install(_option, cls, _factory) {
    defineMethod(cls, 'temperature', function (this: InstanceType<typeof cls>, kelvin?: number) {
      if (kelvin === undefined) {
        return rgbToKelvin(this.red(), this.green(), this.blue());
      }

      const rgb = kelvinToRgb(clamp(kelvin, 1000, 40000));
      this.rgb(rgb.r, rgb.g, rgb.b);
      return this;
    });
  }
};

export default temperature;
