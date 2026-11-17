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

### 感知比较、排序与去重

`colorDifference(a, b, { metric? })` 默认使用 CIEDE2000（D50，kL/kC/kH 均为 1）；也支持 `cie76` 和未乘 100 的 `oklab` 欧氏距离。全精度计算，不先裁剪到 sRGB。旧 lab 插件的 `.deltaE()` 保持原行为。

```ts
import { parseCssColor, colorDifference, isColorSimilar, sortColors, deduplicateColors } from '@xpyjs/color/plugins/colorSpace'
const colors = ['red', '#ff0100', 'blue'].map(value => parseCssColor(value)!)
colorDifference(colors[0], colors[1]) // CIEDE2000 距离
isColorSimilar(colors[0], colors[1], { tolerance: 2 }) // 包含阈值边界
deduplicateColors(colors) // 顺序保留首个代表色
sortColors(colors, { by: 'distance', reference: colors[0] }) // 按到参考色的距离排序
```

坐标距离忽略 alpha，不代表透明色合成后的外观差异。`isColorSimilar` / `deduplicateColors` 同时要求 alpha 差值不超过 `alphaTolerance`（默认 0，范围 0–1）；距离 `tolerance` 默认 CIE 指标为 2、OKLab 为 .02，可设置任意非负有限值，均含等于。缺失通道在比较时按零处理。

`sortColors` 默认按 OKLCh lightness 升序，也可按 chroma、hue 或到 reference 的 distance 排序；`descending` 反转主键，相同键保留输入顺序。无彩色的数值色相采用转换结果 0。输出保留原空间，记录与数组独立。去重逐一比较已保留代表色，最坏 O(n²)；容差相似关系不传递，调整输入顺序可能改变代表色，不是聚类算法。

CIEDE2000 以 [Sharma/Wu/Dalal 参考数据](https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/) 的 34 组向量验证，包括中性色及 180° 色相边界。

### 多色标渐变

`createColorGradient(stops, options?)` 创建输入快照，默认在 OKLab 插值，不修改输入。每个色标为 `{ color: record, position?: number }`，数量 2–10000；`at(value)` 按数据域采样，`colors(count = 5)` 均匀采样并包含域端点。

```ts
import { createColorGradient, parseCssColor, formatColorSpace } from '@xpyjs/color/plugins/colorSpace'
const gradient = createColorGradient(['red', 'gold', 'blue'].map(value => ({ color: parseCssColor(value)! })), { space: 'oklch', hue: 'shorter', domain: [0, 100] })
formatColorSpace(gradient.at(50)) // 中间色标
gradient.colors(7) // 七个独立颜色记录
```

`position` 使用 0–1 标度，必须非递减；省略的首末位置默认为 0/1，其余按相邻锚点均分。重复位置形成突变，同位置取最后一个色标；首末色标之外延用端点颜色。`domain` 为有限递增数对，默认 `[0,1]`，域外采样夹到端点。`colors` 数量为 2–10000 的整数，无效参数抛错。

支持所有记录空间，包括 Lab/LCH/OKLCh 和广色域 RGB；输出保留指定空间，不自动裁剪。`hue` 可选 shorter/longer/increasing/decreasing，仅柱坐标接受显式策略。使用 alpha 预乘及缺失通道补全，输入和返回记录互不共享可变数组。已有实例 `.scale()` 保持原有两色 API；该接口不是 CSS 渐变字符串解析器。

### CSS 表达式和显式上下文

`resolveCssColor(input, context?)` 支持字面量、双颜色 `color-mix(in space, color percentage?, color percentage?)`、相对 RGB/HSL/HWB/Lab/LCH/OKLab/OKLCh/`color()`。返回未裁剪的记录，无效或无法解析返回 null，不需要注册插件。

```ts
import { resolveCssColor, fromColorSpace } from '@xpyjs/color/plugins/colorSpace'
const mixed = resolveCssColor('color-mix(in srgb, var(--brand), currentColor)', { variables: { '--brand': 'red' }, currentColor: 'blue' })!
fromColorSpace(mixed).toHex() // '#800080'
resolveCssColor('oklch(from red calc(l * .8) c h)') // 保留空间坐标
```

混色默认各 50%；单个省略权重补足 100%；权重总和不足 100% 会降低 alpha，总和超过 100% 则归一化。按 alpha 预乘，柱坐标色相不预乘；支持 shorter（默认）、longer、increasing、decreasing hue，仅柱坐标可指定色相路径。缺失通道按对应分量/集合传递与补全，双方均缺失时保留 none，无彩色色相不影响彩色端。

相对颜色的通道关键词使用目标空间标度；rgb 的 r/g/b 为 0–255，`color(... srgb ...)` 为 0–1。省略 alpha 继承源值，显式 alpha 限制到 0–1，颜色坐标不提前裁剪。`calc()` 子集支持有限数字、通道关键词、`+ - * /` 和括号，不执行 JavaScript；不支持 calc 内百分比/单位、其他数学函数。

上下文只解析**整种颜色**的 `var(--name[, fallback])` 和 currentColor；变量名区分大小写，可传字符串或记录。不读取 DOM，不替换通道内部变量。限制为 16384 字符、32 层嵌套、256 次颜色解析，calc 最多 256 token；循环、溢出和除零返回 null。暂不支持多于两个混色参数、权重在颜色前、CSS 注释/转义、自定义 profile、系统颜色、light-dark 和 contrast-color。这里是有明确语法范围的表达式求值器，不宣称完整 CSS Color 5 实现。

### 严格 CSS 字面量与缺失通道

`parseCssColor(input, { syntax: 'strict' })` 默认严格检查完整字面量：Hex、所有 CSS 命名色、transparent、RGB/HSL/HWB、Lab/LCH/OKLab/OKLCh 和上列预定义 `color()` 空间。它不依赖全局插件注册。现代语法允许 `none`，逗号语法仅允许 RGB/HSL，并检查 RGB 的数字/百分比一致性。

```ts
import { parseCssColor, formatColorSpace, convertColorSpace } from '@xpyjs/color/plugins/colorSpace'
const missing = parseCssColor('oklch(.6 .2 none / none)')!
formatColorSpace(missing) // 'oklch(0.6 0.2 none / none)'
convertColorSpace(missing, 'srgb').alpha // 0（普通转换，不是插值）
```

可选 `missing` 是三个坐标和 alpha 的四个布尔标记，数值占位为 0。序列化保留 `none`；普通转换将缺失通道解析为 0 并移除标记。插值补全不能用普通转换代替，将由渐变 API 负责。`parseColorSpace` 同样保留显式 `none`。参见 [CSS Color 4 缺失通道](https://www.w3.org/TR/css-color-4/#missing)。

`syntax: 'loose'` 在严格解析失败后尝试已有库语法（例如 HSV）。注册 colorSpace 插件额外接通 `color(srgb-linear …)` 和 `none` 字符串，其余字符串仍由已有解析器处理。实例工厂和 setter 在 Lab/OKLab 亮度端点输出黑/白，纯坐标转换仍保留数学结果。

这是字面量解析器，不是完整 CSS 样式解析器：CSS 注释/转义、数学函数、相对颜色、color-mix、自定义 profile、currentColor、var() 和系统颜色返回 null。上下文与表达式另由表达式 API 处理，不推测环境值。

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
