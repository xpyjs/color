# Static Methods

Methods mounted on the `xcolor` factory function.

## xcolor.use(plugin, option?) {#use}

Register a plugin. Registering a plugin with the same name again reinstalls it and logs an override warning.

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
xcolor.use(labPlugin, { /* options */ })
```

Alias: `xcolor.extend()`. Returns the `XColor` class for chaining plugin registration.

## xcolor.isColor(value) {#isColor}

Determine whether a value is an `XColor` instance.

Alias: `xcolor.is()`

**Returns**: `boolean`

```ts
xcolor.isColor(xcolor('#ff0000'))  // true
xcolor.isColor('#ff0000')         // false
xcolor.isColor(null)              // false
```

## xcolor.random() {#random}

Generate a random color.

**Returns**: `XColor` instance

```ts
xcolor.random().toHex()  // '#a3c74f' (different each time)
```

## xcolor.config(options) {#config}

Set the global default configuration. The provided object replaces the current global configuration; pass `{}` to restore defaults. Calling without arguments does not return the configuration.

```ts
// Preserve fractional RGB precision globally
xcolor.config({ useDecimal: true })

// Instances created afterwards preserve fractions by default
const c = xcolor('#000000')
c.rgb(127.5, 64.25, 0)
c.rgb()  // { r: 127.5, g: 64.25, b: 0, a: 1 }

// Restore defaults
xcolor.config({})
```

### Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `useDecimal` | `boolean` | `false` | Preserve fractional RGB channels; the range remains 0–255 |

::: tip
The `options` parameter on an individual instance takes priority over the global configuration.
:::
