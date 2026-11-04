import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8"));

describe("package entry points", () => {
  it("should resolve browser bundlers to ESM instead of the UMD script", () => {
    expect(pkg.exports["."].browser.import.default).toBe("./dist/index.esm.js");
    expect(pkg.exports["."].browser.require.default).toBe("./dist/index.cjs");
  });

  it("should keep dedicated ESM, CJS and fallback entry points", () => {
    expect(pkg.exports["."].node.import.default).toBe("./dist/index.node.js");
    expect(pkg.exports["."].require.default).toBe("./dist/index.cjs");
    expect(pkg.exports["."].default).toBe("./dist/index.esm.js");
    expect(pkg.exports["./plugins/*"].default).toBe("./dist/plugins/*/index.js");
  });

  it("should list explicit plugin subpaths for Node 14.0", () => {
    const plugins = readdirSync(resolve(__dirname, "../src/plugins"), { withFileTypes: true });
    for (const plugin of plugins.filter((entry) => entry.isDirectory())) {
      const entry = pkg.exports[`./plugins/${plugin.name}`];
      expect(entry.import.default).toBe(`./dist/plugins/${plugin.name}/index.js`);
      expect(entry.require.default).toBe(`./dist/plugins/${plugin.name}/index.cjs`);
      expect(entry.require.types).toBe(`./dist/types/plugins/${plugin.name}/index.d.cts`);
    }
  });

  it("should preserve UMD entry points for direct CDN scripts", () => {
    expect(pkg.unpkg).toBe("dist/index.umd.js");
    expect(pkg.jsdelivr).toBe("dist/index.umd.js");
  });
});
