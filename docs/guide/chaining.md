# 链式调用

<SvgChainFlow />

xcolor 的所有操作方法都返回实例自身（`this`），因此可以连续串联多个操作：

```ts
import xcolor from '@xpyjs/color'

const result = xcolor('#ff0000')
  .lighten(10)
  .saturate(20)
  .spin(30)
  .fade(15)
  .toHex()

// 一行完成多步操作，无需中间变量
```

## 可变设计

xcolor 的所有操作方法都**原地修改**实例。这意味着链上的每一步都在同一个对象上操作：

```ts
const color = xcolor('#ff0000')
color.lighten(20)

// color 本身已经改变 — 不是新对象
color.toHex() // '#ff6666'，不再是 '#ff0000'
```

这种设计避免了频繁创建对象，也让链式调用更加自然。

## 用 clone() 保留原色

当你希望基于同一原色产生多个变体时，在操作前调用 `.clone()`：

```ts
const brand = xcolor('#6366f1')

// 生成一组配色，原色不受影响
const light    = brand.clone().lighten(20).toHex()  // '#a5a7f6'
const dark     = brand.clone().darken(20).toHex()   // '#2f3193'
const muted    = brand.clone().desaturate(30).toHex()
const inverted = brand.clone().negate().toHex()

brand.toHex() // '#6366f1' — 始终不变
```

::: tip 经验法则
如果你要从同一个颜色分出多条链，在分叉处 `.clone()`。如果只是顺序处理一个颜色，不需要 clone。
:::

## 读取与操作混用

getter 方法（如 `toHex()`、`luminance()`、`isLight()`）不会修改实例，可以在链的任意位置安全调用，但注意它们返回的不是实例，因此必须放在链的末尾：

```ts
// ✅ getter 放末尾
xcolor('#ff0000').lighten(20).spin(30).toHex()

// ✅ 中间需要读值时，使用独立语句
const color = xcolor('#ff0000').lighten(20)
console.log(color.luminance())  // 读取亮度
color.spin(30)                  // 继续操作
```

## 结合 getter/setter

通道方法（`red()`、`hue()` 等）同时支持 getter 和 setter。setter 模式同样返回实例，可以加入链：

```ts
xcolor('#ff0000')
  .hue(210)       // setter：设置色相为 210°
  .lightness(60)  // setter：设置亮度为 60%
  .alpha(0.8)     // setter：设置透明度
  .toRgbString()  // 'rgba(77, 136, 230, 0.8)'
```

## 实际场景

### 生成按钮状态色

```ts
const base = xcolor('#3b82f6')

const states = {
  default: base.toHex(),
  hover:   base.clone().lighten(8).toHex(),
  active:  base.clone().darken(8).toHex(),
  disabled: base.clone().desaturate(60).lighten(20).toHex()
}
```

### 主题配色

```ts
const primary = xcolor('#6366f1')

const theme = {
  primary:    primary.toHex(),
  onPrimary:  primary.isLight() ? '#000' : '#fff',
  surface:    primary.clone().lighten(40).desaturate(50).toHex(),
  border:     primary.clone().lighten(30).fade(50).toRgbString()
}
```

::: info
链式调用搭配 [插件](/guide/plugins)，能力更强大。例如 `gradient` 插件的 `.gradient()` 和 `harmony` 插件的 `.analogous()` 返回数组，适合在链末尾读取。
:::
