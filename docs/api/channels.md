# 通道读写

所有通道方法不传参时为 getter（返回当前值），传参时为 setter（设置值并返回 `this`）。

## RGB 通道

### red(value?) {#red}

读写红色通道。范围 0–255。

别名：`r()`

```ts
xcolor('#3b82f6').red()     // 59
xcolor('#3b82f6').red(200)  // 设置红色为 200，返回 this
```

### green(value?) {#green}

读写绿色通道。范围 0–255。

别名：`g()`

```ts
xcolor('#3b82f6').green()   // 130
```

### blue(value?) {#blue}

读写蓝色通道。范围 0–255。

别名：`b()`

```ts
xcolor('#3b82f6').blue()    // 246
```

### alpha(value?) {#alpha}

读写透明度。范围 0–1。

别名：`a()`, `opacity()`

```ts
xcolor('#ff0000').alpha()      // 1
xcolor('#ff0000').alpha(0.5)   // 设置为半透明
```

## HSL 通道

### hue(value?) {#hue}

读写色相。范围 0–360。

别名：`h()`

```ts
xcolor('#ff0000').hue()     // 0
xcolor('#ff0000').hue(120)  // 变为绿色
```

### saturation(value?) {#saturation}

读写 HSL 饱和度。范围 0–100。

别名：`s()`

```ts
xcolor('#ff0000').saturation()    // 100
xcolor('#ff0000').saturation(50)  // 降低饱和度
```

### lightness(value?) {#lightness}

读写 HSL 亮度。范围 0–100。

别名：`l()`

```ts
xcolor('#ff0000').lightness()    // 50
xcolor('#ff0000').lightness(80)  // 提亮
```

## HSV 通道

### value(val?) {#value}

读写 HSV 明度。范围 0–100。

别名：`v()`

```ts
xcolor('#ff0000').value()    // 100
xcolor('#ff0000').value(50)  // 降低明度
```

::: info
`hue()` 和 `saturation()` 在 HSL 和 HSV 中共享。
:::

## 复合读写

### rgb(r?, g?, b?) {#rgb}

不传参返回 `{ r, g, b, a }` 对象。传参同时设置 RGB 三通道。

```ts
xcolor('#ff0000').rgb()             // { r: 255, g: 0, b: 0, a: 1 }
xcolor('#ff0000').rgb(0, 128, 255)  // 设置三通道
```

### hsl(h?, s?, l?) {#hsl}

不传参返回 `{ h, s, l, a }` 对象。传参同时设置 HSL 三通道。

```ts
xcolor('#ff0000').hsl()              // { h: 0, s: 100, l: 50, a: 1 }
xcolor('#ff0000').hsl(210, 80, 60)   // 设置为蓝色调
```

### hsv(h?, s?, v?) {#hsv}

不传参返回 `{ h, s, v, a }` 对象。传参同时设置 HSV 三通道。

```ts
xcolor('#ff0000').hsv()               // { h: 0, s: 100, v: 100, a: 1 }
xcolor('#ff0000').hsv(120, 100, 80)  // 设置为绿色调
```

### hex(value?) {#hex}

不传参返回 6 位 hex 字符串。传参以 hex 字符串设置颜色。

```ts
xcolor('#ff0000').hex()          // '#ff0000'
xcolor('#ff0000').hex('#00ff00') // 变为绿色
```
