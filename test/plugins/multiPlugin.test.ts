// =======================================
// Tests: Multi-plugin toString chain
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import xcolor, { XColor } from "@xpyjs/color";
import cmyk from "../../src/plugins/cmyk";
import lab from "../../src/plugins/lab";
import name from "../../src/plugins/name";
import percentageRgb from "../../src/plugins/percentageRgb";

beforeAll(() => {
  // Load several plugins that register custom string formats
  xcolor.use(cmyk);
  xcolor.use(lab);
  xcolor.use(name);
  xcolor.use(percentageRgb);
});

describe("multi-plugin toString chain", () => {
  it("toString('cmyk') should still work when percentageRgb is also loaded", () => {
    const c = xcolor("#ff0000");
    expect(c.toString("cmyk")).toBe("cmyk(0%, 100%, 100%, 0%)");
  });

  it("toString('percentageRgb') should work when cmyk is also loaded", () => {
    const c = xcolor("#ff0000");
    expect(c.toString("percentageRgb")).toBe("rgb(100%, 0%, 0%)");
  });

  it("toString('hex') should fall through the entire chain", () => {
    const c = xcolor("#ff0000");
    expect(c.toString("hex")).toBe("#ff0000");
  });

  it("toString('rgb') should fall through the entire chain", () => {
    const c = xcolor("#ff0000");
    expect(c.toString("rgb")).toBe("rgb(255, 0, 0)");
  });

  it("toString() without args should fall through to default", () => {
    const c = xcolor("#ff0000");
    expect(c.toString()).toBe("#ff0000");
  });

  it("all three formats should work on the same instance", () => {
    const c = xcolor("#ff8000");
    expect(c.toString("cmyk")).toBe("cmyk(0%, 50%, 100%, 0%)");
    expect(c.toString("percentageRgb")).toBe("rgb(100%, 50%, 0%)");
    expect(c.toString("hex")).toBe("#ff8000");
  });

  it("custom string formats from different plugins should coexist", () => {
    const c = xcolor("#ff0000");
    expect(c.toString("name")).toBe("red");
    expect(c.toString("lab")).toBe(c.toLabString());
    expect(c.toString("cmyk")).toBe("cmyk(0%, 100%, 100%, 0%)");
  });
});
