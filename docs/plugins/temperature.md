# temperature - 色温

色温读写支持。色温以开尔文 (K) 表示，范围 1000–40000K。低色温偏暖（橙红），高色温偏冷（蓝白）。

## 安装

```ts
import xcolor from '@xpyjs/color'
import temperaturePlugin from '@xpyjs/color/plugins/temperature'

xcolor.use(temperaturePlugin)
```

## 方法

<SvgTemperatureBar />

### temperature()

getter/setter 模式。不传参返回当前颜色对应的近似色温（K），传参则按色温设置颜色。

#### 读取色温

```ts
xcolor('#ff8000').temperature()   // ≈ 2000（暖光）
xcolor('#ffffff').temperature()   // ≈ 6500（日光）
xcolor('#80b0ff').temperature()   // > 10000（冷光）
```

#### 设置色温

```ts
xcolor('#000000').temperature(2700).toHex()  // 暖白光 ≈ '#ffb46b'
xcolor('#000000').temperature(5500).toHex()  // 日光
xcolor('#000000').temperature(9000).toHex()  // 冷蓝光
```

**返回值**：getter 模式返回 `number`（K），setter 模式返回 `this`。

## 常见色温参考

| 色温 (K) | 光源 |
| --- | --- |
| 1850 | 蜡烛 |
| 2700 | 白炽灯 |
| 4000 | 荧光灯 |
| 5500 | 正午日光 |
| 6500 | 阴天 / D65 标准光源 |
| 9000+ | 蓝天 |

## 实际场景

### 模拟日出到日落

```ts
const daylight = [2000, 3500, 5500, 7000, 4000, 2500]
const palette = daylight.map(k => xcolor('#fff').temperature(k).toHex())
```
