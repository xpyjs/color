// =======================================
// Tests: Plugin - Harmony
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import harmony from "../../src/plugins/harmony";

beforeAll(() => {
  XColor.extend(harmony);
});

describe("harmony plugin", () => {
  describe("complement", () => {
    it("should return complementary color (180° rotation)", () => {
      const c = xcolor("#ff0000");
      const comp = c.complement();
      expect(comp).toBeInstanceOf(XColor);
      expect(comp.hue()).toBeCloseTo(180, 0);
    });

    it("should not mutate original", () => {
      const c = xcolor("#ff0000");
      c.complement();
      expect(c.toHex()).toBe("#ff0000");
    });

    it("should work for green", () => {
      const c = xcolor("hsl(120, 100%, 50%)");
      const comp = c.complement();
      expect(comp.hue()).toBeCloseTo(300, 0);
    });
  });

  describe("triad", () => {
    it("should return 3 colors 120° apart", () => {
      const c = xcolor("#ff0000");
      const triad = c.triad();
      expect(triad).toHaveLength(3);
      expect(triad[0].hue()).toBeCloseTo(0, 0);
      expect(triad[1].hue()).toBeCloseTo(120, 0);
      expect(triad[2].hue()).toBeCloseTo(240, 0);
    });

    it("should not mutate original", () => {
      const c = xcolor("#ff0000");
      c.triad();
      expect(c.toHex()).toBe("#ff0000");
    });
  });

  describe("tetrad", () => {
    it("should return 4 colors 90° apart", () => {
      const c = xcolor("#ff0000");
      const tetrad = c.tetrad();
      expect(tetrad).toHaveLength(4);
      expect(tetrad[0].hue()).toBeCloseTo(0, 0);
      expect(tetrad[1].hue()).toBeCloseTo(90, 0);
      expect(tetrad[2].hue()).toBeCloseTo(180, 0);
      expect(tetrad[3].hue()).toBeCloseTo(270, 0);
    });
  });

  describe("splitComplement", () => {
    it("should return 3 colors (0°, 150°, 210° offset)", () => {
      const c = xcolor("#ff0000");
      const sc = c.splitComplement();
      expect(sc).toHaveLength(3);
      expect(sc[0].hue()).toBeCloseTo(0, 0);
      expect(sc[1].hue()).toBeCloseTo(150, 0);
      expect(sc[2].hue()).toBeCloseTo(210, 0);
    });
  });

  describe("analogous", () => {
    it("should return 6 colors by default", () => {
      const c = xcolor("#ff0000");
      const analogous = c.analogous();
      expect(analogous).toHaveLength(6);
    });

    it("should accept custom count", () => {
      const c = xcolor("#ff0000");
      const analogous = c.analogous(3);
      expect(analogous).toHaveLength(3);
    });

    it("should return the original as first color", () => {
      const c = xcolor("#ff0000");
      const analogous = c.analogous();
      expect(analogous[0].toHex()).toBe("#ff0000");
    });
  });

  describe("monochromatic", () => {
    it("should return 6 variations by default", () => {
      const c = xcolor("#ff0000");
      const mono = c.monochromatic();
      expect(mono).toHaveLength(6);
    });

    it("should accept custom count", () => {
      const c = xcolor("#ff0000");
      const mono = c.monochromatic(3);
      expect(mono).toHaveLength(3);
    });

    it("should return colors with same hue", () => {
      const c = xcolor("#ff0000");
      const mono = c.monochromatic(4);
      // All monochromatic variations of red should have hue close to 0
      mono.forEach((color) => {
        const hue = color.hue();
        // Grayscale (s=0) can have any hue, so only check saturated ones
        if (color.saturation() > 0) {
          expect(hue).toBeCloseTo(0, -1);
        }
      });
    });
  });
});
