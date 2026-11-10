#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { closeSync, existsSync, openSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const allowedActions = ['plan', 'status', 'backup', 'restore-validation'];

/** Deliberately local only. Never falls back to DATABASE_URL, DIRECT_URL,
 * dotenv, PGHOST, a service file or the documented production tunnel. */
export function parseDatabaseOperationsTarget(value) {
  let url;
  try { url = new URL(value ?? ''); } catch { throw new Error('EXPLICIT_TEST_DATABASE_URL_REQUIRED'); }
  const database = decodeURIComponent(url.pathname.slice(1));
  const port = url.port || '5432';
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || port === '15432' ||
      !/^bangbuy_[a-z0-9_]*(?:test|restore_validation)$/.test(database) || !url.username ||
      [...url.searchParams.keys()].some((key) => !['sslmode', 'connect_timeout'].includes(key))) {
    throw new Error('LOCAL_DISPOSABLE_DATABASE_REQUIRED');
  }
  const sslmode = url.searchParams.get('sslmode') ?? 'disable';
  if (!['disable', 'require', 'verify-ca', 'verify-full'].includes(sslmode)) throw new Error('INVALID_TLS_MODE');
  return {
    host: url.hostname.replace(/^\[|\]$/g, ''), port, database,
    target: `${url.hostname}:${port}/${database}`,
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), sslmode,
  };
}

function childEnvironment(target) {
  // Inherited libpq settings could silently override a guarded destination.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('PG') && !['DATABASE_URL', 'DIRECT_URL'].includes(key)));
  return { ...env, PGHOST: target.host, PGPORT: target.port, PGDATABASE: target.database,
    PGUSER: target.user, PGPASSWORD: target.password, PGSSLMODE: target.sslmode, PGCONNECT_TIMEOUT: '5' };
}

function command(target, tool, args) {
  const binaryDirectory = process.env.BANGBUY_PG_BIN;
  if (binaryDirectory && !isAbsolute(binaryDirectory)) throw new Error('POSTGRES_BINARY_DIRECTORY_MUST_BE_ABSOLUTE');
  const executable = binaryDirectory ? join(binaryDirectory, tool) : tool;
  const result = spawnSync(executable, args, { env: childEnvironment(target), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  // Never print libpq errors, URLs, role/password values or dump contents.
  if (result.error || result.status !== 0) throw new Error(`POSTGRES_${tool.toUpperCase()}_FAILED`);
  return result.stdout.trim();
}

function query(target, sql) {
  return command(target, 'psql', ['-X', '--no-psqlrc', '--set=ON_ERROR_STOP=1', '--tuples-only', '--no-align', '--command', sql]);
}

export function migrationFileChecksums(directory = join(repository, 'prisma/migrations')) {
  return readdirSync(directory).filter((name) => /^\d+_/.test(name) && existsSync(join(directory, name, 'migration.sql')))
    .sort().map((name) => ({ name, checksum: createHash('sha256').update(readFileSync(join(directory, name, 'migration.sql'))).digest('hex') }));
}

export function databaseMigrationStatus(target) {
  if (query(target, 'SELECT current_database()') !== target.database) throw new Error('DATABASE_IDENTITY_MISMATCH');
  const present = query(target, "SELECT to_regclass('public._prisma_migrations') IS NOT NULL") === 't';
  const applied = present ? JSON.parse(query(target, 'SELECT COALESCE(json_agg(row_to_json(m)),\'[]\'::json) FROM (SELECT migration_name, checksum, finished_at IS NOT NULL AS finished, rolled_back_at IS NOT NULL AS rolled_back FROM "_prisma_migrations" ORDER BY migration_name) m')) : [];
  const files = migrationFileChecksums();
  return {
    target: target.target,
    serverVersion: query(target, 'SHOW server_version'),
    applied: applied.filter((row) => row.finished && !row.rolled_back).map((row) => row.migration_name),
    pending: files.filter((file) => !applied.some((row) => row.migration_name === file.name && row.finished && !row.rolled_back)).map((file) => file.name),
    failed: applied.filter((row) => !row.finished && !row.rolled_back).map((row) => row.migration_name),
    checksumMismatches: applied.filter((row) => row.finished && !row.rolled_back && files.some((file) => file.name === row.migration_name && file.checksum !== row.checksum)).map((row) => row.migration_name),
    databaseOnly: applied.filter((row) => row.finished && !row.rolled_back && !files.some((file) => file.name === row.migration_name)).map((row) => row.migration_name),
  };
}

async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
function exclusiveJson(path, value) { writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); }
function archivePath(value) {
  if (!value || !isAbsolute(value) || !existsSync(dirname(value))) throw new Error('ABSOLUTE_ARCHIVE_PATH_REQUIRED');
  return resolve(value);
}

export async function databaseOperationsMain(argv = process.argv.slice(2)) {
  const action = argv[0] ?? 'plan';
  if (!allowedActions.includes(action)) throw new Error('INVALID_OPERATION');
  const flags = new Map();
  for (let index = 1; index < argv.length; index += 1) {
    const name = argv[index];
    if (!['--execute', '--archive', '--confirm-target'].includes(name) || flags.has(name)) throw new Error('INVALID_ARGUMENT');
    if (name === '--execute') flags.set(name, true);
    else {
      if (!argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error('ARGUMENT_VALUE_REQUIRED');
      flags.set(name, argv[++index]);
    }
  }
  const target = parseDatabaseOperationsTarget(process.env.DATABASE_OPERATIONS_URL);
  const archive = flags.has('--archive') ? archivePath(flags.get('--archive')) : null;
  if (action === 'plan' || !flags.has('--execute')) {
    return { action, target: target.target, executed: false, requiresExplicitTarget: true, productionAllowed: false };
  }
  if (flags.get('--confirm-target') !== target.target) throw new Error('EXACT_TARGET_CONFIRMATION_REQUIRED');
  if (action === 'status') return { action, executed: true, ...databaseMigrationStatus(target) };
  if (!archive) throw new Error('ARCHIVE_REQUIRED');
  if (action === 'backup') {
    if (existsSync(archive) || existsSync(`${archive}.manifest.json`)) throw new Error('BACKUP_OVERWRITE_REFUSED');
    const descriptor = openSync(archive, 'wx', 0o600); closeSync(descriptor);
    try {
      const status = databaseMigrationStatus(target);
      command(target, 'pg_dump', ['--format=custom', '--no-owner', '--no-acl', '--file', archive]);
      command(target, 'pg_restore', ['--list', archive]);
      const manifest = { format: 1, source: target.target, createdAt: new Date().toISOString(), sha256: await hashFile(archive), bytes: statSync(archive).size,
        status, archiveFormat: 'PostgreSQL custom', restoreValidated: false };
      exclusiveJson(`${archive}.manifest.json`, manifest);
      return { action, executed: true, archive, manifest: `${archive}.manifest.json`, bytes: manifest.bytes, sha256: manifest.sha256 };
    } catch (error) { unlinkSync(archive); throw error; }
  }
  if (action === 'restore-validation') {
    if (!target.database.endsWith('_restore_validation')) throw new Error('RESTORE_VALIDATION_TARGET_REQUIRED');
    if (!existsSync(archive) || !statSync(archive).isFile() || existsSync(`${archive}.restore-validation.json`)) throw new Error('TRUSTED_NEW_VALIDATION_ARCHIVE_REQUIRED');
    const manifest = JSON.parse(readFileSync(`${archive}.manifest.json`, 'utf8'));
    if (manifest.format !== 1 || manifest.source === target.target || manifest.sha256 !== await hashFile(archive)) throw new Error('ARCHIVE_IDENTITY_OR_HASH_MISMATCH');
    const tableCount = Number(query(target, "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema')"));
    if (tableCount !== 0) throw new Error('EMPTY_RESTORE_DATABASE_REQUIRED');
    command(target, 'pg_restore', ['--dbname', target.database, '--exit-on-error', '--single-transaction', '--no-owner', '--no-acl', archive]);
    const status = databaseMigrationStatus(target);
    if (status.failed.length || status.checksumMismatches.length || JSON.stringify(status.applied) !== JSON.stringify(manifest.status.applied)) throw new Error('RESTORED_MIGRATION_HISTORY_MISMATCH');
    const proof = { format: 1, source: manifest.source, restoredTo: target.target, sha256: manifest.sha256, validatedAt: new Date().toISOString(), status };
    exclusiveJson(`${archive}.restore-validation.json`, proof);
    return { action, executed: true, target: target.target, proof: `${archive}.restore-validation.json`, migrationHistoryMatches: true };
  }
  throw new Error('INVALID_OPERATION');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  databaseOperationsMain().then((result) => console.info(JSON.stringify(result))).catch((error) => {
    const code = error instanceof Error && /^[A-Z_]+$/.test(error.message) ? error.message : 'DATABASE_OPERATION_FAILED';
    // Failure can happen after a completed dump/restore. Do not imply rollback.
    console.error(JSON.stringify({ code, completed: false })); process.exitCode = 1;
  });
}
