/** Operator-only context candidate. No consent, approval, SDK or delivery. */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright";
import { validateTrackingReviewUrl, isMarketingDestination } from "../lib/analytics/context-review";
import type { TrackingContext } from "../lib/analytics/policy";

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") {
  console.log("Usage: npm run tracking:review-context -- --url <clean configured public URL>\nUses a fresh anonymous Chromium context, blocks Meta/tag-manager network destinations and all writes, and prints an unapproved context candidate. No manifest is changed.");
  process.exit(0);
}
if (args.length !== 2 || args[0] !== "--url") throw new Error("Expected --url followed by one clean configured public URL. Use --help.");
const env = { STOREFRONT_ORIGIN: process.env.STOREFRONT_ORIGIN, COMMERCE_ORIGIN: process.env.COMMERCE_ORIGIN };
const target = validateTrackingReviewUrl(args[1], env);
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const bundled = await build({
  stdin: { contents: 'import { collectBrowserTrackingContext } from "./lib/analytics/browser-context"; import { createDeniedTrackingPolicy } from "./lib/analytics/policy"; globalThis.__reviewTrackingContext = () => collectBrowserTrackingContext(createDeniedTrackingPolicy());', resolveDir: root, sourcefile: "tracking-context-review.ts", loader: "ts" },
  bundle: true, write: false, platform: "browser", format: "iife", tsconfig: resolve(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
});
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }), headless: true });
try {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] }, serviceWorkers: "block" });
  let blocked = 0;
  await context.route("**/*", async (route) => {
    const request = route.request();
    if (isMarketingDestination(request.url()) || !["GET", "HEAD"].includes(request.method())) { blocked++; await route.abort(); return; }
    // A public document redirecting into commerce cannot make this tool inspect
    // a private screen, even though the browser has no account or order cookies.
    if (request.isNavigationRequest()) {
      try { validateTrackingReviewUrl(request.url(), env); } catch { await route.abort(); return; }
    }
    await route.continue();
  });
  const page = await context.newPage();
  await page.goto(target.href, { waitUntil: "domcontentloaded", timeout: 30000 });
  validateTrackingReviewUrl(page.url(), env);
  await page.waitForFunction(() => !document.querySelector("[data-tracking-pending]"), undefined, { timeout: 15000 });
  await page.addScriptTag({ content: bundled.outputFiles[0].text });
  const read = () => page.evaluate(async (): Promise<TrackingContext | null> => {
    const collect = Reflect.get(globalThis, "__reviewTrackingContext") as () => Promise<TrackingContext | null>;
    return collect();
  });
  let candidate = await read();
  if (!candidate) throw new Error("Document is mutable, contains sensitive controls, has legacy private storage or is not ready for context review. It remains unapproved.");
  let stable = false;
  for (let attempt = 0; attempt < 10; attempt++) {
    await page.waitForTimeout(500);
    const next = await read();
    if (next && next.metadataFingerprint === candidate.metadataFingerprint && next.url === candidate.url) { candidate = next; stable = true; break; }
    if (!next) throw new Error("Document became ineligible during review. It remains unapproved.");
    candidate = next;
  }
  if (!stable) throw new Error("Document context did not settle. It remains unapproved.");
  console.log(JSON.stringify({ candidate: { ...candidate, classification: "unknown" }, approved: false, approvalReference: null, blockedMarketingOrWriteRequests: blocked }, null, 2));
  await context.close();
} finally { await browser.close(); }
