# displayP3

Display P3 广色域色彩空间支持。P3 是 Apple 设备和现代显示器广泛支持的色域，比 sRGB 大约 25%。

输入会转换为 sRGB 并裁剪到其色域。超出 sRGB 的颜色在往返转换时会丢失信息。

## 安装

```ts
import xcolor from '@xpyjs/color'
import displayP3Plugin from '@xpyjs/color/plugins/displayP3'

xcolor.use(displayP3Plugin)
```

## 方法

### toDisplayP3()

返回 Display P3 对象。各通道值 0–1。

```ts
xcolor('#ff0000').toDisplayP3()
// { r: 0.9175, g: 0.2003, b: 0.1386 }
```

### toDisplayP3String()

返回 `color(display-p3 ...)` 格式字符串。

```ts
xcolor('#ff0000').toDisplayP3String()
// 'color(display-p3 0.9175 0.2003 0.1386)'
```

## 输入解析

```ts
xcolor('color(display-p3 0.92 0.20 0.14)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('displayP3')  // 'color(display-p3 0.9175 0.2003 0.1386)'
```

## 保留原始坐标

需要保留广色域坐标时，使用插件的命名导出。`parseWideColor(input)` 返回 `{ space, coordinates, alpha }` 或 `null`。`formatWideColor(record)` 直接序列化记录，`toSrgb(record)` 显式转换并裁剪到 sRGB。调用这些函数无需注册插件。

```ts
import { parseWideColor, formatWideColor, toSrgb } from '@xpyjs/color/plugins/displayP3'

const color = parseWideColor('color(display-p3 1 .4 0 / .3)')
if (color) {
  console.log(formatWideColor(color)) // color(display-p3 1 0.4 0 / 0.3)
  console.log(toSrgb(color))
}
```
