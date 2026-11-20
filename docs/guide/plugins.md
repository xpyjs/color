# 插件系统

xcolor 的核心保持精简，高级功能通过插件按需加载。

## 安装插件

所有官方插件从 `@xpyjs/color/plugins/*` 导入，通过 `xcolor.use()` 注册：

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'
import namePlugin from '@xpyjs/color/plugins/name'

xcolor.use(labPlugin)
xcolor.use(namePlugin)
```

注册后，新方法会直接挂载到所有 xcolor 实例上：

```ts
xcolor('#ff0000').toLab()     // { l: 53.24, a: 80.09, b: 67.2 }
xcolor('#ff0000').toName()    // 'red'
```

## 注册时机

`xcolor.use()` 是全局的——注册后，之前和之后创建的所有实例都可以使用插件方法。建议在应用入口统一注册：

```ts
// main.ts / index.ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'
import harmonyPlugin from '@xpyjs/color/plugins/harmony'

xcolor.use(labPlugin)
xcolor.use(harmonyPlugin)

// 然后在任何地方使用
```

::: warning
同名插件再次注册时会重新安装并输出警告。安装成功后会替换旧的解析器和格式化器。
:::

## 带选项的插件

部分插件支持配置选项，在 `use()` 时传入第二个参数：

```ts
xcolor.use(somePlugin, { /* 选项 */ })
```

## 官方插件

### 色彩空间

提供色彩空间转换、颜色输入解析和输出格式。

| 插件 | 说明 |
| --- | --- |
| [cmyk](/plugins/cmyk) | CMYK 印刷色彩空间 |
| [lab](/plugins/lab) | CIE Lab / LCH 感知色彩空间 |
| [hsv](/plugins/hsv) | HSV 输入、通道读写与输出 |
| [hwb](/plugins/hwb) | HWB 色彩空间 |
| [oklab](/plugins/oklab) | Oklab / Oklch 现代感知色彩空间 |
| [a98Rgb](/plugins/a98Rgb) | Adobe RGB (1998) 广色域 |
| [displayP3](/plugins/displayP3) | Display P3 广色域 |
| [proPhotoRgb](/plugins/proPhotoRgb) | ProPhoto RGB 广色域 |
| [rec2020](/plugins/rec2020) | Rec. 2020 广色域 |
| [xyz](/plugins/xyz) | CIE XYZ (D65/D50) |
| [colorSpace](/plugins/colorSpace) | 保留原色彩空间的颜色记录，支持空间转换、色域映射、色差比较和多色标渐变 |
| [name](/plugins/name) | 解析 CSS 命名色并输出匹配的名称 |
| [percentageRgb](/plugins/percentageRgb) | 输出百分比通道的 RGB 字符串 |

### 功能扩展

提供调色、配色、主题生成和可读性检查等功能。

| 插件 | 说明 |
| --- | --- |
| [a11y](/plugins/a11y) | 对比度计算、可读性判断、对比度调整和批量审查 |
| [blend](/plugins/blend) | 图层混合与 Porter–Duff 合成 |
| [gradient](/plugins/gradient) | 渐变色序列与明暗色调生成 |
| [harmony](/plugins/harmony) | 配色方案（互补、三色、四色等）|
| [palette](/plugins/palette) | 从基础色生成色阶面板 |
| [scale](/plugins/scale) | 在指定色彩空间内插值，支持缓动和定点采样 |
| [simulate](/plugins/simulate) | 色觉障碍模拟 |
| [temperature](/plugins/temperature) | 色温读取与设置 |
| [theme](/plugins/theme) | 生成语义色和明暗主题，输出或注入 CSS 变量 |

## 开发自定义插件

xcolor 的插件接口完全开放，你可以创建自己的插件来扩展实例方法、注册新的解析器或输出格式。详见 [自定义插件开发](/guide/custom-plugin)。
