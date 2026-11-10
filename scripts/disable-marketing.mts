import { randomUUID } from 'node:crypto';
import { open, lstat, readFile, rename, unlink } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';

// Deliberately never loads .env, credentials, a browser or a network client.
// Run as the manifest owner on every app and worker instance.
async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--policy-file' || !isAbsolute(args[1])) {
    throw new Error('INVALID_ARGUMENTS');
  }
  const path = args[1];
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size > 256 * 1024 ||
      (process.getuid && before.uid !== process.getuid())) throw new Error('INVALID_FILE');
  const policy: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (!policy || typeof policy !== 'object' || Array.isArray(policy) ||
      typeof (policy as Record<string, unknown>).runtimeEnabled !== 'boolean') throw new Error('INVALID_POLICY');
  const disabled = { ...policy, runtimeEnabled: false };
  const temp = join(dirname(path), `.marketing-disabled-${randomUUID()}.tmp`);
  try {
    const file = await open(temp, 'wx', 0o600);
    try {
      await file.writeFile(`${JSON.stringify(disabled, null, 2)}\n`, 'utf8');
      await file.chmod(before.mode & 0o777);
      await file.sync();
    } finally { await file.close(); }
    const current = await lstat(path);
    if (current.ino !== before.ino || current.mtimeMs !== before.mtimeMs || current.size !== before.size) {
      throw new Error('CONCURRENT_UPDATE');
    }
    await rename(temp, path);
    const directory = await open(dirname(path), 'r');
    try { await directory.sync(); } finally { await directory.close(); }
  } finally { await unlink(temp).catch(() => undefined); }
  console.info(JSON.stringify({ code: 'MARKETING_DISABLED' }));
}

main().catch(() => {
  // No manifest, exception, credential, customer identifier or URL is logged.
  console.error(JSON.stringify({ code: 'DISABLE_FAILED', instruction: 'Check explicit absolute path, ownership, valid JSON and directory write access; retry without concurrent policy edits.' }));
  process.exitCode = 1;
});
