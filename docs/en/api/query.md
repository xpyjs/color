# Color Query

Query methods only read information and do not modify the instance.

## isLight() {#isLight}

Determine whether the color is light (perceived brightness > 128).

**Returns**: `boolean`

```ts
xcolor('#ffffff').isLight()  // true
xcolor('#000000').isLight()  // false
xcolor('#ff0000').isLight()  // false
```

## isDark() {#isDark}

Determine whether the color is dark. Mutually exclusive with `isLight()`.

**Returns**: `boolean`

```ts
xcolor('#000000').isDark()  // true
xcolor('#ffffff').isDark()  // false
```

## isValid() {#isValid}

Determine whether the input at creation time was a valid color.

**Returns**: `boolean`

```ts
xcolor('#ff0000').isValid()  // true
xcolor('rgb(255,0,0)').isValid()  // true
xcolor('not-a-color').isValid()   // false
xcolor().isValid()                // false
```

::: info
Invalid input does not throw an error. The instance is created normally as black (`#000000`), and only `isValid()` returns `false`.
:::

## brightness() {#brightness}

Calculate perceived brightness (0–255), based on the W3C weighted formula:

$$
\text{brightness} = \frac{R \times 299 + G \times 587 + B \times 114}{1000}
$$

**Returns**: `number` (0–255)

```ts
xcolor('#ffffff').brightness()  // 255
xcolor('#000000').brightness()  // 0
xcolor('#ff0000').brightness()  // 76.245
```

## luminance() {#luminance}

Calculate relative luminance (0–1), based on the WCAG 2.0 specification.

**Returns**: `number` (0–1)

```ts
xcolor('#ffffff').luminance()  // 1
xcolor('#000000').luminance()  // 0
xcolor('#ff0000').luminance()  // 0.21
```

## contrast(other) {#contrast}

Calculate the WCAG contrast ratio (1–21) against another color.

| Param | Type | Description |
| --- | --- | --- |
| `other` | `XColorInput` | The target color to compare against |

**Returns**: `number` (1–21)

```ts
xcolor('#000000').contrast('#ffffff')  // 21
xcolor('#ff0000').contrast('#ffffff')  // 4 (approx.)
```

::: tip WCAG Contrast Standards

- **AA body text**: ≥ 4.5
- **AA large text**: ≥ 3
- **AAA body text**: ≥ 7
- **AAA large text**: ≥ 4.5

Use the [a11y plugin](/en/plugins/a11y) to directly check `isReadable()` and select `mostReadable()` among multiple candidate colors.
:::

## equals(other) {#equals}

Determine whether two colors are the same (based on RGBA values).

| Param | Type | Description |
| --- | --- | --- |
| `other` | `XColorInput` | The target to compare against |

**Returns**: `boolean`

```ts
xcolor('#ff0000').equals('rgb(255, 0, 0)')  // true
xcolor('#ff0000').equals('#ff0001')         // false
```
