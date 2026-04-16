# palette - 色阶面板生成

从任意颜色生成设计系统色阶面板。支持 Ant Design HSV 曲线、线性插值和自定义生成函数。

## 安装

```ts
import xcolor from '@xpyjs/color'
import palettePlugin from '@xpyjs/color/plugins/palette'

xcolor.use(palettePlugin)
```

## 实例方法

### palette(options?)

从当前颜色生成设计系统色阶面板。基础色对应 shade 500，低于 500 更浅，高于 500 更深。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options.type` | `PaletteType` | `'antd'` | 色阶生成类型 |
| `options.shades` | `Shade[]` | `[50,...,950]` | 色阶级别 |

**返回值**：`XColor[]`

```ts
xcolor('#1890ff').palette()
// → XColor[]，11 个色阶（50–950）

xcolor('#1890ff').palette({ type: 'linear' })
// → 线性插值色阶

xcolor('#ff0000').palette({ shades: [100, 500, 900] })
// → 3 个色阶
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #e6f7ff"></div>
  <div class="color-demo-swatch" style="background: #bae7ff"></div>
  <div class="color-demo-swatch" style="background: #91d5ff"></div>
  <div class="color-demo-swatch" style="background: #69c0ff"></div>
  <div class="color-demo-swatch" style="background: #40a9ff"></div>
  <div class="color-demo-swatch" style="background: #1890ff; border: 2px solid #333"></div>
  <div class="color-demo-swatch" style="background: #096dd9"></div>
  <div class="color-demo-swatch" style="background: #0050b3"></div>
  <div class="color-demo-swatch" style="background: #003a8c"></div>
  <div class="color-demo-swatch" style="background: #002766"></div>
</div>

### 色阶类型 (PaletteType)

| 值 | 说明 |
| --- | --- |
| `'antd'` | Ant Design HSV 曲线算法。非线性色相旋转 + 饱和度/明度调整，生成感知均匀的色阶 |
| `'linear'` | 线性 RGB 插值。从白色经过基础色到黑色，等距过渡 |
| `(baseColor, shades) => XColor[]` | 自定义函数。接收基础色和色阶级别，返回对应的 `XColor[]` |

```ts
// 自定义函数示例
const result = xcolor('#1890ff').palette({
  type: (baseColor, shades) => {
    return shades.map((s) => {
      const factor = (s - 500) / 500
      return factor < 0
        ? xcolor(baseColor.toHex()).lighten(Math.abs(factor) * 50)
        : xcolor(baseColor.toHex()).darken(factor * 50)
    })
  }
})
```

### 色阶级别 (Shade)

默认生成 11 级色阶：`50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`。

基础色对应 `500`。低于 500 的色阶更浅，高于 500 的色阶更深。
