# xyz

CIE XYZ 色彩空间支持。XYZ 是所有 CIE 色彩空间的基础，也是不同色彩空间转换的中间桥梁。

## 安装

```ts
import xcolor from '@xpyjs/color'
import xyzPlugin from '@xpyjs/color/plugins/xyz'

xcolor.use(xyzPlugin)
```

## 方法

### toXyz(illuminant?)

返回 XYZ 对象。默认使用 D65 光源。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `illuminant` | `'D65'` \| `'D50'` | `'D65'` | 参考光源 |

```ts
xcolor('#ff0000').toXyz()
// { x: 0.4124, y: 0.2126, z: 0.0193 }

xcolor('#ff0000').toXyz('D50')
// D50 光源下的 XYZ 值
```

### toXyzString(illuminant?)

返回 `color(xyz ...)` 格式字符串。

```ts
xcolor('#ff0000').toXyzString()
// 'color(xyz 0.4124 0.2126 0.0193)'
```

## 输入解析

```ts
xcolor('color(xyz 0.4124 0.2126 0.0193)').toHex()
xcolor('color(xyz-d65 0.4124 0.2126 0.0193)').toHex()
xcolor('color(xyz-d50 0.4360 0.2225 0.0139)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('xyz')  // 'color(xyz 0.4124 0.2126 0.0193)'
```
