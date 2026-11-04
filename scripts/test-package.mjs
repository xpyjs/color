import fs, { copyFileSync, mkdtempSync, readFileSync, realpathSync, rmdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { execFileSync } from "child_process";

const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run this script with npm run test:package");

const args = process.argv.slice(2);
const tarballIndex = args.indexOf("--tarball");
// Use a canonical path so bundlers see the same module IDs through Windows short paths.
const fixture = realpathSync.native(mkdtempSync(join(tmpdir(), "xcolor-consumer-")));
const run = (script, args, cwd = fixture) => execFileSync(
  process.execPath, [script, ...args], { cwd, stdio: "inherit" }
);

async function testPackage() {
  try {
    let tarball;
    if (tarballIndex >= 0) {
      tarball = resolve(args[tarballIndex + 1]);
    } else {
      const output = execFileSync(process.execPath, [npm, "pack", "--json", "--pack-destination", fixture]);
      tarball = join(fixture, JSON.parse(output)[0].filename);
    }

    writeFileSync(join(fixture, "package.json"), '{"private":true}');
    run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--cache", join(fixture, "npm-cache"), tarball]);
    for (const file of ["smoke.mjs", "types.mts", "types.cts", "mixed.mts"]) {
      copyFileSync(resolve("test/consumer", file), join(fixture, file));
    }
    for (const readme of ["README.md", "README.zh-CN.md"]) {
      const content = readFileSync(join(fixture, "node_modules/@xpyjs/color", readme), "utf8");
      if (!content.includes("./README")) throw new Error(`Missing language link in ${readme}`);
    }
    run("smoke.mjs", []);
    run("smoke.mjs", ["--esm-first"]);

    if (args.includes("--deno") || args.includes("--bun")) {
      copyFileSync(resolve("test/consumer/platform.mjs"), join(fixture, "platform.mjs"));
      if (args.includes("--deno")) {
        execFileSync(process.env.DENO_BIN || "deno", ["run", "--node-modules-dir=manual", "platform.mjs"], { cwd: fixture, stdio: "inherit" });
      }
      if (args.includes("--bun")) execFileSync(process.env.BUN_BIN || "bun", ["platform.mjs"], { cwd: fixture, stdio: "inherit" });
    }

    const cdnIndex = args.indexOf("--cdn-version");
    if (cdnIndex >= 0 && !args[cdnIndex + 1]) throw new Error("Missing exact CDN version");
    if (args.includes("--browser") || args.includes("--electron") || cdnIndex >= 0) {
      const { testBrowser } = await import("./test-package-browser.mjs");
      await testBrowser(fixture, args.includes("--electron"), cdnIndex < 0 ? undefined : args[cdnIndex + 1]);
    }

    if (!args.includes("--runtime-only")) {
      const tsc = resolve("node_modules/typescript/bin/tsc");
      const examples = ["docs", "docs/en"].flatMap((directory, language) => {
        const samples = [
          ["guide/custom-plugin.md", ": XColorPlugin"],
          ["plugins/a11y.md", "foreground.isReadable(background)"],
          ["plugins/name.md", "NAMED_COLORS"],
          ["plugins/theme.md", "const light = generateTheme"],
          ["plugins/displayP3.md", "const color = parseWideColor"]
        ];
        return samples.flatMap(([page, marker], pageIndex) => {
          const guide = readFileSync(resolve(directory, page), "utf8");
          return [...guide.matchAll(/^```ts\r?\n([\s\S]*?)^```/gm)]
            .map((match) => match[1])
            .filter((code) => code.includes(marker))
            .map((code, index) => {
              const filename = `docs-${language}-${pageIndex}-${index}.mts`;
              writeFileSync(join(fixture, filename), code);
              return filename;
            });
        });
      });
      for (const module of ["node16", "nodenext"]) {
        run(tsc, ["--module", module, "--strict", "--noEmit", "types.mts", "types.cts", "mixed.mts", ...examples]);
      }
      for (const resolution of ["bundler", "node10"]) {
        run(tsc, ["--module", "esnext", "--moduleResolution", resolution, "--strict", "--noEmit", "types.mts", ...examples]);
      }
    }
  } finally {
    if (fs.rmSync) fs.rmSync(fixture, { recursive: true, force: true });
    else rmdirSync(fixture, { recursive: true });
  }
}

testPackage().catch((error) => { console.error(error); process.exitCode = 1; });
