# 颜色库审计与改进清单

基于 2026-11-16 的源码审计。按编号推进；每项使用独立分支，完成针对性回归测试、全量测试和源码类型检查后提交，再开始下一项。后续分支基于上一项已验证的提交创建，形成可追踪的串行分支；不自动合并到 main。

状态：`[ ]` 待处理，`[-]` 进行中，`[x]` 已完成。设计扩展项实施前先明确兼容性和验收边界，不将已有能力重复实现。

## 正确性修复

- [x] 01 透明颜色的可读性：合成前景，支持显式不透明底色；背景不确定时不返回肯定判断；覆盖 isReadable / mostReadable / wcagLevel。分支：`fix/01-a11y-alpha`。
- [x] 02 无效主题和色板输入：拒绝无效基础色；主题更新失败保留配置、缓存和 DOM。分支：`fix/02-invalid-theme-colors`。
- [x] 03 深色色阶反向变亮：保证黑色及近黑色的暗阶不比基础色亮。分支：`fix/03-dark-palette-boundaries`。移除暗阶 5% 明度下限；6 个黑色/近黑色参考输入验证单调性。全量 806 测试及类型检查通过，中英文文档同步。
- [x] 04 线性色阶不稳定：相同 shade 不因请求的等级子集或顺序变化。分支：`fix/04-stable-linear-shades`。固定 50/500/950 锚点并按 shade 数值插值；覆盖子集、顺序、重复和单项请求。中间颜色较旧版变化已在双语文档说明。全量 807 测试及类型检查通过。
- [x] 05 OKLab / OKLCh 黑白边界：正确处理零、最大和超范围亮度，保留 alpha。分支：`fix/05-oklab-lightness-boundaries`。8 组数字/百分比边界覆盖两个空间；全量 815 测试及类型检查通过。双语文档说明中间亮度仍采用通道裁剪。
- [x] 06 广色域负通道：修正扩展传递函数，以独立参考向量验证 P3、ProPhoto 和相关转换。分支：`fix/06-signed-transfer-functions`。修复共用 sRGB、P3、ProPhoto、Rec.2020 的符号扩展，保留既有正通道曲线；7 组往返及 3 个独立参考向量，全量 825 测试和类型检查通过。
- [x] 07 HSL 无彩色插值：处理无意义的色相，覆盖白/灰/黑与彩色之间的双向插值。分支：`fix/07-achromatic-interpolation`。无彩色继承另一端色相，双无彩色保持中性；全量 829 测试及类型检查通过，双语文档同步。
- [x] 08 色板实例选项：保留基础色透明度和小数配置，明确派生色的透明度策略。分支：`fix/08-palette-options`。内置色板及暗色派生继承 alpha 和实例精度，500 独立复制原色；自定义生成器自行决定输出。全量 833 测试、覆盖率门槛及类型检查通过，双语文档同步。

## 数据模型与兼容性

- [x] 09a 前置修复：跨空间往返测试发现 D65↔D50 矩阵系数错误。独立分支 `fix/09a-chromatic-adaptation`；按 CSS Color 4 Bradford 参考矩阵修正，验证标准白点、带负值 XYZ 往返并更新 ProPhoto 参考向量。

- [x] 09 广色域计算模型：统一带空间标识的数据、直接跨空间转换、色域检测、显式映射和延迟裁剪；接通现有 wide-color 记录。分支：`feat/09-color-space-records`；新增 colorSpace 可选模块，13 个空间，无裁剪转换、色域检测、clip / OKLCh 降色度映射、实例导出；保持旧实例模型。26 项新测试，全量 860 测试、覆盖率门槛、类型检查、111 个构建输出、ESM/CJS 消费及四种 TS 解析模式通过。基于记录的渐变和色差分别在 15/16 项继续。
- [x] 10 Lab 与 CSS：区分 D65 数据计算和 D50 CSS 解析/输出，制定兼容策略。分支：`feat/10-explicit-css-lab`。保留旧默认；新增 parseCssLab、toCssLabString/toCssLchString 及 cssLab/cssLch 格式键，D50 始终明确。黑白边界、alpha、配置独立性与无效输入回归通过；全量 863 测试和类型检查通过，双语文档同步。
- [x] 11 精度：统一无损数据输出和可配置序列化精度，覆盖 RGB/alpha/HSL/HSV/Lab/OKLab/XYZ 往返。分支：`feat/11-output-precision`。兼容方案：旧 getter 保持默认；记录接口扩展 HSL/HSV，formatColorSpace 提供 full（默认）或 0–15 位精度，统一坐标与 alpha 输出，保留数据。新增 8 项精度/往返回归，全量 871 测试和类型检查通过。
- [x] 12 颜色空间 API 闭环：带空间标识的对象输入、fromColorSpace 工厂和链式 colorSpace setter，HWB 转换及 CMYK getter/setter；修正 RGB/HSL/HSV/CMYK 输入类型与运行时要求不一致。分支：`feat/12-color-space-inputs`；880 项测试、源码类型检查、111 个构建输出、ESM/CJS 消费及四种 TypeScript 解析模式通过，双语文档同步。

## 能力扩展（每项单独分支）

- [x] 13 CSS 解析：独立 parseCssColor 严格/宽松入口，srgb-linear 注册输入，none 标记与序列化保留，普通转换按零解析；明确上下文、表达式和 CSS 词法边界，补齐实例 Lab/OKLab 黑白端点。分支：`codex/13-css-parsing`；928 项测试、覆盖率门槛、类型检查、111 个构建输出与 ESM/CJS/四种 TS 消费模式通过，双语文档同步。
- [x] 14 CSS 表达式：独立 resolveCssColor 支持双颜色 color-mix、相对颜色和数值 calc 子集；显式 currentColor/整色变量上下文，缺失分量传递、alpha 预乘、四色相路径及循环边界。分支：`codex/14-css-expressions`；973 项测试、覆盖率、类型检查、111 个构建输出、ESM/CJS 与四种 TS 消费模式通过。双语文档列明支持的语法子集及限制。
- [x] 15 渐变：createColorGradient 支持多色标、可选位置、重复位置突变、数据域、所有记录空间和四色相路径；输入快照、独立采样、缺失通道及 alpha 预乘。分支：`codex/15-multi-stop-gradients`；991 项测试、类型检查、111 个构建输出、ESM/CJS 和四种 TS 消费模式通过，双语文档同步。
- [x] 16 感知比较：colorDifference（CIEDE2000/CIE76/OKLab）、isColorSimilar、稳定 sortColors 和顺序 deduplicateColors；独立 alpha 容差、保留广色域。分支：`codex/16-perceptual-comparison`；34 组 CIEDE2000 作者参考向量正反向验证，全量 1030 测试、覆盖率、类型检查、111 构建输出及 ESM/CJS/四种 TS 消费模式通过，双语文档明确指标单位和去重语义。
- [x] 17 无障碍增强：adjustContrast 保留 alpha/实例精度，沿黑白方向搜索并明确返回 met；auditContrastPairs 检查具体主题变量配对，保留未舍入阈值判断。分支：`codex/17-contrast-adjustment`；1042 测试、类型检查、111 构建输出及 ESM/CJS/四种 TS 消费模式通过，双语文档同步。包括不可达、底色、输入不变和真实主题变量回归。
- [x] 18 感知色板：generatePerceptualPalette 固定 50/500/950 锚点、分段 OKLCh 线性目标及降色度映射；目标明度单调、子集稳定、alpha 保留；最终显示色对比度约束支持拒绝或逐项报告。分支：`codex/18-perceptual-palettes`；1053 测试、覆盖率、类型检查、111 构建输出及 ESM/CJS/四种 TS 消费模式通过。双语文档说明映射后不保证等 ΔE，约束不自动移动锚点。
- [x] 19 独立主题实例：createTheme 隔离配置/缓存/样式所有权，防御性快照、原子更新、SSR、移除/重注入与 ID 冲突保护；getVars/getThemeVars('dark') 和 ThemeResult.darkVars 提供完整暗色快照。分支：`codex/19-isolated-themes`；1060 测试、类型检查、111 构建输出及 ESM/CJS/四种 TS 消费模式通过，双语文档说明 CSS 作用域仍由选择器/前缀控制。
- [x] 20 混合增强：hue/saturation/color/luminosity 非分离模式与 composite 的 13 种 Porter–Duff 单 RGBA 操作；明确编码 sRGB、源/目标顺序、lighter 饱和累加和零覆盖透明黑。分支：`codex/20-blend-compositing`；1082 测试、覆盖率、类型检查、111 构建输出及 ESM/CJS/四种 TS 消费模式通过，双语文档同步。
- [x] 21 错误处理：strict 构造/核心数值变更检查与原子失败；XColorError/code/operation；核心混合/分析和插件计算拒绝无效源，scale/deltaE 拒绝无效目标。保留默认 isValid 工作流与 false 型判断。分支：`codex/21-strict-errors`；1108 测试、覆盖率、类型检查、111 构建输出及 ESM/CJS/四种 TS 消费模式通过。双语文档说明兼容变化；核心体积在 23 项重新实测。

## 文档与质量保障

- [x] 22 README 示例：命名色示例正确注册 name 插件，中英文同步，并明确 toHex 输出。分支：`codex/22-readme-name-plugin`；Node 22 下 1108 测试及源码类型检查通过。
- [x] 23 体积说明：Node 22 实测核心 minified 19043–19266 字节、gzip 6011–6055 字节；README/技能规范/CI 统一为约 6.1 kB 实测、6 KiB 当前预算和 5 KiB 优化目标。新增 bundle-budget.json 单一预算来源与测量说明。分支：`codex/23-bundle-budget`；完整构建、预算正向检查和超限拒绝检查通过，源码/1108 测试在前项已通过且无源码变更。
- [ ] 24 跨功能测试：标准参考向量、序列化往返、色阶单调性、子集稳定性、实例选项继承；各修复同步补相关测试，此项补充系统性缺口。

## 完成记录

### 02 — 无效主题和色板输入

- 色板在调用算法前验证基础色；主题拒绝空字符串、无效 DEFAULT 和派生源。
- 保持深/浅合并更新及插件重装失败时的配置、缓存和 DOM；继续允许自定义 CSS 覆盖值。
- 验证：针对性 121 测试、全量 800 测试及 tsc --noEmit 通过；中英文说明同步。

每项记录分支、验证结果、兼容性变化及剩余限制；提交号以对应分支的 Git 历史为准。

### 01 — 透明颜色可读性

- 新增 `backdrop` 选项；按照文字 → 背景 → 不透明底色计算，不舍入中间通道。
- 背景无法确定时 isReadable 返回 false，wcagLevel / mostReadable 抛错；不透明背景行为保持兼容。
- 5 项新回归测试覆盖透明文字、半透明多层合成、AA 临界值、缺失/无效底色、候选透明度与不变性。
- 验证：Node 24.22.1，全量 32 文件 / 797 测试通过；tsc --noEmit、git diff --check 通过；核心与 a11y 的 11 个代码/类型输出在内存构建通过。
- 中英文文档同步；核心 contrast() 的既有行为留待统一错误处理/对比度 API 项处理。
