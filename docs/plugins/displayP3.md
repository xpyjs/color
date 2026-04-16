# displayP3

Display P3 广色域色彩空间支持。P3 是 Apple 设备和现代显示器广泛支持的色域，比 sRGB 大约 25%。

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
// { r: 0.92, g: 0.20, b: 0.14 }
```

### toDisplayP3String()

返回 `color(display-p3 ...)` 格式字符串。

```ts
xcolor('#ff0000').toDisplayP3String()
// 'color(display-p3 0.92 0.20 0.14)'
```

## 输入解析

```ts
xcolor('color(display-p3 0.92 0.20 0.14)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('displayP3')  // 'color(display-p3 0.92 0.20 0.14)'
```
