# 静态方法

挂载在 `xcolor` 工厂函数上的方法。

## xcolor.use(plugin, option?) {#use}

注册插件。同名插件只安装一次。

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
xcolor.use(labPlugin, { /* 选项 */ })
```

别名：`xcolor.extend()`

## xcolor.isColor(value) {#isColor}

判断一个值是否是 `XColor` 实例。

别名：`xcolor.is()`

**返回值**：`boolean`

```ts
xcolor.isColor(xcolor('#ff0000'))  // true
xcolor.isColor('#ff0000')         // false
xcolor.isColor(null)              // false
```

## xcolor.random() {#random}

生成一个随机颜色。

**返回值**：`XColor` 实例

```ts
xcolor.random().toHex()  // '#a3c74f'（每次不同）
```

## xcolor.config(options?) {#config}

获取或设置全局默认配置。不传参返回当前配置，传参则合并更新。

```ts
// 读取当前全局配置
xcolor.config()  // { useDecimal: false }

// 设置全局默认使用小数模式
xcolor.config({ useDecimal: true })

// 之后创建的实例默认使用小数
xcolor({ r: 1, g: 0, b: 0 }).toHex()  // '#ff0000'
```

### 配置项

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `useDecimal` | `boolean` | `false` | RGB 通道使用 0–1 范围而非 0–255 |

::: tip
单个实例的 `options` 参数优先于全局配置。
:::
