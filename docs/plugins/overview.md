# 插件概览

xcolor 的核心库覆盖 RGB、HSL、HSV 和 Hex 格式。更多色彩空间和功能通过插件按需加载。

## 安装方式

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
```

详细说明请参考 [插件系统](/guide/plugins)。

## 按任务选择插件

- 生成色板与主题 · [harmony](/plugins/harmony), [gradient](/plugins/gradient), [scale](/plugins/scale), [palette](/plugins/palette), [theme](/plugins/theme)
- 比较、合成与模拟 · [a11y](/plugins/a11y), [blend](/plugins/blend), [simulate](/plugins/simulate), [lab](/plugins/lab)
- 查找名称与处理色温 · [name](/plugins/name), [temperature](/plugins/temperature)
- 转换与格式化颜色 · [hwb](/plugins/hwb), [cmyk](/plugins/cmyk), [oklab](/plugins/oklab), [xyz](/plugins/xyz), [displayP3](/plugins/displayP3), [a98Rgb](/plugins/a98Rgb), [proPhotoRgb](/plugins/proPhotoRgb), [rec2020](/plugins/rec2020), [percentageRgb](/plugins/percentageRgb)
