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
xcolor('#ff0000').toLab()     // { l: 53.23, a: 80.11, b: 67.22 }
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
重复注册同一个插件不会报错，但也不会重复安装——同名插件只会注册一次。
:::

## 带选项的插件

部分插件支持配置选项，在 `use()` 时传入第二个参数：

```ts
xcolor.use(somePlugin, { /* 选项 */ })
```

## 官方插件

### 色彩空间

扩展颜色的输入解析和输出格式：

| 插件 | 说明 |
| --- | --- |
| [cmyk](/plugins/cmyk) | CMYK 印刷色彩空间 |
| [lab](/plugins/lab) | CIE Lab / LCH 感知色彩空间 |
| [hwb](/plugins/hwb) | HWB 色彩空间 |
| [oklab](/plugins/oklab) | Oklab / Oklch 现代感知色彩空间 |
| [a98Rgb](/plugins/a98Rgb) | Adobe RGB (1998) 广色域 |
| [displayP3](/plugins/displayP3) | Display P3 广色域 |
| [proPhotoRgb](/plugins/proPhotoRgb) | ProPhoto RGB 广色域 |
| [rec2020](/plugins/rec2020) | Rec. 2020 广色域 |
| [xyz](/plugins/xyz) | CIE XYZ (D65/D50) |
| [name](/plugins/name) | CSS 颜色名称（148 种）|

### 功能扩展

为颜色实例添加新的操作和查询能力：

| 插件 | 说明 |
| --- | --- |
| [a11y](/plugins/a11y) | 无障碍（对比度、可读性判断）|
| [blend](/plugins/blend) | 11 种图层混合模式 |
| [gradient](/plugins/gradient) | 渐变色序列生成 |
| [harmony](/plugins/harmony) | 配色方案（互补、三色、四色等）|
| [name](/plugins/name) | CSS 颜色名称（148 种）|
| [palette](/plugins/palette) | 色阶面板生成 |
| [percentageRgb](/plugins/percentageRgb) | 百分比 RGB 输出 |
| [scale](/plugins/scale) | 色彩空间插值与缓动 |
| [simulate](/plugins/simulate) | 色觉障碍模拟 |
| [temperature](/plugins/temperature) | 色温读取与设置 |
| [theme](/plugins/theme) | 主题色生成与 CSS 变量注入 |

## 开发自定义插件

xcolor 的插件接口完全开放，你可以创建自己的插件来扩展实例方法、注册新的解析器或输出格式。详见 [自定义插件开发](/guide/custom-plugin)。
