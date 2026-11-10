/** Real Chromium network tests using the real public adapter and consent UI.
 * Every Meta endpoint is intercepted. No real customer data or conversion leaves
 * the browser. The fixture is not a production route or a live-account check.
 */
import assert from "node:assert/strict";
import { createServer } from "node:https";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium, type BrowserContext, type Page } from "playwright";
import { approvedTestPolicy, grantedConsent, trackingTestEvent } from "../__tests__/fixtures/tracking-policy";
import { UNKNOWN_MARKETING_CONSENT, type MarketingConsent } from "@/lib/analytics/consent";
import type { TrackingRuntimePolicy } from "@/lib/analytics/policy";

const temporary = await mkdtemp(join(tmpdir(), "bangbuy-marketing-browser-"));
const tlsKey = join(temporary, "key.pem");
const tlsCertificate = join(temporary, "certificate.pem");
const certificate = spawnSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", tlsKey, "-out", tlsCertificate, "-days", "1", "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:public.localhost,DNS:commerce.localhost"], { stdio: "ignore" });
assert.equal(certificate.status, 0, "Unable to generate disposable localhost TLS certificate");
let policy: TrackingRuntimePolicy;
let consent: MarketingConsent = { ...UNKNOWN_MARKETING_CONSENT };
let publicOrigin = "";
let commerceOrigin = "";
let bundle = "";
let passed = 0;
let cacheableHistoryFixture = false;
type HistoryObservation = { origin: string; persisted: boolean; trusted: boolean; documentId: string; canary: string | null; sdkPresent: boolean };
const historyObservations: HistoryObservation[] = [];
// Installed before the application listener. The browser's trusted pageshow
// event is observed before PublicTracking replaces a restored document. This
// is a first-party synthetic fixture beacon, never a marketing event.
const historyProbe = `<script>(()=>{const documentId=crypto.randomUUID();window.__bfcacheDocumentId=documentId;window.addEventListener('pageshow',event=>{navigator.sendBeacon('/fixture-history-observation',JSON.stringify({persisted:event.persisted,trusted:event.isTrusted,documentId,canary:window.__bfcacheCanary??null,sdkPresent:!!window.fbq}));},{capture:true});})();</script>`;
const html = (isPublic: boolean) => `<!doctype html><html><head><meta charset="utf-8"><title>Synthetic catalog</title>${historyProbe}</head><body>${isPublic
  ? `<div data-tracking-content><main><h1>Example product</h1><p data-tracking-content-id="SKU-EXAMPLE">Synthetic product only</p><span hidden data-tracking-product='{"productId":"test-product","productCode":"SKU-EXAMPLE","quantity":1,"unitPrice":125.5}'></span><a id="private" href="${commerceOrigin}/en/checkout">Checkout</a></main></div><div id="consent-ui"></div><script src="/fixture.js"></script>`
  : `<main data-private-commerce><h1>Private checkout</h1><input name="address" value="Synthetic private address"><a href="${publicOrigin}/en/products/example">Catalog</a></main>`}</body></html>`;

const server = createServer({ key: await readFile(tlsKey), cert: await readFile(tlsCertificate) }, async (request, response) => {
  const requestOrigin = `https://${request.headers.host}`;
  if (![publicOrigin, commerceOrigin].includes(requestOrigin)) { response.writeHead(421).end(); return; }
  const path = new URL(request.url ?? "/", requestOrigin).pathname;
  response.setHeader("Referrer-Policy", "no-referrer");
  // The normal fixture retains no-store. A separately identified history
  // segment permits caching solely to exercise the genuine BFCache branch on
  // Chrome versions that evict no-store documents; no application header changes.
  response.setHeader("Cache-Control", cacheableHistoryFixture ? "private, max-age=0, must-revalidate" : "no-store");
  if (path === "/fixture-history-observation" && request.method === "POST") {
    let body = ""; for await (const chunk of request) body += chunk;
    historyObservations.push({ ...JSON.parse(body), origin: requestOrigin });
    response.writeHead(204).end(); return;
  }
  if (path === "/fixture.js") { response.setHeader("Content-Type", "application/javascript"); response.end(bundle); return; }
  if (path === "/api/public/tracking-policy") { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ policy, consent })); return; }
  if (path === "/api/public/consent") {
    if (request.method === "POST") {
      if (request.headers.origin !== requestOrigin) { response.writeHead(403).end(); return; }
      let body = ""; for await (const chunk of request) body += chunk;
      const change = JSON.parse(body);
      consent = { ...grantedConsent(Date.now()), state: change.state };
    }
    response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ consent })); return;
  }
  if (path.startsWith("/api/")) { response.writeHead(403).end("Private APIs are not exposed"); return; }
  response.setHeader("Content-Type", "text/html");
  response.end(html(requestOrigin === publicOrigin));
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
assert(address && typeof address !== "string");
publicOrigin = `https://public.localhost:${address.port}`;
commerceOrigin = `https://commerce.localhost:${address.port}`;
console.log(`Local HTTPS fixture origins: ${publicOrigin} and ${commerceOrigin} (disposable self-signed certificate)`);
await build({ entryPoints: ["tests/browser/marketing-fixture.tsx"], outfile: join(temporary, "fixture.js"), bundle: true, platform: "browser", format: "iife", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" } });
bundle = await readFile(join(temporary, "fixture.js"), "utf8");
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }), headless: true, ignoreDefaultArgs: ["--disable-back-forward-cache"] });

function reset() {
  cacheableHistoryFixture = false;
  policy = approvedTestPolicy(Date.now());
  policy.storefrontOrigin = publicOrigin; policy.commerceOrigin = commerceOrigin;
  consent = { ...UNKNOWN_MARKETING_CONSENT };
}
async function fixture(options: { blockSdk?: boolean } = {}) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const network: string[] = [];
  const captures: Record<string, string>[] = [];
  await context.route(/https:\/\/(?:connect\.facebook\.net|www\.facebook\.com|graph\.facebook\.com)\//, async (route) => {
    const url = route.request().url(); network.push(url);
    if (url.includes("fbevents.js")) {
      if (options.blockSdk) { await route.abort(); return; }
      await route.fulfill({ contentType: "application/javascript", body: `(()=>{const q=window.fbq; const old=q.queue.splice(0); q.callMethod=(...a)=>{if(a[0]==='init')window.__initCount=(window.__initCount||0)+1;if(a[0]==='trackSingle'){const u=new URL('https://www.facebook.com/tr');u.searchParams.set('ev',a[2]);u.searchParams.set('payload',JSON.stringify(a[3]));u.searchParams.set('eid',a[4].eventID);new Image().src=u.href;}}; old.forEach(a=>q.callMethod(...a));})()` });
    } else {
      captures.push(Object.fromEntries(new URL(url).searchParams));
      await route.fulfill({ status: 200, contentType: "image/gif", body: "" });
    }
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => console.error("Synthetic browser fixture error:", error.message));
  await page.goto(`${publicOrigin}/en/products/example`);
  await page.waitForFunction(() => Reflect.has(window, "__marketingTest"));
  return { context, page, network, captures };
}
async function approveDocument(page: Page) {
  const actual = await page.evaluate(async (candidate) => Reflect.get(window, "__marketingTest").collectBrowserTrackingContext(candidate), policy);
  assert(actual);
  policy.routes[0].metadataFingerprint = actual.metadataFingerprint;
}
async function consentGrant(page: Page) {
  await page.getByRole("button", { name: "Allow catalog analytics" }).click();
  await page.waitForLoadState("load");
}
async function settle(page: Page) {
  await page.waitForTimeout(100);
}
async function check(name: string, fn: () => Promise<void>) {
  reset(); await fn(); passed++; console.log(`PASS ${name}`);
}
const contexts: BrowserContext[] = [];
try {
  await check("No SDK download before consent, after denial or without approval", async () => {
    const f = await fixture(); contexts.push(f.context);
    await approveDocument(f.page); await settle(f.page); assert.equal(f.network.length, 0);
    await f.page.getByRole("button", { name: "Keep catalog analytics off" }).click(); await settle(f.page); assert.equal(f.network.length, 0);
    policy.business.approved = false;
    await consentGrant(f.page); await settle(f.page); assert.equal(f.network.length, 0);
  });
  await check("Consented approved document initializes once in StrictMode and sends each expected event once", async () => {
    const f = await fixture(); contexts.push(f.context); await approveDocument(f.page); await consentGrant(f.page);
    await f.page.waitForFunction(() => Reflect.get(window, "__initCount") === 1);
    await settle(f.page);
    assert.equal(f.network.filter(url => url.includes("fbevents.js")).length, 1);
    assert.deepEqual(f.captures.map(row => row.ev).sort(), ["PageView", "ViewContent"]);
    const event = { ...trackingTestEvent("PageView", Date.now()), eventId: "95a4a300-d4a3-4a6f-bb22-c515cfe43368" };
    await f.page.evaluate(async (value) => Promise.all([Reflect.get(window, "__marketingTest").dispatchPublicPixelEvent(value), Reflect.get(window, "__marketingTest").dispatchPublicPixelEvent(value)]), event);
    await settle(f.page); assert.equal(f.captures.filter(row => row.eid === event.eventId).length, 1);
    assert(f.captures.every(row => !/Synthetic private|address|email|phone|userId|orderId/.test(row.payload)));
  });
  await check("Unapproved query, fragment, content and metadata remain untracked", async () => {
    for (const suffix of ["?search=private", "#private", "?fbclid=not-approved"]) {
      consent = { ...UNKNOWN_MARKETING_CONSENT };
      const f = await fixture(); contexts.push(f.context); await approveDocument(f.page);
      consent = grantedConsent(Date.now()); await f.page.goto(`${publicOrigin}/en/products/example${suffix}`); await settle(f.page);
      assert.equal(f.network.length, 0);
    }
    consent = { ...UNKNOWN_MARKETING_CONSENT };
    const f = await fixture(); contexts.push(f.context); await approveDocument(f.page);
    policy.contents[0].classification = "sensitive"; consent = grantedConsent(Date.now()); await f.page.reload(); await settle(f.page); assert.equal(f.network.length, 0);
  });
  await check("Public to private replaces the document and direct private entry has no marketing", async () => {
    const f = await fixture(); contexts.push(f.context); await approveDocument(f.page); await consentGrant(f.page);
    await f.page.waitForFunction(() => Reflect.get(window, "__initCount") === 1);
    const count = f.network.length;
    await f.page.evaluate(() => { Reflect.set(window, "documentCanary", true); });
    await f.page.locator("#private").click(); await f.page.waitForURL(`${commerceOrigin}/en/checkout`);
    assert.equal(await f.page.evaluate(() => Reflect.has(window, "documentCanary")), false);
    assert.equal(await f.page.evaluate(() => Reflect.has(window, "fbq")), false);
    assert(!/fbevents|noscript|bangbuy-public-pixel/.test(await f.page.content()));
    await settle(f.page); assert.equal(f.network.length, count);
    await f.page.evaluate(() => localStorage.setItem("private-customer", "synthetic-secret"));
    await f.page.goto(`${publicOrigin}/en/products/example`);
    assert.equal(await f.page.evaluate(() => localStorage.getItem("private-customer")), null);
    const read = await f.page.evaluate(async (url) => { try { await fetch(url, { credentials: "include" }); return "readable"; } catch { return "blocked"; } }, `${commerceOrigin}/api/user/me`);
    assert.equal(read, "blocked");
  });
  await check("Withdrawal and tab synchronization unload the SDK and stop later requests", async () => {
    const f = await fixture(); contexts.push(f.context); await approveDocument(f.page); await consentGrant(f.page);
    await f.page.waitForFunction(() => Reflect.get(window, "__initCount") === 1);
    const second = await f.context.newPage(); await second.goto(`${publicOrigin}/en/products/example`);
    await second.waitForFunction(() => Reflect.get(window, "__initCount") === 1);
    await f.page.getByRole("button", { name: "Withdraw catalog consent" }).click();
    await f.page.waitForFunction(() => !Reflect.has(window, "fbq"));
    await second.waitForFunction(() => !Reflect.has(window, "fbq"));
    const count = f.network.length; await settle(f.page); assert.equal(f.network.length, count);
    assert.equal(consent.state, "revoked");
    await f.page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    await settle(f.page); assert.equal(await f.page.evaluate(() => Reflect.has(window, "fbq")), false);
  });
  await check("Runtime disablement rechecks delivery and cleans a loaded document", async () => {
    const f = await fixture(); contexts.push(f.context); await approveDocument(f.page); await consentGrant(f.page);
    await f.page.waitForFunction(() => Reflect.get(window, "__initCount") === 1);
    policy.runtimeEnabled = false;
    await f.page.evaluate(async (event) => Reflect.get(window, "__marketingTest").revalidatePublicPixel(event), trackingTestEvent("PageView", Date.now()));
    await f.page.waitForFunction(() => !Reflect.has(window, "fbq"));
    assert.equal(await f.page.evaluate(async (event) => Reflect.get(window, "__marketingTest").dispatchPublicPixelEvent(event), trackingTestEvent("PageView", Date.now())), false);
  });
  await check("Trusted real BFCache restoration and browser history recheck revoked consent before delivery", async () => {
    for (const cacheable of [false, true]) {
      cacheableHistoryFixture = cacheable;
      consent = { ...UNKNOWN_MARKETING_CONSENT };
      const f = await fixture(); contexts.push(f.context); await approveDocument(f.page); await consentGrant(f.page);
      await f.page.waitForFunction(() => Reflect.get(window, "__initCount") === 1); await settle(f.page);
      const targetDocument = await f.page.evaluate(() => {
        Reflect.set(window, "__bfcacheCanary", "synthetic-cached-document");
        return Reflect.get(window, "__bfcacheDocumentId") as string;
      });
      const cacheFailures: string[] = [];
      const session = await f.context.newCDPSession(f.page);
      await session.send("Page.enable");
      session.on("Page.backForwardCacheNotUsed", (event) => {
        for (const explanation of event.notRestoredExplanations) cacheFailures.push(explanation.reason);
      });
      const count = f.network.length;
      await f.page.locator("#private").click(); await f.page.waitForURL(`${commerceOrigin}/en/checkout`);
      consent = { ...grantedConsent(Date.now()), state: "revoked" };
      await f.page.goBack({ waitUntil: "commit" });
      await f.page.waitForFunction(() => !Reflect.has(window, "fbq"));
      assert.equal(new URL(f.page.url()).origin, publicOrigin);
      for (let attempt = 0; attempt < (cacheable ? 50 : 1) && !historyObservations.some(row => row.documentId === targetDocument && row.persisted); attempt++) await f.page.waitForTimeout(100);
      const cachedRestore = historyObservations.find(row => row.documentId === targetDocument && row.persisted);
      if (cacheable) {
        assert(cachedRestore, `Chrome did not restore the public document from BFCache. Not-restored reasons: ${[...new Set(cacheFailures)].join(", ") || "none reported"}`);
        assert.equal(cachedRestore.trusted, true, "A synthetic pageshow event is not BFCache evidence");
        assert.equal(cachedRestore.canary, "synthetic-cached-document", "BFCache must restore the same JavaScript document");
        assert.equal(cachedRestore.sdkPresent, true, "Observe restoration before the application unloads the cached SDK runtime");
        assert.equal(await f.page.evaluate(() => Reflect.has(window, "__bfcacheCanary")), false, "The restored document must be replaced before continuing");
      } else if (!cachedRestore) {
        console.log(`INFO Normal no-store history fixture required a fresh document; Chrome reasons: ${[...new Set(cacheFailures)].join(", ") || "none reported"}`);
      }
      // BFCache does not fire a new load event. Wait for the actual history
      // commit and the destination UI rather than a fresh-network load.
      await f.page.goForward({ waitUntil: "commit" });
      await f.page.getByRole("heading", { name: "Private checkout" }).waitFor();
      assert.equal(new URL(f.page.url()).origin, commerceOrigin);
      assert.equal(await f.page.evaluate(() => Reflect.has(window, "fbq")), false);
      await f.page.goBack({ waitUntil: "commit" });
      await f.page.waitForFunction(() => !Reflect.has(window, "fbq")); await settle(f.page);
      assert.equal(await f.page.evaluate(() => Reflect.has(window, "fbq")), false);
      assert.equal(f.network.length, count);
      if (cacheable) console.log("INFO Cache-permissive fixture proved trusted persisted pageshow, the same JavaScript document and cached SDK, then clean replacement with no additional Meta request.");
      await session.detach();
    }
    cacheableHistoryFixture = false;
  });
  await check("Ad blockers are nonfatal and private conversions cannot load SDK", async () => {
    const f = await fixture({ blockSdk: true }); contexts.push(f.context); await approveDocument(f.page); await consentGrant(f.page);
    await settle(f.page); assert.equal(f.captures.length, 0);
    assert.equal(await f.page.evaluate(async (event) => Reflect.get(window, "__marketingTest").dispatchPublicPixelEvent(event), trackingTestEvent("Purchase", Date.now())), false);
    await f.page.locator("#private").click(); await f.page.waitForURL(`${commerceOrigin}/en/checkout`);
    assert.equal(await f.page.getByRole("heading", { name: "Private checkout" }).count(), 1);
  });
  console.log(`${passed} Chromium privacy and outbound-network scenarios passed. All Meta traffic intercepted.`);
} finally {
  await Promise.all(contexts.map(context => context.close()));
  await browser.close();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await rm(temporary, { recursive: true, force: true });
}
