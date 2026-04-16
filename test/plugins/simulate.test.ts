import { describe, it, expect, beforeAll, vi } from "vitest";
import { XColor, xcolor } from "../../src/core";
import simulate from "../../src/plugins/simulate";
import { Logger } from "../../src/utils";

beforeAll(() => {
  XColor.extend(simulate);
});

describe("simulate plugin", () => {
  it("should simulate protanopia", () => {
    const c = xcolor("#ff0000").simulate("protanopia");
    expect(c).toBeInstanceOf(XColor);
    expect(c.toHex()).not.toBe("#ff0000");
  });

  it("should simulate grayscale", () => {
    const c = xcolor("#ff0000").simulate("grayscale");
    expect(c.saturation()).toBe(0);
  });

  describe("individual modes", () => {
    it("should simulate deuteranopia", () => {
      const c = xcolor("#00ff00").simulate("deuteranopia");
      expect(c).toBeInstanceOf(XColor);
      expect(c.toHex()).not.toBe("#00ff00");
    });

    it("should simulate tritanopia", () => {
      const c = xcolor("#0000ff").simulate("tritanopia");
      expect(c).toBeInstanceOf(XColor);
      expect(c.toHex()).not.toBe("#0000ff");
    });

    it("grayscale should produce zero saturation for any color", () => {
      const colors = ["#ff0000", "#00ff00", "#0000ff", "#ff8800", "#8800ff"];
      for (const hex of colors) {
        const c = xcolor(hex).simulate("grayscale");
        expect(c.saturation()).toBe(0);
      }
    });

    it("protanopia should reduce red perception", () => {
      const original = xcolor("#ff0000");
      const simulated = original.simulate("protanopia");
      // Protanopia reduces red sensitivity, so red channel should decrease
      expect(simulated.red()).toBeLessThan(original.red());
    });
  });

  describe("alpha preservation", () => {
    it("should preserve alpha in protanopia", () => {
      const c = xcolor("rgba(255, 0, 0, 0.5)").simulate("protanopia");
      expect(c.alpha()).toBeCloseTo(0.5, 2);
    });

    it("should preserve alpha in deuteranopia", () => {
      const c = xcolor("rgba(0, 255, 0, 0.3)").simulate("deuteranopia");
      expect(c.alpha()).toBeCloseTo(0.3, 2);
    });

    it("should preserve alpha in tritanopia", () => {
      const c = xcolor("rgba(0, 0, 255, 0.8)").simulate("tritanopia");
      expect(c.alpha()).toBeCloseTo(0.8, 2);
    });

    it("should preserve alpha in grayscale", () => {
      const c = xcolor("rgba(255, 128, 0, 0.6)").simulate("grayscale");
      expect(c.alpha()).toBeCloseTo(0.6, 2);
    });
  });

  describe("invalid mode handling", () => {
    it("should warn and return clone for unknown mode", () => {
      const warnSpy = vi.spyOn(Logger, "warn");
      const original = xcolor("#ff0000");
      const result = original.simulate("unknown" as any);
      expect(result).toBeInstanceOf(XColor);
      expect(result.toHex()).toBe("#ff0000");
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown simulate mode"));
      warnSpy.mockRestore();
    });
  });

  describe("does not mutate original", () => {
    it("should return a new instance", () => {
      const original = xcolor("#ff8800");
      const simulated = original.simulate("protanopia");
      expect(simulated).not.toBe(original);
      expect(original.toHex()).toBe("#ff8800");
    });
  });

  describe("numerical verification", () => {
    it("grayscale should desaturate to equal RGB channels", () => {
      // grayscale uses desaturate(100), which sets HSL S=0
      // Red (#ff0000) → HSL(0, 100%, 50%) → HSL(0, 0%, 50%) → #808080
      const r = xcolor("#ff0000").simulate("grayscale");
      expect(r.red()).toBe(r.green());
      expect(r.green()).toBe(r.blue());
      expect(r.red()).toBe(128); // L=50% → RGB(128,128,128)

      // Green (#00ff00) → HSL(120, 100%, 50%) → HSL(120, 0%, 50%) → #808080
      const g = xcolor("#00ff00").simulate("grayscale");
      expect(g.red()).toBe(g.green());
      expect(g.red()).toBe(128);

      // White → stays white (L=100%)
      const w = xcolor("#ffffff").simulate("grayscale");
      expect(w.red()).toBe(255);
    });

    it("deuteranopia should shift green towards brown", () => {
      const sim = xcolor("#00ff00").simulate("deuteranopia");
      // Deuteranopia: green cone missing, greens shift to brownish
      expect(sim.red()).toBeGreaterThan(50);
      expect(sim.green()).toBeGreaterThan(50);
      // Blue channel should be reduced
      expect(sim.blue()).toBeLessThan(100);
    });

    it("tritanopia should shift blue towards teal/red", () => {
      const sim = xcolor("#0000ff").simulate("tritanopia");
      // Tritanopia: blue cone missing, blues shift
      expect(sim.toHex()).not.toBe("#0000ff");
      expect(sim.red()).toBeGreaterThanOrEqual(0);
      expect(sim.red()).toBeLessThanOrEqual(255);
    });
  });

  describe("black and white invariance", () => {
    it("black should remain black for all modes", () => {
      for (const mode of ["protanopia", "deuteranopia", "tritanopia", "grayscale"] as const) {
        const c = xcolor("#000000").simulate(mode);
        expect(c.toHex()).toBe("#000000");
      }
    });

    it("white should remain white for all modes", () => {
      for (const mode of ["protanopia", "deuteranopia", "tritanopia", "grayscale"] as const) {
        const c = xcolor("#ffffff").simulate(mode);
        expect(c.red()).toBeCloseTo(255, 0);
        expect(c.green()).toBeCloseTo(255, 0);
        expect(c.blue()).toBeCloseTo(255, 0);
      }
    });
  });
});
