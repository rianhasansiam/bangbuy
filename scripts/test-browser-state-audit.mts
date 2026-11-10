/** Auditor privacy/compatibility check using only an isolated synthetic browser. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { chromium } from "playwright";

const server = createServer((_request, response) => response.end("<!doctype html><title>Synthetic state auditor</title>"));
server.listen(0, "127.0.0.1"); await once(server, "listening");
const address = server.address(); assert(address && typeof address !== "string");
const origin = `http://127.0.0.1:${address.port}`;
const portProbe = createServer(); portProbe.listen(0, "127.0.0.1"); await once(portProbe, "listening");
const debugAddress = portProbe.address(); assert(debugAddress && typeof debugAddress !== "string");
await new Promise<void>(done => portProbe.close(() => done()));
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true, args: [`--remote-debugging-port=${debugAddress.port}`] });
try {
  const context = await browser.newContext();
  const page = await context.newPage(); await page.goto(origin);
  await context.addCookies([{ name: "bangbuy-guest-order-SECRET_ORDER_KEY", value: "SECRET_COOKIE_VALUE", url: origin, httpOnly: true, sameSite: "Lax" }]);
  await page.evaluate(async () => {
    localStorage.setItem("enterfly:cart:v1", "SECRET_CART_VALUE");
    localStorage.setItem("SECRET_UNKNOWN_KEY", "SECRET_UNKNOWN_VALUE");
    sessionStorage.setItem("bangbuy:locale-draft:checkout", "SECRET_ADDRESS_VALUE");
    sessionStorage.setItem("bangbuy:public-product-selection", "SYNTHETIC_PUBLIC_SELECTION");
    const cache = await caches.open("SECRET_CACHE_NAME");
    await cache.put("/SECRET_PRIVATE_CACHE_PATH", new Response("SECRET_CACHED_BODY"));
  });
  const before = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, url: location.href }));
  const cookieBefore = await context.cookies();
  const child = spawn(process.execPath, ["--import", "tsx", resolve("scripts/audit-browser-state.mts"), "--cdp", `http://127.0.0.1:${debugAddress.port}`, "--origin", origin, "--role", "public"], { stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  child.stdout.on("data", chunk => { stdout += chunk; }); child.stderr.on("data", chunk => { stderr += chunk; });
  const [code] = await once(child, "exit");
  assert.equal(code, 0, `Auditor failed (details withheld); stderr length ${stderr.length}`);
  const report = JSON.parse(stdout);
  assert.equal(report.localStorage.legacyPrivate, 1); assert.equal(report.localStorage.unknown, 1);
  assert.equal(report.sessionStorage.legacyPrivate, 1); assert.equal(report.sessionStorage.publicPreferenceOrSelection, 1);
  assert.equal(report.cookies.guestAccess, 1); assert.equal(report.cookies.httpOnly, 1);
  assert.equal(report.cacheStorageCaches, 1); assert.equal(report.publicPrivateStateFound, true); assert.equal(report.approvalGranted, false);
  assert(!stdout.includes("SECRET_")); assert(!stderr.includes("SECRET_"));
  console.log("PASS Classified private state, HttpOnly cookie and cache presence without exporting names or values");
  assert.deepEqual(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, url: location.href })), before);
  assert.deepEqual(await context.cookies(), cookieBefore);
  assert.equal(await page.evaluate(async () => (await caches.match("/SECRET_PRIVATE_CACHE_PATH"))?.text()), "SECRET_CACHED_BODY");
  console.log("PASS Storage, cookies, cached response and current document remain unchanged");
  const snippet = spawn(process.execPath, ["--import", "tsx", resolve("scripts/audit-browser-state.mts"), "--snippet"], { stdio: ["ignore", "pipe", "pipe"] });
  let expression = ""; snippet.stdout.on("data", chunk => { expression += chunk; });
  const [snippetCode] = await once(snippet, "exit"); assert.equal(snippetCode, 0);
  const result = await page.evaluate(expression.trim().replace(/^await /, "")) as { localStorage: { legacyPrivate: number }; cacheStorageCaches: number };
  assert.equal(result.localStorage.legacyPrivate, 1); assert.equal(result.cacheStorageCaches, 1);
  console.log("PASS DevTools expression executes without helpers or writes to the inspected window");
  const rejected = spawn(process.execPath, ["--import", "tsx", resolve("scripts/audit-browser-state.mts"), "--cdp", "http://synthetic:SECRET_SUPPLIED_CREDENTIAL@example.test:9222", "--origin", origin, "--role", "public"], { stdio: ["ignore", "pipe", "pipe"] });
  let rejectedOutput = ""; rejected.stdout.on("data", chunk => { rejectedOutput += chunk; }); rejected.stderr.on("data", chunk => { rejectedOutput += chunk; });
  const [rejectedCode] = await once(rejected, "exit"); assert.equal(rejectedCode, 1);
  assert(!rejectedOutput.includes("SECRET_")); assert(rejectedOutput.includes("Raw details withheld"));
  console.log("PASS Unsafe debugger configuration is refused without echoing supplied credentials");
  await context.close();
} finally {
  await browser.close(); await new Promise<void>(done => server.close(() => done()));
}
