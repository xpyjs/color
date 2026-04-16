# Getter / Setter

xcolor 的通道方法同时扮演 getter 和 setter 的角色——不传参读取，传参设置：

```ts
const color = xcolor('#ff6600')

color.red()     // 255 — getter
color.red(200)  // setter，返回 this，可以继续链式调用
color.red()     // 200
```

## RGB 通道

<SvgRgbChannels />

### red() / r()

获取或设置红色通道（0–255）。

```ts
xcolor('#3b82f6').red()    // 59
xcolor('#3b82f6').red(200) // 设置红色为 200
xcolor('#3b82f6').r()      // 59 — 别名
```

### green() / g()

获取或设置绿色通道（0–255）。

```ts
xcolor('#3b82f6').green()    // 130
xcolor('#3b82f6').green(255) // 设置绿色为 255
```

### blue() / b()

获取或设置蓝色通道（0–255）。

```ts
xcolor('#3b82f6').blue()   // 246
xcolor('#3b82f6').blue(0)  // 设置蓝色为 0
```

### alpha() / a() / opacity()

获取或设置透明度（0–1）。

```ts
xcolor('#3b82f6').alpha()    // 1
xcolor('#3b82f6').alpha(0.5) // 设置为半透明
xcolor('#3b82f680').a()      // 0.5 — 8 位 hex 自动解析 alpha
```

## HSL 通道

<SvgHslCylinder />

### hue() / h()

获取或设置色相（0–360）。

```ts
xcolor('#ff0000').hue()    // 0
xcolor('#ff0000').hue(120) // 变为绿色
```

### saturation() / s()

获取或设置 HSL 饱和度（0–100）。

```ts
xcolor('#ff0000').saturation()   // 100
xcolor('#ff0000').saturation(50) // 降低饱和度
```

### lightness() / l()

获取或设置 HSL 亮度（0–100）。

```ts
xcolor('#ff0000').lightness()   // 50
xcolor('#ff0000').lightness(80) // 提亮
```

## HSV 通道

<SvgHsvCone />

### value() / v()

获取或设置 HSV 明度（0–100）。

```ts
xcolor('#ff0000').value()   // 100
xcolor('#ff0000').value(50) // 降低明度
```

::: info
`hue()` 和 `saturation()` 在 HSL 和 HSV 中共享，修改色相或饱和度会同时影响两种模型。
:::

## 复合 Getter / Setter

### rgb(r, g, b)

不传参返回 `{ r, g, b, a }` 对象。传参同时设置 RGB 三通道：

```ts
xcolor('#ff0000').rgb()           // { r: 255, g: 0, b: 0, a: 1 }
xcolor('#ff0000').rgb(0, 128, 255) // 同时设置三通道
```

### hsl(h, s, l)

不传参返回 `{ h, s, l, a }` 对象。传参同时设置 HSL 三通道：

```ts
xcolor('#ff0000').hsl()          // { h: 0, s: 100, l: 50, a: 1 }
xcolor('#ff0000').hsl(210, 80, 60)
```

### hsv(h, s, v)

不传参返回 `{ h, s, v, a }` 对象。传参同时设置 HSV 三通道：

```ts
xcolor('#ff0000').hsv()            // { h: 0, s: 100, v: 100, a: 1 }
xcolor('#ff0000').hsv(120, 100, 80)
```

### hex(value)

不传参返回 6 位 hex 字符串。传参以 hex 字符串设置颜色：

```ts
xcolor('#ff0000').hex()        // '#ff0000'
xcolor('#ff0000').hex('#00ff00') // 变为绿色
```

## 大写属性（只读）

`R`、`G`、`B`、`A` 四个大写属性为快捷只读 getter，无法赋值：

```ts
const c = xcolor('#3b82f6')
c.R  // 59
c.G  // 130
c.B  // 246
c.A  // 1
```

## 别名一览

所有别名与原方法完全等价，选择你觉得更顺手的即可：

| 方法 | 别名 |
| --- | --- |
| `red()` | `r()` |
| `green()` | `g()` |
| `blue()` | `b()` |
| `alpha()` | `a()`, `opacity()` |
| `hue()` | `h()` |
| `saturation()` | `s()` |
| `lightness()` | `l()` |
| `value()` | `v()` |

## 链式示例

getter/setter 与操作方法可以自由组合：

```ts
xcolor('#ff0000')
  .hue(210)           // 设置色相
  .saturation(80)     // 设置饱和度
  .lighten(10)        // 操作方法
  .alpha(0.9)         // 设置透明度
  .toRgbString()      // 最终输出
```
