import { Logger, XColor } from "@xpyjs/color";
import { deepMerge, resolveThemeConfig } from "./config";
import type { XColorThemeOptions } from "./types";

/** Independent theme state, with an owned style element and defensive snapshots. */
export interface XColorThemeInstance {
  /** Read the current generated CSS. */
  getCss(): string;
  /** Get a fresh light (default) or complete dark variable snapshot. */
  getVars(mode?: "light" | "dark"): Record<string,string>;
  /** Read a defensive configuration snapshot; callback functions retain their identity. */
  getOptions(): XColorThemeOptions;
  /** Validate and apply an update atomically; deep merge defaults to true. Returns this instance. */
  update(options: Partial<XColorThemeOptions>, deep?: boolean): XColorThemeInstance;
  /** Inject this instance's owned style; SSR returns CSS without DOM work. */
  inject(): string;
  /** Remove only this instance's element; configuration remains available for reinjection. */
  remove(): void;
}

/** Optional explicit DOM identity; existing elements are never adopted or overwritten. */
export interface XColorThemeInstanceOptions {
  styleId?: string;
}

let nextId = 0;

function snapshot<T>(value:T, ancestors = new Set<object>()):T {
  if (!value || typeof value !== "object") return value;
  if (ancestors.has(value)) throw Logger.createError("Cyclic theme configuration");
  ancestors.add(value);
  const result: unknown = Array.isArray(value)
    ? value.map(item=>snapshot(item,ancestors))
    : Object.keys(value).reduce((copy,key)=>{
      Object.defineProperty(copy,key,{value:snapshot((value as Record<string,unknown>)[key],ancestors),enumerable:true,writable:true,configurable:true});
      return copy;
    },{} as Record<string,unknown>);
  ancestors.delete(value);
  return result as T;
}

/**
 * Create an independent theme without registering the global theme plugin.
 * @param options - Theme configuration, copied before generation
 * @param instanceOptions - Optional unique style element ID
 * @returns Independent configuration, snapshots and DOM lifecycle methods
 * @throws For invalid configuration or duplicate style IDs when injecting
 * Use different prefixes/selectors when multiple themes should not overlap in CSS.
 */
export function createTheme(options:XColorThemeOptions, instanceOptions:XColorThemeInstanceOptions = {}):XColorThemeInstance {
  if (instanceOptions.styleId !== undefined && (!instanceOptions.styleId || /\s/.test(instanceOptions.styleId))) throw Logger.createError("Theme style ID must be nonempty and contain no whitespace");
  let config = snapshot(options);
  let result = resolveThemeConfig(config,XColor);
  let element: HTMLStyleElement | null = null;
  let styleId = instanceOptions.styleId;
  const checkOwnership = () => {
    if (typeof document === "undefined" || !styleId) return;
    const existing = document.getElementById(styleId);
    if (existing && existing !== element) throw Logger.createError(`Theme style ID already exists: ${styleId}`);
  };
  const instance:XColorThemeInstance = {
    getCss:()=>result.css,
    getVars(mode="light") {
      if (mode !== "light" && mode !== "dark") throw Logger.createError("Unknown theme mode");
      return {...(mode === "dark" ? result.darkVars : result.vars)};
    },
    getOptions:()=>snapshot(config),
    update(partial,deep=true) {
      const next = snapshot(deep ? deepMerge(config,partial) : {...config,...partial});
      const generated = resolveThemeConfig(next,XColor);
      if (element) {
        checkOwnership();
        element.textContent = generated.css;
      }
      config = next;
      result = generated;
      return instance;
    },
    inject() {
      if (typeof document === "undefined") return result.css;
      if (!styleId) {
        do { styleId = `xcolor-theme-instance-${++nextId}`; } while (document.getElementById(styleId));
      }
      checkOwnership();
      const style = element ?? document.createElement("style");
      style.id = styleId;
      style.textContent = result.css;
      if (!style.parentNode) document.head.appendChild(style);
      element = style;
      return result.css;
    },
    remove() {
      if (element?.parentNode) element.parentNode.removeChild(element);
      element = null;
    }
  };
  return instance;
}
