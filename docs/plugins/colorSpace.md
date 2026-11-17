# colorSpace - 保留原空间的颜色计算

此模块提供独立于 `XColor` 的 `{ space, coordinates, alpha }` 记录。转换不经过 sRGB 裁剪，不修改输入，也不按输出格式提前舍入。现有广色域插件的 `parseWideColor()` 结果可以直接传入。

```ts
import { parseColorSpace, convertColorSpace, inGamut, mapToGamut, formatColorSpace } from '@xpyjs/color/plugins/colorSpace'
const source = parseColorSpace('color(display-p3 1 0 0 / .5)')!
const lab = convertColorSpace(source, 'oklab')
inGamut(source, 'srgb') // false
formatColorSpace(mapToGamut(source, 'srgb', 'oklch-chroma'))
```

## 支持的空间

`srgb`、`srgb-linear`、`display-p3`、`a98-rgb`、`prophoto-rgb`、`rec2020`、`xyz`（D65 别名）、`xyz-d65`、`xyz-d50`、`lab`、`lch`、`oklab`、`oklch`。

RGB 坐标使用 0–1 标度，但记录和转换允许负值及超范围值。XYZ 使用相对亮度标度。Lab/LCH 使用 D50 和 0–100 亮度；OKLab/OKLCh 使用 0–1 亮度；柱坐标色相为度数。alpha 必须是 0–1 的有限数值。

## 精度与旧 API

记录保留完整计算精度，新增的 `hsl` / `hsv` 空间使用角度和 0–100 百分比标度。`toColorSpace()` 保留实例实际存储的 alpha，不经过旧 `toRgb()` 的两位舍入。创建实例时已经丢掉的小数不能恢复，RGB 小数输入仍应启用 `useDecimal`。

```ts
const record = xcolor('#010203').toColorSpace('hsl')
formatColorSpace(record) // 完整精度，往返可保留暗色细节
formatColorSpace(record, { precision: 4 }) // 仅输出时统一舍入坐标和 alpha
```

`precision` 为 `'full'`（默认）或 0–15 的整数，不改变原记录；主动降低精度可能改变颜色或使极小 alpha 变为 0。旧 `toRgb()` / `toHslString()` 等默认输出保持兼容；需要保真数据请使用记录接口。`hsv()` 为库内记法，不是 CSS 标准函数。

## API

| 方法 | 行为 |
| --- | --- |
| `parseColorSpace(string)` | 保留原空间坐标；无法解析返回 null。普通 Hex/RGB/HSL 等由当前核心解析器解析为 sRGB 记录 |
| `convertColorSpace(record, space)` | 无裁剪、无舍入转换，返回独立记录，保留 alpha |
| `formatColorSpace(record)` | 直接输出原空间 CSS 函数，不进行色域映射 |
| `inGamut(record, rgbSpace = 'srgb', epsilon = 1e-7)` | 判断指定 RGB 色域是否容纳颜色，不改变数据 |
| `mapToGamut(record, rgbSpace = 'srgb', method = 'clip')` | 显式映射到目标 RGB 色域 |

`clip` 逐通道裁剪。`oklch-chroma` 固定 OKLCh 亮度/色相，二分降低色度，端点映射为黑/白；它不是 CSS Local MINDE 算法。转换存在浮点误差，跨空间往返不保证逐位相等。Rec.2020 沿用本库既有的 alpha/beta 分段传递曲线，不在此新增接口中切换曲线定义。

记录验证失败、未知空间或计算溢出会抛错。直接转换保留超范围坐标，仅 `mapToGamut` 做显示色域映射。

## 与 XColor 连接

注册插件后可以直接传入带标识的记录，并通过 `colorSpace()` getter/setter 读取或替换颜色。HWB 记录也已支持，坐标顺序为 `[h, w, b]`；不要把无标识的 Lab/HWB 对象直接交给 RGB 猜测解析。

```ts
xcolor.use(colorSpace)
const record = { space: 'hwb' as const, coordinates: [0, 0, 0] as const, alpha: .5 }
xcolor(record).colorSpace(record).toHex() // '#ff000080'
```

不注册插件时可使用命名导出 `fromColorSpace(record, options?)`。创建/修改 `XColor` 时会显式进入 sRGB 并裁剪；需要保持广色域时继续使用记录纯函数。setter 保留当前实例精度选项，验证失败不修改原实例。

类型现在与解析器一致：HSL/HSV 必须给齐三个通道，CMYK 必须给齐四个墨色通道，RGB 至少需要 r/g/b 之一；alpha 可选。原先仅因 Partial 类型而通过编译的无效对象现在会报类型错误。

纯函数无需注册插件。需要从已有实例导出记录时：

```ts
import xcolor from '@xpyjs/color'
import colorSpace from '@xpyjs/color/plugins/colorSpace'
xcolor.use(colorSpace)
xcolor('#f00').toColorSpace('lab')
```

已有实例先前被裁剪的坐标无法恢复；广色域输入应从 `parseColorSpace` 开始。此接口不改变旧 `lab` 插件的默认 D65 行为，新记录中的 `lab`/`lch` 始终使用 D50。基于记录的渐变、色差和高层操作将分别扩展；现有实例操作仍是 sRGB 操作。
