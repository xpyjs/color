# a98Rgb

Adobe RGB (1998) 广色域色彩空间支持。常用于印刷和摄影工作流。

输入会转换为 sRGB 并裁剪到其色域。超出 sRGB 的颜色在往返转换时会丢失信息。

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
// { r: 0.8586, g: 0, b: 0 }
```

### toA98RgbString()

返回 `color(a98-rgb ...)` 格式字符串。

```ts
xcolor('#ff0000').toA98RgbString()
// 'color(a98-rgb 0.8586 0 0)'
```

## 输入解析

```ts
xcolor('color(a98-rgb 0.86 0 0)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('a98Rgb')  // 'color(a98-rgb 0.8586 0 0)'
```

## 保留原始坐标

需要保留广色域坐标时，使用插件的命名导出。`parseWideColor(input)` 返回 `{ space, coordinates, alpha }` 或 `null`。`formatWideColor(record)` 直接序列化记录，`toSrgb(record)` 显式转换并裁剪到 sRGB。调用这些函数无需注册插件。
