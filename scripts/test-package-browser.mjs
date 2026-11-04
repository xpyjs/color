import { spawn } from "child_process";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { createServer } from "http";
import { join, resolve, sep } from "path";
import { build } from "vite";

export async function testBrowser(fixture, electron = false, cdnVersion) {
  const browser = process.env.CHROME_BIN || "google-chrome";
  if (cdnVersion !== undefined) {
    if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(cdnVersion)) throw new Error("Expected an exact CDN version");
    const cdn = `https://cdn.jsdelivr.net/npm/@xpyjs/color@${cdnVersion}/dist`;
    writeFileSync(join(fixture, "index.html"), `
      <body data-result="pending">
      <script type="importmap">{"imports":{"@xpyjs/color":"${cdn}/index.esm.js"}}</script>
      <script src="${cdn}/index.umd.js"></script>
      <script src="${cdn}/plugins/name/index.umd.js"></script>
      <script type="module">
        import xcolor from "@xpyjs/color";
        import name from "${cdn}/plugins/name/index.js";
        xcolor.use(name);
        window.xcolor.use(window.xcolorPlugins.name);
        if (xcolor("red").toHex() === "#ff0000" && window.xcolor("red").toHex() === "#ff0000") {
          document.body.dataset.result = "passed";
        }
      </script>
    `);
  } else {
    const dist = "/node_modules/@xpyjs/color/dist";
    const bundledEntry = join(fixture, "bundled.js");
    writeFileSync(bundledEntry, `
      import xcolor from "@xpyjs/color";
      import name from "@xpyjs/color/plugins/name";
      xcolor.use(name);
      export default xcolor("red").toHex();
    `);
    await build({
      configFile: false,
      root: fixture,
      build: { lib: { entry: bundledEntry, formats: ["es"], fileName: () => "bundled.js" }, outDir: "bundle" }
    });
    writeFileSync(join(fixture, "index.html"), `
      <body data-result="pending">
      <script type="importmap">{"imports":{"@xpyjs/color":"${dist}/index.esm.js"}}</script>
      <script src="${dist}/index.umd.js"></script>
      <script src="${dist}/plugins/name/index.umd.js"></script>
      <script type="module">
        import xcolor from "@xpyjs/color";
        import name from "${dist}/plugins/name/index.js";
        import bundled from "/bundle/bundled.js";

        window.xcolor.use(window.xcolorPlugins.name);
        xcolor.use(name);
        const worker = new Worker("/worker.js", { type: "module" });
        worker.onmessage = ({ data }) => {
          const colors = [xcolor("red").toHex(), window.xcolor("red").toHex(), bundled, data];
          document.body.dataset.result = colors.every((color) => color === "#ff0000") ? "passed" : colors.join(",");
          worker.terminate();
        };
      </script>
    `);
    writeFileSync(join(fixture, "worker.js"), `
      import xcolor from "${dist}/index.esm.js";
      postMessage(xcolor("#f00").toHex());
    `);
  }

  const server = createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const file = resolve(fixture, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(fixture + sep)) return response.writeHead(404).end();
    try {
      const content = readFileSync(file);
      response.setHeader("Content-Type", file.endsWith(".html") ? "text/html" : "text/javascript");
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done, fail) => {
    server.once("error", fail);
    server.listen(0, "127.0.0.1", done);
  });

  try {
    const url = `http://127.0.0.1:${server.address().port}/`;
    const profile = `--user-data-dir=${join(fixture, "chrome-profile")}`;
    let binary = browser;
    let browserArgs = [
      "--headless", "--no-sandbox", "--disable-gpu", "--disable-background-networking",
      profile, "--virtual-time-budget=10000", "--dump-dom", url
    ];
    if (electron) {
      const script = join(fixture, "desktop.cjs");
      copyFileSync(resolve("test/consumer/desktop.cjs"), script);
      binary = process.env.ELECTRON_BIN || "electron";
      browserArgs = ["--no-sandbox", "--disable-gpu", profile, script, url];
    }

    const output = await new Promise((done, fail) => {
      const process = spawn(binary, browserArgs, { stdio: ["ignore", "pipe", "inherit"] });
      let stdout = "";
      process.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
      const timeout = setTimeout(() => {
        process.kill();
        fail(new Error("Browser smoke test timed out"));
      }, 30000);
      process.once("error", (error) => { clearTimeout(timeout); fail(error); });
      process.once("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) done(stdout);
        else fail(new Error(`Browser exited with code ${code}`));
      });
    });
    if (!output.includes('data-result="passed"')) throw new Error(`Browser smoke test failed:\n${output}`);
  } finally {
    server.close();
  }
}
