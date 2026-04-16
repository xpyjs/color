import { XColor, xcolor } from "../core";

/**
 * Object-style XColor plugin.
 *
 * Every plugin must be an object with a unique `name` and an `install` method.
 * Additional custom fields (e.g. `version`, `description`) are allowed via the
 * index signature and can be used freely by plugin authors.
 *
 * @template T - Type of the optional configuration object passed to the plugin.
 *   Defaults to `unknown` when the plugin requires no configuration.
 *
 * @example
 * ```ts
 * import type { XColorPlugin } from '@xpyjs/color';
 * import xcolor from '@xpyjs/color';
 *
 * const myPlugin: XColorPlugin = {
 *   name: '@xpyjs/color/plugins/my-plugin',
 *   version: '1.0.0',
 *   install(_option, cls) {
 *     (cls.prototype as any).myMethod = function () {
 *       return this.toHex();
 *     };
 *   }
 * };
 *
 * xcolor.use(myPlugin);
 * ```
 */
export interface XColorPlugin<T = unknown> {
  /** Unique plugin name used for deduplication. */
  name: string;
  /**
   * Install callback that extends `XColor` and/or the `xcolor` factory.
   *
   * @param option  - Optional configuration object forwarded from the `use()` / `extend()` call.
   * @param cls     - The `XColor` class itself. Use `cls.prototype` to add instance methods.
   * @param factory - The `xcolor` factory function, useful when the plugin needs
   *   to construct new `XColor` instances internally.
   */
  install(option: T, cls: typeof XColor, factory: typeof xcolor): void;
  /** Allow arbitrary metadata fields for plugin authors. */
  [key: string]: unknown;
}

