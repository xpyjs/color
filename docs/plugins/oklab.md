# oklab / oklch

Oklab 和 Oklch 现代感知色彩空间支持。Oklab 是 Lab 的改进版，在感知均匀性方面表现更好，尤其适合渐变和色彩插值。

## 安装

```ts
import xcolor from '@xpyjs/color'
import oklabPlugin from '@xpyjs/color/plugins/oklab'

xcolor.use(oklabPlugin)
```

## Oklab 方法

### toOklab()

返回 Oklab 对象。

- `l`：亮度（0–1）
- `a`：绿红轴（约 -0.4 到 0.4）
- `b`：蓝黄轴（约 -0.4 到 0.4）

```ts
xcolor('#ff0000').toOklab()
// { l: 0.63, a: 0.22, b: 0.13 }
```

### toOklabString()

返回 `oklab()` 格式字符串。

```ts
xcolor('#ff0000').toOklabString()
// 'oklab(0.63 0.22 0.13)'
```

## Oklch 方法

### toOklch()

返回 Oklch 对象（Oklab 的极坐标形式）。

- `l`：亮度（0–1）
- `c`：彩度
- `h`：色相（0–360）

```ts
xcolor('#ff0000').toOklch()
// { l: 0.63, c: 0.26, h: 29.23 }
```

### toOklchString()

返回 `oklch()` 格式字符串。

```ts
xcolor('#ff0000').toOklchString()
// 'oklch(0.63 0.26 29.23)'
```

## 输入解析

```ts
xcolor('oklab(0.63 0.22 0.13)').toHex()
xcolor('oklch(0.63 0.26 29.23)').toHex()
```

## 格式化

```ts
xcolor('#ff0000').toString('oklab')  // 'oklab(0.63 0.22 0.13)'
xcolor('#ff0000').toString('oklch')  // 'oklch(0.63 0.26 29.23)'
```
