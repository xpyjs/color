// =======================================
// Tests: Color parsing pipeline
// =======================================

import { describe, it, expect } from "vitest";
import {
  parseColor,
  parseFunctionalChannels,
  registerColorParser,
  parseRgbChannel,
  parseAlphaChannel,
  parsePercent,
  parseHue
} from "../src/parse";

describe("parseColor", () => {
  describe("hex strings", () => {
    it("should parse #RRGGBB", () => {
      const c = parseColor("#ff0000");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should parse #RGB", () => {
      const c = parseColor("#f00");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should parse #RRGGBBAA", () => {
      const c = parseColor("#ff000080");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(255);
      expect(c!.g).toBe(0);
      expect(c!.b).toBe(0);
      expect(c!.a).toBeCloseTo(0.502, 1);
    });

    it("should parse #RGBA", () => {
      const c = parseColor("#f008");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(255);
      expect(c!.g).toBe(0);
      expect(c!.b).toBe(0);
      expect(c!.a).toBeCloseTo(0.533, 1);
    });

    it("should handle uppercase", () => {
      const c = parseColor("#FF0000");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should parse hex without #", () => {
      expect(parseColor("ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(parseColor("f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(parseColor("ff000080")).toEqual({ r: 255, g: 0, b: 0, a: 0.502 });
      expect(parseColor("f008")).toEqual({ r: 255, g: 0, b: 0, a: 0.5333 });
    });

    it("should return null for invalid hex", () => {
      expect(parseColor("#xyz")).toBeNull();
      expect(parseColor("#12345")).toBeNull();
      expect(parseColor("#")).toBeNull();
    });
  });

  describe("rgb/rgba strings", () => {
    it("should parse rgb(r, g, b)", () => {
      const c = parseColor("rgb(255, 0, 0)");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should parse rgba(r, g, b, a)", () => {
      const c = parseColor("rgba(255, 0, 0, 0.5)");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it("should parse percentage values", () => {
      const c = parseColor("rgb(100%, 0%, 0%)");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(255);
      expect(c!.g).toBe(0);
      expect(c!.b).toBe(0);
    });

    it("should parse modern space syntax", () => {
      const c = parseColor("rgb(255 0 0)");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should parse modern syntax with alpha", () => {
      const c = parseColor("rgb(255 0 0 / 0.5)");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it("should parse alpha with percentage", () => {
      const c = parseColor("rgba(255, 0, 0, 50%)");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it("should clamp out-of-range values", () => {
      const c = parseColor("rgb(300, -10, 0)");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(255);
      expect(c!.g).toBe(0);
      expect(c!.b).toBe(0);
    });

    it("should parse decimal channel values", () => {
      const c = parseColor("rgb(10.4, 20.5, 30.6)");
      expect(c).toEqual({ r: 10, g: 21, b: 31, a: 1 });
    });

    it("should parse bare rgb syntax without parentheses", () => {
      expect(parseColor("rgb 255 0 0")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(parseColor("rgb 255 0 0 / 50%")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(parseColor("rgba 255, 0, 0, 0.5")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });
  });

  describe("hsl/hsla strings", () => {
    it("should parse hsl(h, s%, l%)", () => {
      const c = parseColor("hsl(0, 100%, 50%)");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(255);
      expect(c!.g).toBe(0);
      expect(c!.b).toBe(0);
    });

    it("should parse hsla with alpha", () => {
      const c = parseColor("hsla(0, 100%, 50%, 0.5)");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(255);
      expect(c!.a).toBe(0.5);
    });

    it("should parse modern space syntax", () => {
      const c = parseColor("hsl(120 100% 50%)");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(0);
      expect(c!.g).toBe(255);
      expect(c!.b).toBe(0);
    });

    it("should parse modern syntax with alpha", () => {
      const c = parseColor("hsl(120 100% 50% / 0.5)");
      expect(c).not.toBeNull();
      expect(c!.g).toBe(255);
      expect(c!.a).toBe(0.5);
    });

    it("should parse hue units", () => {
      const c = parseColor("hsl(0.5turn 100% 50%)");
      expect(c).toEqual({ r: 0, g: 255, b: 255, a: 1 });
    });

    it("should parse bare hsl syntax without parentheses", () => {
      const c1 = parseColor("hsl 120 100% 50%");
      expect(c1).toEqual({ r: 0, g: 255, b: 0, a: 1 });

      const c2 = parseColor("hsla 120, 100%, 50%, 0.5");
      expect(c2).toEqual({ r: 0, g: 255, b: 0, a: 0.5 });
    });
  });

  describe("hsv/hsva strings", () => {
    it("should parse hsv(h, s%, v%)", () => {
      const c = parseColor("hsv(0, 100%, 100%)");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(255);
      expect(c!.g).toBe(0);
      expect(c!.b).toBe(0);
    });

    it("should parse hsva with alpha", () => {
      const c = parseColor("hsva(0, 100%, 100%, 0.5)");
      expect(c).not.toBeNull();
      expect(c!.a).toBe(0.5);
    });

    it("should parse hsv modern space syntax", () => {
      const c = parseColor("hsv(120 100% 100% / 50%)");
      expect(c).not.toBeNull();
      expect(c!.r).toBe(0);
      expect(c!.g).toBe(255);
      expect(c!.b).toBe(0);
      expect(c!.a).toBe(0.5);
    });

    it("should parse bare hsv syntax without parentheses", () => {
      const c1 = parseColor("hsv 120 100% 100%");
      expect(c1).toEqual({ r: 0, g: 255, b: 0, a: 1 });

      const c2 = parseColor("hsva 120, 100%, 100%, 0.5");
      expect(c2).toEqual({ r: 0, g: 255, b: 0, a: 0.5 });
    });
  });

  describe("named colors", () => {
    it("should not parse named colors without name plugin", () => {
      expect(parseColor("red")).toBeNull();
      expect(parseColor("Red")).toBeNull();
      expect(parseColor("transparent")).toBeNull();
    });
  });

  describe("number input", () => {
    it("should parse 0xRRGGBB", () => {
      const c = parseColor(0xFF0000);
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should parse 0", () => {
      const c = parseColor(0);
      expect(c).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it("should return null for invalid numbers", () => {
      expect(parseColor(-1)).toBeNull();
      expect(parseColor(0x1000000)).toBeNull();
      expect(parseColor(NaN)).toBeNull();
      expect(parseColor(Infinity)).toBeNull();
    });
  });

  describe("object input", () => {
    it("should parse RGBA object", () => {
      const c = parseColor({ r: 255, g: 0, b: 0, a: 1 });
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should fill default values", () => {
      const c = parseColor({ r: 255 });
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should clamp out-of-range values", () => {
      const c = parseColor({ r: 300, g: -10, b: 128, a: 2 });
      expect(c).toEqual({ r: 255, g: 0, b: 128, a: 1 });
    });

    it("should parse HSL object", () => {
      const c = parseColor({ h: 0, s: 100, l: 50, a: 1 } as any);
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should parse HSV object", () => {
      const c = parseColor({ h: 240, s: 100, v: 100 } as any);
      expect(c).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    });
  });

  describe("modern color()", () => {
    it("should parse color(srgb ...)", () => {
      const c = parseColor("color(srgb 1 0 0 / 0.5)");
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });
  });

  describe("external parser (plugin pipeline)", () => {
    it("should parse via custom parser registration", () => {
      const unregister = registerColorParser((value) => {
        if (value === "brand") return { r: 18, g: 52, b: 86, a: 1 };
        return null;
      });

      expect(parseColor("brand")).toEqual({ r: 18, g: 52, b: 86, a: 1 });
      unregister();
      expect(parseColor("brand")).toBeNull();
    });

    it("should run plugin parsers after built-in parsers", () => {
      const calls: string[] = [];
      const unregister = registerColorParser((value) => {
        calls.push("plugin");
        return null;
      });

      // Built-in hex should match first, plugin not called
      parseColor("#ff0000");
      expect(calls).toEqual([]);

      // Unknown string falls through to plugin
      parseColor("custom-color");
      expect(calls).toEqual(["plugin"]);

      unregister();
    });

    it("should support multiple plugin parsers (first match wins)", () => {
      const unregister1 = registerColorParser((value) => {
        if (value === "special") return { r: 1, g: 2, b: 3, a: 1 };
        return null;
      });
      const unregister2 = registerColorParser((value) => {
        if (value === "special") return { r: 99, g: 99, b: 99, a: 1 };
        return null;
      });

      // First registered parser wins
      expect(parseColor("special")).toEqual({ r: 1, g: 2, b: 3, a: 1 });

      unregister1();
      unregister2();
    });

    it("should normalize plugin parser output", () => {
      const unregister = registerColorParser((value) => {
        if (value === "out-of-range") return { r: 300, g: -10, b: 128.7, a: 1.5 };
        return null;
      });

      const c = parseColor("out-of-range");
      // parseColor clamps but does not round — rounding is done by XColor constructor
      expect(c).toEqual({ r: 255, g: 0, b: 128.7, a: 1 });

      unregister();
    });

    it("should handle parser errors gracefully", () => {
      const unregister = registerColorParser((_value) => {
        throw new Error("boom");
      });

      // Should not throw, falls through to failure
      expect(parseColor("anything-custom")).toBeNull();

      unregister();
    });

    it("should support before priority to override built-in", () => {
      const unregister = registerColorParser(
        (value) => {
          if (typeof value === "string" && value.startsWith("#"))
            return { r: 1, g: 1, b: 1, a: 1 };
          return null;
        },
        { priority: "before" }
      );

      // Before-priority parser intercepts hex before built-in
      expect(parseColor("#ff0000")).toEqual({ r: 1, g: 1, b: 1, a: 1 });

      unregister();

      // After unregister, built-in hex works again
      expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should default to after priority", () => {
      const calls: string[] = [];
      const unregister = registerColorParser((value) => {
        calls.push("after");
        return null;
      });

      // Built-in matches first, after-parser not called
      parseColor("#ff0000");
      expect(calls).toEqual([]);

      unregister();
    });
  });

  describe("invalid inputs", () => {
    it("should return null for invalid strings", () => {
      expect(parseColor("not a color")).toBeNull();
      expect(parseColor("")).toBeNull();
      expect(parseColor("   ")).toBeNull();
    });

    it("should return null for invalid types", () => {
      expect(parseColor(true as any)).toBeNull();
      expect(parseColor(undefined as any)).toBeNull();
    });
  });
});

describe("parseFunctionalChannels", () => {
  it("should parse rgb modern syntax", () => {
    const parsed = parseFunctionalChannels("rgb(255 0 153 / 80%)", ["rgb", "rgba"], 3);
    expect(parsed).toEqual({ channels: ["255", "0", "153"], alpha: "80%" });
  });

  it("should parse bare syntax with comma alpha", () => {
    const parsed = parseFunctionalChannels("rgba 255, 0, 153, 0.5", ["rgb", "rgba"], 3);
    expect(parsed).toEqual({ channels: ["255", "0", "153"], alpha: "0.5" });
  });

  it("should parse cmyk with and without parentheses", () => {
    expect(parseFunctionalChannels("cmyk(10, 20, 30, 40 / 50%)", "cmyk", 4))
      .toEqual({ channels: ["10", "20", "30", "40"], alpha: "50%" });
    expect(parseFunctionalChannels("cmyk 10 20 30 40", "cmyk", 4))
      .toEqual({ channels: ["10", "20", "30", "40"] });
  });
});

describe("parseRgbChannel", () => {
  it("should parse plain numbers", () => {
    expect(parseRgbChannel(128)).toBe(128);
    expect(parseRgbChannel("200")).toBe(200);
  });

  it("should parse percentages", () => {
    expect(parseRgbChannel("50%")).toBe(128);
    expect(parseRgbChannel("100%")).toBe(255);
    expect(parseRgbChannel("0%")).toBe(0);
  });

  it("should clamp out-of-range", () => {
    expect(parseRgbChannel(300)).toBe(255);
    expect(parseRgbChannel(-10)).toBe(0);
  });
});

describe("parseAlphaChannel", () => {
  it("should parse plain numbers", () => {
    expect(parseAlphaChannel(0.5)).toBe(0.5);
    expect(parseAlphaChannel("0.8")).toBe(0.8);
  });

  it("should parse percentages", () => {
    expect(parseAlphaChannel("50%")).toBe(0.5);
    expect(parseAlphaChannel("100%")).toBe(1);
  });

  it("should clamp out-of-range", () => {
    expect(parseAlphaChannel(1.5)).toBe(1);
    expect(parseAlphaChannel(-0.1)).toBe(0);
  });
});

describe("parsePercent", () => {
  it("should parse values with or without %", () => {
    expect(parsePercent("50%")).toBe(50);
    expect(parsePercent("50")).toBe(50);
    expect(parsePercent(75)).toBe(75);
  });

  it("should clamp to 0-100", () => {
    expect(parsePercent("150%")).toBe(100);
    expect(parsePercent(-10)).toBe(0);
  });
});

describe("parseHue", () => {
  it("should parse plain degrees", () => {
    expect(parseHue(180)).toBe(180);
    expect(parseHue("90deg")).toBe(90);
    expect(parseHue("90")).toBe(90);
  });

  it("should parse turn unit", () => {
    expect(parseHue("0.5turn")).toBe(180);
    expect(parseHue("1turn")).toBe(0);
  });

  it("should parse grad unit", () => {
    expect(parseHue("200grad")).toBe(180);
  });

  it("should parse rad unit", () => {
    expect(parseHue(`${Math.PI}rad`)).toBeCloseTo(180, 1);
  });

  it("should handle negative values via modulo", () => {
    expect(parseHue(-90)).toBe(270);
  });
});
