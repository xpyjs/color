# a98Rgb

Adobe RGB (1998) 广色域色彩空间支持。常用于印刷和摄影工作流。

## 安装

```ts
import xcolor from '@xpyjs/color'
import a98RgbPlugin from '@xpyjs/color/plugins/a98Rgb'

xcolor.use(a98RgbPlugin)
```

## 方法

### toA98Rgb()

返回 A98 RGB 对象。各通道值 0–1。

```ts
xcolor('#ff0000').toA98Rgb()
// { r: 0.86, g: 0, b: 0 }
```

### toA98RgbString()

返回 `color(a98-rgb ...)` 格式字符串。

```ts
xcolor('#ff0000').toA98RgbString()
// 'color(a98-rgb 0.86 0 0)'
```

## 输入解析

```ts
xcolor('color(a98-rgb 0.86 0 0)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('a98Rgb')  // 'color(a98-rgb 0.86 0 0)'
```
