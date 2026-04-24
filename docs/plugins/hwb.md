# hwb

HWB (Hue-Whiteness-Blackness) 色彩空间支持。HWB 是 CSS Color Level 4 规范中的色彩空间，对人类直觉友好——通过"加白"和"加黑"来调整颜色。

## 安装

```ts
import xcolor from '@xpyjs/color'
import hwbPlugin from '@xpyjs/color/plugins/hwb'

xcolor.use(hwbPlugin)
```

<SvgHwbModel />

## 方法

### toHwb()

返回 HWB 对象。

- `h`：色相（0–360）
- `w`：白度（0–100）
- `b`：黑度（0–100）

```ts
xcolor('#ff0000').toHwb()
// { h: 0, w: 0, b: 0 }

xcolor('#ff8080').toHwb()
// { h: 0, w: 50, b: 0 }
```

### toHwbString()

返回 `hwb()` 格式字符串。

```ts
xcolor('#ff0000').toHwbString()
// 'hwb(0 0% 0%)'
```

## 输入解析

```ts
xcolor('hwb(0 0% 0%)').toHex()      // '#ff0000'
xcolor('hwb(120 20% 10%)').toHex()   // 绿色调
```

## 格式化

```ts
xcolor('#ff0000').toString('hwb')  // 'hwb(0 0% 0%)'
```
