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
    // useDecimal allows fractional RGB — integer hex input stays integer
    const c = xcolor("#ff0000");
    expect(c.toRgb()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    // Setting fractional value preserves it
    c.red(127.5);
    expect(c.red()).toBe(127.5);
  });

  it("should apply global options to new instances", () => {
    xcolor.config({ useDecimal: true });
    const c = xcolor("#808080");
    expect(c.toHex()).toBe("#808080");
    // Integer input stays integer
    expect(c.toRgb().r).toBe(128);
    // Fractional setter is preserved
    c.green(100.5);
    expect(c.green()).toBe(100.5);
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
    expect(c.toRgb()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("should be accessible from xcolor.config", () => {
    expect(typeof xcolor.config).toBe("function");
  });
});
