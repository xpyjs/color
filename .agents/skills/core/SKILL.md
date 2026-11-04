---
name: core
description: 核心技能。开发时需要参考该技能，包含核心功能的实现和规范。
---

# @xpyjs/color - 核心技能文档

本文档汇总了 `@xpyjs/color` 项目的核心技能，涵盖了核心功能的实现和规范，旨在为开发者提供清晰的指导，确保项目的核心功能的正确实现和一致性。

## 1. 开发工具版本

- Node.js: 20.x 或 22.x
- TypeScript: 5.x
- ESLint: 8.x
- Prettier: 2.x
- vitest: 3.x
- rollup: 4.x

所有其他内容都需要适配以上工具版本。

## 2. 打包后目标使用环境

- browserslist: "> 0.25%, not dead"
- Node.js: 14.x 及以上
- 其他 JavaScript 运行环境，需支持 ES2015 及以上
- 需要支持 CommonJS、ES Module 和 UMD 三种模块系统

## 3. 核心实现

XColor 作为核心类型，需要实现如下功能：

### 颜色实例创建

所有具体实现都应该在内部 `class XColor` 中实现，确保核心功能的封装和模块化。同时，提供必要的类型定义，确保用户能够正确使用这些功能。

通过工厂函数可以直接连接 XColor 类进行实例化。内部实现应当是：

```typescript
// 颜色实例的核心实现类，包含了颜色实例创建的核心逻辑和方法
class XColor {
  constructor(input: XColorInput, options?: XColorOptions) {
    // 颜色实例创建的核心逻辑
  }

  // 其他核心方法和属性
}

// 工厂函数，作为用户创建颜色实例的入口，同时也是插件挂载的入口
export const xcolor = (input: XColorInput, options?: XColorOptions): XColor => {
  // 已有实例会被复制，并应用显式传入的选项。
  return new XColor(input, options);
};

// 导出 XColor 类，常规使用推荐工厂函数。
```


### 全局工厂函数

全局只有导出一个 `xcolor` 函数，用于创建颜色实例。同时也是插件挂载入口。

使用方法：

```typescript
import xcolor from '@xpyjs/color';
import SomePlugin from '@xpyjs/color-some-plugin';

xcolor.use(SomePlugin, {/* 配置项 */}); // 安装插件，插件会在全局范围内生效。支持配置项

xcolor.config({ /* 全局配置项 */ }); // 设置全局配置项

const color = xcolor('rgb(255, 0, 0)'); // 创建一个红色实例

const color2 = xcolor('#00ff00', {/* 配置项 */}); // 支持针对当前实例的配置项，覆盖全局配置项
```

### 颜色解析

- 支持多种颜色格式的解析，如 RGB、HEX、HSL 等，且能够正确处理各种边界情况和异常输入。需要支持插件扩展等。
- 保存默认 r、g、b、a 信息，以及一些颜色附加信息，作为基础值。所有颜色操作都通过这些基础值进行。
- 内部数据支持完整小数位。由于 CSS4 中以及现代浏览器能够支持颜色小数位（比如 rgb(230.5, 120.3, 50.8)），因此内部数据需要支持完整小数位，以确保颜色计算的准确性和一致性。但这些仅在显式声明下才可用，默认情况仍然需要返回整数以确保用户得到的颜色有效性。这个参数可以通过工厂函数的配置选项实现。

解析方法应当统一为一个 `parse` 方法，接受不同格式的输入，并返回一个标准化的颜色对象。解析过程中需要进行严格的输入验证，确保输入的合法性和正确性。

### Getter 和 Setter 方法

- 提供颜色通道的 getter 和 setter 方法，确保对颜色通道的访问和修改的正确性和一致性。
- 有一些方法还应当提供便捷简写形式，比如 `r()` 和 `r(value: number)` 这样的 getter 和 setter 合一的设计，既可以通过 getter 获取属性值，也可以通过 setter 设置属性值，保持 API 的简洁和一致性。

比如：

```typescript
class XColor {
  // ...

  // red 通道的 Getter 方法，获取颜色通道的值
  red(): number {
    // 返回红色通道的值
  }
  // red 通道的 Setter 方法，设置颜色通道的值
  red(value: number): this {
    // 设置红色通道的值，并返回当前实例以支持链式调用
    return this;
  }

  // red 方法的简写形式，获取颜色通道的值
  r(): number {
    // 返回红色通道的值
  }
  // red 方法的简写形式，设置颜色通道的值
  r(value: number): this {
    // 设置红色通道的值，并返回当前实例以支持链式调用
    return this;
  }

  // alpha 通道的 Getter 方法，获取颜色通道的值
  alpha(): number {
    // 返回 alpha 通道的值
  }
  // alpha 通道的 Setter 方法，设置颜色通道的值
  alpha(value: number): this {
    // 设置 alpha 通道的值，并返回当前实例以支持链式调用
    return this;
  }

  // alpha 方法的简写形式，获取颜色通道的值
  a(): number {
    // 返回 alpha 通道的值
  }
  // alpha 方法的简写形式，设置颜色通道的值
  a(value: number): this {
    // 设置 alpha 通道的值，并返回当前实例以支持链式调用
    return this;
  }

  // alpha 的别名方法，获取颜色通道的值
  opacity(): number {
    // 返回 alpha 通道的值
  }
  // alpha 的别名方法，设置颜色通道的值
  opacity(value: number): this {
    // 设置 alpha 通道的值，并返回当前实例以支持链式调用
    return this;
  }

  // ...
}
```

类似的还可以有对应的 `rgb`、`hsl` 等方法和单独通道。

### 颜色操作

- 颜色转换：提供颜色格式之间的转换功能，确保转换结果的准确性和一致性。
- 颜色操作：提供颜色混合、调整亮度、饱和度等功能，确保操作结果的准确性和一致性。
- 颜色分析：支持颜色的对比度计算、色彩和谐度分析等功能，确保分析结果的准确性和一致性。

核心功能只保留最常用的需求方法即可，其余均可以放在插件中。

### 颜色输出

各种 to 方法，比如 `toRGB`, `toHex`, `toHSL` 等，会得到对应的输出格式，如 `RGB` 等。

`toString('rgb')` 返回 RGB 字符串。`toObject()` 是 `toRgb()` 的别名，HSL 对象通过 `toHsl()` 获取。无参 `toString()` 对不透明色输出 hex，对透明色输出 RGBA 字符串。格式参数通过联合类型约束，插件导入后可增强类型，运行时通过 `use()` 注册格式。

比如：

```typescript
color.toString(); // '#000' 默认返回 HEX 格式的字符串
color.toString('rgb'); // 'rgb(0, 0, 0)' 返回 RGB 格式的字符串

// 默认情况下，写 cmyk 应当提示错误，在开发时就显式报错。
color.toString('cmyk'); // '#000' 没有插件，应当返回 hex
                ~~~~    // 这里应当提示错误，因为没有安装 CMYK 插件

// 安装插件后
import CmykPlugin from '@xpyjs/color-cmyk-plugin';
xcolor.use(CmykPlugin); // 安装 CMYK 插件

color.toString('cmyk'); // 'cmyk(0, 0, 0, 100)' 安装插件后，应当返回 CMYK 格式的字符串
```

## 4. 插件实现

该库支持插件机制，允许用户根据需要扩展功能。插件应遵循统一的接口规范，确保与核心库的兼容性和一致性。

插件应当具有同一类型，并且具有参数。方便开发配置。

比如：

```typescript
interface XColorPlugin {
  name: string; // 插件名称，必须唯一
  install(xcolorInstance: typeof xcolor, options?: any): void; // 插件安装方法，接受核心库实例和可选的配置项
  // 其他必要的信息，如版本、作者等
}
```

类型可以支持类型参数，方便在安装插件时进行类型提示和约束。比如：`XColorPlugin<T = any>`，其中 `T` 是插件的配置项类型，根据实际情况，看需要如何使用。

插件应当在 src/plugins 目录下实现，每个插件都有单独子目录。所有插件目录下都存在一个 `index.ts` 文件，其中至少有一个默认导出的插件对象，包含插件的名称、安装方法和其他必要的信息。插件的安装方法应当接受核心库的实例作为参数，以便插件能够正确地挂载到核心库上。

比如：

```typescript
// src/plugins/some-plugin/index.ts
import { XColor } from '@xpyjs/color';

const SomePlugin: XColorPlugin = {
  name: 'some-plugin',
  install(xcolorInstance: typeof xcolor) {
    // 在这里实现插件的安装逻辑，比如添加新的方法或属性到 XColor 类上
    xcolorInstance.prototype.someMethod = function() {
      // 插件方法的实现
    };
  },
};

export default SomePlugin;
```

### 覆盖原有方法

插件可以覆盖核心库的原有方法，但必须确保覆盖后的方法能够正确调用原方法，并且保持原方法的功能和行为不变。覆盖的方法应当在调用原方法的基础上进行扩展或修改，而不是完全替换原方法。

比如：

```typescript
const SomePlugin: XColorPlugin = {
  name: 'some-plugin',
  install(xcolorInstance: typeof xcolor) {
    // 保存原有的 toString 方法
    const originalToString = xcolorInstance.prototype.toString;

    // 覆盖 toString 方法
    xcolorInstance.prototype.toString = function(type: XColorFormat) {
      if (type === 'cmyk') {
        // 实现 CMYK 格式的字符串输出
        return `cmyk(0, 0, 0, 100)`;
      }
      // 调用原有的 toString 方法处理其他格式
      return originalToString.call(this, type);
    };
  },
};
```

## 5. 静态方法

在 XColor 上，可以有一些静态方法，比如 `use`, `config` 等，这些方法不依赖于具体的颜色实例，而是作用于整个库或类。静态方法应当具有明确的功能和用途，并且与核心库的其他功能保持一致。

还可以有一些常用的静态方法，如 `isColor` 用于判断一个值是否为有效的颜色输入，`random` 用于生成随机颜色等。这些方法应当具有明确的参数和返回值，并且提供必要的类型定义和文档说明。

静态方法还可以是一些简写，比如 `is` 方法，可以是 `isColor` 的简写形式，提供更简洁的 API 供用户使用。

最重要的，静态方法也需要挂载到 `xcolor` 唯一的工厂函数中，以确保用户能够通过 `xcolor` 访问和使用这些方法。

## 6. 工具方法

库中可以有一些工具方法，在 utils 中。它们通常是没有任何状态的纯函数，提供一些通用的功能，如颜色格式的验证、颜色值的计算等。这些方法应当具有明确的功能和用途，并且提供必要的类型定义和文档说明。

【必须】在开发时，当使用到通用方法时，首先确认 utils 中是否包含了相关方法，如果有，则直接使用。如果没有，则需要判断该工具方法是否是无状态的，是否可以被通用，如果可以，则在 utils 中创建并使用。

## 7. 命名规范

- 所有方法和属性的命名应当清晰、简洁，并且能够准确反映其功能和用途。
- 颜色通道的 getter 和 setter 方法应当使用颜色通道名称作为方法名，如 `red`、`green`、`blue`、`alpha` 等，同时提供简写形式如 `r`、`g`、`b`、`a` 等。
- 颜色格式的转换方法应当使用 `to` 前缀，如 `toRgb`、`toHex`、`toHsl` 等，保持 API 的一致性和清晰性。

## 8. JSDoc

- 所有方法和属性都应当使用 JSDoc 进行注释，提供清晰的文档说明，包括参数类型、返回值类型、功能描述等，以便用户能够正确理解和使用这些方法和属性。
- 所有提供给使用者的方法、参数、类型等，都应该具有更加完整的 JSDoc 注释，必要时添加对应的 @example 示例，确保用户能够正确理解和使用这些功能。
- 对于一些属性，需要给出完整的数值区间，并加以说明
- 对于一些标准值/属性/方法，需要给出对应的标准规范链接，方便用户参考和理解。

## 9. 类型安全

本库完整的使用 TypeScript 进行类型定义，非必要时，需要避免使用 `any` 类型，以确保类型安全和代码的可维护性。

针对给使用者的类型，应当确保类型受约束，避免使用过于宽泛的类型，如 `string`、`number` 等，而是使用具体的类型或联合类型来确保类型安全和正确性。除非确实不受约束，用户可以任意填写。

类型名称应当符合本库标准（参考 base/SKILL.md）。

## 10. 实现目标

- 核心包打包后体积不超过 5KB（gzip 后），以确保库的轻量级和高性能。
- 核心包的功能实现应当满足常见的颜色处理需求，同时保持 API 的简洁和一致性，以确保用户能够方便地使用和扩展库的功能。
- 插件机制应当灵活且易于使用，允许用户根据需要扩展库的功能，同时保持与核心库的兼容性和一致性。
- 可与其他 JavaScript 运行环境兼容，确保库的广泛适用性和用户覆盖面。
- 可与 SCSS / SASS / LESS 等 CSS 预处理器兼容，确保库在前端开发中的广泛应用和便利性。
- 可与构建工具集成，如 Webpack、Rollup、Vite 等，确保库在现代前端开发流程中的顺利使用和集成。
