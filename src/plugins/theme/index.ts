// =======================================
// Plugin: theme - Design system theme generation
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import { Logger } from "@xpyjs/color";
import type {
  XColorThemeOptions,
  ThemeResult,
  ThemeCssFormat,
  ColorConfig
} from "./types";
import { resolveThemeConfig, deepMerge } from "./config";

declare module "@xpyjs/color" {
  interface XColorFactory {
    /**
     * Inject the generated theme CSS into the document `<head>` as a
     * `<style id="xcolor-theme">` element.
     *
     * In non-browser environments (SSR / Node.js), this method is a no-op
     * and simply returns the CSS string without DOM manipulation.
     *
     * @returns The generated CSS string
     * @throws If the theme plugin has not been registered via `xcolor.use()`
     * @example
     * ```ts
     * xcolor.use(ThemePlugin, { colors: { primary: '#1890ff' } })
     * xcolor.injectTheme()
     * // → <style id="xcolor-theme">:root { --x-primary-500: ... }</style>
     * ```
     */
    injectTheme(): string;

    /**
     * Get the generated theme as a CSS string without injecting it.
     *
     * @returns Complete CSS string with variable declarations
     * @example
     * ```ts
     * const css = xcolor.getThemeCss()
     * // → ':root {\n  --x-primary-500: #1890ff;\n  ...\n}\n'
     * ```
     */
    getThemeCss(): string;

    /**
     * Get the generated theme as a flat map of CSS variable names to values.
     *
     * @returns Record of variable names to color values
     * @example
     * ```ts
     * const vars = xcolor.getThemeVars()
     * // → { '--x-primary-500': '#1890ff', '--x-primary-hover': '#40a9ff', ... }
     * ```
     */
    getThemeVars(): Record<string, string>;

    /**
     * Update the theme configuration with a partial options object.
     *
     * By default, uses deep merge so only specified fields are changed;
     * all other settings are preserved. Pass `false` as the second
     * argument to use shallow merge (replaces top-level keys entirely).
     * If a `<style>` tag was previously injected, the DOM is
     * automatically updated.
     *
     * @param options - Partial configuration to merge
     * @param deep - Whether to deep merge (`true`, default) or shallow merge (`false`)
     * @example
     * ```ts
     * // Deep merge (default) — only primary color changes
     * xcolor.updateTheme({ colors: { primary: '#722ed1' } })
     *
     * // Shallow merge — replaces the entire colors object
     * xcolor.updateTheme({ colors: { primary: '#722ed1' } }, false)
     * ```
     */
    updateTheme(options: Partial<XColorThemeOptions>, deep?: boolean): void;

    /**
     * Remove the injected `<style>` tag and clear the cached theme result.
     *
     * @example
     * ```ts
     * xcolor.removeTheme()
     * ```
     */
    removeTheme(): void;
  }
}

/** Style element ID used for DOM injection. */
const STYLE_ID = "xcolor-theme";

const theme: XColorPlugin<XColorThemeOptions> = {
  name: "@xpyjs/color/plugins/theme",
  install(option, cls, factory) {
    // Validate that options are provided
    if (!option || !option.colors) {
      Logger.warn("ThemePlugin requires options with a `colors` property.");
    }

    // ---- Closure state ----
    let _options: XColorThemeOptions = option || { colors: {} };
    let _result: ThemeResult | null = null;
    let _injected = false;

    function ensureResult(): ThemeResult {
      if (!_result) {
        _result = resolveThemeConfig(_options, cls, factory as any);
      }
      return _result;
    }

    function invalidateCache(): void {
      _result = null;
    }

    // ---- Static methods on factory ----

    (factory as any).injectTheme = function (): string {
      var result = ensureResult();
      var css = result.css;

      // SSR safety: only manipulate DOM in browser environments
      if (typeof document !== "undefined") {
        var existing = document.getElementById(STYLE_ID);
        if (existing) {
          existing.textContent = css;
        } else {
          var style = document.createElement("style");
          style.id = STYLE_ID;
          style.textContent = css;
          document.head.appendChild(style);
        }
        _injected = true;
      }

      return css;
    };

    (factory as any).getThemeCss = function (): string {
      return ensureResult().css;
    };

    (factory as any).getThemeVars = function (): Record<string, string> {
      return ensureResult().vars;
    };

    (factory as any).updateTheme = function (partial: Partial<XColorThemeOptions>, deep?: boolean): void {
      var useDeep = deep !== false;
      _options = useDeep ? deepMerge(_options, partial) : Object.assign({}, _options, partial) as XColorThemeOptions;
      invalidateCache();

      // Auto re-inject if previously injected
      if (_injected) {
        (factory as any).injectTheme();
      }
    };

    (factory as any).removeTheme = function (): void {
      if (typeof document !== "undefined") {
        var existing = document.getElementById(STYLE_ID);
        if (existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }
      }
      _injected = false;
      invalidateCache();
    };
  }
};

export type {
  XColorThemeOptions,
  ThemeResult,
  ThemeCssFormat,
  ColorConfig
};
export default theme;
