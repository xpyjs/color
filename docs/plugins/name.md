# name - 颜色命名

CSS 颜色名称支持。覆盖 CSS Color Level 4 规范中的全部 148 种命名颜色，以及 `transparent`。

[跳到全部颜色速查](#named-colors)

## 安装

```ts
import xcolor from '@xpyjs/color'
import namePlugin from '@xpyjs/color/plugins/name'

xcolor.use(namePlugin)
```

## 方法

### toName()

如果颜色精确匹配某个 CSS 颜色名称，返回该名称；否则返回 `undefined`。

**返回值**：`string | undefined`

```ts
xcolor('#ff0000').toName()   // 'red'
xcolor('#ffa500').toName()   // 'orange'
xcolor('#ff0001').toName()   // undefined（不精确匹配）
```

### closestName()

返回最接近的 CSS 颜色名称（即使不精确匹配）。

**返回值**：`string`

```ts
xcolor('#ff0001').closestName()  // 'red'
xcolor('#123456').closestName()  // 最接近的 CSS 命名色
```

## 输入解析

注册后可以用 CSS 颜色名称创建颜色：

```ts
xcolor('red').toHex()          // '#ff0000'
xcolor('dodgerblue').toHex()   // '#1e90ff'
xcolor('coral').toRgb()        // { r: 255, g: 127, b: 80, a: 1 }
xcolor('transparent').alpha()  // 0
```

## 格式化

```ts
xcolor('#ff0000').toString('name')  // 'red'
xcolor('#ff0001').toString('name')  // 回退到 hex（无精确匹配）
```

## 全部命名颜色 {#named-colors}

以下列出 CSS Color Level 4 的全部 148 个命名颜色，以及特殊值 `transparent`。色块展示对应颜色，卡片中同时显示名称和 hex 值；**点击任意卡片会复制对应的 `name` 字段**，可直接用于 `xcolor('...')`。

<NamedColors />

### NAMED_COLORS

插件同时导出名称到 hex 的完整映射，便于自行渲染选择器或做数据校验：

```ts
import { NAMED_COLORS } from '@xpyjs/color/plugins/name'

NAMED_COLORS.red      // '#ff0000'
NAMED_COLORS.coral    // '#ff7f50'
NAMED_COLORS.transparent // '#00000000'
```
