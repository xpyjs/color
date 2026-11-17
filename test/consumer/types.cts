import xcolor = require("@xpyjs/color");
import lab = require("@xpyjs/color/plugins/lab");
import palette = require("@xpyjs/color/plugins/palette");
import theme = require("@xpyjs/color/plugins/theme");
import colorSpace = require("@xpyjs/color/plugins/colorSpace");

xcolor.use(colorSpace);
const wide: colorSpace.XColorSpaceRecord = colorSpace.parseColorSpace("color(display-p3 1 0 0)")!;
const converted = colorSpace.convertColorSpace(wide, "oklab");
const spaceName: "oklab" = converted.space;
colorSpace.mapToGamut(converted, "srgb");
xcolor(wide).colorSpace(converted);
// @ts-expect-error HSV requires all three channels
xcolor({ h: 120, v: 50 });
import defaultFactory from "@xpyjs/color";

xcolor.use(lab, { whitePoint: "D50" }).use(palette);
const color: xcolor.XColor = xcolor.default("#f00");
const result: lab.Lab = color.toLab();
color.toString("lab");
defaultFactory(color).palette({ shades: palette.DEFAULT_SHADES });
xcolor.use(theme, { colors: { primary: "#f00" } });
xcolor.getThemeVars();
const configured: xcolor.XColorPlugin<{ threshold: number }> = {
  name: "consumer-configured",
  install(option) {
    option.threshold.toFixed();
  }
};
xcolor.use(configured, { threshold: 3 });

xcolor.use({
  name: "consumer-cjs",
  install(_option, cls) {
    xcolor.registerStringFormatter(cls, "local", (value) => value.toHex());
  }
});
