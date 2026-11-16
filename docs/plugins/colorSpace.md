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

纯函数无需注册插件。需要从已有实例导出记录时：

```ts
import xcolor from '@xpyjs/color'
import colorSpace from '@xpyjs/color/plugins/colorSpace'
xcolor.use(colorSpace)
xcolor('#f00').toColorSpace('lab')
```

已有实例先前被裁剪的坐标无法恢复；广色域输入应从 `parseColorSpace` 开始。此接口不改变旧 `lab` 插件的默认 D65 行为，新记录中的 `lab`/`lch` 始终使用 D50。基于记录的渐变、色差和高层操作将分别扩展；现有实例操作仍是 sRGB 操作。
