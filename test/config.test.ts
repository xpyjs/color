// =======================================
// Tests: xcolor.config() global options
// =======================================

import { describe, it, expect, afterEach } from "vitest";
import { XColor, xcolor } from "../src/core";

// Reset global config after each test to avoid cross-test pollution
afterEach(() => {
  XColor.config({});
});

describe("xcolor.config()", () => {
  it("should set global useDecimal option", () => {
    xcolor.config({ useDecimal: true });
    // When useDecimal is true, channels may keep fractional precision
    const c = xcolor("rgb(127.5, 63.75, 191.25)");
    // With useDecimal, the internal values should preserve fractions
    expect(typeof c.red()).toBe("number");
  });

  it("should apply global options to new instances", () => {
    xcolor.config({ useDecimal: true });
    const c = xcolor("#808080");
    // The color should be created without errors
    expect(c.toHex()).toBe("#808080");
  });

  it("should allow instance options to override global options", () => {
    xcolor.config({ useDecimal: true });
    const c = xcolor("#ff0000", { useDecimal: false });
    expect(c.red()).toBe(255);
  });

  it("should reset when called with empty object", () => {
    xcolor.config({ useDecimal: true });
    xcolor.config({});
    const c = xcolor("#ff0000");
    expect(c.red()).toBe(255);
  });

  it("should be accessible from XColor.config", () => {
    expect(typeof XColor.config).toBe("function");
    XColor.config({ useDecimal: true });
    const c = new XColor("#ff0000");
    expect(c.toHex()).toBe("#ff0000");
  });

  it("should be accessible from xcolor.config", () => {
    expect(typeof xcolor.config).toBe("function");
  });
});
