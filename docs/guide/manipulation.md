# 颜色操作

xcolor 提供了一系列基于 HSL 和 RGB 色彩空间的操作方法。所有操作方法都**原地修改**当前实例并返回 `this`，支持链式调用。

::: tip
如果需要保留原色不变，先调用 `.clone()`。
:::

## 亮度调节

<SvgLightenDarken />

### lighten(amount)

增加 HSL 亮度。`amount` 为添加的百分点数，默认 `10`，范围 0–100。

```ts
xcolor('#ff0000').lighten(20).toHex() // '#ff6666'
xcolor('#ff0000').lighten().toHex()   // '#ff3333' (默认 +10)
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">lighten(20)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #ff6666"></div>
</div>

### darken(amount)

减少 HSL 亮度。等价于 `lighten(-amount)`，默认 `10`。

```ts
xcolor('#ff0000').darken(20).toHex() // '#990000'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">darken(20)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #990000"></div>
</div>

### brighten(amount)

<SvgBrighten />

直接在 RGB 空间将各通道推向 255。与 `lighten` 不同，`brighten` 不经过 HSL 转换，产生更"发白"的效果。默认 `10`，范围 0–100。

```ts
xcolor('#ff0000').brighten(50).toHex() // '#ff8080'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">brighten(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #ff8080"></div>
</div>

## 饱和度

<SvgSaturation />

### saturate(amount)

增加 HSL 饱和度。默认 `10`，范围 0–100。

```ts
xcolor('#bf4040').saturate(40).toHex() // '#ff0000'
```

### desaturate(amount)

减少 HSL 饱和度。等价于 `saturate(-amount)`，默认 `10`。

```ts
xcolor('#ff0000').desaturate(50).toHex() // '#bf4040'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">desaturate(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #bf4040"></div>
</div>

### grayscale()

<SvgGrayscale />

完全去饱和，等价于 `desaturate(100)`。别名：`greyscale()`。

```ts
xcolor('#ff0000').grayscale().toHex() // '#808080'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">grayscale()</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #808080"></div>
</div>

## 色相旋转

<SvgColorWheel />

### spin(degrees)

在 HSL 色轮上旋转色相。参数为度数，支持正负值，自动取模 360°。别名：`rotate()`。

```ts
xcolor('#ff0000').spin(120).toHex()  // '#00ff00' — 旋转 120°
xcolor('#ff0000').spin(-120).toHex() // '#0000ff' — 旋转 -120°
xcolor('#ff0000').spin(180).toHex()  // '#00ffff' — 互补色
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">spin(120)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #00ff00"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">spin(120)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
</div>

## 反转

<SvgNegate />

### negate()

RGB 各通道取反（`255 - channel`），alpha 保持不变。别名：`invert()`。

```ts
xcolor('#ff0000').negate().toHex() // '#00ffff'
xcolor('#ffffff').negate().toHex() // '#000000'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">negate()</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #00ffff"></div>
</div>

## 透明度

<SvgAlpha />

### fade(amount)

降低不透明度（变更透明）。alpha 减少 `amount / 100`，默认 `10`。别名：`fadeOut()`。

```ts
xcolor('#ff0000').fade(50).alpha()   // 0.5
```

### opaquer(amount)

增加不透明度。alpha 增加 `amount / 100`，默认 `10`。别名：`fadeIn()`。

```ts
xcolor('rgba(255,0,0,0.5)').opaquer(30).alpha() // 0.8
```

## 混合

<SvgMixTintShade />

### mix(color, amount)

在 RGB 空间与另一个颜色线性混合。`amount` 为目标颜色的权重（0–100），默认 `50`。

- `0` = 完全保持当前色
- `50` = 等量混合
- `100` = 完全变为目标色

```ts
xcolor('#ff0000').mix('#0000ff', 50).toHex() // '#800080' — 紫色
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">+</span>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">mix(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #800080"></div>
</div>

### tint(amount)

与白色混合。`amount` 为白色的权重，默认 `50`。

```ts
xcolor('#ff0000').tint(50).toHex()  // '#ff8080'
xcolor('#ff0000').tint(100).toHex() // '#ffffff'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">tint(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #ff8080"></div>
</div>

### shade(amount)

与黑色混合。`amount` 为黑色的权重，默认 `50`。

```ts
xcolor('#ff0000').shade(50).toHex()  // '#800000'
xcolor('#ff0000').shade(100).toHex() // '#000000'
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <span class="color-demo-arrow">→</span>
  <span class="color-demo-label">shade(50)</span>
  <span class="color-demo-arrow">→</span>
  <div class="color-demo-swatch" style="background: #800000"></div>
</div>

## 方法速查

| 方法 | 默认值 | 色彩空间 | 说明 | 别名 |
| --- | --- | --- | --- | --- |
| `lighten(amount)` | 10 | HSL | 增加亮度 | — |
| `darken(amount)` | 10 | HSL | 降低亮度 | — |
| `brighten(amount)` | 10 | RGB | 各通道推向 255 | — |
| `saturate(amount)` | 10 | HSL | 增加饱和度 | — |
| `desaturate(amount)` | 10 | HSL | 降低饱和度 | — |
| `grayscale()` | — | HSL | 完全去饱和 | `greyscale()` |
| `spin(degrees)` | — | HSL | 旋转色相 | `rotate()` |
| `negate()` | — | RGB | 取反 | `invert()` |
| `fade(amount)` | 10 | — | 降低不透明度 | `fadeOut()` |
| `opaquer(amount)` | 10 | — | 增加不透明度 | `fadeIn()` |
| `mix(color, amount)` | 50 | RGB | 与任意颜色混合 | — |
| `tint(amount)` | 50 | RGB | 与白色混合 | — |
| `shade(amount)` | 50 | RGB | 与黑色混合 | — |

想要更丰富的颜色操作？查看 [插件系统](/guide/plugins) — blend 插件提供 11 种混合模式，scale 插件支持色彩空间插值和缓动函数。
