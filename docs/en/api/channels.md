# Channel Read/Write

All channel methods act as a getter when called without arguments (returning the current value) and as a setter when called with an argument (setting the value and returning `this`).

## RGB Channels

### red(value?) {#red}

Read or write the red channel. Range 0–255.

Alias: `r()`

```ts
xcolor('#3b82f6').red()     // 59
xcolor('#3b82f6').red(200)  // set red to 200, returns this
```

### green(value?) {#green}

Read or write the green channel. Range 0–255.

Alias: `g()`

```ts
xcolor('#3b82f6').green()   // 130
```

### blue(value?) {#blue}

Read or write the blue channel. Range 0–255.

Alias: `b()`

```ts
xcolor('#3b82f6').blue()    // 246
```

### alpha(value?) {#alpha}

Read or write the opacity. Range 0–1.

Alias: `a()`, `opacity()`

```ts
xcolor('#ff0000').alpha()      // 1
xcolor('#ff0000').alpha(0.5)   // set to semi-transparent
```

## HSL Channels

### hue(value?) {#hue}

Read or write the hue. Range 0–360.

Alias: `h()`

```ts
xcolor('#ff0000').hue()     // 0
xcolor('#ff0000').hue(120)  // becomes green
```

### saturation(value?) {#saturation}

Read or write HSL saturation. Range 0–100.

Alias: `s()`

```ts
xcolor('#ff0000').saturation()    // 100
xcolor('#ff0000').saturation(50)  // reduce saturation
```

### lightness(value?) {#lightness}

Read or write HSL lightness. Range 0–100.

Alias: `l()`

```ts
xcolor('#ff0000').lightness()    // 50
xcolor('#ff0000').lightness(80)  // lighten
```

## HSV Channels

### value(val?) {#value}

Read or write HSV brightness. Range 0–100.

Alias: `v()`

```ts
xcolor('#ff0000').value()    // 100
xcolor('#ff0000').value(50)  // reduce brightness
```

::: info
`hue()` and `saturation()` are shared between HSL and HSV.
:::

## Compound Read/Write

### rgb(r?, g?, b?) {#rgb}

Without arguments, returns a `{ r, g, b, a }` object. With arguments, sets all three RGB channels at once.

```ts
xcolor('#ff0000').rgb()             // { r: 255, g: 0, b: 0, a: 1 }
xcolor('#ff0000').rgb(0, 128, 255)  // set three channels
```

### hsl(h?, s?, l?) {#hsl}

Without arguments, returns a `{ h, s, l, a }` object. With arguments, sets all three HSL channels at once.

```ts
xcolor('#ff0000').hsl()              // { h: 0, s: 100, l: 50, a: 1 }
xcolor('#ff0000').hsl(210, 80, 60)   // set to a blue tone
```

### hsv(h?, s?, v?) {#hsv}

Without arguments, returns a `{ h, s, v, a }` object. With arguments, sets all three HSV channels at once.

```ts
xcolor('#ff0000').hsv()               // { h: 0, s: 100, v: 100, a: 1 }
xcolor('#ff0000').hsv(120, 100, 80)  // set to a green tone
```

### hex(value?) {#hex}

Without arguments, returns a 6-digit hex string. With an argument, sets the color from a hex string.

```ts
xcolor('#ff0000').hex()          // '#ff0000'
xcolor('#ff0000').hex('#00ff00') // becomes green
```
