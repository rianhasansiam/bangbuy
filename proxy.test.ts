import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getRedirect: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/services/catalog-redirect.service", () => ({
  getCatalogRedirectByPath: mocks.getRedirect,
}));

import { NextRequest } from "next/server";

import { config, proxy } from "./proxy";

describe("catalog proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRedirect.mockResolvedValue(null);
  });

  it("uses case-tolerant matchers for every catalog detail prefix", () => {
    expect(config.matcher).toEqual([
      "/([pP][rR][oO][dD][uU][cC][tT][sS]|[bB][rR][aA][nN][dD][sS])/:slug",
      "/([cC][aA][tT][eE][gG][oO][rR][iI][eE][sS])/:path+",
    ]);
  });

  it("permanently normalizes uppercase catalog paths before rendering", async () => {
    const response = await proxy(
      new NextRequest("https://bangbuy.net/products/LOUD-SLUG?ref=test"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://bangbuy.net/products/loud-slug?ref=test",
    );
    expect(mocks.getRedirect).toHaveBeenCalledWith(
      "/products/loud-slug",
      "PRODUCT",
    );
  });

  it("collapses uppercase redirect-history paths into one hop", async () => {
    mocks.getRedirect.mockResolvedValue({
      destinationPath: "/products/current-slug",
    });

    const response = await proxy(
      new NextRequest("https://bangbuy.net/products/OLD-SLUG?ref=test"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://bangbuy.net/products/current-slug?ref=test",
    );
  });

  it("returns an HTTP 308 for persisted catalog redirect history", async () => {
    mocks.getRedirect.mockResolvedValue({
      destinationPath: "/brands/current-brand",
    });

    const response = await proxy(
      new NextRequest("https://bangbuy.net/brands/old-brand"),
    );

    expect(mocks.getRedirect).toHaveBeenCalledWith(
      "/brands/old-brand",
      "BRAND",
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://bangbuy.net/brands/current-brand",
    );
  });

  it("passes canonical paths through when no history exists", async () => {
    const response = await proxy(
      new NextRequest("https://bangbuy.net/categories/tools/drills"),
    );

    expect(mocks.getRedirect).toHaveBeenCalledWith(
      "/categories/tools/drills",
      "CATEGORY",
    );
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not query redirect history for malformed catalog paths", async () => {
    const response = await proxy(
      new NextRequest("https://bangbuy.net/products/not%20a%20slug"),
    );

    expect(mocks.getRedirect).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("fails open when redirect history is temporarily unavailable", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getRedirect.mockRejectedValue(new Error("database unavailable"));

    const canonicalResponse = await proxy(
      new NextRequest("https://bangbuy.net/brands/current-brand"),
    );
    const uppercaseResponse = await proxy(
      new NextRequest("https://bangbuy.net/brands/CURRENT-BRAND"),
    );

    expect(canonicalResponse.headers.get("x-middleware-next")).toBe("1");
    expect(uppercaseResponse.status).toBe(308);
    expect(uppercaseResponse.headers.get("location")).toBe(
      "https://bangbuy.net/brands/current-brand",
    );
    expect(errorSpy).toHaveBeenCalledTimes(2);
    errorSpy.mockRestore();
  });
});
