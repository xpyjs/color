import xcolor, { defineMethod, registerStringFormatter } from "@xpyjs/color";
import type { XColor, XColorPlugin } from "@xpyjs/color";
import lab from "@xpyjs/color/plugins/lab";
import theme from "@xpyjs/color/plugins/theme";

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
