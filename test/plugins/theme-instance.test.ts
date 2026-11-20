import { afterEach, describe, expect, it, vi } from "vitest";
import xcolor from "../../src";
import theme, { createTheme, generateTheme } from "../../src/plugins/theme";

function documentFixture() {
  type Style = {id:string;textContent:string|null;parentNode:typeof head|null};
  const elements:Style[] = [];
  const head = {
    appendChild(style:Style) { elements.push(style); style.parentNode = head; return style; },
    removeChild(style:Style) { elements.splice(elements.indexOf(style),1); style.parentNode = null; return style; }
  };
  const document = {head,getElementById:(id:string)=>elements.find(style=>style.id === id) ?? null,createElement:()=>({id:"",textContent:null,parentNode:null} as Style)};
  vi.stubGlobal("document",document);
  return {document,elements};
}
afterEach(()=>vi.unstubAllGlobals());

describe("xcolor independent themes", () => {
  it.each(["rgb", "hsl"] as const)("preserves CSS references in strict mode with %s output", format => {
    xcolor.config({ strict: true });
    try {
      const theme = createTheme({ colors: { brand: { DEFAULT: "#123456", hover: "var(--brand-hover)" } }, format });
      expect(theme.getCss()).toContain("--x-brand-hover: var(--brand-hover);");
      expect(theme.getCss()).toContain("--x-brand: " + format + "(");
      expect(() => theme.update({ colors: { brand: { DEFAULT: "invalid" } } })).toThrow();
    } finally {
      xcolor.config({});
    }
  });
  it.each([true, false])("keeps the base shorthand aligned with overridden shade 500, semantic=%s", semantic => {
    const instance = createTheme({ colors: { brand: { DEFAULT: "#123456", 500: "#ff0000" } }, semantic });
    expect(instance.getVars()["--x-brand"]).toBe("#ff0000");
    expect(instance.getVars()["--x-brand-500"]).toBe("#ff0000");
    expect(instance.getCss()).toContain("--x-brand: #ff0000;");
  });

  it("generates nested DEFAULT palettes and preserves custom overrides", () => {
    const instance = createTheme({ colors: { brand: { accent: { DEFAULT: "#ff0000", hover: "var(--hover)", 500: "#00ff00" } } }, darkMode: "class" });
    const light = instance.getVars();
    expect(light["--x-brand-accent"]).toBe("#00ff00");
    expect(light["--x-brand-accent-500"]).toBe("#00ff00");
    expect(light["--x-brand-accent-50"]).toBeDefined();
    expect(light["--x-brand-accent-hover"]).toBe("var(--hover)");
    const dark = instance.getVars("dark");
    expect(dark["--x-brand-accent"]).toBe(dark["--x-brand-accent-500"]);
    expect(instance.getCss()).toContain("--x-brand-accent-500:");
    expect(() => instance.update({ colors: { brand: { accent: { DEFAULT: "invalid" } } } })).toThrow();
    expect(instance.getVars()).toEqual(light);
  });
  it("isolates configurations, generated snapshots and the global plugin", () => {
    xcolor.use(theme,{colors:{primary:"#f00"}});
    const options = {colors:{primary:{DEFAULT:"#00f",custom:"#123456"}},darkMode:"class" as const};
    const a = createTheme(options), b = createTheme({colors:{primary:"#0f0"}});
    options.colors.primary.DEFAULT = "#fff";
    a.getOptions().colors.primary = "#000";
    a.getVars()["--x-primary"] = "#000";
    expect(a.getVars()["--x-primary"]).toBe("#0000ff");
    expect(b.getVars()["--x-primary"]).toBe("#00ff00");
    expect(xcolor.getThemeVars()["--x-primary"]).toBe("#ff0000");
    expect(a.update({colors:{primary:{DEFAULT:"#ff0"}}})).toBe(a);
    expect(a.getVars()["--x-primary-custom"]).toBe("#123456");
    a.update({colors:{secondary:"#000"}},false);
    expect(a.getVars()["--x-primary"]).toBeUndefined();
    expect(b.getVars()["--x-primary"]).toBe("#00ff00");
  });

  it("provides complete independent dark snapshots in every entry point", () => {
    const options = {colors:{primary:"#1890ff",custom:{border:"#123456"}},darkMode:"class" as const};
    const instance = createTheme(options);
    expect(instance.getVars("dark")["--x-primary"]).not.toBe(instance.getVars()["--x-primary"]);
    expect(instance.getVars("dark")["--x-custom-border"]).toBe("#123456");
    const generated = generateTheme(options);
    expect(generated.darkVars).toEqual(instance.getVars("dark"));
    xcolor.use(theme,options);
    expect(xcolor.getThemeVars("dark")).toEqual(generated.darkVars);
    const lightOnly = createTheme({colors:{primary:"#f00"}});
    expect(lightOnly.getVars("dark")).toEqual(lightOnly.getVars());
    expect(lightOnly.getVars("dark")).not.toBe(lightOnly.getVars());
  });

  it("owns separate styles and removes only its own element", () => {
    const {elements} = documentFixture();
    const a = createTheme({colors:{primary:"#f00"}},{styleId:"theme-a"});
    const b = createTheme({colors:{primary:"#00f"}},{styleId:"theme-b"});
    a.inject(); b.inject(); a.inject();
    expect(elements).toHaveLength(2);
    const oldB = elements[1].textContent;
    a.update({colors:{primary:"#0f0"}});
    expect(elements[0].textContent).toContain("#00ff00");
    expect(elements[1].textContent).toBe(oldB);
    a.remove(); a.remove();
    expect(elements.map(style=>style.id)).toEqual(["theme-b"]);
    a.inject();
    expect(elements).toHaveLength(2);
    b.remove();
    expect(elements.map(style=>style.id)).toEqual(["theme-a"]);
  });

  it("keeps prior config, cache and DOM on failed update", () => {
    const {elements} = documentFixture();
    const instance = createTheme({colors:{primary:"#f00"}});
    instance.inject();
    const css = instance.getCss(), options = instance.getOptions();
    expect(()=>instance.update({colors:{primary:"invalid"}})).toThrow();
    expect(instance.getCss()).toBe(css);
    expect(instance.getOptions()).toEqual(options);
    expect(elements[0].textContent).toBe(css);
  });

  it("does not overwrite foreign elements or same-ID instances", () => {
    const {document,elements} = documentFixture();
    const a = createTheme({colors:{primary:"#f00"}},{styleId:"shared"});
    const b = createTheme({colors:{primary:"#00f"}},{styleId:"shared"});
    a.inject();
    expect(()=>b.inject()).toThrow(/already exists/);
    b.remove();
    expect(elements).toHaveLength(1);
    const original = elements[0];
    document.head.removeChild(original);
    const foreign = document.createElement(); foreign.id = "shared"; foreign.textContent = "foreign";
    document.head.appendChild(foreign);
    expect(()=>a.update({colors:{primary:"#0f0"}})).toThrow(/already exists/);
    expect(a.getVars()["--x-primary"]).toBe("#ff0000");
    a.remove();
    expect(elements[0].textContent).toBe("foreign");
  });

  it("supports generated IDs and SSR without touching the global factory", () => {
    const instance = createTheme({colors:{primary:"#f00"}});
    expect(instance.inject()).toBe(instance.getCss());
    instance.remove();
    const {elements} = documentFixture();
    instance.inject();
    createTheme({colors:{primary:"#00f"}}).inject();
    expect(elements[0].id).not.toBe(elements[1].id);
    expect(elements[0].id).not.toBe("xcolor-theme");
  });

  it("rejects invalid mode, cyclic configuration and style identity", () => {
    const instance = createTheme({colors:{primary:"#f00"}});
    expect(()=>instance.getVars("auto" as "light")).toThrow();
    expect(()=>createTheme({colors:{}},{styleId:" "})).toThrow();
    const cyclic: Record<string,unknown> = {}; cyclic.self = cyclic;
    expect(()=>createTheme({colors:cyclic as never})).toThrow(/Cyclic/);
  });
});
