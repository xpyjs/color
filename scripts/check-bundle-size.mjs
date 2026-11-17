import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

// One checked-in source of truth for measured baselines and acceptance limits.
// Re-measure with CI's Node major before changing the budget; gzip depends on zlib.
const budget = JSON.parse(readFileSync(new URL("../bundle-budget.json", import.meta.url), "utf8"));

const exceeded = [];
for (const [file, entry] of Object.entries(budget.files)) {
  const ceiling = entry.maxGzipBytes;
  if (!Number.isInteger(ceiling) || ceiling <= 0) throw new Error(`Invalid gzip budget: ${file}`);
  const data = readFileSync(new URL(`../dist/${file}`, import.meta.url));
  const bytes = gzipSync(data).length;
  console.log(`${file}: ${data.length} bytes minified; ${bytes} bytes gzip (limit ${ceiling})`);
  if (bytes > ceiling) exceeded.push(file);
}

if (exceeded.length) {
  console.error(`\n${exceeded.join(", ")} exceed the gzip budget.`);
  console.error(
    `Measured with Node ${process.version} (zlib ${process.versions.zlib}); ` +
    "re-measure with the CI Node version before raising a ceiling."
  );
  process.exitCode = 1;
}
