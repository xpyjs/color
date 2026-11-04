import esm, { type XColor } from "@xpyjs/color";
import cjs = require("@xpyjs/color");
import lab = require("@xpyjs/color/plugins/lab");
import scale from "@xpyjs/color/plugins/scale";
import p3 = require("@xpyjs/color/plugins/displayP3");
import { generateTheme } from "@xpyjs/color/plugins/theme";

cjs.use(lab);
esm.use(scale);

const color: XColor = cjs(esm("#f00"));
const other: cjs.XColor = esm(cjs("#00f"));
color.toLab();
other.at(color, 0.5, { space: "oklab" });

const input: unknown = color;
if (cjs.isColor(input)) {
  const guarded: XColor = input;
  esm(guarded).toLab();
}

const wide: p3.WideColor | null = p3.parseWideColor("color(display-p3 1 .4 0)");
if (wide) esm(p3.toSrgb(wide));
generateTheme({ colors: { primary: "#f00" } });
