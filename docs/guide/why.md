# 为什么选择 xcolor

颜色操作是前端开发和设计工具中的常见需求。市面上已有不少颜色库，xcolor 的设计目标是在**体积、API 友好度、可扩展性**之间取得平衡。

## 核心特点

### 极致轻量

核心库约 **15 KB** min / **5 KB** gzip。

### 链式调用 + 可变实例

xcolor 所有操作方法都原地修改实例并返回 `this`，支持流畅的链式写法：

```ts
xcolor('#3498db')
  .saturate(20)
  .spin(45)
  .lighten(10)
  .toHex() // 一行搞定多步操作
```

需要保留原值时使用 `.clone()`。

### Getter / Setter 合一

相比许多库将 get 和 set 分为不同方法或属性，xcolor 用同一个方法名同时承担两个角色：

```ts
color.red()      // → 255           getter
color.red(128)   // → this (链式)    setter
```

短方法也可用：`r()`, `g()`, `b()`, `a()`, `h()`, `s()`, `l()`, `v()`。

### 插件机制

核心只保留最常用的功能（RGB/HSL/HSV 转换、基础操作、查询）。CMYK、Lab、配色方案、色觉模拟等通过官方插件按需加载，不增加无用体积：

```ts
import xcolor from '@xpyjs/color'
import lab from '@xpyjs/color/plugins/lab'

xcolor.use(lab)
xcolor('#ff0000').toLab() // { l: 53.23, a: 80.11, b: 67.22 }
```

提供多款官方插件，涵盖 10+ 种色彩空间和多种实用功能。同时提供开发模板，用户可以轻松创建和分享自己的插件。

### TypeScript 原生支持

库本身用 TypeScript 编写，内置完整类型声明。插件通过 `declare module` 扩展类型，安装插件后方法签名自动生效，未安装的插件方法在编辑器中会正确报类型错误。

## 适用场景

- **前端 UI 开发** — 动态主题、色值转换、对比度检查
- **设计系统** — 生成配色方案、色阶
- **数据可视化** — 渐变色、色彩插值
- **无障碍合规** — WCAG 对比度验证
- **Node.js 工具** — 颜色格式转换、批量处理
