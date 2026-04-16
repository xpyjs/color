# 颜色操作

所有操作方法**原地修改**实例并返回 `this`，支持链式调用。如需保留原色，先 `.clone()`。

## 亮度

### lighten(amount?) {#lighten}

增加 HSL 亮度。`amount` 为百分点数（0–100），默认 `10`。

```ts
xcolor('#ff0000').lighten(20).toHex()  // '#ff6666'
```

### darken(amount?) {#darken}

减少 HSL 亮度。默认 `10`。

```ts
xcolor('#ff0000').darken(20).toHex()  // '#990000'
```

### brighten(amount?) {#brighten}

在 RGB 空间将各通道推向 255。默认 `10`，范围 0–100。

```ts
xcolor('#ff0000').brighten(50).toHex()  // '#ff8080'
```

## 饱和度

### saturate(amount?) {#saturate}

增加 HSL 饱和度。默认 `10`，范围 0–100。

```ts
xcolor('#bf4040').saturate(40).toHex()  // '#ff0000'
```

### desaturate(amount?) {#desaturate}

减少 HSL 饱和度。默认 `10`。

```ts
xcolor('#ff0000').desaturate(50).toHex()  // '#bf4040'
```

### grayscale() {#grayscale}

完全去饱和，等价于 `desaturate(100)`。

别名：`greyscale()`

```ts
xcolor('#ff0000').grayscale().toHex()  // '#808080'
```

## 色相

### spin(degrees) {#spin}

在 HSL 色轮上旋转色相。支持正负值，自动取模 360°。

别名：`rotate()`

```ts
xcolor('#ff0000').spin(120).toHex()   // '#00ff00'
xcolor('#ff0000').spin(-120).toHex()  // '#0000ff'
```

## 反转

### negate() {#negate}

RGB 各通道取反（`255 - channel`），alpha 不变。

别名：`invert()`

```ts
xcolor('#ff0000').negate().toHex()  // '#00ffff'
```

## 透明度

### fade(amount?) {#fade}

降低不透明度。alpha 减少 `amount / 100`，默认 `10`。

别名：`fadeOut()`

```ts
xcolor('#ff0000').fade(50).alpha()  // 0.5
```

### opaquer(amount?) {#opaquer}

增加不透明度。alpha 增加 `amount / 100`，默认 `10`。

别名：`fadeIn()`

```ts
xcolor('rgba(255,0,0,0.5)').opaquer(30).alpha()  // 0.8
```

## 混合

### mix(color, amount?) {#mix}

在 RGB 空间与另一个颜色线性混合。`amount` 为目标颜色的权重（0–100），默认 `50`。

```ts
xcolor('#ff0000').mix('#0000ff', 50).toHex()  // '#800080'
```

### tint(amount?) {#tint}

与白色混合。`amount` 为白色的权重（0–100），默认 `50`。

```ts
xcolor('#ff0000').tint(50).toHex()  // '#ff8080'
```

### shade(amount?) {#shade}

与黑色混合。`amount` 为黑色的权重（0–100），默认 `50`。

```ts
xcolor('#ff0000').shade(50).toHex()  // '#800000'
```

## 方法签名汇总

| 方法 | 参数 | 默认值 | 返回值 | 别名 |
| --- | --- | --- | --- | --- |
| `lighten(amount?)` | 0–100 | 10 | `this` | — |
| `darken(amount?)` | 0–100 | 10 | `this` | — |
| `brighten(amount?)` | 0–100 | 10 | `this` | — |
| `saturate(amount?)` | 0–100 | 10 | `this` | — |
| `desaturate(amount?)` | 0–100 | 10 | `this` | — |
| `grayscale()` | — | — | `this` | `greyscale()` |
| `spin(degrees)` | 任意数 | — | `this` | `rotate()` |
| `negate()` | — | — | `this` | `invert()` |
| `fade(amount?)` | 0–100 | 10 | `this` | `fadeOut()` |
| `opaquer(amount?)` | 0–100 | 10 | `this` | `fadeIn()` |
| `mix(color, amount?)` | 0–100 | 50 | `this` | — |
| `tint(amount?)` | 0–100 | 50 | `this` | — |
| `shade(amount?)` | 0–100 | 50 | `this` | — |
