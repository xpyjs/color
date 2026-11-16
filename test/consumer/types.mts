import xcolor, { defineMethod, registerStringFormatter } from "@xpyjs/color";
import type { XColor, XColorPlugin } from "@xpyjs/color";
import lab from "@xpyjs/color/plugins/lab";
import theme from "@xpyjs/color/plugins/theme";
import colorSpace, { parseColorSpace, convertColorSpace, mapToGamut, type XColorSpaceRecord } from "@xpyjs/color/plugins/colorSpace";

xcolor.use(colorSpace);
const wide: XColorSpaceRecord = parseColorSpace("color(display-p3 1 0 0)")!;
const converted = convertColorSpace(wide, "oklab");
const spaceName: "oklab" = converted.space;
mapToGamut(converted, "srgb");
xcolor("#f00").toColorSpace("xyz-d50");

declare module "@xpyjs/color" {
  interface XColor { toMyString(): string }
  interface XColorStringFormatMap { my: true }
}

const custom: XColorPlugin = {
  name: "consumer-custom",
  install(_option, cls) {
    defineMethod(cls, "toMyString", function (this: XColor) {
      return this.toRgbString();
    });
    return registerStringFormatter(cls, "my", (color) => color.toMyString());
  }
};

xcolor.use(lab).use(custom);
const color: XColor = xcolor("#f00");
color.toLab();
color.format("my");
xcolor.use(theme, { colors: { primary: "#f00" } });
xcolor.getThemeCss();
