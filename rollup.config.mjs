import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import ts from "typescript";
import { dts } from "rollup-plugin-dts";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const terserOptions = {
    toplevel: true,
    mangle: { properties: { regex: /^_(?:a|valid|roundCh|applyCS|channel|pluginCleanups)$/ } },
    compress: {
        passes: 4,
        pure_getters: true,
        unsafe_comps: false,
        unsafe_math: false
    },
    format: {
        comments: false
    }
};

// Support floor: the first engines with full ES2015 support, plus Node 14.
// The list lives in package.json#browserslist so the build and the published
// metadata cannot drift apart. Explicit versions instead of a market-share query
// ("> 0.25%, not dead"): that query dragged in legacy engines such as UC 15.5 and
// changed the emitted code whenever browserslist data was refreshed, so the
// bundle size drifted with it.
const browserTargets = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8")).browserslist;

const babelOptions = {
    babelHelpers: "bundled",
    presets: [
        [
            "@babel/preset-env",
            {
                targets: browserTargets,
                modules: false
            }
        ]
    ],
    extensions: [".js", ".ts"]
};

// Scan plugins directory
function getPluginEntries() {
    const pluginsDir = join(__dirname, "src/plugins");
    const entries = [];
    try {
        const dirs = readdirSync(pluginsDir);
        for (const dir of dirs) {
            const fullPath = join(pluginsDir, dir);
            if (statSync(fullPath).isDirectory()) {
                entries.push({
                    name: dir,
                    input: `src/plugins/${dir}/index.ts`
                });
            }
        }
    } catch {
        // No plugins directory yet
    }
    return entries;
}

const plugins = getPluginEntries();

// The Node ESM entry shares the callable CommonJS export and its registries.
function nodeEntry() {
    return {
        name: "node-entry",
        generateBundle(output, bundle) {
            if (output.format !== "es") return;
            const entry = bundle["index.esm.js"];
            const names = entry.exports.filter((name) => name !== "default");
            this.emitFile({
                type: "asset",
                fileName: "index.node.js",
                source: [
                    'import core from "./index.cjs";',
                    "export default core;",
                    ...names.map((name) => `export const ${name} = core.${name};`)
                ].join("\n")
            });
        }
    };
}

// Rollup's bundled declarations retain JSDoc and list every public export.
function commonJsDeclarations(isCore = false) {
    return {
        name: "commonjs-declarations",
        generateBundle(_output, bundle) {
            const entry = Object.values(bundle)[0];
            const source = ts.createSourceFile(entry.fileName, entry.code, ts.ScriptTarget.Latest, true);
            const typeNames = new Set();
            for (const statement of source.statements) {
                if (!ts.isExportDeclaration(statement) || !statement.exportClause ||
                    !ts.isNamedExports(statement.exportClause)) continue;
                for (const specifier of statement.exportClause.elements) {
                    if (statement.isTypeOnly || specifier.isTypeOnly ||
                        (isCore && specifier.name.text === "XColor")) {
                        typeNames.add(specifier.name.text);
                    }
                }
            }
            this.emitFile({
                type: "asset",
                fileName: "index.d.cts",
                source: [
                    'import type * as exports from "./index.js" with { "resolution-mode": "import" };',
                    "declare const entry: typeof exports.default & Omit<typeof exports, \"default\"> & { default: typeof entry };",
                    ...(typeNames.size ? [
                        "declare namespace entry {",
                        ...Array.from(typeNames, (name) => name === "XColorPlugin"
                            ? "    export type XColorPlugin<T = unknown> = exports.XColorPlugin<T>;"
                            : `    export type ${name} = exports.${name};`),
                        "}"
                    ] : []),
                    "export = entry;"
                ].join("\n")
            });

        }
    };
}

// Main library build
const mainConfig = [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.cjs",
                format: "cjs",
                exports: "named",
                sourcemap: false,
                footer: `module.exports = exports.default; Object.assign(module.exports, exports);`
            },
            {
                file: "dist/index.esm.js",
                format: "esm",
                sourcemap: false
            }
        ],
        plugins: [
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: false,
                declarationDir: undefined,
                sourceMap: false,
                inlineSources: false
            }),
            babel(babelOptions),
            terser(terserOptions),
            nodeEntry()
        ]
    },
    // Type declarations
    {
        input: "src/index.ts",
        output: { file: "dist/types/index.d.ts", format: "esm" },
        plugins: [dts(), commonJsDeclarations(true)]
    },
    // UMD build for direct browser usage: window.xcolor(...)
    {
        input: "src/umd.ts",
        output: {
            file: "dist/index.umd.js",
            format: "umd",
            name: "xcolor",
            exports: "default",
            sourcemap: false
        },
        plugins: [
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: false,
                declarationDir: undefined,
                sourceMap: false,
                inlineSources: false
            }),
            babel(babelOptions),
            terser(terserOptions)
        ]
    }
];

// Plugin builds
const pluginConfigs = plugins.flatMap((plugin) => [
    {
        input: plugin.input,
        external: ["@xpyjs/color"],
        output: [
            {
                file: `dist/plugins/${plugin.name}/index.cjs`,
                format: "cjs",
                exports: "named",
                sourcemap: false,
                footer: `module.exports = exports.default; Object.assign(module.exports, exports);`
            },
            {
                file: `dist/plugins/${plugin.name}/index.js`,
                format: "esm",
                sourcemap: false
            },
            {
                file: `dist/plugins/${plugin.name}/index.umd.js`,
                format: "umd",
                name: `xcolorPlugins.${plugin.name}`,
                globals: {
                    "@xpyjs/color": "xcolor"
                },
                exports: "named",
                sourcemap: false
            }
        ],
        plugins: [
            typescript({
                tsconfig: "./tsconfig.plugins.json",
                declaration: false,
                declarationDir: undefined,
                sourceMap: false,
                inlineSources: false,
                noEmitOnError: false
            }),
            babel(babelOptions),
            terser(terserOptions)
        ]
    },
    {
        input: plugin.input,
        output: { file: `dist/types/plugins/${plugin.name}/index.d.ts`, format: "esm" },
        external: ["@xpyjs/color", "@xpyjs/color/plugins/palette"],
        plugins: [dts({ respectExternal: true }), commonJsDeclarations()]
    }
]);

export default [...mainConfig, ...pluginConfigs];
