// =======================================
// Tests: Plugin - Rec2020
// =======================================

import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import rec2020 from "../../src/plugins/rec2020";

beforeAll(() => {
  XColor.extend(rec2020);
});

describe("rec2020 plugin", () => {
  describe("toRec2020", () => {
    it("should convert white", () => {
      const r = xcolor("#ffffff").toRec2020();
      expect(r.r).toBeCloseTo(1, 2);
      expect(r.g).toBeCloseTo(1, 2);
      expect(r.b).toBeCloseTo(1, 2);
    });

    it("should convert black", () => {
      const r = xcolor("#000000").toRec2020();
      expect(r.r).toBeCloseTo(0, 2);
      expect(r.g).toBeCloseTo(0, 2);
      expect(r.b).toBeCloseTo(0, 2);
    });
  });

  describe("toRec2020String", () => {
    it("should output correct format", () => {
      const str = xcolor("#ff0000").toRec2020String();
      expect(str).toMatch(/^color\(rec2020 /);
    });
  });

  describe("toString format", () => {
    it("should output rec2020 via toString", () => {
      const c = xcolor("#ff0000");
      expect(c.toString("rec2020")).toBe(c.toRec2020String());
    });
  });

  describe("color() string parsing", () => {
    it("should parse color(rec2020 1 0 0)", () => {
      const c = xcolor("color(rec2020 1 0 0)");
      expect(c.red()).toBeGreaterThan(200);
    });
  });
});
