import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8"));

describe("package entry points", () => {
  it("should resolve browser bundlers to ESM instead of the UMD script", () => {
    expect(pkg.exports["."].browser.import).toBe("./dist/index.esm.js");
    expect(pkg.exports["."].browser.require).toBe("./dist/index.cjs");
  });

  it("should keep dedicated ESM, CJS and fallback entry points", () => {
    expect(pkg.exports["."].import).toBe("./dist/index.esm.js");
    expect(pkg.exports["."].require).toBe("./dist/index.cjs");
    expect(pkg.exports["."].default).toBe("./dist/index.esm.js");
    expect(pkg.exports["./plugins/*"].default).toBe("./dist/plugins/*/index.js");
  });

  it("should preserve UMD entry points for direct CDN scripts", () => {
    expect(pkg.unpkg).toBe("dist/index.umd.js");
    expect(pkg.jsdelivr).toBe("dist/index.umd.js");
  });
});
