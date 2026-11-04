// =======================================
// Plugin: theme - Design system theme generation
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import { Logger, XColor } from "@xpyjs/color";
import type {
  XColorThemeOptions,
  ThemeResult,
  ThemeCssFormat,
  ColorConfig,
  BuiltinRole,
  ThemeDeriveAlgorithm,
  XColorThemeDeriveOptions
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

/**
 * Generate a theme from its configuration for SSR or build-time use.
 * @param options - Theme colors and generation settings
 * @returns CSS, variable snapshot, and generated palettes
 */
export function generateTheme(options: XColorThemeOptions): ThemeResult {
  return resolveThemeConfig(options, XColor);
}

const theme: XColorPlugin<XColorThemeOptions> = {
  name: "@xpyjs/color/plugins/theme",
  install(option, cls, factory) {
    // Validate that options are provided
    if (!option || !option.colors) {
      Logger.warn("ThemePlugin requires options with a `colors` property.");
    }

    // ---- Closure state ----
    let _options: XColorThemeOptions = { ...option, colors: option?.colors ?? {} };
    let _result: ThemeResult | null = null;
    let _injected = false;

    function ensureResult(): ThemeResult {
      if (!_result) {
        _result = resolveThemeConfig(_options, cls);
      }
      return _result;
    }

    function invalidateCache(): void {
      _result = null;
    }

    function injectCss(css: string): void {
      if (typeof document === "undefined") return;

      const existing = document.getElementById(STYLE_ID);
      if (existing) {
        existing.textContent = css;
      } else {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
      }
      _injected = true;
    }

    const hasStyle = typeof document !== "undefined" && document.getElementById(STYLE_ID);
    if (hasStyle || typeof factory.getThemeCss === "function") {
      const { css } = ensureResult();
      if (hasStyle) injectCss(css);
    }

    factory.injectTheme = function (): string {
      const css = ensureResult().css;
      injectCss(css);
      return css;
    };

    factory.getThemeCss = function (): string {
      return ensureResult().css;
    };

    factory.getThemeVars = function (): Record<string, string> {
      return { ...ensureResult().vars };
    };

    factory.updateTheme = function (partial: Partial<XColorThemeOptions>, deep?: boolean): void {
      const options = deep === false ? { ..._options, ...partial } : deepMerge(_options, partial);
      const result = resolveThemeConfig(options, cls);
      if (_injected) injectCss(result.css);
      _options = options;
      _result = result;
    };

    factory.removeTheme = function (): void {
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
  ColorConfig,
  BuiltinRole,
  ThemeDeriveAlgorithm,
  XColorThemeDeriveOptions
};
export default theme;
