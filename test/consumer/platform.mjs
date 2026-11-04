import xcolor from "@xpyjs/color";
import name from "@xpyjs/color/plugins/name";
import theme from "@xpyjs/color/plugins/theme";

xcolor.use(name).use(theme, { colors: { primary: "red" } });
if (xcolor("red").toString("name") !== "red" || !xcolor.getThemeCss().includes("--x-primary: #ff0000")) {
  throw new Error("Color plugin or SSR theme failed");
}
