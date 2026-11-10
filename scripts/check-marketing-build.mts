import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]);
}
assert(existsSync(".next/BUILD_ID"), "Run a production build before checking browser assets");
const assets = files(".next/static").filter(path => /\.(?:js|map)$/.test(path));
assert(assets.length > 0, "No browser assets found");
for (const path of assets) {
  const source = readFileSync(path, "utf8");
  for (const value of ["META_CAPI_ACCESS_TOKEN", "META_WORKER_SECRET", "SYNTHETIC_MARKETING_SERVER_TOKEN_DO_NOT_EXPORT", "SYNTHETIC_MARKETING_WORKER_SECRET_DO_NOT_EXPORT", "SYNTHETIC_MARKETING_AUTH_SECRET_DO_NOT_EXPORT"]) {
    assert(!source.includes(value), `Server tracking configuration escaped into ${path}`);
  }
}
console.log(`${assets.length} production browser assets inspected; server tracking credentials and configuration are absent.`);
