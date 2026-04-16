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
