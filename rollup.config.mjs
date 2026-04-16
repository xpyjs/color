import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";
import { readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const terserOptions = {
    compress: {
        passes: 2,
        pure_getters: true,
        unsafe_comps: true,
        unsafe_math: true
    },
    format: {
        comments: false
    }
};

const babelOptions = {
    babelHelpers: "bundled",
    presets: [
        [
            "@babel/preset-env",
            {
                targets: "> 0.25%, not dead",
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
            terser(terserOptions)
        ]
    },
    // Type declarations
    {
        input: "src/index.ts",
        output: { file: "dist/types/index.d.ts", format: "esm" },
        plugins: [dts()]
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
        external: ["@xpyjs/color"],
        plugins: [dts({ respectExternal: true })]
    }
]);

export default [...mainConfig, ...pluginConfigs];
