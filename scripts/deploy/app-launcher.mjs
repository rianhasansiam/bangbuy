import { spawn } from "node:child_process";
import { realpathSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { loadApplicationEnvironment } from "./protected-env.mjs";

// The launcher is prepared for the existing PM2 stack. It is never invoked by
// a build or test and does not install/reload anything itself.
try {
  const releaseRoot = process.env.BANGBUY_RELEASE_ROOT;
  const nodeBinary = process.env.BANGBUY_NODE_BINARY;
  if (!releaseRoot || !isAbsolute(releaseRoot) || !nodeBinary || !isAbsolute(nodeBinary)) throw new Error("Confirmed absolute release and Node paths are required.");
  const root = realpathSync(releaseRoot);
  if (JSON.parse(readFileSync(join(root, "package.json"), "utf8")).name !== "bangbuy") throw new Error("The release is not the BangBuy application.");
  if (!statSync(realpathSync(nodeBinary)).isFile()) throw new Error("The confirmed Node binary is unavailable.");
  const port = Number(process.env.BANGBUY_APP_PORT);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("A confirmed unprivileged application port is required.");
  const values = loadApplicationEnvironment(process.env.BANGBUY_APP_ENV_FILE, { releaseRoot: root });
  const child = spawn(nodeBinary, [join(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: root, env: values, stdio: "inherit",
  });
  const forward = signal => { if (!child.killed) child.kill(signal); };
  process.once("SIGINT", () => forward("SIGINT")); process.once("SIGTERM", () => forward("SIGTERM"));
  child.once("error", () => { console.error("[bangbuy.app]", { code: "START_FAILED" }); process.exitCode = 1; });
  child.once("exit", code => { process.exitCode = code ?? 1; });
} catch {
  // No environment path contents, credentials, URLs or arbitrary exception.
  console.error("[bangbuy.app]", { code: "CONFIGURATION_REJECTED" }); process.exitCode = 1;
}
