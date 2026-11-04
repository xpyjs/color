const assert = require("assert");
const { app, BrowserWindow } = require("electron");
const xcolor = require("@xpyjs/color");
const name = require("@xpyjs/color/plugins/name");

app.whenReady().then(async () => {
  xcolor.use(name);
  assert.strictEqual(xcolor("red").toString("name"), "red");

  const window = new BrowserWindow({ show: false });
  await window.loadURL(process.argv.at(-1));
  const result = await window.webContents.executeJavaScript(`
    new Promise((resolve) => {
      const check = () => {
        const result = document.body.dataset.result;
        if (result !== "pending") resolve(result);
        else setTimeout(check, 50);
      };
      check();
    })
  `);
  assert.strictEqual(result, "passed");
  console.log('data-result="passed"');
  app.exit(0);
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
