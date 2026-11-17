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
  const spaces = require("@xpyjs/color/plugins/colorSpace");
  const coordinateColor = spaces.parseColorSpace("color(display-p3 1 0 0 / .25)");
  assert.strictEqual(spaces.inGamut(coordinateColor, "display-p3"), true);
  assert.strictEqual(spaces.inGamut(coordinateColor, "srgb"), false);
  assert.ok(spaces.convertColorSpace(coordinateColor, "srgb").coordinates[0] > 1);
  assert.strictEqual(spaces.mapToGamut(coordinateColor).alpha, .25);
  cjs.use(spaces);
  const gradient = spaces.createColorGradient([{color:spaces.parseCssColor("red")},{color:spaces.parseCssColor("blue")}],{space:"srgb"});
  assert.strictEqual(spaces.fromColorSpace(gradient.at(.5)).toHex(), "#800080");
  assert.strictEqual(gradient.colors().length, 5);
  assert.strictEqual(spaces.colorDifference(coordinateColor, coordinateColor), 0);
  assert.strictEqual(spaces.isColorSimilar(coordinateColor, coordinateColor), true);
  assert.strictEqual(spaces.deduplicateColors([coordinateColor, coordinateColor]).length, 1);
  assert.strictEqual(spaces.sortColors([coordinateColor],{by:"distance",reference:coordinateColor}).length, 1);
  const missing = spaces.parseCssColor("color(srgb-linear none .5 0 / none)");
  assert.strictEqual(spaces.fromColorSpace(spaces.resolveCssColor("color-mix(in srgb, red, blue)")).toHex(), "#800080");
  assert.strictEqual(spaces.fromColorSpace(spaces.resolveCssColor("rgb(from var(--brand) r 0 0)", {variables:{"--brand":"red"}})).toHex(), "#ff0000");
  assert.deepStrictEqual(missing.missing, [true, false, false, true]);
  assert.strictEqual(spaces.formatColorSpace(missing), "color(srgb-linear none 0.5 0 / none)");
  assert.strictEqual(spaces.parseCssColor("rgb(1, 2%, 3)"), null);
  assert.strictEqual(xcolor("color(srgb-linear .21404114048223255 0 0)").toHex(), "#800000");
  assert.strictEqual(xcolor("#f00").toColorSpace("oklab").space, "oklab");
  assert.strictEqual(cjs.isValidInput("bogus"), false);

  cjs.config({ useDecimal: true });
  assert.strictEqual(xcolor("rgb(12.5 0 0)").red(), 12.5);
}

smoke().catch((error) => { console.error(error); process.exitCode = 1; });
