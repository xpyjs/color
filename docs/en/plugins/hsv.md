# HSV plugin

Register this plugin for HSV inputs, value/v, hsv and the toHsv methods. Import rgbToHsv and hsvToRgb from the plugin entry. This is a breaking change to the core API.

```ts
import xcolor from '@xpyjs/color'
import hsvPlugin from '@xpyjs/color/plugins/hsv'
xcolor.use(hsvPlugin)
const color = xcolor('hsv(120, 100%, 100%)')
color.toHex() // '#00ff00'
color.value(50).toHsv() // { h: 120, s: 100, v: 50.2, a: 1 }
```

`hsv(h, s, v, a?)` · `value(value?)` · `v(value?)` · `toHsv()` · `toHsvArray()` · `toHsvString()` · `toString('hsv')`
