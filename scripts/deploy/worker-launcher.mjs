#!/usr/bin/env node
import { lstatSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';

const releaseRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Keep credentials out of the PM2 process declaration and its saved env.
 * This launcher intentionally never reads the application's .env file. */
export function loadWorkerEnvironment(path, inherited = process.env) {
  if (!path || !isAbsolute(path)) throw new Error('ABSOLUTE_WORKER_ENV_FILE_REQUIRED');
  const fromRelease = relative(releaseRoot, resolve(path));
  if (!fromRelease.startsWith('../') || fromRelease === '..') throw new Error('WORKER_ENV_MUST_BE_OUTSIDE_RELEASE');
  const file = lstatSync(path);
  if (!file.isFile() || file.size > 128 * 1024 || (file.mode & 0o077) !== 0 || (process.getuid && file.uid !== process.getuid())) {
    throw new Error('PRIVATE_OWNED_WORKER_ENV_FILE_REQUIRED');
  }
  const supplied = parse(readFileSync(path));
  if (!supplied.DATABASE_URL?.trim()) throw new Error('EXPLICIT_WORKER_DATABASE_REQUIRED');
  const inheritedSafe = Object.fromEntries(Object.entries(inherited).filter(([key]) =>
    !key.startsWith('META_') && !key.startsWith('DOTENV_') &&
    !['DATABASE_URL', 'DIRECT_URL', 'NEXT_PUBLIC_META_PIXEL_ID', 'TRACKING_ISOLATION_READY', 'STOREFRONT_ORIGIN', 'COMMERCE_ORIGIN'].includes(key)));
  return {
    ...inheritedSafe,
    ...supplied,
    // Only the protected worker file may enable runtime/server delivery.
    META_RUNTIME_ENABLED: supplied.META_RUNTIME_ENABLED === 'true' ? 'true' : 'false',
    META_CAPI_ENABLED: supplied.META_CAPI_ENABLED === 'true' ? 'true' : 'false',
    META_PIXEL_ENABLED: 'false',
    DOTENV_CONFIG_PATH: path,
    DOTENV_CONFIG_QUIET: 'true',
  };
}

export async function workerLauncherMain(argv = process.argv.slice(2)) {
  if (resolve(process.cwd()) !== resolve(releaseRoot)) throw new Error('WORKER_RELEASE_DIRECTORY_MISMATCH');
  const env = loadWorkerEnvironment(process.env.BANGBUY_WORKER_ENV_FILE);
  if (argv.includes('--validate')) {
    return { valid: true, privateFile: true, browserEnabled: false,
      runtimeEnabled: env.META_RUNTIME_ENABLED === 'true', capiEnabled: env.META_CAPI_ENABLED === 'true' };
  }
  for (const key of Object.keys(process.env)) delete process.env[key];
  Object.assign(process.env, env);
  await import('../marketing-worker.ts');
  return null;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  workerLauncherMain().then((result) => { if (result) console.info(JSON.stringify(result)); }).catch((error) => {
    const code = error instanceof Error && /^[A-Z_]+$/.test(error.message) ? error.message : 'WORKER_BOOTSTRAP_FAILED';
    console.error(JSON.stringify({ code })); process.exitCode = 1;
  });
}
