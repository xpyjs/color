import { describe, expect, it } from "vitest";
import xcolor from "../../src";
import a11y, { adjustContrast, auditContrastPairs } from "../../src/plugins/a11y";
import theme from "../../src/plugins/theme";

xcolor.use(a11y);

describe("xcolor contrast adjustment and theme audits", () => {
  it.each([
    ["#777","#fff",4.5], ["#444","#000",7], ["#f00","#fff",4.5], ["#aaa","#888",3],
    ["#345678","#eee",7], ["#808080","#000",4.5]
  ])("adjusts %s on %s to %s", (foreground,background,target) => {
    const input = xcolor(foreground as string);
    const before = input.toHex();
    const result = adjustContrast(input,background as string,{target:target as number});
    expect(result.met).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(target as number);
    expect(result.color.isReadable(background as string,{level:target === 7 ? "AAA":"AA",size:target === 3 ? "large":"normal"})).toBe(true);
    expect(input.toHex()).toBe(before);
    expect(result.color).not.toBe(input);
  });

  it("preserves alpha and decimal options and reports unreachable goals", () => {
    const source = xcolor({r:170.123,g:130.456,b:90.789,a:.9},{useDecimal:true});
    const result = adjustContrast(source,"#fff");
    expect(result.met).toBe(true);
    expect(result.color.alpha()).toBe(.9);
    expect(result.color.red()).not.toBe(Math.round(result.color.red()));
    const impossible = adjustContrast("#0000","#fff");
    expect(impossible.met).toBe(false);
    expect(impossible.ratio).toBe(1);
    expect(impossible.color.alpha()).toBe(0);
    const gray = adjustContrast("#888","#888",{target:21});
    expect(gray.met).toBe(false);
    expect(gray.ratio).toBeLessThan(21);
  });

  it("supports explicit direction and keeps already-compliant colors", () => {
    expect(adjustContrast("#aaa","#fff",{direction:"darker"}).met).toBe(true);
    expect(adjustContrast("#aaa","#fff",{direction:"lighter"}).met).toBe(false);
    expect(adjustContrast("#444","#000",{direction:"lighter"}).met).toBe(true);
    const result = adjustContrast("#123456","#fff",{target:1});
    expect(result.changed).toBe(false);
    expect(result.color.toHex()).toBe("#123456");
  });

  it("resolves translucent backgrounds with an explicit backdrop", () => {
    expect(()=>adjustContrast("#aaa","#fff8")).toThrow();
    const result = adjustContrast("#aaa","#fff8",{backdrop:"#fff"});
    expect(result.met).toBe(true);
    expect(result.color.isReadable("#fff8",{backdrop:"#fff"})).toBe(true);
  });

  it("audits every named pair without rounding thresholds or changing values", () => {
    const colors = {text:"#777",surface:"#fff",inverse:"#000",hidden:"#0000"};
    const pairs = [{foreground:"text",background:"surface"},{foreground:"inverse",background:"surface",target:7},{foreground:"hidden",background:"surface"}];
    const before = JSON.stringify(colors);
    const results = auditContrastPairs(colors,pairs);
    expect(results.map(result=>result.passes)).toEqual([false,true,false]);
    expect(results[0].ratio).toBeLessThan(4.5);
    expect(results[1].ratio).toBe(21);
    expect(results[2].ratio).toBe(1);
    expect(JSON.stringify(colors)).toBe(before);
    expect(auditContrastPairs(colors,[pairs[0]],{target:3})[0].passes).toBe(true);
    expect(auditContrastPairs({text:"#000",surface:"#fff8"},[pairs[0]],{backdrop:"#fff"})[0].passes).toBe(true);
  });

  it("rejects invalid inputs rather than reporting a success", () => {
    for (const target of [0,22,NaN,Infinity]) expect(()=>adjustContrast("#000","#fff",{target})).toThrow();
    expect(()=>adjustContrast("bogus","#fff")).toThrow();
    expect(()=>adjustContrast("#000","bogus")).toThrow();
    expect(()=>adjustContrast("#000","#fff",{direction:"bogus" as "auto"})).toThrow();
    expect(()=>auditContrastPairs({text:"#000"},[{foreground:"text",background:"missing"}])).toThrow();
    expect(()=>auditContrastPairs({text:"bogus",surface:"#fff"},[{foreground:"text",background:"surface"}])).toThrow();
    expect(()=>auditContrastPairs({},[],{target:22})).toThrow();
  });

  it("audits concrete theme-generated CSS variables", () => {
    xcolor.use(theme,{colors:{text:"#777",surface:"#fff"}});
    const vars = xcolor.getThemeVars();
    const pairs = [{foreground:"--x-text",background:"--x-surface"}];
    expect(auditContrastPairs(vars,pairs)[0].passes).toBe(false);
    const adjusted = adjustContrast(vars["--x-text"],vars["--x-surface"]);
    expect(auditContrastPairs({...vars,"--x-text":adjusted.color},pairs)[0].passes).toBe(true);
    expect(xcolor.getThemeVars()).toEqual(vars);
  });
});
