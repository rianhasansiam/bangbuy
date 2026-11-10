import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { classifySurfacePath, getSurfaceOrigins, isPublicApiAllowed, needsDocumentNavigation, requestSurface, resolveSurfaceRequestUrl, surfaceHref } from "@/lib/security/surfaces";
import { readPublicProductSelection, savePublicProductSelection } from "@/lib/security/public-product-selection";
import { documentSecurityHeaders } from "@/lib/security/content-security-policy";
import { shoppingHandoffHref, shoppingSelectionSchema } from "@/lib/security/shopping-handoff";

const fixture = vi.hoisted(() => ({ profile: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/i18n/server", () => ({ getPublishedLanguages: async () => [{ code: "en" }, { code: "bn" }] }));
vi.mock("@/lib/i18n/preferences", () => ({ getProfileLocale: fixture.profile }));
vi.mock("@/lib/i18n/catalogs", () => ({ loadMessages: async () => ({ Navigation: {} }) }));
vi.mock("@/lib/services/catalog-redirect.service", () => ({ getCatalogRedirectByPath: fixture.redirect }));
import { proxy } from "@/proxy";

const env = { STOREFRONT_ORIGIN: "https://catalog.bangbuy.test", COMMERCE_ORIGIN: "https://commerce.bangbuy.test" };
beforeEach(() => { vi.stubEnv("STOREFRONT_ORIGIN", env.STOREFRONT_ORIGIN); vi.stubEnv("COMMERCE_ORIGIN", env.COMMERCE_ORIGIN); fixture.profile.mockResolvedValue("bn"); fixture.redirect.mockResolvedValue(null); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("surface contracts", () => {
  it.each(["/", "/en", "/bn/products", "/en/products/public-part", "/bn/categories/parts/boards", "/brands/a", "/about"])("classifies the known public document %s", path => expect(classifySurfacePath(path)).toBe("public"));
  it.each(["/cart", "/bn/checkout", "/en/orders/payment-return", "/profile", "/wishlist", "/login", "/admin", "/contact", "/search", "/unknown", "/zzz", "/zzz/"])("defaults the private or unknown document %s to private", path => expect(classifySurfacePath(path)).toBe("private"));
  it("requires distinct hostnames rather than a port-only split", () => {
    expect(getSurfaceOrigins(env).separated).toBe(true);
    expect(getSurfaceOrigins({ STOREFRONT_ORIGIN: "https://same.test:3000", COMMERCE_ORIGIN: "https://same.test:3001" }).separated).toBe(false);
    expect(getSurfaceOrigins({}).separated).toBe(false);
    expect(getSurfaceOrigins({ STOREFRONT_ORIGIN: "https://user:secret@public.test", COMMERCE_ORIGIN: "https://private.test" }).separated).toBe(false);
    expect(getSurfaceOrigins({ STOREFRONT_ORIGIN: "https://public.test/path", COMMERCE_ORIGIN: "https://private.test" }).separated).toBe(false);
  });
  it("accepts loopback hosts for isolated development but never production HTTP", () => {
    const local = { STOREFRONT_ORIGIN: "http://catalog.localhost:3000", COMMERCE_ORIGIN: "http://commerce.localhost:3000" };
    vi.stubEnv("NODE_ENV", "test"); expect(getSurfaceOrigins(local).separated).toBe(true);
    vi.stubEnv("NODE_ENV", "production"); expect(getSurfaceOrigins(local).separated).toBe(false);
  });
  it("recognizes only configured request origins", () => {
    expect(requestSurface(env.STOREFRONT_ORIGIN, env)).toBe("public");
    expect(requestSurface("https://attacker.test", env)).toBe("unknown");
    expect(requestSurface("https://legacy.test", {})).toBe("private");
  });
  it("maps an internal proxy URL through the exact configured Host without trusting forwarded hosts", () => {
    expect(resolveSurfaceRequestUrl(new Request("https://127.0.0.1:3187/en/products", { headers: { host: "catalog.bangbuy.test", "x-forwarded-host": "attacker.test", "x-forwarded-proto": "http" } }), env)).toBe(`${env.STOREFRONT_ORIGIN}/en/products`);
    expect(resolveSurfaceRequestUrl(new Request("https://127.0.0.1:3187/en/products", { headers: { host: "attacker.test", "x-forwarded-host": "catalog.bangbuy.test" } }), env)).toBeNull();
  });
  it("recovers only the current public variant and quantity with an expiry", () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", { sessionStorage: { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) } });
    savePublicProductSelection("product-a", { selectedVariantId: "variant-a", quantity: 3, address: "must not be saved", price: 99 }, 1000);
    expect(readPublicProductSelection("product-a", 1100)).toEqual({ selectedVariantId: "variant-a", quantity: 3 });
    expect([...storage.values()].join("")).not.toMatch(/address|must not|price/);
    expect(readPublicProductSelection("product-b", 1100)).toBeNull();
    expect(readPublicProductSelection("product-a", 1000 + 600001)).toBeNull();
    savePublicProductSelection("product-b", { selectedVariantId: "variant-b", quantity: 1 }, 1200);
    expect(readPublicProductSelection("product-a", 1300)).toBeNull();
    expect(storage.size).toBe(1);
  });
  it("hard navigates all public contexts while private SPA navigation remains local", () => {
    const origins = getSurfaceOrigins(env);
    expect(surfaceHref("/bn/checkout?buy=p%3A2%3Av", origins)).toBe(`${env.COMMERCE_ORIGIN}/bn/checkout?buy=p%3A2%3Av`);
    expect(surfaceHref("/en/products/part", origins)).toBe(`${env.STOREFRONT_ORIGIN}/en/products/part`);
    expect(needsDocumentNavigation(`${env.STOREFRONT_ORIGIN}/en`, "/en/products", origins)).toBe(true);
    expect(needsDocumentNavigation(`${env.STOREFRONT_ORIGIN}/en/products`, "/en/products?q=private", origins)).toBe(true);
    expect(needsDocumentNavigation(`${env.COMMERCE_ORIGIN}/en/cart`, "/en/checkout", origins)).toBe(false);
    expect(needsDocumentNavigation(`${env.COMMERCE_ORIGIN}/en/cart`, `${env.STOREFRONT_ORIGIN}/en/products`, origins)).toBe(true);
  });
  it("strictly validates public shopping handoffs without accepting customer data or prices", () => {
    expect(shoppingSelectionSchema.safeParse({ action: "cart", productId: "p", variantId: "v", quantity: 2 }).success).toBe(true);
    for (const extra of [{ customerEmail: "private@example.test" }, { price: 1 }, { returnUrl: "https://attacker.test" }, { guestToken: "secret" }]) expect(shoppingSelectionSchema.safeParse({ action: "cart", productId: "p", quantity: 1, ...extra }).success).toBe(false);
    expect(shoppingSelectionSchema.safeParse({ action: "cart", productId: "../orders", quantity: 1 }).success).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_STOREFRONT_ORIGIN", env.STOREFRONT_ORIGIN); vi.stubEnv("NEXT_PUBLIC_COMMERCE_ORIGIN", env.COMMERCE_ORIGIN);
    const href = shoppingHandoffHref({ action: "buy", productId: "p", variantId: "v", quantity: 2 }, "bn");
    expect(href).toBe(`${env.COMMERCE_ORIGIN}/bn/checkout?buy=p%3A2%3Av`);
    expect(href).not.toContain("source=cart");
  });
  it("never allows private API methods or paths on the public host", () => {
    expect(isPublicApiAllowed("/api/products", "GET")).toBe(true);
    expect(isPublicApiAllowed("/api/catalog/facets", "GET")).toBe(true);
    for (const path of ["/api/auth/session", "/api/user/me", "/api/cart", "/api/checkout", "/api/orders/123", "/api/payments/airwallex/status/123", "/api/admin/guests", "/api/language"]) expect(isPublicApiAllowed(path, "GET")).toBe(false);
    expect(isPublicApiAllowed("/api/products", "POST")).toBe(false);
  });
});

describe("host and header enforcement before handlers", () => {
  it("redirects direct private entry without rendering a public SDK document", async () => {
    const response = await proxy(new NextRequest(`${env.STOREFRONT_ORIGIN}/bn/checkout?buy=p%3A2%3Av`));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${env.COMMERCE_ORIGIN}/bn/checkout?buy=p%3A2%3Av`);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });
  it("rejects private API reads on public and unrecognized hosts", async () => {
    expect((await proxy(new NextRequest(`${env.STOREFRONT_ORIGIN}/api/user/me`))).status).toBe(404);
    expect((await proxy(new NextRequest("https://spoofed.test/api/user/me"))).status).toBe(421);
  });
  it("strips manually supplied account and guest credentials from public handlers", async () => {
    const response = await proxy(new NextRequest(`${env.STOREFRONT_ORIGIN}/api/products`, { headers: { cookie: "authjs.session-token=account; bangbuy-guest-order-o=secret; enterfly=private; bangbuy_locale=bn; currency=USD; bangbuy-marketing-consent=preference", authorization: "Bearer secret", "x-bangbuy-surface": "private" } }));
    expect(response.headers.get("x-middleware-request-cookie")).toBe("bangbuy_locale=bn; currency=USD; bangbuy-marketing-consent=preference");
    expect(response.headers.get("x-middleware-request-authorization")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-bangbuy-surface")).toBe("public");
  });
  it("does not consult a signed-in profile to personalize public locale", async () => {
    const response = await proxy(new NextRequest(`${env.STOREFRONT_ORIGIN}/products`));
    expect(response.headers.get("location")).toBe(`${env.STOREFRONT_ORIGIN}/en/products`);
    expect(fixture.profile).not.toHaveBeenCalled();
  });
  it("blocks tracked-origin private API requests without enabling credentialed CORS", async () => {
    const response = await proxy(new NextRequest(`${env.COMMERCE_ORIGIN}/api/cart`, { method: "POST", headers: { origin: env.STOREFRONT_ORIGIN, "content-type": "application/json" }, body: "{}" }));
    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(response.headers.get("access-control-allow-credentials")).toBeNull();
  });
  it("retains provider callbacks and historical locale redirects", async () => {
    expect((await proxy(new NextRequest(`${env.COMMERCE_ORIGIN}/api/payments/sslcommerz/success`, { method: "POST", headers: { origin: "https://securepay.sslcommerz.com" } }))).status).toBe(200);
    fixture.redirect.mockResolvedValue({ destinationPath: "/products/new-part" });
    const response = await proxy(new NextRequest(`${env.STOREFRONT_ORIGIN}/bn/products/old-part`));
    expect(response.status).toBe(308); expect(response.headers.get("location")).toBe(`${env.STOREFRONT_ORIGIN}/bn/products/new-part`);
  });
  it("private CSP excludes Meta while retaining legitimate payment and image hosts", () => {
    const privatePolicy = documentSecurityHeaders("private")["Content-Security-Policy"];
    expect(privatePolicy).not.toMatch(/facebook|fbcdn|googletagmanager/);
    expect(privatePolicy).toContain("https://*.airwallex.com");
    expect(privatePolicy).toContain("https://www.google.com/maps");
    const contactMap = readFileSync("app/(private-commerce)/(shop)/contact/components/ContactMap.tsx", "utf8");
    expect(contactMap).toContain('referrerPolicy="no-referrer"');
    expect(contactMap).not.toContain("no-referrer-when-downgrade");
    expect(documentSecurityHeaders("public")["Content-Security-Policy"]).toContain("https://connect.facebook.net");
  });
});
