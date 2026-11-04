import assert from "assert";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const esmFirst = process.argv.includes("--esm-first");
const packageName = "@xpyjs/color";
async function smoke() {
  const esm = esmFirst ? await import(packageName) : undefined;
  const cjs = require(packageName);
  const { default: xcolor, XColor } = esm || await import(packageName);
  assert.strictEqual(xcolor, cjs);
  assert.strictEqual(XColor, cjs.XColor);

  const color = xcolor("#f00");
  assert.strictEqual(cjs.isColor(color), true);
  assert.strictEqual(cjs(color).toHex(), color.toHex());

  const name = esmFirst ? require("@xpyjs/color/plugins/name") : (await import("@xpyjs/color/plugins/name")).default;
  const lab = esmFirst ? (await import("@xpyjs/color/plugins/lab")).default : require("@xpyjs/color/plugins/lab");
  cjs.use(name).use(lab);
  assert.strictEqual(xcolor("red").toHex(), "#ff0000");
  assert.strictEqual(cjs("red").toString("name"), "red");
  assert.strictEqual(color.toLab().l, 53.24);

  for (const subpath of Object.keys(require("@xpyjs/color/package.json").exports)) {
    if (!subpath.startsWith("./plugins/") || subpath.endsWith("*")) continue;
    const specifier = packageName + subpath.slice(1);
    assert.strictEqual(typeof require(specifier).install, "function");
    assert.strictEqual(typeof (await import(specifier)).default.install, "function");
  }

  const p3 = require("@xpyjs/color/plugins/displayP3");
  const wide = p3.parseWideColor("color(display-p3 1 .4 0 / .3)");
  assert.strictEqual(p3.formatWideColor(wide), "color(display-p3 1 0.4 0 / 0.3)");
  assert.strictEqual(xcolor(p3.toSrgb(wide)).alpha(), .3);
  assert.strictEqual(xcolor("#f00").toHslArray()[0], 0);
  assert.strictEqual(cjs.isValidInput("bogus"), false);

  cjs.config({ useDecimal: true });
  assert.strictEqual(xcolor("rgb(12.5 0 0)").red(), 12.5);
}

smoke().catch((error) => { console.error(error); process.exitCode = 1; });
