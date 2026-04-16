# simulate - 色觉模拟

模拟不同类型的色觉障碍，帮助设计师验证界面在色觉异常用户眼中的表现。

## 安装

```ts
import xcolor from '@xpyjs/color'
import simulatePlugin from '@xpyjs/color/plugins/simulate'

xcolor.use(simulatePlugin)
```

## 方法

<SvgColorBlindness />

### simulate(mode)

模拟指定类型的色觉障碍。**原地修改**实例。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `mode` | `SimulateMode` | 模拟类型 |

**返回值**：`this`

## 模拟类型

| 模式 | 说明 | 影响人群 |
| --- | --- | --- |
| `'protanopia'` | 红色盲（L 锥体缺失）| 约 1% 男性 |
| `'deuteranopia'` | 绿色盲（M 锥体缺失）| 约 1% 男性 |
| `'tritanopia'` | 蓝色盲（S 锥体缺失）| 极少数 |
| `'grayscale'` | 全色盲 | — |

```ts
xcolor('#ff0000').clone().simulate('protanopia').toHex()
// 红色盲者看到的"红色"

xcolor('#00ff00').clone().simulate('deuteranopia').toHex()
// 绿色盲者看到的"绿色"

xcolor('#ff0000').clone().simulate('grayscale').toHex()
// 灰度视觉
```

## 实际场景

### 检查配色方案的无障碍性

```ts
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
const modes = ['protanopia', 'deuteranopia', 'tritanopia'] as const

modes.forEach(mode => {
  const simulated = colors.map(c =>
    xcolor(c).clone().simulate(mode).toHex()
  )
  console.log(`${mode}:`, simulated)
  // 如果模拟后多个颜色变得相似，说明这些颜色对该类色觉障碍者难以区分
})
```

::: tip
结合 [a11y 插件](/plugins/a11y) 同时检查对比度和色觉可访问性。
:::
