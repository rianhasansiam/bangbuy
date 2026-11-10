import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const directories: string[] = [];
afterEach(() => directories.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));
const command = resolve('scripts/disable-marketing.mts');
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'bangbuy-marketing-disable-'));
  directories.push(directory);
  const path = join(directory, 'policy.json');
  const policy = { runtimeEnabled: true, business: { approved: false, reference: 'SYNTHETIC_PRIVATE_REFERENCE' }, pixelEnabled: true, capiEnabled: false };
  writeFileSync(path, JSON.stringify(policy)); chmodSync(path, 0o640);
  return { directory, path, policy };
}

describe('operational marketing disable', () => {
  it('atomically disables a manifest while preserving all other decisions and mode without logging contents', () => {
    const { path, policy } = fixture();
    const output = execFileSync(process.execPath, ['--import', 'tsx', command, '--policy-file', path], { encoding: 'utf8' });
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual({ ...policy, runtimeEnabled: false });
    expect(statSync(path).mode & 0o777).toBe(0o640);
    expect(output.trim()).toBe('{"code":"MARKETING_DISABLED"}');
  });
  it('rejects a symbolic link without changing the target or exposing its contents', () => {
    const { directory, path, policy } = fixture();
    const link = join(directory, 'link.json'); symlinkSync(path, link);
    const result = spawnSync(process.execPath, ['--import', 'tsx', command, '--policy-file', link], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(policy);
    expect(result.stderr).not.toContain('SYNTHETIC_PRIVATE_REFERENCE');
  });
  it('rejects malformed JSON and relative paths with redacted failures', () => {
    const { path } = fixture(); writeFileSync(path, 'SYNTHETIC_MALFORMED_PRIVATE_CONTENT');
    for (const value of [path, 'relative/policy.json']) {
      const result = spawnSync(process.execPath, ['--import', 'tsx', command, '--policy-file', value], { encoding: 'utf8' });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('DISABLE_FAILED');
      expect(result.stderr).not.toContain('SYNTHETIC_MALFORMED_PRIVATE_CONTENT');
      expect(result.stdout).toBe('');
    }
  });
});
