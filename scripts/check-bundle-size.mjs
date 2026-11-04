import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

// Ceilings are measured the way CI measures them: Node 22 with Node's default gzip
// level, plus a small (~0.25%) buffer so ordinary edits are not blocked by noise.
// gzip output depends on the zlib build bundled with Node — Node 18 reports ~20
// bytes less than Node 22 for these same files — so always re-measure with the CI
// Node version before changing these numbers.
const ceilings = { "index.cjs": 5575, "index.esm.js": 5545, "index.umd.js": 5590 };

const exceeded = [];
for (const [file, ceiling] of Object.entries(ceilings)) {
  const bytes = gzipSync(readFileSync(new URL(`../dist/${file}`, import.meta.url))).length;
  console.log(`${file}: ${bytes} bytes gzip (limit ${ceiling})`);
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
