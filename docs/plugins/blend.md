# blend - 混合模式

模拟 Photoshop/CSS 的图层混合模式，将两个颜色按照指定算法混合。

## 安装

```ts
import xcolor from '@xpyjs/color'
import blendPlugin from '@xpyjs/color/plugins/blend'

xcolor.use(blendPlugin)
```

## 方法

<SvgBlendModes />

### blend(color, mode)

将当前颜色（底层）与另一个颜色（顶层）按指定模式混合。**原地修改**实例。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `color` | `XColorInput` | 顶层颜色 |
| `mode` | `BlendMode` | 混合模式 |

**返回值**：`this`

```ts
xcolor('#ff0000').blend('#0000ff', 'multiply').toHex()
xcolor('#ff0000').blend('#0000ff', 'screen').toHex()
```

## 混合模式

| 模式 | 说明 |
| --- | --- |
| `'multiply'` | 正片叠底——变暗效果 |
| `'screen'` | 滤色——变亮效果 |
| `'overlay'` | 叠加——对比度增强 |
| `'darken'` | 变暗——取各通道较暗值 |
| `'lighten'` | 变亮——取各通道较亮值 |
| `'colorDodge'` | 颜色减淡 |
| `'colorBurn'` | 颜色加深 |
| `'hardLight'` | 强光 |
| `'softLight'` | 柔光 |
| `'difference'` | 差值 |
| `'exclusion'` | 排除 |

## 示例

```ts
const base = xcolor('#3b82f6')

// 各种混合效果
base.clone().blend('#ff6600', 'multiply').toHex()
base.clone().blend('#ff6600', 'screen').toHex()
base.clone().blend('#ff6600', 'overlay').toHex()
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #3b82f6"></div>
  <span class="color-demo-arrow">×</span>
  <div class="color-demo-swatch" style="background: #ff6600"></div>
  <span class="color-demo-label">multiply</span>
</div>
