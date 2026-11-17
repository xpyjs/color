import xcolor, { defineMethod, registerStringFormatter } from "@xpyjs/color";
import type { XColor, XColorPlugin } from "@xpyjs/color";
import lab from "@xpyjs/color/plugins/lab";
import theme from "@xpyjs/color/plugins/theme";
import cmyk from "@xpyjs/color/plugins/cmyk";
xcolor.use(cmyk);
xcolor({ c:0,m:100,y:100,k:0 }).cmyk({c:100,m:0,y:100,k:0});
// @ts-expect-error CMYK requires all four ink channels
xcolor({ c:20 });
import colorSpace, { parseColorSpace, convertColorSpace, mapToGamut, type XColorSpaceRecord } from "@xpyjs/color/plugins/colorSpace";

xcolor.use(colorSpace);
const wide: XColorSpaceRecord = parseColorSpace("color(display-p3 1 0 0)")!;
const converted = convertColorSpace(wide, "oklab");
const spaceName: "oklab" = converted.space;
mapToGamut(converted, "srgb");
xcolor("#f00").toColorSpace("xyz-d50");
xcolor(wide).colorSpace(converted).colorSpace();
import { parseCssColor, type XColorCssParseOptions } from "@xpyjs/color/plugins/colorSpace";
const cssOptions: XColorCssParseOptions = { syntax: "strict" };
import { resolveCssColor, type XColorCssContext } from "@xpyjs/color/plugins/colorSpace";
const cssContext: XColorCssContext = {currentColor: "red", variables: {"--brand": wide}};
import { createColorGradient, type XColorGradient, type XColorHuePath } from "@xpyjs/color/plugins/colorSpace";
const huePath: XColorHuePath = "shorter";
const gradient: XColorGradient = createColorGradient([{color:wide},{color:converted}],{space:"oklch",hue:huePath,domain:[0,100]});
gradient.at(50);
gradient.colors(7);
import { colorDifference, isColorSimilar, sortColors, deduplicateColors, type XColorDifferenceMetric } from "@xpyjs/color/plugins/colorSpace";
const metric: XColorDifferenceMetric = "ciede2000";
colorDifference(wide, converted, {metric});
isColorSimilar(wide, converted, {metric, tolerance:2, alphaTolerance:0});
sortColors([wide,converted],{by:"distance",reference:wide});
deduplicateColors([wide,converted]);
import { adjustContrast, auditContrastPairs, type XColorContrastAdjustment } from "@xpyjs/color/plugins/a11y";
const adjusted: XColorContrastAdjustment = adjustContrast("#777","#fff",{target:4.5});
auditContrastPairs({text:adjusted.color,surface:"#fff"},[{foreground:"text",background:"surface"}]);
resolveCssColor("color-mix(in oklch, currentColor, var(--brand))", cssContext);
const cssRecord = parseCssColor("rgb(none 0 0 / none)", cssOptions)!;
const missingAlpha: boolean | undefined = cssRecord.missing?.[3];
// @ts-expect-error Unknown syntax policy
parseCssColor("red", { syntax: "browser" });
// @ts-expect-error HSL requires all three channels
xcolor({ h: 120, s: 50 });
// @ts-expect-error At least one RGB channel is required
xcolor({ a: .5 });
// @ts-expect-error Empty objects are not valid colors
xcolor({});

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
