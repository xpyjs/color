# name

148 CSS named colors — parsing and output, plus the special `transparent` value.

[Jump to the full color reference](#named-colors)

## Install

```ts
import namePlugin from '@xpyjs/color/plugins/name'
xcolor.use(namePlugin)
```

## Methods

### toName()

Returns CSS color name if exact match, otherwise `undefined`.

```ts
xcolor('#ff0000').toName()   // 'red'
xcolor('#ff0001').toName()   // undefined
```

### closestName()

Returns closest CSS color name.

```ts
xcolor('#ff0001').closestName()  // 'red'
```

## Input Parsing

```ts
xcolor('red').toHex()         // '#ff0000'
xcolor('dodgerblue').toHex()  // '#1e90ff'
```

## Format Key

`'name'`

## All Named Colors {#named-colors}

All 148 CSS Color Level 4 named colors are listed below, together with the special `transparent` value. Each card shows the color, its name, and its hex value; **click any card to copy the corresponding `name` field** for use with `xcolor('...')`.

<NamedColors />

### NAMED_COLORS

The plugin also exports the complete name-to-hex map, useful for building your own picker or validating data:

```ts
import { NAMED_COLORS } from '@xpyjs/color/plugins/name'

NAMED_COLORS.red      // '#ff0000'
NAMED_COLORS.coral    // '#ff7f50'
NAMED_COLORS.transparent // '#00000000'
```
