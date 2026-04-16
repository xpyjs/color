// =======================================
// Plugin: palette - Design system palette generation
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import { defineMethod } from "@xpyjs/color";
import type { Shade, PaletteType, CustomPaletteGenerator } from "./types";
import { DEFAULT_SHADES } from "./types";
import { generatePalette } from "./generate";

/**
 * Options for the {@link XColor.palette} instance method.
 */
export interface PaletteOptions {
  /** Palette generation type. @default 'antd' */
  type?: PaletteType;
  /** Shade levels to generate. @default [50,100,...,950] */
  shades?: Shade[];
}

declare module "@xpyjs/color" {
  interface XColor {
    /**
     * Generate a design system palette from this color.
     *
     * Creates a shade palette using the specified algorithm. The base color
     * maps to shade 500, with lighter shades below and darker shades above.
     *
     * @param options - Type and shade configuration
     * @param options.type - `'antd'` (default), `'linear'`, or a custom function
     * @param options.shades - Shade levels to generate (default: 50-950)
     * @returns Array of XColor instances from lightest to darkest
     * @example
     * ```ts
     * xcolor('#1890ff').palette()
     * // → XColor[] with 11 shades (50, 100, 200, ..., 950)
     *
     * xcolor('#1890ff').palette({ type: 'linear' })
     * // → XColor[] using linear interpolation
     * ```
     */
    palette(options?: PaletteOptions): XColor[];
  }
}

const palettePlugin: XColorPlugin = {
  name: "@xpyjs/color/plugins/palette",
  install(_option, cls) {
    defineMethod(cls, "palette", function (
      this: InstanceType<typeof cls>,
      options?: PaletteOptions
    ) {
      var algo = (options && options.type) || "antd";
      var shades = (options && options.shades) || DEFAULT_SHADES;
      return generatePalette(this, algo, shades, cls);
    });
  }
};

export type { Shade, PaletteType, CustomPaletteGenerator };
export { DEFAULT_SHADES };
export default palettePlugin;
