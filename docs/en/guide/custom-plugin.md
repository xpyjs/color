# Custom Plugin Development

This page is for developers who want to extend xcolor's capabilities. You will learn about plugin structure, available utility functions, and how to provide full type hints for TypeScript users.

## Plugin Structure

An xcolor plugin is an object that implements the `XColorPlugin` interface:

```ts
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin = {
  name: 'my-plugin',          // unique identifier, used for deduplication
  install(option, cls, factory) {
    // cls       — the XColor class itself
    // factory   — the xcolor factory function (for creating instances inside the plugin)
    // option    — user config passed via xcolor.use(plugin, option)
  }
}

export default myPlugin
```

`install()` is called when `xcolor.use()` is invoked, and a plugin with the same name will only be installed once.

## Adding Instance Methods

Use `defineMethod` to add methods to `XColor.prototype`:

```ts
import { defineMethod } from '@xpyjs/color'
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls) {
    defineMethod(cls, 'brightness255', function () {
      // this is the XColor instance
      return Math.round(
        this.red() * 0.299 + this.green() * 0.587 + this.blue() * 0.114
      )
    })
  }
}
```

::: warning
The method implementation must use the `function` keyword, not arrow functions — otherwise `this` will not point to the correct context.
:::

### Why Use defineMethod

`defineMethod` internally uses `Object.defineProperty` to set the method as `enumerable: false`. Compared to directly assigning `cls.prototype.xxx = fn`, this better matches the behavior of native methods and prevents the method from appearing in `for...in` loops.

## Registering String Formats

If your plugin outputs a new string format, register it with `registerStringFormatter` so users can use it via `toString('myFormat')` or `format('myFormat')`:

```ts
import { defineMethod, registerStringFormatter } from '@xpyjs/color'
import type { XColorPlugin } from '@xpyjs/color'

const myPlugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls) {
    defineMethod(cls, 'toMyString', function () {
      return `my(${this.red()}, ${this.green()}, ${this.blue()})`
    })

    // Register the format key
    registerStringFormatter(cls, 'my', color => color.toMyString())
  }
}
```

After registration:

```ts
xcolor('#ff0000').toString('my')  // 'my(255, 0, 0)'
xcolor('#ff0000').format('my')    // 'my(255, 0, 0)'
```

## Registering Color Parsers

If your plugin introduces a new color format, use `registerColorParser` to register a parser into the parsing pipeline. A parser is a function that receives an input value and returns `{ r, g, b, a }` or `null` (indicating it cannot parse, passing to the next parser):

```ts
import { registerColorParser } from '@xpyjs/color'
import type { XColorPlugin } from '@xpyjs/color'

const brandPlugin: XColorPlugin = {
  name: 'brand-colors',
  install() {
    registerColorParser((value) => {
      if (value === 'brand-primary') {
        return { r: 99, g: 102, b: 241, a: 1 }
      }
      return null // cannot parse, pass to next
    })
  }
}
```

After registration:

```ts
xcolor('brand-primary').toHex()  // '#6366f1'
```

### Parser Priority

By default, custom parsers run **after** built-in parsers. If you need to override a built-in format, set `priority: 'before'`:

```ts
registerColorParser(
  (value) => { /* ... */ },
  { priority: 'before' }
)
```

`registerColorParser` returns an unregister function — call it to remove the parser:

```ts
const unregister = registerColorParser(myParser)
// later...
unregister()
```

## Using the Factory Function

The third argument of `install`, `factory`, is the `xcolor` factory function. Use it when your plugin needs to create color instances internally:

```ts
const plugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls, factory) {
    defineMethod(cls, 'midpoint', function (other: string) {
      // Use factory to create another color
      const target = factory(other)
      return factory({
        r: Math.round((this.red() + target.red()) / 2),
        g: Math.round((this.green() + target.green()) / 2),
        b: Math.round((this.blue() + target.blue()) / 2)
      })
    })
  }
}
```

## TypeScript Type Augmentation

Use `declare module` to let TypeScript know about your new methods and formats:

```ts
import type { XColorPlugin } from '@xpyjs/color'
import { defineMethod, registerStringFormatter } from '@xpyjs/color'

// Type declarations
declare module '@xpyjs/color' {
  interface XColor {
    brightness255(): number
    toMyString(): string
  }

  interface XColorStringFormatMap {
    my: true
  }
}

// Plugin implementation
const myPlugin: XColorPlugin = {
  name: 'my-plugin',
  install(_option, cls) {
    defineMethod(cls, 'brightness255', function () {
      return Math.round(
        this.red() * 0.299 + this.green() * 0.587 + this.blue() * 0.114
      )
    })

    defineMethod(cls, 'toMyString', function () {
      return `my(${this.red()}, ${this.green()}, ${this.blue()})`
    })

    registerStringFormatter(cls, 'my', color => color.toMyString())
  }
}

export default myPlugin
```

::: tip
Place `declare module` in the plugin source file. Once the user imports and uses the plugin, TypeScript will automatically merge the type declarations.
:::

## Available Utility Functions

The following functions are exported from `@xpyjs/color` to facilitate plugin development:

### Core Utilities

| Function | Description |
| --- | --- |
| `defineMethod(cls, name, fn)` | Add a method to the class prototype (`enumerable: false`) |
| `registerStringFormatter(cls, format, fn)` | Register a `toString(format)` format |
| `registerColorParser(fn, options?)` | Register a color parser, returns an unregister function |

### Math Utilities

| Function | Description |
| --- | --- |
| `clamp(value, min, max)` | Clamp a value within a range |
| `round(value, decimals?)` | Round to specified decimal places, default 0 |
| `clampByte(value)` | Clamp to 0–255 and round to integer |
| `normalizeSteps(steps, fallback?)` | Normalize step count parameter (≥ 2), default 5 |

### Color Space Conversions

| Function | Description |
| --- | --- |
| `rgbToHsl(r, g, b)` | RGB → HSL |
| `hslToRgb(h, s, l)` | HSL → RGB |
| `rgbToHsv(r, g, b)` | RGB → HSV |
| `hsvToRgb(h, s, v)` | HSV → RGB |
| `rgbaToHex(r, g, b, a, allow3Char?, forceAlpha?)` | RGBA → hex string |

### Parsing Utilities

| Function | Description |
| --- | --- |
| `parseRgbChannel(val)` | Parse an RGB channel value (supports percentages) |
| `parseAlphaChannel(val)` | Parse an alpha value (supports percentages) |
| `parseFunctionalChannels(input, name)` | Parse CSS functional syntax channel values |
| `parseColor(input)` | Complete color parsing pipeline |

### Logging

| Object/Method | Description |
| --- | --- |
| `Logger.warn(...args)` | console.warn with `[X-Color]` prefix |
| `Logger.error(...args)` | console.error with `[X-Color]` prefix |
| `Logger.createError(msg)` | Create an Error instance with prefix |

## Complete Example

Here is a fully functional plugin that adds perceived brightness percentage output and parsing:

```ts
import type { XColorPlugin } from '@xpyjs/color'
import {
  defineMethod,
  registerStringFormatter,
  registerColorParser,
  round
} from '@xpyjs/color'

declare module '@xpyjs/color' {
  interface XColor {
    /** Returns perceived brightness as a percentage (0–100) */
    perceivedBrightness(): number
    /** Returns a brightness string, e.g. "brightness(72%)" */
    toBrightnessString(): string
  }
  interface XColorStringFormatMap {
    brightness: true
  }
}

const brightnessPlugin: XColorPlugin = {
  name: 'brightness',
  install(_option, cls, factory) {
    defineMethod(cls, 'perceivedBrightness', function () {
      const r = this.red(), g = this.green(), b = this.blue()
      return round(Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b) / 2.55, 1)
    })

    defineMethod(cls, 'toBrightnessString', function () {
      return `brightness(${this.perceivedBrightness()}%)`
    })

    registerStringFormatter(cls, 'brightness', c => c.toBrightnessString())

    // Parse "brightness(72%)" format → corresponding gray color
    registerColorParser((value) => {
      if (typeof value !== 'string') return null
      const m = value.match(/^brightness\((\d+(?:\.\d+)?)%\)$/i)
      if (!m) return null
      const gray = round(parseFloat(m[1]) * 2.55)
      return { r: gray, g: gray, b: gray, a: 1 }
    })
  }
}

export default brightnessPlugin
```
