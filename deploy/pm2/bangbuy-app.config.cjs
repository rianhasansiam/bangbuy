/* eslint-disable @typescript-eslint/no-require-imports -- PM2 .config.cjs ecosystem files use CommonJS; no application/client import. */
const { existsSync, readFileSync, realpathSync, statSync } = require("node:fs");
const { isAbsolute, join } = require("node:path");

function required(name) {
  const value = process.env[name];
  if (!value || /[\r\n\0]/.test(value)) throw new Error(`Confirm ${name} before loading this deployment definition.`);
  return value;
}
const release = required("BANGBUY_RELEASE_ROOT");
const node = required("BANGBUY_NODE_BINARY");
const envFile = required("BANGBUY_APP_ENV_FILE");
const logs = required("BANGBUY_APP_LOG_DIRECTORY");
const pm2Home = required("PM2_HOME");
const name = required("BANGBUY_APP_PROCESS_NAME");
const port = Number(required("BANGBUY_APP_PORT"));
for (const path of [release, node, envFile, logs, pm2Home]) if (!isAbsolute(path)) throw new Error("Deployment paths must be absolute.");
if (!/^[a-zA-Z0-9_-]{1,80}$/.test(name) || name === "all") throw new Error("Use only the specifically confirmed BangBuy process name.");
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Use the confirmed BangBuy loopback listener port.");
if (!existsSync(join(pm2Home, "rpc.sock")) || !statSync(join(pm2Home, "rpc.sock")).isSocket()) throw new Error("The existing PM2 RPC socket is required; do not initialize another daemon.");
if (!statSync(logs).isDirectory()) throw new Error("Prepare an application-only log directory before loading this definition.");
const root = realpathSync(release);
if (JSON.parse(readFileSync(join(root, "package.json"), "utf8")).name !== "bangbuy") throw new Error("The release checkout must be BangBuy.");

module.exports = {
  apps: [{
    name, cwd: root, script: join(root, "scripts/deploy/app-launcher.mjs"), interpreter: node,
    instances: 1, exec_mode: "fork", autorestart: true, min_uptime: "10s", max_restarts: 5,
    restart_delay: 3000, kill_timeout: 15000, time: false, merge_logs: true,
    out_file: join(logs, "app-out.log"), error_file: join(logs, "app-error.log"),
    env: { NODE_ENV: "production", BANGBUY_RELEASE_ROOT: root, BANGBUY_NODE_BINARY: node, BANGBUY_APP_ENV_FILE: envFile, BANGBUY_APP_PORT: String(port) },
  }],
};
