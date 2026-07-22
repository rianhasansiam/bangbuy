import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "@/lib/seo/site";

describe("resolveSiteUrl", () => {
  it("uses the production domain when production has no override", () => {
    expect(resolveSiteUrl({ NODE_ENV: "production" })).toBe(
      "https://bangbuy.net",
    );
  });

  it("ignores a legacy localhost public value during production builds", () => {
    expect(
      resolveSiteUrl({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      }),
    ).toBe("https://bangbuy.net");
  });

  it("uses a safe localhost fallback outside production", () => {
    expect(resolveSiteUrl({ NODE_ENV: "development" })).toBe(
      "http://localhost:3000",
    );
  });

  it("prefers and normalizes the server-only SITE_URL", () => {
    expect(
      resolveSiteUrl({
        NODE_ENV: "production",
        SITE_URL: "https://WWW.BANGBUY.NET:443/",
        NEXT_PUBLIC_SITE_URL: "https://legacy.example.com",
      }),
    ).toBe("https://www.bangbuy.net");
  });

  it("supports the legacy public URL and local HTTP during development", () => {
    expect(
      resolveSiteUrl({
        NODE_ENV: "development",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000/",
      }),
    ).toBe("http://127.0.0.1:3000");
  });

  it.each([
    "https://bangbuy.net/store",
    "https://bangbuy.net?preview=1",
    "https://user:password@bangbuy.net",
    "ftp://bangbuy.net",
    "not-a-url",
  ])("rejects an invalid configured origin: %s", (value) => {
    expect(() =>
      resolveSiteUrl({ NODE_ENV: "production", SITE_URL: value }),
    ).toThrow();
  });

  it("rejects plain HTTP for production and non-local development hosts", () => {
    expect(() =>
      resolveSiteUrl({
        NODE_ENV: "production",
        SITE_URL: "http://bangbuy.net",
      }),
    ).toThrow(/must use https/);
    expect(() =>
      resolveSiteUrl({
        NODE_ENV: "development",
        SITE_URL: "http://example.com",
      }),
    ).toThrow(/must use https/);
  });
});
