/** Actual production Next route test; local database and intercepted Graph only. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: PUBLIC_CAPI_HTTP_DATABASE_URL=postgresql://marketing_test@127.0.0.1:56543/bangbuy_tracking_test node scripts/test-public-capi-http.mjs [--skip-build]\nUses synthetic secrets, blocks dotenv loading, binds Next to loopback, and mocks every Meta request. No production URL or real Meta event is used.");
  process.exit(0);
}
assert(args.every(arg => arg === "--skip-build"), "Only --skip-build is supported.");
const connection = process.env.PUBLIC_CAPI_HTTP_DATABASE_URL;
assert(connection, "Set PUBLIC_CAPI_HTTP_DATABASE_URL to the explicit disposable local database.");
const database = new URL(connection);
assert(database.protocol === "postgresql:" && database.hostname === "127.0.0.1" && database.port === "56543" && database.pathname === "/bangbuy_tracking_test", "This test only accepts 127.0.0.1:56543/bangbuy_tracking_test; production and tunnel URLs are rejected.");
const port = Number(process.env.PUBLIC_CAPI_HTTP_PORT ?? 3207);
assert(Number.isSafeInteger(port) && port >= 3000 && port <= 65535 && ![15432, 15439, 56543].includes(port), "Use an isolated local application port.");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const next = join(root, "node_modules/next/dist/bin/next");
const preload = join(root, "scripts/fixtures/public-capi-http-preload.mjs");
const work = mkdtempSync(join(tmpdir(), "bangbuy-public-capi-http-"));
const policyFile = join(work, "policy.json"), recordsFile = join(work, "mock-records.jsonl");
const logFd = openSync(join(work, "next.log"), "a", 0o600);
const origin = "https://public-capi.localhost", alias = "https://legacy-capi.localhost";
const policyVersion = "2026-11-11-public-capi-v1";
const approval = { approved: true, reference: "synthetic-local-http-test-only", expiresAt: new Date(Date.now() + 3_600_000).toISOString() };
const policy = {
  policyVersion, runtimeEnabled: true, origins: [origin, alias], pixelId: "999999999999992",
  business: approval, source: { ...approval, pixelId: "999999999999992" },
  matching: { ...approval, fields: ["client_ip_address", "client_user_agent"] },
  routes: ["/en", "/en/about"].map(pathname => ({ ...approval, pathname, classification: "ordinary", events: ["PageView"] })),
};
writeFileSync(policyFile, JSON.stringify(policy), { mode: 0o600 });
writeFileSync(recordsFile, "", { mode: 0o600 });

// Deliberately do not spread the caller's environment or read a dotenv file.
const environment = {
  PATH: process.env.PATH ?? "", LANG: "en_US.UTF-8", TZ: "UTC", NODE_ENV: "production",
  DATABASE_URL: connection, DIRECT_URL: connection,
  AUTH_SECRET: "synthetic-local-http-only-auth-secret-2026", AUTH_URL: origin, AUTH_TRUST_HOST: "true",
  AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", SITE_URL: origin, NEXT_PUBLIC_SITE_URL: origin,
  STOREFRONT_ORIGIN: "", COMMERCE_ORIGIN: "", NEXT_PUBLIC_STOREFRONT_ORIGIN: "", NEXT_PUBLIC_COMMERCE_ORIGIN: "",
  META_TRACKING_MODE: "server-only", META_ENVIRONMENT: "test", META_RUNTIME_ENABLED: "true",
  META_CAPI_ENABLED: "true", META_PUBLIC_CAPI_ENABLED: "true", META_PUBLIC_CAPI_TRUST_PROXY: "true",
  META_PIXEL_ENABLED: "false", TRACKING_ISOLATION_READY: "false", META_POLICY_FILE: "", META_DEBUG: "false",
  NEXT_PUBLIC_META_PIXEL_ID: "999999999999991", META_TEST_PIXEL_ID: "999999999999992", META_TEST_EVENT_CODE: "SYNTHETIC_HTTP_TEST_CODE",
  META_CAPI_ACCESS_TOKEN: "SYNTHETIC_CAPI_HTTP_ACCESS_TOKEN", META_GRAPH_API_VERSION: "v27.0",
  META_PUBLIC_CAPI_POLICY_FILE: policyFile, META_PUBLIC_CAPI_CONSENT_SECRET: "synthetic-public-capi-http-consent-signing-secret-2026",
  AIRWALLEX_ENABLED: "false", AIRWALLEX_RETURN_URL: `${origin}/orders/payment-return`,
  BANGBUY_PUBLIC_CAPI_HTTP_FIXTURE: "local-only-v1", BANGBUY_PUBLIC_CAPI_HTTP_WORK: work,
  BANGBUY_PUBLIC_CAPI_HTTP_RECORD_FILE: recordsFile, BANGBUY_PUBLIC_CAPI_HTTP_PORT: String(port),
  NODE_OPTIONS: `--import=${preload}`, NEXT_TELEMETRY_DISABLED: "1", __NEXT_PROCESSED_ENV: "true",
};
const checks = [];
const passed = name => { checks.push(name); console.log(`PASS ${name}`); };
const records = () => readFileSync(recordsFile, "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line));
const mockCount = () => records().filter(record => record.type === "mock_graph_acknowledgement").length;
let child;

function call(path, { method = "GET", host = origin, cookie, body, headers = {} } = {}) {
  return new Promise((resolveCall, reject) => {
    const target = new URL(host);
    const encoded = body === undefined ? undefined : JSON.stringify(body);
    const outgoing = request({ hostname: "127.0.0.1", port, path, method, headers: {
      Host: target.host, "X-Forwarded-Proto": "https", "X-Real-IP": "8.8.8.8",
      "User-Agent": "BangBuy local CAPI HTTP fixture", ...(cookie ? { Cookie: cookie } : {}),
      ...(encoded === undefined ? {} : { Origin: host, "Sec-Fetch-Site": "same-origin", "Content-Type": "application/json", "Content-Length": Buffer.byteLength(encoded) }),
      ...headers,
    } }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolveCall({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString("utf8") }));
      response.on("error", reject);
    });
    outgoing.setTimeout(15_000, () => outgoing.destroy(new Error("The local HTTP fixture timed out.")));
    outgoing.on("error", reject);
    outgoing.end(encoded);
  });
}
async function ready() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) throw new Error("The local Next process exited before readiness.");
    try { if ((await call("/api/public/capi/consent")).status === 200) return; } catch { /* Wait for local startup only. */ }
    await new Promise(done => setTimeout(done, 100));
  }
  throw new Error("The local Next process did not become ready.");
}
function cookieFrom(response) {
  const values = response.headers["set-cookie"];
  assert.equal(values?.length, 1, "One first-party consent cookie is required.");
  assert.match(values[0], /; HttpOnly/);
  assert.match(values[0], /; Secure/);
  assert.match(values[0], /; SameSite=Strict/);
  assert.doesNotMatch(values[0], /Domain=/i);
  return values[0].split(";", 1)[0];
}
async function stop(childProcess) {
  if (!childProcess?.pid || childProcess.exitCode !== null || childProcess.signalCode !== null) return;
  const exited = once(childProcess, "exit");
  childProcess.kill("SIGTERM");
  let timer;
  await Promise.race([exited, new Promise(done => { timer = setTimeout(done, 5000); })]);
  clearTimeout(timer);
  if (childProcess.exitCode === null && childProcess.signalCode === null) { childProcess.kill("SIGKILL"); await exited; }
}

try {
  if (!args.includes("--skip-build")) {
    child = spawn(process.execPath, [next, "build"], { cwd: root, env: environment, stdio: ["ignore", logFd, logFd] });
    const [code] = await once(child, "exit");
    assert.equal(code, 0, "The isolated build failed. Run the normal validated local build, then use --skip-build.");
    child = undefined;
  }
  assert(existsSync(join(root, ".next/BUILD_ID")), "Build the application before reusing its artifact.");
  child = spawn(process.execPath, [next, "start", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: root, env: environment, stdio: ["ignore", logFd, logFd] });
  await ready();
  const initial = await call("/api/public/capi/consent");
  assert.equal(initial.status, 200);
  assert.match(initial.headers["cache-control"], /no-store/);
  assert.equal(JSON.parse(initial.body).policy.enabled, true);
  assert.equal(JSON.parse(initial.body).consent.state, "unknown");
  assert.equal(mockCount(), 0);
  passed("Actual compiled consent route starts unknown without external delivery");

  const event = { eventId: randomUUID(), name: "PageView", sourceUrl: `${origin}/en` };
  assert.equal((await call("/api/public/capi", { method: "POST", body: event })).status, 204);
  assert.equal(mockCount(), 0);
  passed("No event is forwarded before explicit consent");

  const grant = await call("/api/public/capi/consent", { method: "POST", body: { state: "granted", policyVersion } });
  assert.equal(grant.status, 200);
  assert.equal(JSON.parse(grant.body).consent.state, "granted");
  const cookie = cookieFrom(grant);
  assert.equal((await call("/api/public/capi", { method: "POST", cookie, body: event })).status, 202);
  assert.equal(mockCount(), 1);
  passed("Consent and event route bundles share the grant and send one minimal mocked projection");
  assert.equal((await call("/api/public/capi", { method: "POST", cookie, body: event })).status, 202);
  assert.equal(mockCount(), 1);
  passed("A duplicate event ID returns the existing acknowledgement without another send");

  assert.equal((await call("/api/public/capi", { method: "POST", host: alias, cookie, body: { ...event, eventId: randomUUID(), sourceUrl: `${alias}/en` } })).status, 204);
  assert.equal((await call("/api/public/capi", { method: "POST", cookie, body: { ...event, eventId: randomUUID() }, headers: { Origin: alias } })).status, 403);
  for (const sourceUrl of [`${origin}/en/cart`, `${origin}/en/checkout`, `${origin}/en?private=sentinel`, `${origin}/en#private-sentinel`]) {
    assert.equal((await call("/api/public/capi", { method: "POST", cookie, body: { ...event, eventId: randomUUID(), sourceUrl } })).status, 204);
  }
  assert.equal(mockCount(), 1);
  passed("Host-only consent, same-origin requests, private paths, query and hash exclusions hold");

  const aliasGrant = await call("/api/public/capi/consent", { method: "POST", host: alias, body: { state: "granted", policyVersion } });
  assert.equal(aliasGrant.status, 200);
  const aliasCookie = cookieFrom(aliasGrant);
  assert.equal((await call("/api/public/capi", { method: "POST", host: alias, cookie: aliasCookie, body: { ...event, eventId: randomUUID(), sourceUrl: `${alias}/en/about` } })).status, 202);
  assert.equal(mockCount(), 2);
  passed("The second existing-host fixture obtains its own independent grant");

  const revoked = await call("/api/public/capi/consent", { method: "POST", cookie, body: { state: "revoked", policyVersion } });
  assert.equal(revoked.status, 200);
  assert.equal(JSON.parse(revoked.body).consent.state, "revoked");
  assert.equal((await call("/api/public/capi", { method: "POST", cookie, body: { ...event, eventId: randomUUID() } })).status, 204);
  assert.equal(mockCount(), 2);
  passed("Revocation invalidates the previous grant across compiled route bundles");

  const privatePage = await call("/en/cart");
  assert.equal(privatePage.status, 200);
  assert.doesNotMatch(privatePage.headers["content-security-policy"] ?? "", /facebook|fbcdn/i);
  assert.doesNotMatch(privatePage.body, /connect\.facebook\.net|facebook\.com\/tr|fbevents\.js/);
  passed("The existing-domain private document retains a Meta-blocking CSP and no Pixel bootstrap");

  policy.runtimeEnabled = false;
  writeFileSync(policyFile, JSON.stringify(policy), { mode: 0o600 });
  assert.equal((await call("/api/public/capi", { method: "POST", host: alias, cookie: aliasCookie, body: { ...event, eventId: randomUUID(), sourceUrl: `${alias}/en` } })).status, 204);
  assert.equal(JSON.parse((await call("/api/public/capi/consent", { host: alias, cookie: aliasCookie })).body).policy.enabled, false);
  assert.equal(mockCount(), 2);
  passed("Runtime manifest disable takes effect without a process restart");
  assert.equal(records().filter(record => record.type !== "mock_graph_acknowledgement").length, 0, "No invalid projection or nonlocal fetch may occur.");
  console.log(JSON.stringify({ scope: "Local production Next HTTP routes; all Meta I/O mocked, no live acceptance or browser verification", passed: true, checks: checks.length, mockedAcknowledgements: mockCount() }));
} finally {
  await stop(child);
  closeSync(logFd);
  rmSync(work, { recursive: true, force: true });
}
