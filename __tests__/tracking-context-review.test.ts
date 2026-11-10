import { afterEach, describe, expect, it, vi } from "vitest";
import { isMarketingDestination, validateTrackingReviewUrl } from "@/lib/analytics/context-review";

const env = { STOREFRONT_ORIGIN: "https://catalog.example.test", COMMERCE_ORIGIN: "https://commerce.example.test" };
afterEach(() => vi.unstubAllEnvs());
describe("operator review never manufactures approval or a safe source URL", () => {
  it("accepts a configured clean public document", () => { expect(validateTrackingReviewUrl("https://catalog.example.test/en/products/example", env).href).toBe("https://catalog.example.test/en/products/example"); });
  it.each(["https://commerce.example.test/en/checkout", "https://catalog.example.test/en/cart", "https://catalog.example.test/en/orders/private", "https://catalog.example.test/en/products/example?q=private", "https://catalog.example.test/en/products/example#private", "https://catalog.example.test/en/products/example?", "https://other.example.test/en/products/example", "https://user:secret@catalog.example.test/en/products/example"])("rejects unsafe or private input rather than sanitizing %s", (url) => { expect(() => validateTrackingReviewUrl(url, env)).toThrow(); });
  it("requires actual origin separation and permits isolated loopback development", () => {
    expect(() => validateTrackingReviewUrl("https://catalog.example.test/en", {})).toThrow();
    expect(() => validateTrackingReviewUrl("https://catalog.example.test/en", { ...env, COMMERCE_ORIGIN: env.STOREFRONT_ORIGIN })).toThrow();
    vi.stubEnv("NODE_ENV", "test");
    expect(validateTrackingReviewUrl("http://public.localhost:3000/en", { STOREFRONT_ORIGIN: "http://public.localhost:3000", COMMERCE_ORIGIN: "http://commerce.localhost:3000" }).origin).toBe("http://public.localhost:3000");
  });
  it("blocks Meta and tag-manager destinations including subdomains", () => {
    for (const url of ["https://connect.facebook.net/en_US/fbevents.js", "https://www.facebook.com/tr", "https://graph.facebook.com/events", "https://static.xx.fbcdn.net/sdk.js", "https://www.googletagmanager.com/gtm.js"]) expect(isMarketingDestination(url)).toBe(true);
    expect(isMarketingDestination("https://catalog.example.test/api/products")).toBe(false);
    expect(isMarketingDestination("https://facebook.com.attacker.test/script.js")).toBe(false);
  });
});
