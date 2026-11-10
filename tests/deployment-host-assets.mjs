import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { loadApplicationEnvironment, readProtectedEnvironment } from "../scripts/deploy/protected-env.mjs";
import { renderBangbuyNginx } from "../scripts/deploy/render-nginx.mjs";
import { runDeploymentHealthChecks } from "../scripts/deploy/healthcheck.mjs";

const config = {
  storefrontOrigin: "https://catalog.example.test", commerceOrigin: "https://legacy.example.test",
  legacyCommerceOrigins: ["https://legacy.example.test", "https://www.legacy.example.test"],
  applicationUpstream: "http://127.0.0.1:3000", commerceCertificate: "/confirmed/commerce.pem",
  commerceCertificateKey: "/confirmed/commerce.key", storefrontCertificate: "/confirmed/catalog.pem",
  storefrontCertificateKey: "/confirmed/catalog.key", uploadsDirectory: "/confirmed/uploads",
};

test("protected application configuration requires an owned private file outside the release", () => {
  const root = mkdtempSync(join(tmpdir(), "bangbuy-app-env-"));
  try {
    const release = join(root, "release"); mkdirSync(release);
    const file = join(root, "app.env"); writeFileSync(file, "DATABASE_URL=PRIVATE_SENTINEL\n", { mode: 0o600 });
    assert.equal(readProtectedEnvironment(file, { releaseRoot: release }).DATABASE_URL, "PRIVATE_SENTINEL");
    chmodSync(file, 0o640); assert.throws(() => readProtectedEnvironment(file)); chmodSync(file, 0o600);
    const link = join(root, "link.env"); symlinkSync(file, link); assert.throws(() => readProtectedEnvironment(link));
    const inside = join(release, "app.env"); writeFileSync(inside, "X=1", { mode: 0o600 });
    assert.throws(() => readProtectedEnvironment(inside, { releaseRoot: release }));
    mkdirSync(join(release, "..hidden")); const hidden = join(release, "..hidden/app.env");
    writeFileSync(hidden, "X=1", { mode: 0o600 }); assert.throws(() => readProtectedEnvironment(hidden, { releaseRoot: release }));
    writeFileSync(file, "NEXT_PUBLIC_CAPI_ACCESS_TOKEN=PRIVATE_SENTINEL\n"); assert.throws(() => readProtectedEnvironment(file));
    assert.throws(() => readProtectedEnvironment("relative.env"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("missing private tracking settings cannot inherit enabled PM2 or dotenv gates", () => {
  const root = mkdtempSync(join(tmpdir(), "bangbuy-app-deny-"));
  try {
    const file = join(root, "app.env"); writeFileSync(file, "AUTH_SECRET=PRIVATE_SENTINEL\n", { mode: 0o600 });
    const env = loadApplicationEnvironment(file, { inherited: { PATH: "/synthetic/bin", META_RUNTIME_ENABLED: "true", META_PIXEL_ENABLED: "true", META_CAPI_ENABLED: "true", TRACKING_ISOLATION_READY: "true", META_ENVIRONMENT: "production", META_POLICY_FILE: "/stale/policy.json", META_CAPI_ACCESS_TOKEN: "STALE_SECRET", NEXT_PUBLIC_META_PIXEL_ID: "12345", META_UNKNOWN: "unreviewed", DOTENV_CONFIG_PATH: "/stale/app.env" } });
    for (const key of ["META_RUNTIME_ENABLED", "META_PIXEL_ENABLED", "META_CAPI_ENABLED", "TRACKING_ISOLATION_READY", "META_DEBUG"]) assert.equal(env[key], "false");
    assert.equal(env.META_ENVIRONMENT, "disabled"); assert.equal(env.META_POLICY_FILE, "");
    assert.equal(env.META_CAPI_ACCESS_TOKEN, ""); assert.equal(env.NEXT_PUBLIC_META_PIXEL_ID, "");
    assert.equal(env.META_UNKNOWN, undefined); assert.equal(env.DOTENV_CONFIG_PATH, undefined);
    assert.equal(env.AUTH_SECRET, "PRIVATE_SENTINEL"); assert.equal(env.NODE_ENV, "production");
    writeFileSync(file, "META_ENVIRONMENT=staging\nMETA_RUNTIME_ENABLED=true\nMETA_CAPI_ENABLED=true\nTRACKING_ISOLATION_READY=true\nMETA_POLICY_FILE=/reviewed/policy.json\n");
    const explicit = loadApplicationEnvironment(file, { inherited: {} });
    assert.equal(explicit.META_RUNTIME_ENABLED, "true"); assert.equal(explicit.META_CAPI_ENABLED, "true");
    assert.equal(explicit.META_PIXEL_ENABLED, "false"); assert.equal(explicit.META_POLICY_FILE, "/reviewed/policy.json");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("application launcher starts only the confirmed release on loopback and redacts failure", () => {
  const root = mkdtempSync(join(tmpdir(), "bangbuy-app-launch-"));
  try {
    const release = join(root, "release"); mkdirSync(join(release, "node_modules/next/dist/bin"), { recursive: true });
    writeFileSync(join(release, "package.json"), JSON.stringify({ name: "bangbuy" }));
    writeFileSync(join(release, "node_modules/next/dist/bin/next"), 'console.log(JSON.stringify({args:process.argv.slice(2),runtime:process.env.META_RUNTIME_ENABLED,mode:process.env.META_ENVIRONMENT}));');
    const file = join(root, "app.env"); writeFileSync(file, "AUTH_SECRET=PRIVATE_SENTINEL\n", { mode: 0o600 });
    const env = { PATH: process.env.PATH, BANGBUY_RELEASE_ROOT: release, BANGBUY_NODE_BINARY: process.execPath, BANGBUY_APP_ENV_FILE: file, BANGBUY_APP_PORT: "3199", META_RUNTIME_ENABLED: "true" };
    const launched = spawnSync(process.execPath, ["scripts/deploy/app-launcher.mjs"], { encoding: "utf8", env });
    assert.equal(launched.status, 0);
    assert.deepEqual(JSON.parse(launched.stdout), { args: ["start", "--hostname", "127.0.0.1", "--port", "3199"], runtime: "false", mode: "disabled" });
    const refused = spawnSync(process.execPath, ["scripts/deploy/app-launcher.mjs"], { encoding: "utf8", env: { ...env, BANGBUY_APP_PORT: "80" } });
    assert.equal(refused.status, 1); assert.match(refused.stderr, /CONFIGURATION_REJECTED/);
    assert.doesNotMatch(launched.stdout + launched.stderr + refused.stderr, /PRIVATE_SENTINEL/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("PM2 application ecosystem requires the existing socket and contains no secret values", async () => {
  const root = mkdtempSync(join(tmpdir(), "bangbuy-app-pm2-"));
  const original = { ...process.env }; const server = createServer(); const require = createRequire(import.meta.url);
  const path = resolve("deploy/pm2/bangbuy-app.config.cjs");
  try {
    mkdirSync(join(root, "logs")); writeFileSync(join(root, "app.env"), "AUTH_SECRET=PRIVATE_SENTINEL\n", { mode: 0o600 });
    Object.assign(process.env, { BANGBUY_RELEASE_ROOT: resolve("."), BANGBUY_NODE_BINARY: process.execPath, BANGBUY_APP_ENV_FILE: join(root, "app.env"), BANGBUY_APP_LOG_DIRECTORY: join(root, "logs"), BANGBUY_APP_PROCESS_NAME: "bangbuy", BANGBUY_APP_PORT: "3000", PM2_HOME: root });
    assert.throws(() => require(path), /existing PM2 RPC socket/);
    await new Promise(done => server.listen(join(root, "rpc.sock"), done)); delete require.cache[path];
    const app = require(path).apps[0]; assert.equal(app.name, "bangbuy"); assert.equal(app.instances, 1);
    assert.equal(app.exec_mode, "fork"); assert.equal(app.env.BANGBUY_APP_PORT, "3000");
    assert.doesNotMatch(JSON.stringify(app), /PRIVATE_SENTINEL|AUTH_SECRET/);
  } finally {
    if (server.listening) await new Promise(done => server.close(done));
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original); delete require.cache[path]; rmSync(root, { recursive: true, force: true });
  }
});

test("Nginx draft rejects legacy catalog reuse, unconfirmed origins and unsafe upstream/path input", () => {
  for (const modified of [
    { storefrontOrigin: null }, { storefrontOrigin: config.commerceOrigin },
    { storefrontOrigin: config.legacyCommerceOrigins[1] }, { storefrontOrigin: "http://catalog.example.test" },
    { storefrontOrigin: "https://catalog.example.test/path" }, { applicationUpstream: "http://public.example.test:3000" },
    { applicationUpstream: "http://127.0.0.1:3000/path" }, { commerceCertificate: "/tmp/x;\nreturn 200;" },
    { uploadsDirectory: "/tmp/../secrets" },
  ]) assert.throws(() => renderBangbuyNginx({ ...config, ...modified }));
});

test("Nginx draft scopes hosts, strips forwarded trust, blocks private public APIs and bounds logs", () => {
  const { configuration, warnings } = renderBangbuyNginx(config);
  assert.match(configuration, /server_name catalog\.example\.test/); assert.match(configuration, /return 421/);
  assert.match(configuration, /location \/api\/ \{ return 404; \}/); assert.match(configuration, /proxy_set_header Forwarded ""/);
  assert.match(configuration, /proxy_set_header X-Forwarded-For \$remote_addr/);
  assert.match(configuration, /log_format bangbuy_deployment '\$request_method \$bangbuy_deployment_route_class \$status'/);
  assert.equal((configuration.match(/access_log /g) ?? []).length, 3);
  assert.equal((configuration.match(/error_log \/dev\/null crit/g) ?? []).length, 3);
  assert.doesNotMatch(configuration, /listen[^;]*default_server|proxy_set_header Origin|add_header Access-Control|proxy_cookie_domain|server_name _/);
  assert.equal(warnings.some(value => value.includes("www.legacy.example.test")), true);
  assert.match(configuration, /Do not remove the current combined apex\/www vhost/);
});

function healthyRequest(overrides = {}) {
  return async (value, options) => {
    const url = new URL(value); const key = `${url.hostname}${url.pathname}`;
    if (overrides[key]) return overrides[key]();
    const headers = { "cache-control": "private, no-store", "referrer-policy": "no-referrer" };
    if (url.pathname === "/api/public/tracking-policy") return Response.json({ policy: { runtimeEnabled: false, pixelEnabled: false, capiEnabled: false, storefrontOrigin: config.storefrontOrigin, commerceOrigin: config.commerceOrigin } }, { headers });
    if (url.hostname === "catalog.example.test" && url.pathname === "/en/cart") return new Response(null, { status: 307, headers: { location: `${config.commerceOrigin}/en/cart` } });
    if (url.pathname === "/api/user/me") return new Response(null, { status: options.headers?.origin ? 403 : 404 });
    return new Response("<html>Private cart</html>", { headers: { ...headers, "content-security-policy": "default-src 'self'; script-src 'self'" } });
  };
}

test("GET-only health runner checks ten disabled delivery and host isolation contracts", async () => {
  const result = await runDeploymentHealthChecks({ publicOrigin: config.storefrontOrigin, commerceOrigin: config.commerceOrigin, request: healthyRequest() });
  assert.equal(result.passed, true); assert.equal(result.checks.length, 10);
  assert.match(result.scope, /not production readiness/);
});

test("health runner fails on enabled policy, unexpected CORS and private Pixel bootstrap", async () => {
  const request = healthyRequest({
    "catalog.example.test/api/public/tracking-policy": () => Response.json({ policy: { runtimeEnabled: true } }),
    "legacy.example.test/api/user/me": () => new Response(null, { status: 403, headers: { "access-control-allow-origin": config.storefrontOrigin } }),
    "legacy.example.test/en/cart": () => new Response('<script src="https://connect.facebook.net/fbevents.js"></script>'),
  });
  const result = await runDeploymentHealthChecks({ publicOrigin: config.storefrontOrigin, commerceOrigin: config.commerceOrigin, request });
  assert.equal(result.passed, false); assert.equal(result.checks.filter(check => !check.passed).length, 5);
  await assert.rejects(() => runDeploymentHealthChecks({ publicOrigin: "http://catalog.example.test", commerceOrigin: config.commerceOrigin }));
});

test("draft renderer refuses unresolved live example and never writes the Nginx directory", () => {
  const current = JSON.parse(readFileSync("deploy/nginx/bangbuy-origins.example.json", "utf8"));
  assert.throws(() => renderBangbuyNginx(current), /has not been selected/);
  const result = spawnSync(process.execPath, ["scripts/deploy/render-nginx.mjs", "--config", "deploy/nginx/bangbuy-origins.example.json", "--output", "/etc/nginx/bangbuy-test.conf"], { encoding: "utf8" });
  assert.equal(result.status, 1); assert.match(result.stderr, /NGINX_DRAFT_CONFIGURATION_REJECTED/);
});
