/** Read-only operator inventory. Never navigates, reads storage values, or exports credentials. */
import assert from "node:assert/strict";

type Target = { type: string; url: string; webSocketDebuggerUrl?: string };
type Cookie = { name: string; domain: string; httpOnly: boolean; secure: boolean; sameSite?: string; expires: number };
type StorageCounts = { legacyPrivate: number; publicPreferenceOrSelection: number; unknown: number; readable: boolean };

// This same expression can be run locally in DevTools without a debugger port.
// Only names/counts are inspected. No getItem, cookie values, cache bodies,
// IndexedDB records, customer identifiers, paths or page text are returned.
async function inspectCurrentDocument() {
  const inventory = (storage: Storage): StorageCounts => {
    const counts: StorageCounts = { legacyPrivate: 0, publicPreferenceOrSelection: 0, unknown: 0, readable: true };
    try {
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index) ?? "";
        if (/^enterfly:(?:cart|wishlist|saved-for-later|order|meta)[-:]/.test(key) || key.startsWith("bangbuy:locale-draft:")) counts.legacyPrivate++;
        else if (["bangbuy:public-product-selection", "bangbuy:privacy:marketing", "bangbuy_locale", "bangbuy_currency"].includes(key)) counts.publicPreferenceOrSelection++;
        else counts.unknown++;
      }
    } catch { counts.readable = false; }
    return counts;
  };
  const storage = (kind: "localStorage" | "sessionStorage"): StorageCounts => {
    try { return inventory(window[kind]); }
    catch { return { legacyPrivate: 0, publicPreferenceOrSelection: 0, unknown: 0, readable: false }; }
  };
  const count = async (read: () => Promise<readonly unknown[]>): Promise<number | null> => {
    try { return (await read()).length; } catch { return null; }
  };
  return {
    localStorage: storage("localStorage"), sessionStorage: storage("sessionStorage"),
    serviceWorkers: await count(() => navigator.serviceWorker.getRegistrations()),
    cacheStorageCaches: await count(() => caches.keys()),
    indexedDatabases: await count(() => indexedDB.databases()),
  };
}
// tsx may preserve nested function names through a generated identity helper.
// Keep that helper local to the evaluated expression, never on the customer's window.
const inspectExpression = `(()=>{const __name=(value)=>value;return (${inspectCurrentDocument.toString()})();})()`;

async function main() {
const usage = "Usage: npm run migration:audit-browser -- --cdp http://127.0.0.1:9222 --origin https://exact-host.example --role public|commerce\nOr: npm run migration:audit-browser -- --snippet\nAttaches to one already-open matching tab. No navigation, mutation, secret values, or automatic approval. DevTools snippet cannot inspect HttpOnly cookies or the HTTP disk cache.";
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") { console.log(usage); process.exit(0); }
if (args.length === 1 && args[0] === "--snippet") { console.log(`await ${inspectExpression}`); process.exit(0); }
assert(args.length === 6 && args[0] === "--cdp" && args[2] === "--origin" && args[4] === "--role" && ["public", "commerce"].includes(args[5]), usage);
const endpoint = new URL(args[1]);
assert(endpoint.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname) && endpoint.pathname === "/" && !endpoint.username && !endpoint.password && !endpoint.search && !endpoint.hash, "CDP must use a loopback HTTP origin without credentials or extra path.");
const origin = new URL(args[3]);
assert((origin.protocol === "https:" || (origin.protocol === "http:" && (origin.hostname.endsWith(".localhost") || origin.hostname === "localhost" || origin.hostname === "127.0.0.1"))) && origin.pathname === "/" && !origin.username && !origin.password && !origin.search && !origin.hash, "Expected one clean HTTPS origin, or a loopback test origin.");
const response = await fetch(new URL("/json/list", endpoint), { signal: AbortSignal.timeout(5000), redirect: "error" });
assert(response.ok, "Unable to enumerate loopback CDP targets.");
const targets = (await response.json()) as Target[];
const matching = targets.filter(target => {
  try { return target.type === "page" && new URL(target.url).origin === origin.origin; } catch { return false; }
});
assert(matching.length === 1, "Open exactly one matching-origin tab before auditing; no navigation is performed.");
assert(matching[0].webSocketDebuggerUrl, "Matching page has no debugger connection.");
const debuggerUrl = new URL(matching[0].webSocketDebuggerUrl);
assert(debuggerUrl.protocol === "ws:" && ["127.0.0.1", "localhost", "[::1]"].includes(debuggerUrl.hostname) && !debuggerUrl.username && !debuggerUrl.password, "Debugger must remain on loopback.");
const socket = new WebSocket(debuggerUrl);
await new Promise<void>((resolve, reject) => {
  socket.addEventListener("open", () => resolve(), { once: true });
  socket.addEventListener("error", () => reject(new Error("Cannot connect to loopback debugger.")), { once: true });
});
let sequence = 0;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void; timeout: ReturnType<typeof setTimeout> }>();
socket.addEventListener("message", event => {
  const result = JSON.parse(String(event.data));
  const request = pending.get(result.id);
  if (!request) return;
  pending.delete(result.id); clearTimeout(request.timeout);
  if (result.error) request.reject(new Error("Read-only debugger request failed; raw response withheld."));
  else request.resolve(result.result);
});
const read = (method: string, params: object) => new Promise<unknown>((resolve, reject) => {
  const id = ++sequence;
  const timeout = setTimeout(() => { pending.delete(id); reject(new Error("Read-only debugger request timed out.")); }, 10000);
  pending.set(id, { resolve, reject, timeout }); socket.send(JSON.stringify({ id, method, params }));
});
try {
  const evaluated = await read("Runtime.evaluate", { expression: inspectExpression, awaitPromise: true, returnByValue: true }) as { result?: { value?: Awaited<ReturnType<typeof inspectCurrentDocument>> }; exceptionDetails?: unknown };
  assert(!evaluated.exceptionDetails && evaluated.result?.value, "Document inventory failed; raw details withheld.");
  const document = evaluated.result.value;
  const cookies = await read("Network.getCookies", { urls: [origin.origin + "/"] }) as { cookies: Cookie[] };
  const cookieCounts = { session: 0, guestAccess: 0, preference: 0, marketing: 0, unknown: 0, parentDomain: 0, httpOnly: 0, insecure: 0 };
  for (const cookie of cookies.cookies) {
    if (/authjs|next-auth/.test(cookie.name)) cookieCounts.session++;
    else if (/^bangbuy-guest-(?:checkout|order-)/.test(cookie.name)) cookieCounts.guestAccess++;
    else if (/^bangbuy_(?:locale|currency)$/.test(cookie.name)) cookieCounts.preference++;
    else if (/^(?:_fbp|_fbc|bangbuy-marketing-consent)$/.test(cookie.name)) cookieCounts.marketing++;
    else cookieCounts.unknown++;
    if (cookie.domain.startsWith(".")) cookieCounts.parentDomain++;
    if (cookie.httpOnly) cookieCounts.httpOnly++;
    if (!cookie.secure) cookieCounts.insecure++;
  }
  const reviews: string[] = ["Cookies are inventoried for the origin root URL only; review other path scopes locally.", "HTTP disk cache, CDN/proxy caches, historical responses and other browser profiles are not inspected."];
  if (document.serviceWorkers !== 0) reviews.push("Service workers require separate scope/script and offline-response review; no worker was unregistered.");
  if (document.cacheStorageCaches !== 0) reviews.push("CacheStorage requires a local private-content review; no cache was opened or deleted.");
  if (document.indexedDatabases !== 0) reviews.push("IndexedDB databases require a local data-class review; no records were opened.");
  if (!document.localStorage.readable || !document.sessionStorage.readable) reviews.push("Unavailable storage cannot establish migration safety.");
  if (document.localStorage.unknown + document.sessionStorage.unknown + cookieCounts.unknown > 0) reviews.push("Unknown storage/cookie names require local review; names and values are withheld.");
  const publicPrivateStateFound = args[5] === "public" && document.localStorage.legacyPrivate + document.sessionStorage.legacyPrivate + cookieCounts.session + cookieCounts.guestAccess + cookieCounts.parentDomain > 0;
  console.log(JSON.stringify({ origin: origin.origin, role: args[5], mode: "read-only", ...document, cookies: cookieCounts, publicPrivateStateFound, approvalGranted: false, reviewRequired: reviews }, null, 2));
} finally {
  // Disconnect this socket only. Never close the user's browser or its tabs.
  for (const request of pending.values()) { clearTimeout(request.timeout); request.reject(new Error("Debugger disconnected.")); }
  pending.clear(); socket.close();
}
}

await main().catch(() => {
  // Even malformed URLs or protocol errors must not echo supplied credentials,
  // target URLs, cookie payloads or a browser exception's raw details.
  console.error("Browser-state audit stopped. Use --help, a loopback debugger, one matching open tab, a clean origin and public|commerce role. Raw details withheld.");
  process.exitCode = 1;
});
