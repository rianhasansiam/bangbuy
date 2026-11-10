/* Uses the historically documented existing PM2 stack. Reconfirm its owner,
 * PM2_HOME, Node binary and paths before any installation. No daemon creation. */
/* eslint-disable @typescript-eslint/no-require-imports -- PM2 ecosystem .cjs uses CommonJS exports. */
const { existsSync, lstatSync } = require('node:fs');
const { isAbsolute, join } = require('node:path');

function absolute(name) {
  const value = process.env[name];
  if (!value || !isAbsolute(value)) throw new Error(`ABSOLUTE_${name}_REQUIRED`);
  return value;
}
const cwd = absolute('BANGBUY_RELEASE_ROOT');
const node = absolute('BANGBUY_NODE_BINARY');
const envFile = absolute('BANGBUY_WORKER_ENV_FILE');
const logs = absolute('BANGBUY_WORKER_LOG_DIRECTORY');
const pm2Home = absolute('PM2_HOME');
const managerUid = process.getuid?.();
const managerGid = process.getgid?.();
function identity(name) {
  const value = process.env[name];
  if (!value || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error(`CONFIRMED_NONROOT_${name}_REQUIRED`);
  return Number(value);
}
let workerIdentity = {};
if (managerUid === 0) {
  workerIdentity = { uid: identity('BANGBUY_WORKER_UID'), gid: identity('BANGBUY_WORKER_GID') };
} else if (!managerUid || !managerGid ||
    (process.env.BANGBUY_WORKER_UID && identity('BANGBUY_WORKER_UID') !== managerUid) ||
    (process.env.BANGBUY_WORKER_GID && identity('BANGBUY_WORKER_GID') !== managerGid)) {
  throw new Error('CONFIRMED_NONROOT_PM2_OWNER_REQUIRED');
}
if (!existsSync(join(pm2Home, 'rpc.sock')) || !lstatSync(join(pm2Home, 'rpc.sock')).isSocket()) {
  throw new Error('EXISTING_CONFIRMED_PM2_DAEMON_REQUIRED');
}
if (!existsSync(join(cwd, 'scripts/deploy/worker-launcher.mjs')) || !existsSync(node) || !existsSync(envFile) || !lstatSync(logs).isDirectory()) {
  throw new Error('CONFIRMED_WORKER_PATHS_REQUIRED');
}

module.exports = {
  apps: [{
    name: 'bangbuy-marketing-worker',
    cwd,
    script: join(cwd, 'scripts/deploy/worker-launcher.mjs'),
    interpreter: node,
    node_args: ['--conditions=react-server', '--import', 'tsx'],
    args: ['--cycles', '1000000', '--batch', '1', '--interval', '5000'],
    exec_mode: 'fork', instances: 1,
    ...workerIdentity,
    autorestart: true, restart_delay: 5000, min_uptime: '10s', max_restarts: 10,
    kill_timeout: 30000, time: true,
    out_file: join(logs, 'marketing-worker.log'),
    error_file: join(logs, 'marketing-worker-error.log'),
    merge_logs: true,
    env: { BANGBUY_WORKER_ENV_FILE: envFile },
  }],
};
