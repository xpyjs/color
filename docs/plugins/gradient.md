# gradient - 渐变

生成两个颜色之间的渐变色序列，或从单一颜色生成明暗变化序列。

## 安装

```ts
import xcolor from '@xpyjs/color'
import gradientPlugin from '@xpyjs/color/plugins/gradient'

xcolor.use(gradientPlugin)
```

## 方法

<SvgGradientBar />

### gradient(to, steps?)

在当前颜色和目标颜色之间生成渐变序列。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `to` | `XColorInput` | — | 目标颜色 |
| `steps` | `number` | `5` | 步数（≥ 2）|

**返回值**：`XColor[]`

```ts
xcolor('#ff0000').gradient('#0000ff', 5).map(c => c.toHex())
// ['#ff0000', '#bf0040', '#800080', '#4000bf', '#0000ff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #bf0040"></div>
  <div class="color-demo-swatch" style="background: #800080"></div>
  <div class="color-demo-swatch" style="background: #4000bf"></div>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
</div>

### tones(steps?)

以当前颜色为中心，生成明暗变化的色调序列（shades + 原色 + tints）。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `steps` | `number` | `5` | 步数（≥ 2）|

**返回值**：`XColor[]`

```ts
xcolor('#3b82f6').tones(5).map(c => c.toHex())
// 从深色到浅色的 5 步变化
```

## 实际场景

### CSS 渐变背景

```ts
const stops = xcolor('#6366f1')
  .gradient('#ec4899', 5)
  .map(c => c.toHex())
  .join(', ')

const css = `linear-gradient(to right, ${stops})`
```

### 图表配色

```ts
const chartColors = xcolor('#3b82f6')
  .gradient('#10b981', 8)
  .map(c => c.toHex())
```
