#!/usr/bin/env node

// =======================================
// Plugin Scaffolding Script for @xpyjs/color
// Usage: node scripts/create-plugin.mjs <plugin-name>
// =======================================

import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const pluginName = process.argv[2];

if (!pluginName) {
  console.error("�?Please provide a plugin name.");
  console.error("   Usage: node scripts/create-plugin.mjs <plugin-name>");
  console.error("   Example: node scripts/create-plugin.mjs myPlugin");
  process.exit(1);
}

// Validate plugin name
if (!/^[a-z][a-zA-Z0-9]*$/.test(pluginName)) {
  console.error(
    "�?Plugin name must start with a lowercase letter and contain only letters and digits."
  );
  console.error("   Example: myPlugin, colorMixer, a11y");
  process.exit(1);
}

const pluginDir = join(ROOT, "src", "plugins", pluginName);
const testDir = join(ROOT, "test", "plugins");

if (existsSync(pluginDir)) {
  console.error(`�?Plugin "${pluginName}" already exists at: ${pluginDir}`);
  process.exit(1);
}

// Capitalize first letter for display
const displayName =
  pluginName.charAt(0).toUpperCase() + pluginName.slice(1);

// ---- Create plugin source ----
mkdirSync(pluginDir, { recursive: true });

const pluginSource = `// =======================================
// Plugin: ${pluginName} - ${displayName} plugin
// =======================================

import type { XColorPlugin } from "@xpyjs/color";
import { defineMethod } from "@xpyjs/color";
// If your plugin adds a toString format, also import:
// import { registerStringFormatter, registerColorParser } from "@xpyjs/color";

/**
 * Module augmentation: declare the methods this plugin adds to XColor.
 * This enables TypeScript type-checking and IDE IntelliSense.
 */
declare module "@xpyjs/color" {
  // If your plugin registers a toString format, uncomment:
  // interface XColorStringFormatMap {
  //   ${pluginName}: true;
  // }

  interface XColor {
    /**
     * Example method added by the ${pluginName} plugin.
     * TODO: Replace with your actual method signature(s).
     * @returns Description of the return value
     */
    ${pluginName}Example(): string;
  }
}

/**
 * ${displayName} plugin for @xpyjs/color.
 *
 * @example
 * \`\`\`ts
 * import { XColor, xcolor } from '@xpyjs/color'
 * import ${pluginName} from '@xpyjs/color/plugins/${pluginName}'
 *
 * XColor.extend(${pluginName})
 * xcolor('#ff0000').${pluginName}Example()
 * \`\`\`
 */
const ${pluginName}: XColorPlugin = {
  name: "@xpyjs/color/plugins/${pluginName}",
  install(_option, cls, _factory) {
    /**
     * Example method - replace with your implementation.
     */
    defineMethod(cls, '${pluginName}Example', function (this: InstanceType<typeof cls>): string {
      return \`${displayName}: \${this.toHex()}\`;
    });

    // To register a custom toString format:
    // registerStringFormatter(cls, "${pluginName}", color => color.${pluginName}Example());

    // To register a custom color parser:
    // registerColorParser((value) => {
    //   if (typeof value !== "string") return null;
    //   // Parse and return { r, g, b, a } or null
    //   return null;
    // });
  }
};

export default ${pluginName};
`;

writeFileSync(join(pluginDir, "index.ts"), pluginSource);

// ---- Create test file ----
mkdirSync(testDir, { recursive: true });

const testSource = `import { describe, it, expect, beforeAll } from "vitest";
import { XColor, xcolor } from "../../src/core";
import ${pluginName} from "../../src/plugins/${pluginName}";

describe("Plugin: ${pluginName}", () => {
  beforeAll(() => {
    XColor.extend(${pluginName});
  });

  describe("${pluginName}Example", () => {
    it("should return formatted string", () => {
      const c = xcolor("#ff0000");
      expect(c.${pluginName}Example()).toBe("${displayName}: #ff0000");
    });

    // TODO: Add more tests for your plugin methods
  });
});
`;

writeFileSync(join(testDir, `${pluginName}.test.ts`), testSource);

// ---- Print success ----
console.log("");
console.log(`�?Plugin "${pluginName}" created successfully!`);
console.log("");
console.log("📁 Files created:");
console.log(`   src/plugins/${pluginName}/index.ts`);
console.log(`   test/plugins/${pluginName}.test.ts`);
console.log("");
console.log("📋 Next steps:");
console.log(`   1. Edit src/plugins/${pluginName}/index.ts to implement your methods`);
console.log(`   2. Update the \`declare module\` block with your method signatures`);
console.log(`   3. Write tests in test/plugins/${pluginName}.test.ts`);
console.log(`   4. Run: npm test`);
console.log(`   5. Build: npm run build`);
console.log("");
console.log("💡 The plugin will be automatically detected by rollup.config.mjs");
console.log("   and built as a separate bundle.");
console.log("");
