# Static Methods

Methods mounted on the `xcolor` factory function.

## xcolor.use(plugin, option?) {#use}

Register a plugin. Same-name plugins are installed only once.

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
xcolor.use(labPlugin, { /* options */ })
```

Alias: `xcolor.extend()`

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

## xcolor.config(options?) {#config}

Get or set the global default configuration. Without arguments, returns the current configuration; with arguments, merges and updates.

```ts
// Read the current global configuration
xcolor.config()  // { useDecimal: false }

// Set global default to use decimal mode
xcolor.config({ useDecimal: true })

// Instances created afterwards default to using decimals
xcolor({ r: 1, g: 0, b: 0 }).toHex()  // '#ff0000'
```

### Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `useDecimal` | `boolean` | `false` | Use 0–1 range for RGB channels instead of 0–255 |

::: tip
The `options` parameter on an individual instance takes priority over the global configuration.
:::
