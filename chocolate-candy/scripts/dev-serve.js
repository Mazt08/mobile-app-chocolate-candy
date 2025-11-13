#!/usr/bin/env node
const { spawn } = require("child_process");
const net = require("net");
const http = require("http");
const path = require("path");

// We previously probed ports manually. Using --port 0 lets Angular/Vite choose a free one
// automatically without interactive conflict prompts.
function choosePort() {
  return Promise.resolve(0);
}

async function ensureBackendHealthy() {
  function isListening(port = 3000) {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(1000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  const listening = await isListening(3000);
  let backendProc = null;
  if (!listening) {
    const entry = path.resolve(
      __dirname,
      "..",
      "..",
      "backend",
      "src",
      "server.js"
    );
    console.log("[dev-serve] Starting backend:", entry);
    backendProc = spawn(process.execPath, [entry], {
      stdio: "inherit",
      shell: false,
      cwd: path.dirname(entry),
    });
  } else {
    console.log("[dev-serve] Backend already running on :3000");
  }

  const start = Date.now();
  while (Date.now() - start < 15000) {
    if (await isListening(3000)) return backendProc; // healthy
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("Backend did not become healthy on :3000");
}

(async () => {
  try {
    const be = await ensureBackendHealthy();
    const port = await choosePort();
    console.log(`[dev-serve] Requesting automatic free frontend port (0)`);
    const args = [
      "ng",
      "serve",
      "--configuration",
      "development",
      "--port",
      String(port),
      "--proxy-config",
      "proxy.conf.json",
    ];
    const child = spawn("npx", args, {
      stdio: "inherit",
      shell: true,
      cwd: path.resolve(__dirname, ".."),
    });
    child.on("exit", (code) => {
      if (be) {
        try {
          be.kill();
        } catch {}
      }
      process.exit(code);
    });
  } catch (err) {
    console.error("[dev-serve] Failed to start:", err.message);
    process.exit(1);
  }
})();
