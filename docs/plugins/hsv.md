# HSV 插件

HSV 输入、value/v、hsv 和 toHsv 系列方法需要注册插件。rgbToHsv、hsvToRgb 从插件入口导入。此项为核心 API 的兼容性变化。

```ts
import xcolor from '@xpyjs/color'
import hsvPlugin from '@xpyjs/color/plugins/hsv'
xcolor.use(hsvPlugin)
const color = xcolor('hsv(120, 100%, 100%)')
color.toHex() // '#00ff00'
color.value(50).toHsv() // { h: 120, s: 100, v: 50.2, a: 1 }
```

`hsv(h, s, v, a?)` · `value(value?)` · `v(value?)` · `toHsv()` · `toHsvArray()` · `toHsvString()` · `toString('hsv')`
