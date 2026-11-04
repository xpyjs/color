import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

// Measured before the second compatibility pass, using Node's default gzip level.
const ceilings = { "index.cjs": 5654, "index.esm.js": 5621, "index.umd.js": 5679 };
for (const [file, ceiling] of Object.entries(ceilings)) {
  const bytes = gzipSync(readFileSync(new URL(`../dist/${file}`, import.meta.url))).length;
  console.log(`${file}: ${bytes} bytes gzip (limit ${ceiling})`);
  if (bytes > ceiling) process.exitCode = 1;
}
