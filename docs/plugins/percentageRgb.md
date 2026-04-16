# percentageRgb

百分比 RGB 输出支持。将 RGB 通道以百分比形式表示。

## 安装

```ts
import xcolor from '@xpyjs/color'
import percentageRgbPlugin from '@xpyjs/color/plugins/percentageRgb'

xcolor.use(percentageRgbPlugin)
```

## 方法

### toPercentageRgb()

返回百分比形式的 RGB 对象。

```ts
xcolor('#ff8000').toPercentageRgb()
// { r: '100%', g: '50%', b: '0%', a: 1 }
```

### toPercentageRgbString()

返回 `rgb()` / `rgba()` 格式的百分比字符串。

```ts
xcolor('#ff8000').toPercentageRgbString()
// 'rgb(100%, 50%, 0%)'

xcolor('rgba(255,128,0,0.5)').toPercentageRgbString()
// 'rgba(100%, 50%, 0%, 0.5)'
```

## 格式化

```ts
xcolor('#ff8000').toString('percentageRgb')  // 'rgb(100%, 50%, 0%)'
```
