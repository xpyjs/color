// =======================================
// Plugin: simulate - Vision deficiency simulation
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import { clampByte, Logger, defineMethod } from "@xpyjs/color";

/**
 * Color vision deficiency modes for the simulate plugin.
 *
 * Each mode applies an RGB matrix transformation (or desaturation) that
 * approximates how a person with the given deficiency would perceive the color.
 *
 * - `"protanopia"`   — Red-blind: missing L-cone (red-sensitive). Red appears dark.
 * - `"deuteranopia"` — Green-blind: missing M-cone (green-sensitive). Most common form (~6% of males).
 * - `"tritanopia"`   — Blue-blind: missing S-cone (blue-sensitive). Rare.
 * - `"grayscale"`    — Achromatopsia: complete absence of color perception.
 *
 * @example
 * ```ts
 * xcolor.use(simulatePlugin)
 *
 * xcolor('#ff0000').simulate('deuteranopia').toHex()
 * xcolor('#00ff00').simulate('protanopia').toHex()
 * xcolor('#ff8800').simulate('grayscale').toHex()
 * ```
 */
type SimulateMode = "protanopia" | "deuteranopia" | "tritanopia" | "grayscale";

const MATRICES: Record<Exclude<SimulateMode, "grayscale">, [number, number, number][]> = {
  protanopia: [
    [0.56667, 0.43333, 0],
    [0.55833, 0.44167, 0],
    [0, 0.24167, 0.75833]
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.43333, 0.56667],
    [0, 0.475, 0.525]
  ]
};

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Simulate how this color appears under a specific color vision deficiency.
     * @param mode - The type of vision deficiency to simulate:
     *   - `"protanopia"` - Red-blind (no red cones)
     *   - `"deuteranopia"` - Green-blind (no green cones)
     *   - `"tritanopia"` - Blue-blind (no blue cones)
     *   - `"grayscale"` - Complete color blindness
     * @returns A new XColor instance with the simulated color
     * @example
     * ```ts
     * xcolor('#ff0000').simulate('deuteranopia').toHex()
     * xcolor('#00ff00').simulate('protanopia').toHex()
     * xcolor('#ff0000').simulate('grayscale').toHex()
     * ```
     */
    simulate(mode: SimulateMode): XColor;
  }
}

const simulate: XColorPlugin = {
  name: "@xpyjs/color/plugins/simulate",
  install(_option, cls, _factory) {
    defineMethod(cls, 'simulate', function (this: InstanceType<typeof cls>, mode: SimulateMode) {
      if (mode === "grayscale") {
        return this.clone().grayscale();
      }

      const matrix = MATRICES[mode as Exclude<SimulateMode, "grayscale">];
      if (!matrix) {
        Logger.warn(`Unknown simulate mode: "${mode}", returning clone.`);
        return this.clone();
      }

      const r = this.red();
      const g = this.green();
      const b = this.blue();

      const nr = clampByte(r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]);
      const ng = clampByte(r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]);
      const nb = clampByte(r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]);

      return new cls({ r: nr, g: ng, b: nb, a: this.alpha() }, this._opts);
    });
  }
};

export type { SimulateMode };
export default simulate;
