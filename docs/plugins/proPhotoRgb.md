# proPhotoRgb

ProPhoto RGB 广色域色彩空间支持。ProPhoto RGB 拥有极大的色域范围，覆盖了人眼可见色彩的约 90%，广泛用于专业摄影后期处理。

输入会转换为 sRGB 并裁剪到其色域。超出 sRGB 的颜色在往返转换时会丢失信息。

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
// { r: 0.7022, g: 0.2757, b: 0.1036 }
```

### toProPhotoRgbString()

返回 `color(prophoto-rgb ...)` 格式字符串。

```ts
xcolor('#ff0000').toProPhotoRgbString()
// 'color(prophoto-rgb 0.7022 0.2757 0.1036)'
```

## 输入解析

```ts
xcolor('color(prophoto-rgb 0.70 0.28 0.10)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('proPhotoRgb')  // 'color(prophoto-rgb 0.7022 0.2757 0.1036)'
```

## 保留原始坐标

需要保留广色域坐标时，使用插件的命名导出。`parseWideColor(input)` 返回 `{ space, coordinates, alpha }` 或 `null`。`formatWideColor(record)` 直接序列化记录，`toSrgb(record)` 显式转换并裁剪到 sRGB。调用这些函数无需注册插件。
