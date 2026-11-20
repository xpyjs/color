# blend - 混合模式

模拟 Photoshop/CSS 的图层混合模式，将两个颜色按照指定算法混合。

## 非分离混合与合成

`blend(source, mode = 'normal')` 新增 `hue`、`saturation`、`color`、`luminosity`，遵循 [W3C 非分离公式](https://www.w3.org/TR/compositing-1/#blendingnonseparable)。这些模式使用规范的 Lum/Sat/ClipColor 运算，不是直接替换 HSL 分量，也不是 WCAG 相对亮度。

```ts
xcolor('#ff0000').blend('#0000ff', 'color')
xcolor('#0000ff').composite('#ff0080', 'source-over')
```

`destination.composite(source, operator = 'source-over')` 在编码 sRGB 中进行单个 RGBA 颜色的 Porter–Duff 合成，支持 clear、copy、destination、source-over、destination-over、source-in、destination-in、source-out、destination-out、source-atop、destination-atop、xor 和 lighter。lighter 累加并限制预乘通道和 alpha；它与 blend 的 lighten（逐通道取大值）不同。

两种操作都返回独立实例，保留目标实例精度选项，不修改输入；合成输出 alpha 为 0 时采用透明黑。无效输入或未知操作会抛错。这里不实现图像形状、图层组隔离或 Canvas 绘制区域，只计算给定 RGBA 像素。

## 安装

```ts
import xcolor from '@xpyjs/color'
import blendPlugin from '@xpyjs/color/plugins/blend'

xcolor.use(blendPlugin)
```

## 方法

<SvgBlendModes />

### blend(color, mode)

将当前颜色（底层）与另一个颜色（顶层）按指定模式混合。返回一个新的颜色实例。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `color` | `XColorInput` | 顶层颜色 |
| `mode` | `BlendMode` | 混合模式 |

**返回值**：`XColor`

```ts
xcolor('#ff0000').blend('#0000ff', 'multiply').toHex()
xcolor('#ff0000').blend('#0000ff', 'screen').toHex()
```

## 混合模式

| 模式 | 说明 |
| --- | --- |
| `'normal'` | 普通 source-over 图层合成 |
| `'multiply'` | 正片叠底——变暗效果 |
| `'screen'` | 滤色——变亮效果 |
| `'overlay'` | 叠加——对比度增强 |
| `'darken'` | 变暗——取各通道较暗值 |
| `'lighten'` | 变亮——取各通道较亮值 |
| `'dodge'` | 颜色减淡 |
| `'burn'` | 颜色加深 |
| `'hardLight'` | 强光 |
| `'softLight'` | 柔光 |
| `'difference'` | 差值 |
| `'exclusion'` | 排除 |

## 示例

```ts
const base = xcolor('#3b82f6')

// 各种混合效果
base.blend('#ff6600', 'multiply').toHex()
base.blend('#ff6600', 'screen').toHex()
base.blend('#ff6600', 'overlay').toHex()
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #3b82f6"></div>
  <span class="color-demo-arrow">×</span>
  <div class="color-demo-swatch" style="background: #ff6600"></div>
  <span class="color-demo-label">multiply</span>
</div>
