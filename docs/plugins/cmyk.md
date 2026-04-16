# cmyk

CMYK 印刷色彩空间支持。提供 CMYK 输出方法、字符串格式注册，以及 CMYK 输入解析。

## 安装

```ts
import xcolor from '@xpyjs/color'
import cmykPlugin from '@xpyjs/color/plugins/cmyk'

xcolor.use(cmykPlugin)
```

## 方法

### toCmyk()

返回 CMYK 对象。各通道值 0–100。

```ts
xcolor('#ff0000').toCmyk()
// { c: 0, m: 100, y: 100, k: 0 }

xcolor('#336699').toCmyk()
// { c: 67, m: 33, y: 0, k: 40 }
```

### toCmykString()

返回 `cmyk()` 格式字符串。

```ts
xcolor('#ff0000').toCmykString()
// 'cmyk(0%, 100%, 100%, 0%)'
```

## 输入解析

注册后可以用 CMYK 对象或字符串创建颜色：

```ts
// 对象输入
xcolor({ c: 0, m: 100, y: 100, k: 0 }).toHex()  // '#ff0000'

// 字符串输入
xcolor('cmyk(0%, 100%, 100%, 0%)').toHex()  // '#ff0000'
```

## 格式化

```ts
xcolor('#ff0000').toString('cmyk')  // 'cmyk(0%, 100%, 100%, 0%)'
xcolor('#ff0000').format('cmyk')    // 同上
```
