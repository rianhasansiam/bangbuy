import assert from 'node:assert/strict';
import { mkdtempSync, chmodSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import test from 'node:test';
import { parseDatabaseOperationsTarget, migrationFileChecksums } from '../scripts/deploy/database-ops.mjs';
import { loadWorkerEnvironment } from '../scripts/deploy/worker-launcher.mjs';

test('database operations require an explicitly named disposable loopback target', () => {
  const target = parseDatabaseOperationsTarget('postgresql://synthetic:secret@127.0.0.1:56543/bangbuy_deployment_test');
  assert.equal(target.target, '127.0.0.1:56543/bangbuy_deployment_test');
  for (const url of [undefined, '', 'postgresql://synthetic@database.example/bangbuy_deployment_test',
    'postgresql://synthetic@127.0.0.1:15432/bangbuy_deployment_test', 'postgresql://synthetic@127.0.0.1/bangbuy',
    'postgresql://127.0.0.1/bangbuy_deployment_test', 'postgresql://synthetic@127.0.0.1/bangbuy_deployment_test?host=remote']) {
    assert.throws(() => parseDatabaseOperationsTarget(url));
  }
});

test('database dry run never loads application/database fallback and never prints credentials', () => {
  const result = spawnSync(process.execPath, ['scripts/deploy/database-ops.mjs', 'backup'], {
    encoding: 'utf8', env: { PATH: process.env.PATH, DATABASE_OPERATIONS_URL: 'postgresql://synthetic:PRIVATE_SENTINEL@127.0.0.1:1/bangbuy_deployment_test',
      DATABASE_URL: 'postgresql://PRIVATE_FALLBACK@production.invalid/bangbuy' },
  });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).executed, false);
  assert.doesNotMatch(result.stdout + result.stderr, /PRIVATE_SENTINEL|PRIVATE_FALLBACK/);
  const absent = spawnSync(process.execPath, ['scripts/deploy/database-ops.mjs', 'status', '--execute'], {
    encoding: 'utf8', env: { PATH: process.env.PATH, DATABASE_URL: 'postgresql://PRIVATE_FALLBACK@production.invalid/bangbuy' },
  });
  assert.equal(absent.status, 1);
  assert.equal(JSON.parse(absent.stderr).code, 'EXPLICIT_TEST_DATABASE_URL_REQUIRED');
  assert.doesNotMatch(absent.stdout + absent.stderr, /PRIVATE_FALLBACK/);
});

test('database executions need the exact target and sanitize connection failures', () => {
  const env = { PATH: process.env.PATH, DATABASE_OPERATIONS_URL: 'postgresql://synthetic:PRIVATE_SENTINEL@127.0.0.1:1/bangbuy_deployment_test' };
  const unconfirmed = spawnSync(process.execPath, ['scripts/deploy/database-ops.mjs', 'status', '--execute'], { encoding: 'utf8', env });
  assert.equal(JSON.parse(unconfirmed.stderr).code, 'EXACT_TARGET_CONFIRMATION_REQUIRED');
  const unreachable = spawnSync(process.execPath, ['scripts/deploy/database-ops.mjs', 'status', '--execute', '--confirm-target', '127.0.0.1:1/bangbuy_deployment_test'], { encoding: 'utf8', env });
  assert.equal(unreachable.status, 1);
  assert.equal(JSON.parse(unreachable.stderr).code, 'POSTGRES_PSQL_FAILED');
  assert.doesNotMatch(unreachable.stdout + unreachable.stderr, /PRIVATE_SENTINEL|postgresql:|password|production/);
});

test('migration checksums include the immutable additive migration', () => {
  const migrations = migrationFileChecksums();
  assert.equal(migrations.length, 15);
  assert.match(migrations.find((row) => row.name === '20261110000000_marketing_conversion_outbox').checksum, /^[a-f0-9]{64}$/);
});

test('worker bootstrap requires a private owned regular file and an explicit database', () => {
  const work = mkdtempSync(join(tmpdir(), 'bangbuy-worker-env-'));
  try {
    const file = join(work, 'worker.env');
    writeFileSync(file, 'DATABASE_URL=postgresql://synthetic:PRIVATE_SENTINEL@127.0.0.1:1/bangbuy_deployment_test\n', { mode: 0o600 });
    const env = loadWorkerEnvironment(file, { META_RUNTIME_ENABLED: 'true', META_CAPI_ENABLED: 'true', META_CAPI_ACCESS_TOKEN: 'PRIVATE_INHERITED', DATABASE_URL: 'PRIVATE_FALLBACK' });
    assert.equal(env.META_RUNTIME_ENABLED, 'false');
    assert.equal(env.META_CAPI_ENABLED, 'false');
    assert.equal(env.META_PIXEL_ENABLED, 'false');
    assert.equal(env.META_CAPI_ACCESS_TOKEN, undefined);
    assert.equal(env.DOTENV_CONFIG_PATH, file);
    chmodSync(file, 0o640);
    assert.throws(() => loadWorkerEnvironment(file), /PRIVATE_OWNED/);
    chmodSync(file, 0o600);
    const link = join(work, 'link.env'); symlinkSync(file, link);
    assert.throws(() => loadWorkerEnvironment(link), /PRIVATE_OWNED/);
    assert.throws(() => loadWorkerEnvironment('relative.env'), /ABSOLUTE/);
    writeFileSync(file, 'META_CAPI_ENABLED=false\n');
    assert.throws(() => loadWorkerEnvironment(file), /EXPLICIT_WORKER_DATABASE/);
  } finally { rmSync(work, { recursive: true, force: true }); }
});

test('worker launcher validation is default-disabled and redacted without connecting', () => {
  const work = mkdtempSync(join(tmpdir(), 'bangbuy-worker-validate-'));
  try {
    const file = join(work, 'worker.env');
    writeFileSync(file, 'DATABASE_URL=postgresql://synthetic:PRIVATE_SENTINEL@127.0.0.1:1/bangbuy_deployment_test\nMETA_CAPI_ACCESS_TOKEN=PRIVATE_ACCESS_TOKEN\n', { mode: 0o600 });
    const result = spawnSync(process.execPath, ['scripts/deploy/worker-launcher.mjs', '--validate'], { encoding: 'utf8', env: { PATH: process.env.PATH, BANGBUY_WORKER_ENV_FILE: file } });
    assert.equal(result.status, 0);
    assert.deepEqual(JSON.parse(result.stdout), { valid: true, privateFile: true, browserEnabled: false, runtimeEnabled: false, capiEnabled: false });
    assert.doesNotMatch(result.stdout + result.stderr, /PRIVATE_SENTINEL|PRIVATE_ACCESS_TOKEN|postgresql:/);
  } finally { rmSync(work, { recursive: true, force: true }); }
});

test('PM2 worker template requires the existing manager and keeps secrets in its file', async () => {
  const work = mkdtempSync(join(tmpdir(), 'bangbuy-worker-pm2-'));
  const server = createServer();
  const original = { ...process.env };
  const require = createRequire(import.meta.url);
  const config = resolve('deploy/pm2/marketing-worker.config.cjs');
  try {
    mkdirSync(join(work, 'logs'));
    writeFileSync(join(work, 'worker.env'), 'DATABASE_URL=PRIVATE_SENTINEL\n', { mode: 0o600 });
    Object.assign(process.env, { BANGBUY_RELEASE_ROOT: resolve('.'), BANGBUY_NODE_BINARY: process.execPath,
      BANGBUY_WORKER_ENV_FILE: join(work, 'worker.env'), BANGBUY_WORKER_LOG_DIRECTORY: join(work, 'logs'), PM2_HOME: work,
      BANGBUY_WORKER_UID: String(process.getuid?.() || 1), BANGBUY_WORKER_GID: String(process.getgid?.() || 1) });
    assert.throws(() => require(config), /EXISTING_CONFIRMED_PM2_DAEMON/);
    await new Promise((done) => server.listen(join(work, 'rpc.sock'), done));
    delete require.cache[config];
    const app = require(config).apps[0];
    assert.equal(app.instances, 1);
    assert.equal(app.exec_mode, 'fork');
    assert.equal(app.kill_timeout, 30000);
    if (process.getuid?.() === 0) { assert.equal(app.uid, 1); assert.equal(app.gid, 1); }
    assert.deepEqual(app.env, { BANGBUY_WORKER_ENV_FILE: join(work, 'worker.env') });
    assert.doesNotMatch(JSON.stringify(app), /PRIVATE_SENTINEL|DATABASE_URL/);
    assert.match(readFileSync(app.script, 'utf8'), /DOTENV_CONFIG_PATH/);
  } finally {
    await new Promise((done) => server.close(done));
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
    delete require.cache[config];
    rmSync(work, { recursive: true, force: true });
  }
});
