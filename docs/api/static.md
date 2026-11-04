# 静态方法

挂载在 `xcolor` 工厂函数上的方法。

## xcolor.use(plugin, option?) {#use}

注册插件。同名插件再次注册时会重新安装，并输出覆盖警告。

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
xcolor.use(labPlugin, { /* 选项 */ })
```

别名：`xcolor.extend()`。返回 `XColor` 类，可继续链式注册插件。

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

## xcolor.config(options) {#config}

设置全局默认配置。传入的对象会整体替换当前全局配置，传 `{}` 可恢复默认值；无参调用不会返回配置。

```ts
// 设置全局默认保留 RGB 小数精度
xcolor.config({ useDecimal: true })

// 之后创建的实例默认保留小数
const c = xcolor('#000000')
c.rgb(127.5, 64.25, 0)
c.rgb()  // { r: 127.5, g: 64.25, b: 0, a: 1 }

// 恢复默认配置
xcolor.config({})
```

### 配置项

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `useDecimal` | `boolean` | `false` | 保留 RGB 通道的小数精度；通道范围仍为 0–255 |

::: tip
单个实例的 `options` 参数优先于全局配置。
:::
