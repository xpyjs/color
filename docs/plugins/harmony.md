# harmony - 配色方案

基于色彩理论生成经典配色方案。所有方法返回包含 `XColor` 实例的数组。

## 安装

```ts
import xcolor from '@xpyjs/color'
import harmonyPlugin from '@xpyjs/color/plugins/harmony'

xcolor.use(harmonyPlugin)
```

## 方法

<SvgHarmonySchemes />

### complement()

互补色——色轮上相隔 180° 的两个颜色。

**返回值**：`[XColor, XColor]`（原色 + 互补色）

```ts
xcolor('#ff0000').complement().map(c => c.toHex())
// ['#ff0000', '#00ffff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #00ffff"></div>
</div>

### triad()

三色方案——色轮上间隔 120° 的三个颜色。

**返回值**：`XColor[]`（3 个）

```ts
xcolor('#ff0000').triad().map(c => c.toHex())
// ['#ff0000', '#00ff00', '#0000ff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #00ff00"></div>
  <div class="color-demo-swatch" style="background: #0000ff"></div>
</div>

### tetrad()

四色方案——色轮上间隔 90° 的四个颜色。

**返回值**：`XColor[]`（4 个）

```ts
xcolor('#ff0000').tetrad().map(c => c.toHex())
// ['#ff0000', '#80ff00', '#00ffff', '#8000ff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #80ff00"></div>
  <div class="color-demo-swatch" style="background: #00ffff"></div>
  <div class="color-demo-swatch" style="background: #8000ff"></div>
</div>

### splitComplement()

分裂互补——原色加互补色两侧各 30° 的颜色。

**返回值**：`XColor[]`（3 个）

```ts
xcolor('#ff0000').splitComplement().map(c => c.toHex())
// ['#ff0000', '#00ff80', '#0080ff']
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #00ff80"></div>
  <div class="color-demo-swatch" style="background: #0080ff"></div>
</div>

### analogous(results?, slices?)

类似色——色轮上相邻的颜色。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `results` | `number` | `6` | 返回颜色数量 |
| `slices` | `number` | `30` | 色轮切分份数 |

**返回值**：`XColor[]`

```ts
xcolor('#ff0000').analogous().map(c => c.toHex())
// 6 个红色附近的颜色
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #ff0000"></div>
  <div class="color-demo-swatch" style="background: #ff3300"></div>
  <div class="color-demo-swatch" style="background: #ff6600"></div>
  <div class="color-demo-swatch" style="background: #ff9900"></div>
  <div class="color-demo-swatch" style="background: #ffcc00"></div>
  <div class="color-demo-swatch" style="background: #ffff00"></div>
</div>

### monochromatic(results?)

单色方案——相同色相，不同明度。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `results` | `number` | `6` | 返回颜色数量 |

**返回值**：`XColor[]`

```ts
xcolor('#ff0000').monochromatic().map(c => c.toHex())
// 6 个从深到浅的红色
```

<div class="color-demo">
  <div class="color-demo-swatch" style="background: #2b0000"></div>
  <div class="color-demo-swatch" style="background: #550000"></div>
  <div class="color-demo-swatch" style="background: #800000"></div>
  <div class="color-demo-swatch" style="background: #aa0000"></div>
  <div class="color-demo-swatch" style="background: #d40000"></div>
  <div class="color-demo-swatch" style="background: #ff0000"></div>
</div>
