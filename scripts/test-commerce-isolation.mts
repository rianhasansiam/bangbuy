/** Synthetic production-build smoke test. Never reads the application .env URL. */
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer as createHttpsServer } from "node:https";
import { request as upstreamRequest } from "node:http";
import { mkdtempSync, readFileSync, writeFileSync, openSync, closeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { once } from "node:events";
import { chromium, type Page, type BrowserContext } from "playwright";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { hash } from "bcryptjs";
import { runDeploymentHealthChecks } from "./deploy/healthcheck.mjs";

const connection = process.env.COMMERCE_ISOLATION_TEST_DATABASE_URL;
assert(connection, "Set COMMERCE_ISOLATION_TEST_DATABASE_URL to the disposable migrated local database.");
const database = new URL(connection);
assert(["localhost", "127.0.0.1"].includes(database.hostname) && ["15439", "56543"].includes(database.port) && database.pathname === "/bangbuy_tracking_test", "This smoke test only accepts the isolated local bangbuy_tracking_test database on disposable ports 15439 or 56543.");
const upstreamPort = Number(process.env.COMMERCE_ISOLATION_TEST_PORT ?? "3187");
const tlsPort = upstreamPort + 1;
const publicOrigin = `https://public.localhost:${tlsPort}`;
const commerceOrigin = `https://commerce.localhost:${tlsPort}`;
const work = mkdtempSync(join(tmpdir(), "bangbuy-commerce-isolation-"));
const report: { checks: string[]; failed?: string; buildId?: string; buildMode: "reused" | "built"; generatedAt: string; healthChecks?: Awaited<ReturnType<typeof runDeploymentHealthChecks>>; publicOrigin: string; commerceOrigin: string; metaRequests: string[]; screenshots: string[] } = { checks: [], buildMode: process.argv.includes("--skip-build") ? "reused" : "built", generatedAt: new Date().toISOString(), publicOrigin, commerceOrigin, metaRequests: [], screenshots: [] };
const passed = (name: string) => { report.checks.push(name); process.stdout.write(`PASS ${name}\n`); };
const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection }) });
const password = "SyntheticTestOnly123!";
const userId = "e2e-isolation-user";
const partA = "e2e-isolation-product-a";
const partB = "e2e-isolation-product-b";
const variantA = "e2e-isolation-variant-a";
const variantBeta = "e2e-isolation-variant-beta";
const variantB = "e2e-isolation-variant-b";
const cartKey = "enterfly:cart:v1";

const environment: NodeJS.ProcessEnv = {
  ...process.env, NODE_ENV: "production", DATABASE_URL: connection, DIRECT_URL: connection,
  AUTH_SECRET: "synthetic-isolated-browser-test-only-auth-secret-2026", AUTH_URL: commerceOrigin, AUTH_TRUST_HOST: "true",
  AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", SITE_URL: publicOrigin, NEXT_PUBLIC_SITE_URL: publicOrigin,
  STOREFRONT_ORIGIN: publicOrigin, COMMERCE_ORIGIN: commerceOrigin,
  NEXT_PUBLIC_STOREFRONT_ORIGIN: publicOrigin, NEXT_PUBLIC_COMMERCE_ORIGIN: commerceOrigin,
  NEXT_PUBLIC_META_PIXEL_ID: "999999999999991", META_TEST_PIXEL_ID: "999999999999992",
  META_ENVIRONMENT: "disabled", META_PIXEL_ENABLED: "false", META_CAPI_ENABLED: "false", META_RUNTIME_ENABLED: "false", TRACKING_ISOLATION_READY: "false",
  META_CAPI_ACCESS_TOKEN: "", META_WORKER_SECRET: "", NEXT_PUBLIC_META_CAPI_ACCESS_TOKEN: "",
  AIRWALLEX_ENABLED: "false", META_DEBUG: "false",
};

async function eventually(check: () => Promise<unknown>, name: string, timeout = 15000) {
  const started = Date.now();
  let last: unknown;
  while (Date.now() - started < timeout) {
    try { const result = await check(); if (result) return result; } catch (error) { last = error; }
    await new Promise(done => setTimeout(done, 100));
  }
  throw new Error(`${name} did not settle${last instanceof Error ? `: ${last.message}` : ""}`);
}

async function seed() {
  const rows = await client.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
  assert.equal(rows[0]?.current_database, "bangbuy_tracking_test");
  await client.category.upsert({ where: { id: "e2e-isolation-category" }, create: { id: "e2e-isolation-category", name: "Synthetic Isolation Catalog", slug: "synthetic-isolation", path: "synthetic-isolation", status: "ACTIVE", depth: 0 }, update: { status: "ACTIVE" } });
  for (const [id, name, price, slug] of [[partA, "Synthetic Isolation Part A", 100, "synthetic-isolation-part-a"], [partB, "Synthetic Isolation Part B", 200, "synthetic-isolation-part-b"]] as const) {
    await client.product.upsert({ where: { id }, create: { id, productCode: id === partA ? "BROWSER-SYNTHETIC-A" : "BROWSER-SYNTHETIC-B", name, slug, description: "Synthetic catalog content for isolated browser verification.", salePrice: price, buyingPrice: 1, categoryId: "e2e-isolation-category", status: "ACTIVE" }, update: { salePrice: price, status: "ACTIVE" } });
    await client.productImage.upsert({ where: { id: `${id}-image` }, create: { id: `${id}-image`, productId: id, url: "/icon.png", position: 0 }, update: { url: "/icon.png" } });
  }
  for (const [id, productId, name, key] of [[variantA, partA, "Option Alpha", "alpha"], [variantBeta, partA, "Option Beta", "beta"], [variantB, partB, "Standard option", "default"]] as const) {
    await client.productVariant.upsert({ where: { id }, create: { id, productId, name, variantKey: key, sku: id, stock: 500, isActive: true }, update: { stock: 500, isActive: true } });
  }
  const settings = await client.storeSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (settings) await client.storeSettings.update({ where: { id: settings.id }, data: { taxRate: 0, standardShippingFee: 60, expressShippingFee: 120, freeShippingThreshold: 100000 } });
  else await client.storeSettings.create({ data: { id: "e2e-isolation-settings", taxRate: 0, standardShippingFee: 60, expressShippingFee: 120, freeShippingThreshold: 100000 } });
  await client.user.upsert({ where: { id: userId }, create: { id: userId, name: "Synthetic Account Buyer", email: "isolation-buyer@example.test", password: await hash(password, 10), role: "USER", provider: "CREDENTIAL", preferredLocale: "en" }, update: { password: await hash(password, 10), preferredLocale: "en" } });
  await client.cartItem.deleteMany({ where: { userId } });
  await client.catalogRedirect.upsert({ where: { sourcePath: "/products/synthetic-isolation-old-part" }, create: { sourcePath: "/products/synthetic-isolation-old-part", destinationPath: "/products/synthetic-isolation-part-a", entityType: "PRODUCT", entityId: partA }, update: { destinationPath: "/products/synthetic-isolation-part-a" } });
}

async function cart(page: Page): Promise<Array<{ productId: string; variantId: string; quantity: number }>> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "[]"), cartKey);
}
async function waitPrivate(page: Page, path: string) {
  await page.waitForURL(url => url.origin === commerceOrigin && url.pathname === `/en/${path}`);
}
async function addProduct(page: Page, slug: string, beta = false) {
  await page.goto(`${publicOrigin}/en/products/${slug}`);
  if (beta) { await page.getByRole("button", { name: "Option Beta", exact: true }).click(); await page.getByRole("button", { name: "Increase quantity", exact: true }).click(); }
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await waitPrivate(page, "shopping-handoff");
  await page.getByRole("button", { name: "Confirm selection", exact: true }).click();
  await waitPrivate(page, "cart");
}
async function placeCod(page: Page) {
  await page.getByLabel("Full name", { exact: false }).fill("Synthetic Browser Buyer");
  await page.getByLabel("Phone number", { exact: false }).fill("01700000001");
  await page.getByLabel("Delivery address", { exact: false }).fill("12 Synthetic Test Road");
  await page.getByLabel("Delivery area", { exact: false }).selectOption("INSIDE_DHAKA");
  const place = page.getByRole("button", { name: "Place order", exact: true });
  await place.waitFor(); await eventually(() => place.isEnabled(), "server checkout preview");
  await place.click();
  await page.waitForURL(url => url.origin === commerceOrigin && /^\/en\/orders\/[^/]+$/.test(url.pathname), { timeout: 20000 });
  const id = new URL(page.url()).pathname.split("/").pop()!;
  const response = await page.request.get(`${commerceOrigin}/api/orders/${id}`);
  assert.equal(response.status(), 200);
  const body = await response.json();
  assert.equal(body.data.paymentStatus, "UNPAID"); assert.equal(body.data.status, "PENDING");
  return { id, data: body.data };
}

let nextProcess: ReturnType<typeof spawn> | undefined;
let tlsServer: ReturnType<typeof createHttpsServer> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
let context: BrowserContext | undefined;
const logPath = join(work, "next-production.log");
const logFd = openSync(logPath, "a");
try {
  await seed(); passed("Synthetic local-only database guard and catalog setup");
  if (!process.argv.includes("--skip-build")) {
    const build = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "build"], { env: environment, stdio: ["ignore", logFd, logFd] });
    const [code] = await once(build, "exit"); assert.equal(code, 0, `Production build failed; see ${logPath}`); passed("Production build with isolated database and disabled marketing");
  }
  report.buildId = readFileSync(resolve(".next/BUILD_ID"), "utf8").trim();
  const cert = join(work, "certificate.pem"), key = join(work, "key.pem");
  const openssl = spawnSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert, "-days", "1", "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:public.localhost,DNS:commerce.localhost,DNS:localhost"], { stdio: "ignore" });
  assert.equal(openssl.status, 0, "Unable to generate the disposable localhost TLS certificate");
  nextProcess = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(upstreamPort)], { env: environment, stdio: ["ignore", logFd, logFd] });
  tlsServer = createHttpsServer({ key: readFileSync(key), cert: readFileSync(cert) }, (req, res) => {
    if (![new URL(publicOrigin).host, new URL(commerceOrigin).host].includes(req.headers.host ?? "")) { res.writeHead(421); res.end(); return; }
    const upstream = upstreamRequest({ hostname: "127.0.0.1", port: upstreamPort, path: req.url, method: req.method, headers: { ...req.headers, "x-forwarded-proto": "https", "x-forwarded-host": req.headers.host, "x-forwarded-for": "127.0.0.1" } }, response => { res.writeHead(response.statusCode ?? 502, response.headers); response.pipe(res); });
    upstream.on("error", () => { res.writeHead(502); res.end(); }); req.pipe(upstream);
  });
  tlsServer.listen(tlsPort, "127.0.0.1"); await once(tlsServer, "listening");
  browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--host-resolver-rules=MAP public.localhost 127.0.0.1,MAP commerce.localhost 127.0.0.1"] });
  context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 1050 } });
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    if (/facebook|fbevents|fbcdn|googletagmanager/.test(url.hostname + url.pathname)) report.metaRequests.push(url.hostname + url.pathname);
    return ["public.localhost", "commerce.localhost"].includes(url.hostname) ? route.continue() : route.abort();
  });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  await eventually(async () => (await page.request.get(`${commerceOrigin}/api/public/tracking-policy`)).status() === 200, "production server start", 30000);
  passed("Local TLS reverse proxy serves both exact configured origins");
  // The shared GET-only operator checks run before the synthetic login or any
  // guest checkout cookie exists. APIRequestContext does not follow redirects.
  report.healthChecks = await runDeploymentHealthChecks({ publicOrigin, commerceOrigin, request: async (url: string, options: { headers?: Record<string, string> }) => {
    const response = await context!.request.get(url, { headers: options.headers, maxRedirects: 0 });
    return new Response(await response.text(), { status: response.status(), headers: response.headers() });
  } });
  for (const check of report.healthChecks.checks) {
    assert(check.passed, `Deployment health check failed: ${check.name}`);
    passed(`Deployment health: ${check.name}`);
  }
  assert.equal((await page.request.get(`${publicOrigin}/api/user/me`)).status(), 404);
  assert.equal((await page.request.get(`${publicOrigin}/api/orders/forged`)).status(), 404);
  passed("Public origin denies account and order APIs before authorization handlers");
  await page.goto(`${commerceOrigin}/en/cart`);
  await page.evaluate(() => localStorage.setItem("isolation-private-sentinel", "synthetic-private-state"));
  await page.goto(`${publicOrigin}/en/products/synthetic-isolation-part-a`);
  assert.equal(await page.evaluate(() => localStorage.getItem("isolation-private-sentinel")), null);
  assert.equal(await page.evaluate(key => localStorage.getItem(key), cartKey), null);
  await page.evaluate(() => { (window as unknown as { documentMarker: string }).documentMarker = "public"; });
  await page.getByRole("button", { name: "Option Beta", exact: true }).click();
  await page.getByRole("button", { name: "Increase quantity", exact: true }).click();
  await eventually(async () => (await page.evaluate(() => sessionStorage.getItem("bangbuy:public-product-selection")))?.includes('"quantity":2'), "public selection persistence");
  await page.reload();
  await eventually(async () => await page.getByRole("button", { name: "Option Beta", exact: true }).getAttribute("aria-pressed") === "true", "public selection restoration");
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await waitPrivate(page, "shopping-handoff");
  assert.equal(await page.evaluate(() => (window as unknown as { documentMarker?: string }).documentMarker), undefined);
  assert.equal((await cart(page)).length, 0);
  await page.getByRole("button", { name: "Confirm selection", exact: true }).click(); await waitPrivate(page, "cart");
  await eventually(async () => (await cart(page)).some(item => item.variantId === variantBeta && item.quantity === 2), "exact variant cart handoff");
  passed("Document and origin replacement with preserved exact variant and quantity; GET handoff does not mutate cart");
  await page.goto(`${publicOrigin}/en/products/synthetic-isolation-part-a`);
  await page.getByRole("button", { name: "Buy now", exact: true }).first().click(); await waitPrivate(page, "checkout");
  const beforeBuy = await cart(page);
  const first = await placeCod(page); assert.deepEqual(await cart(page), beforeBuy);
  passed("Guest Buy now places unpaid COD order and preserves existing cart");
  const unauthenticated = await browser.newContext({ ignoreHTTPSErrors: true });
  assert.notEqual((await unauthenticated.request.get(`${commerceOrigin}/api/orders/${first.id}`)).status(), 200); await unauthenticated.close();
  assert(!(await page.evaluate(() => document.cookie)).includes("bangbuy-guest-order-"));
  const receiptTab = await context.newPage(); await receiptTab.goto(`${commerceOrigin}/en/orders/${first.id}`); await receiptTab.getByRole("button", { name: "Download PDF", exact: true }).first().waitFor(); await receiptTab.close();
  passed("Scoped HttpOnly guest receipt works in new tab and denies another browser context");
  await addProduct(page, "synthetic-isolation-part-b");
  await page.getByRole("checkbox", { name: "Deselect Synthetic Isolation Part A for checkout", exact: true }).click();
  await page.getByRole("button", { name: "Secure Checkout", exact: false }).first().click(); await waitPrivate(page, "checkout");
  const second = await placeCod(page);
  assert.equal(second.data.items.length, 1); assert.equal(second.data.items[0].productId, partB);
  assert((await cart(page)).some(item => item.productId === partA)); assert(!(await cart(page)).some(item => item.productId === partB));
  passed("Selected-cart checkout purchases only selected lines and preserves the remainder");
  await page.goto(`${commerceOrigin}/en/login?callbackUrl=${encodeURIComponent("/en/cart")}`);
  await page.getByLabel("Email address", { exact: false }).fill("isolation-buyer@example.test"); await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click(); await waitPrivate(page, "cart");
  await eventually(async () => {
    const response = await page.request.get(`${commerceOrigin}/api/cart`); if (!response.ok()) return false;
    const result = await response.json(); return result.data.items.some((item: { variantId: string }) => item.variantId === variantBeta);
  }, "login cart merge");
  passed("Guest cart merges into the authenticated account on the commerce origin");
  await page.goto(`${commerceOrigin}/en/checkout`); const third = await placeCod(page);
  assert.equal(third.data.userId, userId);
  const cleared = await page.request.get(`${commerceOrigin}/api/cart`); assert.equal((await cleared.json()).data.items.length, 0);
  passed("Registered full-cart checkout clears the authoritative account cart");
  await page.goto(`${publicOrigin}/en/products/synthetic-isolation-old-part`); await page.waitForURL(`${publicOrigin}/en/products/synthetic-isolation-part-a`);
  assert(!(await page.content()).includes("Synthetic Account Buyer"));
  const blocked = await page.evaluate(async origin => { try { await fetch(`${origin}/api/user/me`, { credentials: "include" }); return false; } catch { return true; } }, commerceOrigin);
  assert(blocked); passed("Historical product redirect and tracked-origin private API/storage isolation");
  await page.getByRole("button", { name: "Choose language: English", exact: true }).click(); await page.getByRole("menuitem", { name: /Bengali/ }).click(); await page.waitForURL(`${publicOrigin}/bn/products/synthetic-isolation-part-a`);
  assert.equal(await page.locator("html").getAttribute("lang"), "bn"); passed("Anonymous public locale switching preserves the product path");
  await page.goto(`${commerceOrigin}/en/orders/${third.id}?payment=success`);
  const forged = await page.request.get(`${commerceOrigin}/api/orders/${third.id}`); assert.equal((await forged.json()).data.paymentStatus, "UNPAID");
  assert.equal(report.metaRequests.length, 0); passed("Private pages and forged payment flags produce no Meta requests or paid transition");
  const shot = join(work, "private-order.png"); await page.screenshot({ path: shot, fullPage: true }); report.screenshots.push(shot);
  assert.equal(report.metaRequests.length, 0); passed("No external marketing delivery throughout the synthetic commerce journey");
} catch (error) {
  const page = context?.pages()[0];
  if (page) { const screenshot = join(work, "failed-state.png"); await page.screenshot({ path: screenshot, fullPage: true }).then(() => report.screenshots.push(screenshot)).catch(() => undefined); }
  report.failed = error instanceof Error ? error.stack ?? error.message : String(error); process.exitCode = 1;
  process.stderr.write(`${report.failed}\nProduction logs: ${logPath}\n`);
} finally {
  await context?.close(); await browser?.close();
  tlsServer?.closeAllConnections(); tlsServer?.close();
  nextProcess?.kill("SIGTERM");
  await client.$disconnect(); closeSync(logFd);
  const reportPath = process.env.COMMERCE_ISOLATION_REPORT_PATH ?? join(work, "report.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2)); process.stdout.write(`Report: ${reportPath}\n`);
}
