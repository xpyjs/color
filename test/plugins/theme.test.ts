import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { XColor, xcolor } from "../../src/core";
import theme from "../../src/plugins/theme";
import type { XColorThemeOptions } from "../../src/plugins/theme";
import { flattenColors, deepMerge } from "../../src/plugins/theme/config";
import { resolveDeriveOptions, deriveRoleColors, deriveBaseColor, DEFAULT_ROLES, DEFAULT_ROLE_HUES } from "../../src/plugins/theme/derive";

const basicOptions: XColorThemeOptions = {
  prefix: "--x",
  colors: {
    primary: "#1890ff"
  }
};

beforeAll(() => {
  XColor.extend(theme, basicOptions);
});

// =======================================
// Config resolver tests
// =======================================
describe("theme plugin - config resolution", () => {
  it("should generate CSS vars for string color shorthand", () => {
    const vars = xcolor.getThemeVars();
    // Should have shade variables
    expect(vars["--x-primary-500"]).toBe("#1890ff");
    expect(vars["--x-primary-50"]).toBeDefined();
    expect(vars["--x-primary-900"]).toBeDefined();
  });

  it("should generate semantic color variables by default", () => {
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-hover"]).toBeDefined();
    expect(vars["--x-primary-active"]).toBeDefined();
    expect(vars["--x-primary-disabled"]).toBeDefined();
    expect(vars["--x-primary-border"]).toBeDefined();
    expect(vars["--x-primary-bg"]).toBeDefined();
    expect(vars["--x-primary-text"]).toBeDefined();
  });

  it("should handle object with DEFAULT and overrides", () => {
    xcolor.updateTheme({
      colors: {
        primary: "#1890ff",
        success: {
          DEFAULT: "#52c41a",
          hover: "#73d13d"
        }
      }
    });
    const vars = xcolor.getThemeVars();
    // User-specified hover takes priority
    expect(vars["--x-success-hover"]).toBe("#73d13d");
    // Other semantic colors still auto-generated
    expect(vars["--x-success-active"]).toBeDefined();
    expect(vars["--x-success-500"]).toBe("#52c41a");
  });

  it("should handle pure custom nesting without DEFAULT", () => {
    xcolor.updateTheme({
      colors: {
        primary: "#1890ff",
        brand: {
          logo: "#ff6600",
          accent: "#9c27b0"
        }
      }
    });
    const vars = xcolor.getThemeVars();
    expect(vars["--x-brand-logo"]).toBe("#ff6600");
    expect(vars["--x-brand-accent"]).toBe("#9c27b0");
    // No shade or semantic for brand (no DEFAULT)
    expect(vars["--x-brand-500"]).toBeUndefined();
    expect(vars["--x-brand-hover"]).toBeUndefined();
  });

  it("should support deep nesting", () => {
    xcolor.updateTheme({
      colors: {
        primary: "#1890ff",
        brand: {
          accent: {
            light: "#ce93d8",
            dark: "#7b1fa2"
          }
        }
      }
    });
    const vars = xcolor.getThemeVars();
    expect(vars["--x-brand-accent-light"]).toBe("#ce93d8");
    expect(vars["--x-brand-accent-dark"]).toBe("#7b1fa2");
  });
});

// =======================================
// flattenColors tests
// =======================================
describe("theme plugin - flattenColors()", () => {
  it("should flatten simple string values", () => {
    const result = flattenColors({ logo: "#ff0000", bg: "#ffffff" }, "--x-brand");
    expect(result).toEqual({
      "--x-brand-logo": "#ff0000",
      "--x-brand-bg": "#ffffff"
    });
  });

  it("should skip DEFAULT key", () => {
    const result = flattenColors({ DEFAULT: "#123456", hover: "#abcdef" }, "--x-primary");
    expect(result).toEqual({
      "--x-primary-hover": "#abcdef"
    });
  });

  it("should recursively flatten nested objects", () => {
    const result = flattenColors(
      {
        foo: {
          bar: "#111",
          baz: {
            qux: "#222"
          }
        }
      } as any,
      "--x"
    );
    expect(result).toEqual({
      "--x-foo-bar": "#111",
      "--x-foo-baz-qux": "#222"
    });
  });
});

// =======================================
// CSS generation tests
// =======================================
describe("theme plugin - CSS output", () => {
  beforeEach(() => {
    // Reset to basic config
    xcolor.updateTheme({
      ...basicOptions,
      darkMode: false,
      format: "hex",
      cssSelector: ":root"
    });
  });

  it("should return valid CSS string", () => {
    const css = xcolor.getThemeCss();
    expect(css).toContain(":root {");
    expect(css).toContain("--x-primary-500:");
    expect(css).toContain("}");
  });

  it("should format values as hex by default", () => {
    const css = xcolor.getThemeCss();
    // Hex values start with #
    expect(css).toMatch(/--x-primary-500:\s*#[0-9a-f]{6}/i);
  });

  it("should support rgb format", () => {
    xcolor.updateTheme({ format: "rgb" });
    const css = xcolor.getThemeCss();
    expect(css).toMatch(/--x-primary-500:\s*rgb\(/);
  });

  it("should support hsl format", () => {
    xcolor.updateTheme({ format: "hsl" });
    const css = xcolor.getThemeCss();
    expect(css).toMatch(/--x-primary-500:\s*hsl\(/);
  });

  it("should use custom cssSelector", () => {
    xcolor.updateTheme({ cssSelector: "html" });
    const css = xcolor.getThemeCss();
    expect(css).toContain("html {");
  });
});

// =======================================
// Dark mode tests
// =======================================
describe("theme plugin - dark mode", () => {
  it("should generate dark mode with class strategy", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      darkMode: "class",
      darkSelector: ".dark"
    });
    const css = xcolor.getThemeCss();
    expect(css).toContain(".dark {");
    expect(css).toContain("--x-primary-500:");
  });

  it("should generate dark mode with media strategy", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      darkMode: "media"
    });
    const css = xcolor.getThemeCss();
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });

  it("should not generate dark vars when darkMode is false", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      darkMode: false
    });
    const css = xcolor.getThemeCss();
    expect(css).not.toContain(".dark {");
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("should use custom dark selector", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      darkMode: "class",
      darkSelector: "[data-theme='dark']"
    });
    const css = xcolor.getThemeCss();
    expect(css).toContain("[data-theme='dark'] {");
  });
});

// =======================================
// Semantic colors tests
// =======================================
describe("theme plugin - semantic colors", () => {
  it("should generate semantic vars when semantic is true (default)", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      semantic: true
    });
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-hover"]).toBeDefined();
    expect(vars["--x-primary-active"]).toBeDefined();
  });

  it("should not generate semantic vars when semantic is false", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      semantic: false
    });
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-hover"]).toBeUndefined();
    expect(vars["--x-primary-active"]).toBeUndefined();
    // Shades should still be generated
    expect(vars["--x-primary-500"]).toBeDefined();
  });

  it("should allow user override of semantic colors", () => {
    xcolor.updateTheme({
      colors: {
        primary: {
          DEFAULT: "#1890ff",
          hover: "#custom1"
        }
      },
      semantic: true
    });
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-hover"]).toBe("#custom1");
    // Non-overridden semantic still auto-generated
    expect(vars["--x-primary-active"]).toBeDefined();
    expect(vars["--x-primary-active"]).not.toBe("#custom1");
  });
});

// =======================================
// Static method tests
// =======================================
describe("theme plugin - static methods", () => {
  it("getThemeCss() should return a string", () => {
    const css = xcolor.getThemeCss();
    expect(typeof css).toBe("string");
    expect(css.length).toBeGreaterThan(0);
  });

  it("getThemeVars() should return an object", () => {
    const vars = xcolor.getThemeVars();
    expect(typeof vars).toBe("object");
    expect(Object.keys(vars).length).toBeGreaterThan(0);
  });

  it("updateTheme() should deep merge options by default", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff", success: "#52c41a" }
    });
    let vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#1890ff");
    expect(vars["--x-success-500"]).toBe("#52c41a");

    // Update only primary
    xcolor.updateTheme({ colors: { primary: "#722ed1" } });
    vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#722ed1");
    // success should also be preserved via deep merge
    expect(vars["--x-success-500"]).toBe("#52c41a");
  });

  it("updateTheme() with deep=false should shallow merge", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff", success: "#52c41a" }
    });
    let vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#1890ff");
    expect(vars["--x-success-500"]).toBe("#52c41a");

    // Shallow merge — replaces entire colors object
    xcolor.updateTheme({ colors: { primary: "#722ed1" } }, false);
    vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#722ed1");
    // success should be gone because shallow merge replaced the entire colors
    expect(vars["--x-success-500"]).toBeUndefined();
  });

  it("updateTheme() with deep=true should behave like default", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff", success: "#52c41a" }
    });

    xcolor.updateTheme({ colors: { primary: "#722ed1" } }, true);
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#722ed1");
    expect(vars["--x-success-500"]).toBe("#52c41a");
  });

  it("injectTheme() should return CSS string (no DOM in test env)", () => {
    const css = xcolor.injectTheme();
    expect(typeof css).toBe("string");
    expect(css).toContain("--x-primary-");
  });
});

// =======================================
// deepMerge tests
// =======================================
describe("theme plugin - deepMerge()", () => {
  it("should merge flat objects", () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3 });
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it("should deep merge nested objects", () => {
    const result = deepMerge(
      { colors: { primary: "#111", success: "#222" } },
      { colors: { primary: "#333" } }
    );
    expect(result).toEqual({
      colors: { primary: "#333", success: "#222" }
    });
  });

  it("should replace arrays", () => {
    const result = deepMerge(
      { shades: [50, 100, 200] },
      { shades: [500, 900] }
    );
    expect(result.shades).toEqual([500, 900]);
  });

  it("should not mutate original objects", () => {
    const target = { a: 1, nested: { b: 2 } };
    const source = { nested: { c: 3 } };
    deepMerge(target, source);
    expect(target.nested).toEqual({ b: 2 });
  });
});

// =======================================
// Prefix configuration tests
// =======================================
describe("theme plugin - prefix", () => {
  it("should use custom prefix", () => {
    xcolor.updateTheme({
      prefix: "--color",
      colors: { primary: "#1890ff" }
    });
    const vars = xcolor.getThemeVars();
    expect(vars["--color-primary-500"]).toBe("#1890ff");
    // Reset
    xcolor.updateTheme({ prefix: "--x" });
  });
});

// =======================================
// Type switch tests
// =======================================
describe("theme plugin - type option", () => {
  it("should use antd type by default", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd"
    });
    const vars = xcolor.getThemeVars();
    const shade50 = vars["--x-primary-50"];
    expect(shade50).toBeDefined();
    // antd shade 50 should be a very light color
    const lightColor = xcolor(shade50);
    expect(lightColor.luminance()).toBeGreaterThan(0.5);
  });

  it("should support linear type via options", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "linear"
    });
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#1890ff");
    expect(vars["--x-primary-50"]).toBeDefined();
  });

  it("should support custom palette generator function", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: (baseColor, shades) => {
        // Simple custom generator: return the base color for all shades
        return shades.map(() => xcolor(baseColor.toHex()));
      }
    });
    const vars = xcolor.getThemeVars();
    // All shades should be the same as the base color
    expect(vars["--x-primary-50"]).toBe("#1890ff");
    expect(vars["--x-primary-500"]).toBe("#1890ff");
    expect(vars["--x-primary-900"]).toBe("#1890ff");
  });
});

// =======================================
// Derive: resolveDeriveOptions tests
// =======================================
describe("theme plugin - resolveDeriveOptions()", () => {
  it("should return null for false", () => {
    expect(resolveDeriveOptions(false)).toBeNull();
  });

  it("should return null for undefined", () => {
    expect(resolveDeriveOptions(undefined)).toBeNull();
  });

  it("should return full defaults for true", () => {
    const opts = resolveDeriveOptions(true)!;
    expect(opts).not.toBeNull();
    expect(opts.enabled).toBe(true);
    expect(opts.from).toBe("primary");
    expect(opts.algorithm).toBe("oklch");
    expect(opts.roles).toEqual(DEFAULT_ROLES);
    expect(opts.chromaScale).toBe(1);
    expect(opts.lightnessShift).toBe(0);
  });

  it("should return null for { enabled: false }", () => {
    expect(resolveDeriveOptions({ enabled: false })).toBeNull();
  });

  it("should merge partial object with defaults", () => {
    const opts = resolveDeriveOptions({
      from: "brand",
      roles: ["success", "error"]
    })!;
    expect(opts.from).toBe("brand");
    expect(opts.algorithm).toBe("oklch");
    expect(opts.roles).toEqual(["success", "error"]);
    expect(opts.chromaScale).toBe(1);
  });

  it("should preserve custom chromaScale and lightnessShift", () => {
    const opts = resolveDeriveOptions({
      chromaScale: 0.8,
      lightnessShift: -0.05
    })!;
    expect(opts.chromaScale).toBe(0.8);
    expect(opts.lightnessShift).toBe(-0.05);
  });
});

// =======================================
// Derive: deriveRoleColors tests
// =======================================
describe("theme plugin - deriveRoleColors()", () => {
  it("should derive all 5 roles when source exists", () => {
    const opts = resolveDeriveOptions(true)!;
    const colors = { primary: "#1890ff" };
    const result = deriveRoleColors(colors, opts, XColor);

    // Original preserved
    expect(result.primary).toBe("#1890ff");
    // All 5 roles derived
    expect(result.secondary).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.warning).toBeDefined();
    expect(result.error).toBeDefined();
    expect(result.info).toBeDefined();
    // Each should be a hex string
    for (const role of DEFAULT_ROLES) {
      expect(typeof result[role]).toBe("string");
      expect((result[role] as string).startsWith("#")).toBe(true);
    }
  });

  it("should not override user-provided colors", () => {
    const opts = resolveDeriveOptions(true)!;
    const colors = {
      primary: "#1890ff",
      success: "#00ff00"
    };
    const result = deriveRoleColors(colors, opts, XColor);
    // User's success preserved
    expect(result.success).toBe("#00ff00");
    // Others derived
    expect(result.error).toBeDefined();
    expect(result.warning).toBeDefined();
  });

  it("should use alias for output names", () => {
    const opts = resolveDeriveOptions({
      alias: { warning: "warn", error: "danger" }
    })!;
    const colors = { primary: "#1890ff" };
    const result = deriveRoleColors(colors, opts, XColor);

    // Alias names used
    expect(result.warn).toBeDefined();
    expect(result.danger).toBeDefined();
    // Original role names NOT present
    expect(result.warning).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it("should skip derivation when source color not found", () => {
    const opts = resolveDeriveOptions({ from: "nonexistent" })!;
    const colors = { primary: "#1890ff" };
    const result = deriveRoleColors(colors, opts, XColor);
    // Should return original without crash
    expect(result.primary).toBe("#1890ff");
    expect(result.success).toBeUndefined();
  });

  it("should support from with DEFAULT object", () => {
    const opts = resolveDeriveOptions({ from: "brand" })!;
    const colors = {
      brand: { DEFAULT: "#1890ff", hover: "#40a9ff" }
    };
    const result = deriveRoleColors(colors, opts, XColor);
    expect(result.success).toBeDefined();
    expect(result.error).toBeDefined();
  });

  it("should skip source without DEFAULT in nested object", () => {
    const opts = resolveDeriveOptions({ from: "brand" })!;
    const colors = {
      brand: { logo: "#ff6600" }
    };
    const result = deriveRoleColors(colors, opts, XColor);
    // No base → should not derive
    expect(result.success).toBeUndefined();
  });

  it("should only derive specified roles", () => {
    const opts = resolveDeriveOptions({
      roles: ["success", "error"]
    })!;
    const colors = { primary: "#1890ff" };
    const result = deriveRoleColors(colors, opts, XColor);

    expect(result.success).toBeDefined();
    expect(result.error).toBeDefined();
    // Not requested
    expect(result.warning).toBeUndefined();
    expect(result.info).toBeUndefined();
    expect(result.secondary).toBeUndefined();
  });

  it("should respect user color with alias name", () => {
    const opts = resolveDeriveOptions({
      alias: { warning: "warn" }
    })!;
    const colors = {
      primary: "#1890ff",
      warn: "#ffaa00" // user provides with alias name
    };
    const result = deriveRoleColors(colors, opts, XColor);
    expect(result.warn).toBe("#ffaa00"); // user value preserved
  });
});

// =======================================
// Derive: deriveBaseColor tests
// =======================================
describe("theme plugin - deriveBaseColor()", () => {
  it("should produce a valid hex color with oklch algorithm", () => {
    const source = new XColor("#1890ff");
    const opts = resolveDeriveOptions(true)!;
    const hex = deriveBaseColor(source, "success", opts);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("should produce a valid hex color with hsl algorithm", () => {
    const source = new XColor("#1890ff");
    const opts = resolveDeriveOptions({ algorithm: "hsl" })!;
    const hex = deriveBaseColor(source, "success", opts);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("should use custom hue anchor", () => {
    const source = new XColor("#1890ff");
    const opts = resolveDeriveOptions({ hues: { success: 160 } })!;
    const hex = deriveBaseColor(source, "success", opts);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
    // Should differ from default hue
    const defaultOpts = resolveDeriveOptions(true)!;
    const defaultHex = deriveBaseColor(source, "success", defaultOpts);
    expect(hex).not.toBe(defaultHex);
  });

  it("secondary should use complementary hue by default", () => {
    const source = new XColor("#1890ff");
    const opts = resolveDeriveOptions(true)!;
    const hex = deriveBaseColor(source, "secondary", opts);
    // The complementary of a blue should be in the orange/amber region
    const derived = new XColor(hex);
    expect(derived.red()).toBeGreaterThan(derived.blue());
  });
});

// =======================================
// Derive: integration with resolveThemeConfig
// =======================================
describe("theme plugin - derive integration", () => {
  it("derive: false should not generate extra colors (backward compat)", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: false
    }, false);
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#1890ff");
    expect(vars["--x-success-500"]).toBeUndefined();
    expect(vars["--x-error-500"]).toBeUndefined();
  });

  it("derive: true should generate all 5 role colors", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: true
    }, false);
    const vars = xcolor.getThemeVars();
    expect(vars["--x-primary-500"]).toBe("#1890ff");
    // All derived roles should have shade 500
    expect(vars["--x-secondary-500"]).toBeDefined();
    expect(vars["--x-success-500"]).toBeDefined();
    expect(vars["--x-warning-500"]).toBeDefined();
    expect(vars["--x-error-500"]).toBeDefined();
    expect(vars["--x-info-500"]).toBeDefined();
  });

  it("derive should also generate semantic and shade vars for derived colors", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: true,
      semantic: true
    }, false);
    const vars = xcolor.getThemeVars();
    // Derived success should have full shades
    expect(vars["--x-success-50"]).toBeDefined();
    expect(vars["--x-success-900"]).toBeDefined();
    // And semantic states
    expect(vars["--x-success-hover"]).toBeDefined();
    expect(vars["--x-success-active"]).toBeDefined();
    expect(vars["--x-success-bg"]).toBeDefined();
  });

  it("user-provided color should take priority over derived", () => {
    xcolor.updateTheme({
      colors: {
        primary: "#1890ff",
        success: "#00ff00"
      },
      type: "antd",
      derive: true
    }, false);
    const vars = xcolor.getThemeVars();
    expect(vars["--x-success-500"]).toBe("#00ff00");
    // Other roles still derived
    expect(vars["--x-error-500"]).toBeDefined();
  });

  it("alias should rename output variables", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: {
        alias: { warning: "warn" }
      }
    }, false);
    const vars = xcolor.getThemeVars();
    // warn exists
    expect(vars["--x-warn-500"]).toBeDefined();
    expect(vars["--x-warn-hover"]).toBeDefined();
    // warning does NOT exist
    expect(vars["--x-warning-500"]).toBeUndefined();
  });

  it("custom hues should change derived colors", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: { hues: { success: 90 } }
    }, false);
    const vars1 = xcolor.getThemeVars();

    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: { hues: { success: 200 } }
    }, false);
    const vars2 = xcolor.getThemeVars();

    // Different hues should produce different colors
    expect(vars1["--x-success-500"]).not.toBe(vars2["--x-success-500"]);
  });

  it("derive with from: 'brand' should use brand as source", () => {
    xcolor.updateTheme({
      colors: { brand: "#ff6600" },
      type: "antd",
      derive: { from: "brand" }
    }, false);
    const vars = xcolor.getThemeVars();
    expect(vars["--x-brand-500"]).toBe("#ff6600");
    expect(vars["--x-success-500"]).toBeDefined();
    expect(vars["--x-error-500"]).toBeDefined();
  });

  it("derive with algorithm: 'hsl' should also work", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: { algorithm: "hsl" }
    }, false);
    const vars = xcolor.getThemeVars();
    expect(vars["--x-success-500"]).toBeDefined();
    expect(vars["--x-error-500"]).toBeDefined();
  });

  it("derive should work with dark mode", () => {
    xcolor.updateTheme({
      colors: { primary: "#1890ff" },
      type: "antd",
      derive: true,
      darkMode: "class",
      darkSelector: ".dark"
    }, false);
    const css = xcolor.getThemeCss();
    expect(css).toContain(".dark {");
    // Dark mode should contain derived colors
    expect(css).toContain("--x-success-500:");
    expect(css).toContain("--x-error-500:");
  });

  it("missing source should not crash", () => {
    expect(() => {
      xcolor.updateTheme({
        colors: { brand: "#ff0000" },
        type: "antd",
        derive: true // from: 'primary' by default but primary not present
      }, false);
    }).not.toThrow();
    const vars = xcolor.getThemeVars();
    // Derivation skipped, only brand exists
    expect(vars["--x-brand-500"]).toBe("#ff0000");
    expect(vars["--x-success-500"]).toBeUndefined();
  });
});
