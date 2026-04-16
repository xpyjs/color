# proPhotoRgb

ProPhoto RGB 广色域色彩空间支持。ProPhoto RGB 拥有极大的色域范围，覆盖了人眼可见色彩的约 90%，广泛用于专业摄影后期处理。

## 安装

```ts
import xcolor from '@xpyjs/color'
import proPhotoRgbPlugin from '@xpyjs/color/plugins/proPhotoRgb'

xcolor.use(proPhotoRgbPlugin)
```

## 方法

### toProPhotoRgb()

返回 ProPhoto RGB 对象。各通道值 0–1。

```ts
xcolor('#ff0000').toProPhotoRgb()
// { r: 0.70, g: 0.28, b: 0.10 }
```

### toProPhotoRgbString()

返回 `color(prophoto-rgb ...)` 格式字符串。

```ts
xcolor('#ff0000').toProPhotoRgbString()
// 'color(prophoto-rgb 0.70 0.28 0.10)'
```

## 输入解析

```ts
xcolor('color(prophoto-rgb 0.70 0.28 0.10)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('proPhotoRgb')  // 'color(prophoto-rgb 0.70 0.28 0.10)'
```
