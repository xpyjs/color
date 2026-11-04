# lab / lch

CIE Lab 和 CIE LCH 感知色彩空间支持。Lab 基于人眼感知设计，常用于色差计算。

插件沿用 D65 参考白点。CSS Color 4 的 Lab 与 LCH 使用 D50，因此相同坐标的渲染结果可能不同。

通过 `xcolor.use(labPlugin, { whitePoint: 'D50' })` 使用与 CSS 一致的 Lab/LCH 坐标。选项同时作用于解析、输出和色差计算。

## 安装

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
```

## Lab 方法

### toLab()

返回 Lab 对象。

- `l`：亮度（0–100）
- `a`：绿红轴（约 -128 到 127）
- `b`：蓝黄轴（约 -128 到 127）

```ts
xcolor('#ff0000').toLab()
// { l: 53.24, a: 80.09, b: 67.2 }
```

### toLabString()

返回 `lab()` 格式字符串。

```ts
xcolor('#ff0000').toLabString()
// 'lab(53.24% 80.09 67.2)'
```

## LCH 方法

### toLch()

返回 LCH 对象。LCH 是 Lab 的极坐标形式。

- `l`：亮度（0–100）
- `c`：彩度
- `h`：色相（0–360）

```ts
xcolor('#ff0000').toLch()
// { l: 53.24, c: 104.55, h: 40 }
```

### toLchString()

返回 `lch()` 格式字符串。

```ts
xcolor('#ff0000').toLchString()
// 'lch(53.24% 104.55 40)'
```

## 色差

### deltaE(other)

计算当前颜色与另一个颜色的 CIE76 色差（欧氏距离）。值越小越接近。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `other` | `XColorInput` | 比较目标颜色 |

```ts
xcolor('#ff0000').deltaE('#ff0100')  // 0.07（几乎相同）
xcolor('#ff0000').deltaE('#0000ff')  // ≈ 176（差异巨大）
```

::: tip 色差参考

| ΔE 范围 | 感知差异 |
| --- | --- |
| 0–1 | 几乎不可察觉 |
| 1–2 | 仔细观察可区分 |
| 2–10 | 一眼可见 |
| 11–49 | 相似色 |
| 50+ | 完全不同 |
:::

## 输入解析

```ts
xcolor('lab(53.24 80.09 67.2)').toHex()   // '#ff0000'
xcolor('lch(53.24 104.55 40)').toHex()   // '#ff0000'
```

## 格式化

```ts
xcolor('#ff0000').toString('lab')  // 'lab(53.24% 80.09 67.2)'
xcolor('#ff0000').toString('lch')  // 'lch(53.24% 104.55 40)'
```
