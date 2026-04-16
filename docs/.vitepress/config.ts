import { defineConfig } from "vitepress";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = resolve(fileURLToPath(import.meta.url), "../../..");
const isDev = !process.argv.includes("build");

const zhSidebar = {
  "/guide/": [
    {
      text: "介绍",
      items: [
        { text: "快速开始", link: "/guide/getting-started" },
        { text: "安装", link: "/guide/installation" },
        { text: "为什么选择 xcolor", link: "/guide/why" }
      ]
    },
    {
      text: "基础",
      items: [
        { text: "创建颜色", link: "/guide/create-color" },
        { text: "颜色输出", link: "/guide/output" },
        { text: "颜色操作", link: "/guide/manipulation" },
        { text: "链式调用", link: "/guide/chaining" },
        { text: "Getter / Setter", link: "/guide/getter-setter" }
      ]
    },
    {
      text: "进阶",
      items: [
        { text: "插件系统", link: "/guide/plugins" },
        { text: "自定义插件开发", link: "/guide/custom-plugin" },
        { text: "TypeScript 支持", link: "/guide/typescript" }
      ]
    }
  ],
  "/api/": [
    {
      text: "API 参考",
      items: [
        { text: "构造与工厂", link: "/api/constructor" },
        { text: "通道读写", link: "/api/channels" },
        { text: "颜色输出", link: "/api/output" },
        { text: "颜色操作", link: "/api/manipulation" },
        { text: "颜色查询", link: "/api/query" },
        { text: "静态方法", link: "/api/static" }
      ]
    }
  ],
  "/plugins/": [
    {
      text: "插件",
      items: [
        { text: "概览", link: "/plugins/overview" }
      ]
    },
    {
      text: "色彩空间",
      items: [
        { text: "cmyk", link: "/plugins/cmyk" },
        { text: "lab / lch", link: "/plugins/lab" },
        { text: "oklab / oklch", link: "/plugins/oklab" },
        { text: "hwb", link: "/plugins/hwb" },
        { text: "xyz", link: "/plugins/xyz" },
        { text: "a98Rgb", link: "/plugins/a98Rgb" },
        { text: "displayP3", link: "/plugins/displayP3" },
        { text: "proPhotoRgb", link: "/plugins/proPhotoRgb" },
        { text: "rec2020", link: "/plugins/rec2020" },
        { text: "percentageRgb", link: "/plugins/percentageRgb" }
      ]
    },
    {
      text: "功能扩展",
      items: [
        { text: "a11y - 无障碍", link: "/plugins/a11y" },
        { text: "blend - 混合模式", link: "/plugins/blend" },
        { text: "gradient - 渐变", link: "/plugins/gradient" },
        { text: "harmony - 配色方案", link: "/plugins/harmony" },
        { text: "name - 颜色命名", link: "/plugins/name" },
        { text: "palette - 色阶生成", link: "/plugins/palette" },
        { text: "scale - 色阶插值", link: "/plugins/scale" },
        { text: "simulate - 色觉模拟", link: "/plugins/simulate" },
        { text: "temperature - 色温", link: "/plugins/temperature" },
        { text: "theme - 主题", link: "/plugins/theme" }
      ]
    }
  ]
};

const enSidebar = {
  "/en/guide/": [
    {
      text: "Introduction",
      items: [
        { text: "Getting Started", link: "/en/guide/getting-started" },
        { text: "Installation", link: "/en/guide/installation" },
        { text: "Why xcolor", link: "/en/guide/why" }
      ]
    },
    {
      text: "Basics",
      items: [
        { text: "Create Color", link: "/en/guide/create-color" },
        { text: "Output", link: "/en/guide/output" },
        { text: "Manipulation", link: "/en/guide/manipulation" },
        { text: "Chaining", link: "/en/guide/chaining" },
        { text: "Getter / Setter", link: "/en/guide/getter-setter" }
      ]
    },
    {
      text: "Advanced",
      items: [
        { text: "Plugin System", link: "/en/guide/plugins" },
        { text: "Custom Plugin Dev", link: "/en/guide/custom-plugin" },
        { text: "TypeScript", link: "/en/guide/typescript" }
      ]
    }
  ],
  "/en/api/": [
    {
      text: "API Reference",
      items: [
        { text: "Constructor", link: "/en/api/constructor" },
        { text: "Channels", link: "/en/api/channels" },
        { text: "Output", link: "/en/api/output" },
        { text: "Manipulation", link: "/en/api/manipulation" },
        { text: "Query", link: "/en/api/query" },
        { text: "Static Methods", link: "/en/api/static" }
      ]
    }
  ],
  "/en/plugins/": [
    {
      text: "Plugins",
      items: [
        { text: "Overview", link: "/en/plugins/overview" }
      ]
    },
    {
      text: "Color Spaces",
      items: [
        { text: "cmyk", link: "/en/plugins/cmyk" },
        { text: "lab / lch", link: "/en/plugins/lab" },
        { text: "oklab / oklch", link: "/en/plugins/oklab" },
        { text: "hwb", link: "/en/plugins/hwb" },
        { text: "xyz", link: "/en/plugins/xyz" },
        { text: "a98Rgb", link: "/en/plugins/a98Rgb" },
        { text: "displayP3", link: "/en/plugins/displayP3" },
        { text: "proPhotoRgb", link: "/en/plugins/proPhotoRgb" },
        { text: "rec2020", link: "/en/plugins/rec2020" },
        { text: "percentageRgb", link: "/en/plugins/percentageRgb" }
      ]
    },
    {
      text: "Utilities",
      items: [
        { text: "a11y", link: "/en/plugins/a11y" },
        { text: "blend", link: "/en/plugins/blend" },
        { text: "gradient", link: "/en/plugins/gradient" },
        { text: "harmony", link: "/en/plugins/harmony" },
        { text: "name", link: "/en/plugins/name" },
        { text: "palette", link: "/en/plugins/palette" },
        { text: "scale", link: "/en/plugins/scale" },
        { text: "simulate", link: "/en/plugins/simulate" },
        { text: "temperature", link: "/en/plugins/temperature" },
        { text: "theme", link: "/en/plugins/theme" }
      ]
    }
  ]
};

export default defineConfig({
  base: "/color/",
  vite: {
    resolve: {
      alias: isDev
        ? {
            "@xpyjs/color/plugins": resolve(root, "src/plugins"),
            "@xpyjs/color": resolve(root, "src/index.ts")
          }
        : {
            "@xpyjs/color/plugins": resolve(root, "dist/plugins"),
            "@xpyjs/color": resolve(root, "dist/index.esm.js")
          }
    }
  },
  appearance: "dark",
  title: "xcolor",
  description: "一个轻量、快速、可扩展的 JavaScript/TypeScript 颜色操作库",
  lang: "zh-CN",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/color/logo.svg" }]],
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/",
      themeConfig: {
        nav: [
          { text: "指南", link: "/guide/getting-started" },
          { text: "API", link: "/api/constructor" },
          { text: "插件", link: "/plugins/overview" },
          { text: "Playground", link: "/playground" }
        ],
        sidebar: zhSidebar,
        outline: { level: [2, 3], label: "目录" }
      }
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/en/guide/getting-started" },
          { text: "API", link: "/en/api/constructor" },
          { text: "Plugins", link: "/en/plugins/overview" },
          { text: "Playground", link: "/en/playground" }
        ],
        sidebar: enSidebar,
        outline: { level: [2, 3], label: "On this page" }
      }
    }
  },
  markdown: {
    math: true
  },
  themeConfig: {
    logo: "/logo.svg",
    socialLinks: [{ icon: "github", link: "https://github.com/xpyjs/color" }],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present xpyjs"
    },
    search: { provider: "local" }
  }
});
