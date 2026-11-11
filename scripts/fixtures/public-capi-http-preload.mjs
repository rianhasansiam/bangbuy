/** Local HTTP test only. Never use this preload in an application deployment. */
import assert from "node:assert/strict";
import fs from "node:fs";
import { basename, join } from "node:path";
import { syncBuiltinESMExports } from "node:module";

assert.equal(process.env.BANGBUY_PUBLIC_CAPI_HTTP_FIXTURE, "local-only-v1");
const database = new URL(process.env.DATABASE_URL ?? "invalid:");
assert.equal(database.protocol, "postgresql:");
assert.equal(database.hostname, "127.0.0.1");
assert.equal(database.port, "56543");
assert.equal(database.pathname, "/bangbuy_tracking_test");
assert.equal(process.env.META_CAPI_ACCESS_TOKEN, "SYNTHETIC_CAPI_HTTP_ACCESS_TOKEN");
assert.equal(process.env.META_ENVIRONMENT, "test");
assert.equal(process.env.META_TEST_PIXEL_ID, "999999999999992");
assert.equal(process.env.META_GRAPH_API_VERSION, "v27.0");
const recordFile = process.env.BANGBUY_PUBLIC_CAPI_HTTP_RECORD_FILE;
const work = process.env.BANGBUY_PUBLIC_CAPI_HTTP_WORK ?? "";
assert(basename(work).startsWith("bangbuy-public-capi-http-"));
assert.equal(recordFile, join(work, "mock-records.jsonl"));
const append = fs.appendFileSync.bind(fs);
const record = (type) => append(recordFile, JSON.stringify({ type }) + "\n", { mode: 0o600 });

// Next's normal environment loader must not read this checkout's private .env.
// Hiding only dotenv files leaves the actual built artifact and source intact.
const isDotenv = (path) => {
  try {
    const name = basename(path instanceof URL ? path.pathname : String(path));
    return name === ".env" || name.startsWith(".env.");
  } catch { return false; }
};
const absent = () => Object.assign(new Error("The local fixture does not load dotenv files."), { code: "ENOENT" });
for (const name of ["statSync", "readFileSync"]) {
  const original = fs[name].bind(fs);
  fs[name] = (path, ...args) => {
    if (isDotenv(path)) throw absent();
    return original(path, ...args);
  };
}
for (const name of ["stat", "readFile"]) {
  const original = fs.promises[name].bind(fs.promises);
  fs.promises[name] = async (path, ...args) => {
    if (isDotenv(path)) throw absent();
    return original(path, ...args);
  };
}
syncBuiltinESMExports();

const originalFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  const graph = "https://graph.facebook.com/v27.0/999999999999992/events";
  if (url.href === graph) {
    try {
      const request = new Request(input, init);
      assert.equal(request.method, "POST");
      assert.equal(request.headers.get("authorization"), "Bearer SYNTHETIC_CAPI_HTTP_ACCESS_TOKEN");
      const body = JSON.parse(await request.text());
      assert.deepEqual(Object.keys(body).sort(), ["data", "test_event_code"]);
      assert.equal(body.test_event_code, "SYNTHETIC_HTTP_TEST_CODE");
      assert.equal(body.data.length, 1);
      const event = body.data[0];
      assert.deepEqual(Object.keys(event).sort(), ["action_source", "event_id", "event_name", "event_source_url", "event_time", "user_data"]);
      assert.equal(event.event_name, "PageView");
      assert.equal(event.action_source, "website");
      assert.equal(Number.isSafeInteger(event.event_time), true);
      assert.match(event.event_id, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
      const source = new URL(event.event_source_url);
      assert(["https://public-capi.localhost", "https://legacy-capi.localhost"].includes(source.origin));
      assert(["/en", "/en/about"].includes(source.pathname));
      assert.equal(source.search + source.hash, "");
      assert.deepEqual(Object.keys(event.user_data).sort(), ["client_ip_address", "client_user_agent"]);
      assert.equal(event.user_data.client_ip_address, "8.8.8.8");
      assert.equal(event.user_data.client_user_agent, "BangBuy local CAPI HTTP fixture");
      record("mock_graph_acknowledgement");
      return Response.json({ events_received: 1 });
    } catch {
      record("invalid_mock_projection");
      return Response.json({ error: "The synthetic projection was invalid." }, { status: 400 });
    }
  }
  if (url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) && url.port === process.env.BANGBUY_PUBLIC_CAPI_HTTP_PORT) {
    return originalFetch(input, init);
  }
  record("blocked_external_fetch");
  throw new Error("External network access is disabled by the local CAPI HTTP fixture.");
};
