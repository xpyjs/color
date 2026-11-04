# scale - 色阶插值

在两个颜色之间进行精确的色彩空间插值，支持多种色彩空间和缓动函数。比 gradient 插件提供更精细的控制。

## 安装

```ts
import xcolor from '@xpyjs/color'
import scalePlugin from '@xpyjs/color/plugins/scale'

xcolor.use(scalePlugin)
```

## 方法

<SvgScaleComparison />

### scale(to, options?)

生成从当前颜色到目标颜色的插值序列。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `to` | `XColorInput` | — | 目标颜色 |
| `options` | `ScaleOptions` | — | 配置选项 |

```ts
interface ScaleOptions {
  steps?: number            // 步数，默认 5（2–10000）
  space?: ScaleSpace        // 插值色彩空间
  easing?: ScaleEasing      // 缓动函数
  premultiplyAlpha?: boolean // 按不透明度加权通道，默认 false
}
```

#### 色彩空间（ScaleSpace）

| 值 | 说明 |
| --- | --- |
| `'rgb'` | RGB 线性插值（默认）|
| `'hsl'` | HSL 插值 |
| `'srgb-linear'` | 线性光 sRGB 插值 |
| `'oklab'` | OKLab 插值 |

#### 缓动函数（ScaleEasing）

| 值 | 说明 |
| --- | --- |
| `'linear'` | 线性（默认）|
| `'easeIn'` | 缓入 |
| `'easeOut'` | 缓出 |
| `'easeInOut'` | 缓入缓出 |

**返回值**：`XColor[]`

```ts
xcolor('#ff0000').scale('#0000ff', {
  steps: 7,
  space: 'hsl',
  easing: 'easeInOut'
}).map(c => c.toHex())
```

### at(to, t, options?)

获取两个颜色之间指定位置的单个插值颜色。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `to` | `XColorInput` | 目标颜色 |
| `t` | `number` | 插值位置（0–1）|
| `options` | `{ space?, easing?, premultiplyAlpha? }` | 配置选项 |

**返回值**：`XColor`

```ts
xcolor('#ff0000').at('#0000ff', 0.5).toHex()         // '#800080'
xcolor('#ff0000').at('#0000ff', 0.5, { space: 'hsl' }).toHex()  // 通过 HSL 插值
```

## RGB vs HSL 插值对比

RGB 插值可能产生"浑浊"的中间色，HSL 插值会沿色轮过渡：

<SvgScaleSpaces />

```ts
// RGB：红→蓝 中间是紫灰色
xcolor('#ff0000').scale('#0000ff', { space: 'rgb', steps: 5 })

// HSL：红→蓝 走最短色相路径，中间经过品红
xcolor('#ff0000').scale('#0000ff', { space: 'hsl', steps: 5 })
```

根据实际场景选择合适的插值空间。

## 线性光、OKLab 与 alpha

`space: 'srgb-linear'` 在光强线性的 sRGB 中插值，`space: 'oklab'` 在 OKLab 中插值。RGB 和 HSL 的默认行为保持一致。显式传入 `premultiplyAlpha: true` 可按不透明度加权通道。HSL 的色相仍按最短路径计算。
