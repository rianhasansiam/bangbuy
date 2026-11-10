import { pathToFileURL } from "node:url";

function origin(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || parsed.origin !== value || parsed.username || parsed.password) throw new Error("Use an exact HTTPS origin without credentials or paths.");
  return parsed.origin;
}
function noCache(response) { return /no-store/i.test(response.headers.get("cache-control") ?? ""); }
function privateHeaders(response) {
  const csp = response.headers.get("content-security-policy") ?? "";
  return response.headers.get("referrer-policy") === "no-referrer" && csp.includes("default-src") && !/facebook|fbcdn|googletagmanager/i.test(csp);
}

/** GET-only evidence collection. It executes no scripts and sends no cookies,
 * credentials, checkout actions or third-party delivery requests. */
export async function runDeploymentHealthChecks({ publicOrigin, commerceOrigin, request = (url, options) => fetch(url, { method: "GET", redirect: "manual", credentials: "omit", signal: AbortSignal.timeout(10000), ...options }) }) {
  const storefront = origin(publicOrigin), commerce = origin(commerceOrigin);
  if (new URL(storefront).hostname === new URL(commerce).hostname) throw new Error("Health checks need two distinct hostnames.");
  const checks = [];
  const record = (name, passed, observed) => checks.push({ name, passed: Boolean(passed), observed });
  for (const [label, base] of [["public", storefront], ["commerce", commerce]]) {
    try {
      const response = await request(`${base}/api/public/tracking-policy`, { headers: { accept: "application/json" } });
      const body = await response.json();
      const policy = body?.policy;
      record(`${label} policy endpoint is bounded and uncached`, response.status === 200 && noCache(response) && response.headers.get("referrer-policy") === "no-referrer", { status: response.status });
      record(`${label} delivery remains disabled`, policy && policy.runtimeEnabled === false && policy.pixelEnabled === false && policy.capiEnabled === false, { runtimeEnabled: policy?.runtimeEnabled, pixelEnabled: policy?.pixelEnabled, capiEnabled: policy?.capiEnabled });
      record(`${label} runtime origin configuration matches`, policy?.storefrontOrigin === storefront && policy?.commerceOrigin === commerce, { matches: policy?.storefrontOrigin === storefront && policy?.commerceOrigin === commerce });
    } catch { record(`${label} policy endpoint available`, false, { code: "POLICY_READ_FAILED" }); }
  }
  try {
    const response = await request(`${storefront}/en/cart`, {});
    record("public private-page entry redirects before rendering", response.status === 307 && response.headers.get("location") === `${commerce}/en/cart`, { status: response.status, destinationMatches: response.headers.get("location") === `${commerce}/en/cart` });
  } catch { record("public private-page entry redirects before rendering", false, { code: "PAGE_READ_FAILED" }); }
  try {
    const response = await request(`${storefront}/api/user/me`, {});
    record("public account API is absent", response.status === 404, { status: response.status });
  } catch { record("public account API is absent", false, { code: "API_READ_FAILED" }); }
  try {
    const response = await request(`${commerce}/api/user/me`, { headers: { origin: storefront } });
    record("tracked-origin private API request is rejected without CORS", response.status === 403 && !response.headers.has("access-control-allow-origin") && !response.headers.has("access-control-allow-credentials"), { status: response.status });
  } catch { record("tracked-origin private API request is rejected without CORS", false, { code: "API_READ_FAILED" }); }
  try {
    const response = await request(`${commerce}/en/cart`, {});
    const body = await response.text();
    record("private document excludes Pixel bootstrap and has private headers", response.status === 200 && noCache(response) && privateHeaders(response) && !/facebook\.com\/tr|connect\.facebook\.net|fbevents\.js|__bangbuyMetaPixel/i.test(body), { status: response.status, privateHeaders: privateHeaders(response) });
  } catch { record("private document excludes Pixel bootstrap and has private headers", false, { code: "PAGE_READ_FAILED" }); }
  return { scope: "GET-only application host checks; not production readiness, database health or Meta receipt", passed: checks.every(check => check.passed), checks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    const read = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
    const result = await runDeploymentHealthChecks({ publicOrigin: read("--public-origin"), commerceOrigin: read("--commerce-origin") });
    console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1;
  } catch { console.error(JSON.stringify({ code: "HEALTHCHECK_CONFIGURATION_REJECTED" })); process.exitCode = 1; }
}
