import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import palettePlugin from "../../src/plugins/palette";

beforeAll(() => {
  XColor.extend(palettePlugin);
});

// =======================================
// Palette algorithm tests
// =======================================
describe("palette plugin - palette()", () => {
  it.each(["antd", "linear"] as const)("preserves alpha and instance precision in %s palettes", type => {
    const base = xcolor({ r: 12.4, g: 32.6, b: 44.5, a: 0.1234 }, { useDecimal: true });
    const colors = base.palette({ type });
    expect(colors[5].toRgb()).toEqual(base.toRgb());
    expect(colors[5]).not.toBe(base);
    for (const color of colors) {
      expect(color.alpha()).toBe(0.1234);
      // Verify the generated instance retains the option for later operations.
      expect(color.clone().red(12.5).red()).toBe(12.5);
    }
    expect(colors[4].red() % 1).not.toBe(0);
    expect(base.red()).toBe(12.4);
    expect(base.palette({ type, shades: [500] })[0].alpha()).toBe(0.1234);
  });

  it("does not replace explicit integer precision with later global defaults", () => {
    const base = xcolor("#1890ff", { useDecimal: false });
    xcolor.config({ useDecimal: true });
    try {
      for (const type of ["antd", "linear"] as const) {
        for (const color of base.palette({ type })) {
          expect(Number.isInteger(color.red())).toBe(true);
          expect(color.red(12.5).red()).toBe(13);
        }
      }
    } finally {
      xcolor.config({});
    }
  });

  it("maps linear shade values independently of subsets, order and duplicates", () => {
    const base = xcolor("#1890ff");
    const full = base.palette({ type: "linear" });
    const shades = [600, 400, 500, 600, 50, 950] as const;
    const subset = base.palette({ type: "linear", shades: [...shades] });
    const standard = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    subset.forEach((color, i) => expect(color.toHex()).toBe(full[standard.indexOf(shades[i])].toHex()));
    expect(base.palette({ type: "linear", shades: [400] })[0].toHex()).toBe(full[4].toHex());
    expect(full[0].toHex()).toBe("#ffffff");
    expect(full[5].toHex()).toBe("#1890ff");
    expect(full[10].toHex()).toBe("#000000");
    expect(subset[0]).not.toBe(subset[3]);
  });

  it.each(["#000000", "#010203", "#0c0000", "#000c00", "#00000c", "#111111"])(
    "keeps dark shades of %s no lighter than their predecessors", (input) => {
      const colors = xcolor(input).palette({ shades: [500, 600, 700, 800, 900, 950] });
      expect(colors[0].toHex()).toBe(input);
      for (let i = 1; i < colors.length; i++) {
        expect(colors[i].luminance()).toBeLessThanOrEqual(colors[i - 1].luminance());
      }
      expect(colors[colors.length - 1].toHex()).toBe("#000000");
    }
  );

  it("rejects invalid base colors before invoking any generator", () => {
    const invalid = xcolor("not-a-color");
    expect(() => invalid.palette()).toThrow("Invalid base color");
    expect(() => invalid.palette({ type: "linear" })).toThrow("Invalid base color");
    expect(() => invalid.palette({ shades: [] })).toThrow("Invalid base color");
    let called = false;
    expect(() => invalid.palette({ type: () => { called = true; return []; } })).toThrow("Invalid base color");
    expect(called).toBe(false);
  });

  it("should generate 11-shade palette with antd algorithm (default)", () => {
    const result = xcolor("#1890ff").palette();
    expect(result).toHaveLength(11);
    // Each entry should be an XColor instance
    result.forEach((c) => {
      expect(c).toBeInstanceOf(XColor);
    });
  });

  it("should place base color at shade 500 (index 5)", () => {
    const result = xcolor("#1890ff").palette();
    // Index 5 should be close to the base color
    expect(result[5].toHex()).toBe("#1890ff");
  });

  it("should generate lighter shades before base and darker after", () => {
    const result = xcolor("#1890ff").palette();
    // Shade 50 (index 0) should be lighter than base
    expect(result[0].luminance()).toBeGreaterThan(result[5].luminance());
    // Shade 900 (index 9) should be darker than base
    expect(result[9].luminance()).toBeLessThan(result[5].luminance());
  });

  it("should support linear algorithm", () => {
    const result = xcolor("#1890ff").palette({ type: "linear" });
    expect(result).toHaveLength(11);
    // Linear palette should also go from light to dark
    expect(result[0].luminance()).toBeGreaterThan(result[10].luminance());
  });

  it("should support custom shade levels", () => {
    const result = xcolor("#ff0000").palette({
      shades: [100, 500, 900] as any
    });
    expect(result).toHaveLength(3);
  });

  it("should work independently of theme options", () => {
    const result = xcolor("#52c41a").palette();
    expect(result).toHaveLength(11);
    expect(result[5].toHex()).toBe("#52c41a");
  });

  it("should support custom palette generator function", () => {
    const result = xcolor("#ff0000").palette({
      type: (baseColor, shades) => {
        return shades.map(() => xcolor(baseColor.toHex()));
      }
    });
    expect(result).toHaveLength(11);
    result.forEach((c) => {
      expect(c.toHex()).toBe("#ff0000");
    });
  });
});
