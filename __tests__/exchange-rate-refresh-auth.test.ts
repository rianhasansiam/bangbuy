import { describe, expect, it } from "vitest";

import { isExchangeRateRefreshAuthorized } from "@/lib/currency/exchange-rate-refresh-auth";

const SECRET = "f".repeat(64);

function requestWithAuthorization(authorization?: string) {
  return new Request("https://example.com/api/internal/exchange-rates/refresh", {
    headers: authorization ? { authorization } : undefined,
  });
}

describe("exchange-rate refresh authorization", () => {
  it("accepts the exact Bearer secret", () => {
    expect(
      isExchangeRateRefreshAuthorized(
        requestWithAuthorization(`Bearer ${SECRET}`),
        SECRET,
      ),
    ).toBe(true);
  });

  it.each([
    ["missing header", undefined],
    ["wrong scheme", `Basic ${SECRET}`],
    ["missing token", "Bearer "],
    ["wrong token", `Bearer ${"e".repeat(64)}`],
    ["extra whitespace", `Bearer  ${SECRET}`],
    ["oversized header", `Bearer ${"a".repeat(600)}`],
  ])("rejects %s", (_label, authorization) => {
    expect(
      isExchangeRateRefreshAuthorized(
        requestWithAuthorization(authorization),
        SECRET,
      ),
    ).toBe(false);
  });

  it("rejects every request when the server secret is absent", () => {
    expect(
      isExchangeRateRefreshAuthorized(
        requestWithAuthorization("Bearer anything"),
        "",
      ),
    ).toBe(false);
  });
});
