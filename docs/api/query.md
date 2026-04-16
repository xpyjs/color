# 颜色查询

查询方法只读取信息，不修改实例。

## isLight() {#isLight}

判断颜色是否为浅色（感知亮度 > 128）。

**返回值**：`boolean`

```ts
xcolor('#ffffff').isLight()  // true
xcolor('#000000').isLight()  // false
xcolor('#ff0000').isLight()  // false
```

## isDark() {#isDark}

判断颜色是否为深色。与 `isLight()` 互斥。

**返回值**：`boolean`

```ts
xcolor('#000000').isDark()  // true
xcolor('#ffffff').isDark()  // false
```

## isValid() {#isValid}

判断创建时的输入是否为有效颜色。

**返回值**：`boolean`

```ts
xcolor('#ff0000').isValid()  // true
xcolor('rgb(255,0,0)').isValid()  // true
xcolor('not-a-color').isValid()   // false
xcolor().isValid()                // false
```

::: info
无效输入不会抛错，实例会正常创建为黑色（`#000000`），仅 `isValid()` 返回 `false`。
:::

## brightness() {#brightness}

计算感知亮度（0–255），基于 W3C 加权公式：

$$
\text{brightness} = \frac{R \times 299 + G \times 587 + B \times 114}{1000}
$$

**返回值**：`number`（0–255）

```ts
xcolor('#ffffff').brightness()  // 255
xcolor('#000000').brightness()  // 0
xcolor('#ff0000').brightness()  // 76.245
```

## luminance() {#luminance}

计算相对亮度（0–1），基于 WCAG 2.0 规范。

**返回值**：`number`（0–1）

```ts
xcolor('#ffffff').luminance()  // 1
xcolor('#000000').luminance()  // 0
xcolor('#ff0000').luminance()  // 0.21
```

## contrast(other) {#contrast}

计算与另一个颜色的 WCAG 对比度（1–21）。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `other` | `XColorInput` | 对比目标颜色 |

**返回值**：`number`（1–21）

```ts
xcolor('#000000').contrast('#ffffff')  // 21
xcolor('#ff0000').contrast('#ffffff')  // 4（约）
```

::: tip WCAG 对比度标准

- **AA 正文**：≥ 4.5
- **AA 大字**：≥ 3
- **AAA 正文**：≥ 7
- **AAA 大字**：≥ 4.5

使用 [a11y 插件](/plugins/a11y) 可以直接判断 `isReadable()` 并在多个候选色中选择 `mostReadable()`。
:::

## equals(other) {#equals}

判断两个颜色是否相同（基于 RGBA 值）。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `other` | `XColorInput` | 比较目标 |

**返回值**：`boolean`

```ts
xcolor('#ff0000').equals('rgb(255, 0, 0)')  // true
xcolor('#ff0000').equals('#ff0001')         // false
```
