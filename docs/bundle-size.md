# 核心体积 / Core bundle size

以 Node 22.12.0、zlib 1.3.0.1-motley-71660e1 构建并使用默认 gzip 设置测量。这里只统计核心运行时代码，不包含插件、类型声明或文档。kB = 1000 字节，KiB = 1024 字节。

Measured with Node 22.12.0 and default gzip settings. Core runtime only; optional plugins, declarations and documentation are excluded.

| Artifact | Minified bytes | gzip bytes | gzip limit |
| --- | ---: | ---: | ---: |
| CJS | 19,266 | 6,041 | 6,144 |
| ESM | 19,043 | 6,011 | 6,144 |
| UMD | 19,157 | 6,055 | 6,144 |

第 21 项的严格校验、结构化错误和无效输入检查增加了核心逻辑，旧的约 4 kB 说明及约 5.6 kB CI 上限已过时。当前验收预算为每个产物 **6 KiB**，最接近上限的产物仍有 89 字节余量；**5 KiB** 是后续优化目标，不能作为当前实际体积宣传。增大预算必须附实测值和原因。

Strict validation and structured errors increased core size. The current acceptance budget is **6 KiB per artifact**; the largest artifact has 89 bytes of headroom. **5 KiB** remains an optimization goal, not a claim about current size. Budget increases require measurements and justification.

唯一机器可读来源为根目录 `bundle-budget.json`，CI 的 `scripts/check-bundle-size.mjs` 从中读取上限。用 CI 的 Node 22 主版本运行 `npm run build` 后执行 `node scripts/check-bundle-size.mjs` 复测；不同 zlib 版本可能产生少量差异。

The CI check reads limits from the root `bundle-budget.json`. Rebuild with Node 22 and run `node scripts/check-bundle-size.mjs`; minor gzip differences may occur across zlib versions.
