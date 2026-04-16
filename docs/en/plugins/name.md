# name

148 CSS named colors — parsing and output.

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
