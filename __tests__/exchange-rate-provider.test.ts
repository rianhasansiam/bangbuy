import { describe, expect, it, vi } from "vitest";

import {
  ExchangeRateApiProvider,
  ExchangeRateProviderError,
} from "@/lib/currency/exchange-rate-provider";

const COMPLETE_RATES = {
  BDT: 1,
  AUD: 0.012,
  EUR: 0.0075,
  GBP: 0.0064,
  USD: 0.0082,
  CNY: 0.059,
  CAD: 0.011,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ExchangeRateApiProvider", () => {
  it("returns only the five required foreign BDT rates", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        result: "success",
        base_code: "BDT",
        conversion_rates: COMPLETE_RATES,
      }),
    );
    const provider = new ExchangeRateApiProvider({
      apiKey: "test-provider-key",
      fetchImpl,
    });

    await expect(provider.getRates("BDT")).resolves.toEqual({
      baseCurrency: "BDT",
      rates: {
        AUD: "0.012",
        EUR: "0.0075",
        GBP: "0.0064",
        USD: "0.0082",
        CNY: "0.059",
      },
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl.mock.calls[0]?.[1]).toMatchObject({
      method: "GET",
      cache: "no-store",
    });
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
    ["NaN", Number.NaN],
    ["infinite", Number.POSITIVE_INFINITY],
    ["missing", undefined],
    ["non-numeric", "0.0082"],
  ])("rejects a %s required rate", async (_label, invalidRate) => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        result: "success",
        base_code: "BDT",
        conversion_rates: {
          ...COMPLETE_RATES,
          USD: invalidRate,
        },
      }),
    );
    const provider = new ExchangeRateApiProvider({
      apiKey: "do-not-leak-this-key",
      fetchImpl,
    });

    const failure = provider.getRates("BDT");
    await expect(failure).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
    await expect(failure).rejects.not.toThrow("do-not-leak-this-key");
  });

  it("rejects a response for the wrong base currency", async () => {
    const provider = new ExchangeRateApiProvider({
      apiKey: "test-key",
      fetchImpl: vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse({
          result: "success",
          base_code: "USD",
          conversion_rates: COMPLETE_RATES,
        }),
      ),
    });

    await expect(provider.getRates("BDT")).rejects.toBeInstanceOf(
      ExchangeRateProviderError,
    );
  });

  it("maps transport failures to a credential-free provider error", async () => {
    const provider = new ExchangeRateApiProvider({
      apiKey: "private-key",
      fetchImpl: vi
        .fn<typeof fetch>()
        .mockRejectedValue(new Error("request URL contained private-key")),
    });

    await expect(provider.getRates("BDT")).rejects.toEqual(
      expect.objectContaining({
        code: "NETWORK_ERROR",
        message: "The exchange-rate provider is unavailable.",
      }),
    );
  });
});
