import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    exchangeRate: {
      findUnique: prismaMocks.findUnique,
      upsert: prismaMocks.upsert,
    },
    $transaction: prismaMocks.transaction,
  },
}));

import type { CurrencyCode } from "@/lib/currency/config";
import type { ExchangeRateProvider } from "@/lib/currency/exchange-rate-provider";
import {
  ExchangeRateRefreshError,
  getExchangeRateFreshnessMs,
  prismaExchangeRateRepository,
  refreshExchangeRates,
  resolveExchangeRateQuote,
  type ExchangeRateRepository,
  type ExchangeRateWrite,
  type StoredExchangeRate,
} from "@/lib/currency/exchange-rate.service";

const NOW = new Date("2026-08-19T12:00:00.000Z");

class MemoryRepository implements ExchangeRateRepository {
  row: StoredExchangeRate | null = null;
  snapshotRows: StoredExchangeRate[] = [];
  findCalls = 0;
  findAllCalls = 0;
  writes: readonly ExchangeRateWrite[] | null = null;
  writeCalls = 0;
  findError: Error | null = null;
  writeError: Error | null = null;

  async find() {
    this.findCalls += 1;
    if (this.findError) throw this.findError;
    return this.row;
  }

  async findAll() {
    this.findAllCalls += 1;
    if (this.findError) throw this.findError;
    return this.snapshotRows;
  }

  async upsertAll(rows: readonly ExchangeRateWrite[]) {
    this.writeCalls += 1;
    if (this.writeError) throw this.writeError;
    this.writes = rows;
  }
}

const VALID_PROVIDER: ExchangeRateProvider = {
  async getRates() {
    return {
      baseCurrency: "BDT",
      rates: {
        AUD: "0.012",
        EUR: "0.0075",
        GBP: "0.0064",
        USD: "0.0082",
        CNY: "0.059",
      },
    };
  },
};

describe("exchange-rate cache service", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMocks.findUnique.mockReset();
    prismaMocks.upsert.mockReset();
    prismaMocks.transaction.mockReset();
  });

  it("returns the BDT identity quote without querying the database", async () => {
    const repository = new MemoryRepository();

    await expect(
      resolveExchangeRateQuote("BDT", { repository }),
    ).resolves.toEqual({
      baseCurrency: "BDT",
      requestedCurrency: "BDT",
      currency: "BDT",
      rate: "1",
      fetchedAt: null,
      stale: false,
    });
    expect(repository.findCalls).toBe(0);
  });

  it("returns a fresh serializable foreign quote", async () => {
    const repository = new MemoryRepository();
    repository.row = {
      baseCurrency: "BDT",
      currency: "USD",
      rate: { toString: () => "0.0082000000" },
      fetchedAt: new Date("2026-08-19T10:00:00.000Z"),
    };

    await expect(
      resolveExchangeRateQuote("USD", {
        repository,
        now: () => NOW,
        freshnessMs: 6 * 60 * 60 * 1_000,
      }),
    ).resolves.toEqual({
      baseCurrency: "BDT",
      requestedCurrency: "USD",
      currency: "USD",
      rate: "0.0082000000",
      fetchedAt: "2026-08-19T10:00:00.000Z",
      stale: false,
    });
  });

  it("retains a valid stale foreign quote", async () => {
    const repository = new MemoryRepository();
    repository.row = {
      baseCurrency: "BDT",
      currency: "EUR",
      rate: "0.0075",
      fetchedAt: new Date("2026-08-18T00:00:00.000Z"),
    };

    const quote = await resolveExchangeRateQuote("EUR", {
      repository,
      now: () => NOW,
      freshnessMs: 6 * 60 * 60 * 1_000,
    });

    expect(quote.currency).toBe("EUR");
    expect(quote.rate).toBe("0.0075");
    expect(quote.stale).toBe(true);
  });

  it.each([
    ["missing", null],
    [
      "zero",
      {
        baseCurrency: "BDT",
        currency: "USD",
        rate: "0",
        fetchedAt: NOW,
      },
    ],
    [
      "negative",
      {
        baseCurrency: "BDT",
        currency: "USD",
        rate: "-1",
        fetchedAt: NOW,
      },
    ],
    [
      "wrong currency",
      {
        baseCurrency: "BDT",
        currency: "EUR",
        rate: "0.1",
        fetchedAt: NOW,
      },
    ],
  ])("downgrades a %s row to both BDT and rate one", async (_label, row) => {
    const repository = new MemoryRepository();
    repository.row = row;

    const quote = await resolveExchangeRateQuote("USD", {
      repository,
      now: () => NOW,
    });

    expect(quote).toMatchObject({
      requestedCurrency: "USD",
      currency: "BDT",
      rate: "1",
      fetchedAt: null,
      stale: false,
    });
  });

  it("downgrades to BDT when the cache read fails", async () => {
    const repository = new MemoryRepository();
    repository.findError = new Error("database unavailable");

    await expect(
      resolveExchangeRateQuote("CNY", { repository }),
    ).resolves.toMatchObject({
      requestedCurrency: "CNY",
      currency: "BDT",
      rate: "1",
    });
  });

  it("persists one complete six-row snapshot with BDT fixed to one", async () => {
    const repository = new MemoryRepository();

    const result = await refreshExchangeRates({
      provider: VALID_PROVIDER,
      repository,
      now: () => NOW,
    });

    expect(result).toEqual({
      status: "refreshed",
      baseCurrency: "BDT",
      currencies: ["BDT", "AUD", "EUR", "GBP", "USD", "CNY"],
      refreshedAt: NOW.toISOString(),
      count: 6,
    });
    expect(repository.writeCalls).toBe(1);
    expect(repository.writes).toHaveLength(6);
    expect(repository.writes?.map((row) => row.currency)).toEqual([
      "BDT",
      "AUD",
      "EUR",
      "GBP",
      "USD",
      "CNY",
    ] satisfies CurrencyCode[]);
    expect(repository.writes?.[0]).toMatchObject({
      baseCurrency: "BDT",
      currency: "BDT",
      rate: "1",
      fetchedAt: NOW,
    });
    expect(
      repository.writes?.every(
        (row) => row.fetchedAt === repository.writes?.[0]?.fetchedAt,
      ),
    ).toBe(true);
  });

  it("does not write anything when the provider fails", async () => {
    const repository = new MemoryRepository();
    const provider: ExchangeRateProvider = {
      async getRates() {
        throw new Error("provider body with sensitive details");
      },
    };

    await expect(
      refreshExchangeRates({ provider, repository, now: () => NOW }),
    ).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
      message: "Exchange-rate refresh failed; stale rates were retained.",
    });
    expect(repository.writeCalls).toBe(0);
    expect(console.error).not.toHaveBeenCalledWith(
      expect.stringContaining("sensitive details"),
      expect.anything(),
    );
  });

  it("skips the provider when all six cached rows are fresh", async () => {
    const repository = new MemoryRepository();
    const fetchedAt = new Date("2026-08-19T10:00:00.000Z");
    repository.snapshotRows = [
      ["BDT", "1"],
      ["AUD", "0.012"],
      ["EUR", "0.0075"],
      ["GBP", "0.0064"],
      ["USD", "0.0082"],
      ["CNY", "0.059"],
    ].map(([currency, rate]) => ({
      baseCurrency: "BDT",
      currency,
      rate,
      fetchedAt,
    }));
    const provider = {
      getRates: vi.fn(VALID_PROVIDER.getRates),
    } satisfies ExchangeRateProvider;

    const result = await refreshExchangeRates({
      provider,
      repository,
      now: () => NOW,
    });

    expect(result.status).toBe("fresh");
    expect(result.refreshedAt).toBe(fetchedAt.toISOString());
    expect(provider.getRates).not.toHaveBeenCalled();
    expect(repository.writeCalls).toBe(0);
  });

  it("refreshes when a complete snapshot is stale", async () => {
    const repository = new MemoryRepository();
    const fetchedAt = new Date("2026-08-18T00:00:00.000Z");
    repository.snapshotRows = [
      ["BDT", "1"],
      ["AUD", "0.012"],
      ["EUR", "0.0075"],
      ["GBP", "0.0064"],
      ["USD", "0.0082"],
      ["CNY", "0.059"],
    ].map(([currency, rate]) => ({
      baseCurrency: "BDT",
      currency,
      rate,
      fetchedAt,
    }));
    const provider = {
      getRates: vi.fn(VALID_PROVIDER.getRates),
    } satisfies ExchangeRateProvider;

    const result = await refreshExchangeRates({
      provider,
      repository,
      now: () => NOW,
    });

    expect(result.status).toBe("refreshed");
    expect(provider.getRates).toHaveBeenCalledOnce();
    expect(repository.writeCalls).toBe(1);
  });

  it("coalesces concurrent refresh calls into one provider request", async () => {
    const repository = new MemoryRepository();
    let releaseProvider!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseProvider = resolve;
    });
    const provider: ExchangeRateProvider = {
      getRates: vi.fn(async () => {
        await gate;
        return VALID_PROVIDER.getRates("BDT");
      }),
    };

    const first = refreshExchangeRates({
      provider,
      repository,
      now: () => NOW,
    });
    const second = refreshExchangeRates({
      provider,
      repository,
      now: () => NOW,
    });
    releaseProvider();

    const [firstResult, secondResult] = await Promise.all([first, second]);
    expect(firstResult).toEqual(secondResult);
    expect(provider.getRates).toHaveBeenCalledOnce();
    expect(repository.findAllCalls).toBe(1);
    expect(repository.writeCalls).toBe(1);
  });

  it("does not write a partial or invalid provider snapshot", async () => {
    const repository = new MemoryRepository();
    const provider = {
      async getRates() {
        return {
          baseCurrency: "BDT",
          rates: {
            AUD: "0.012",
            EUR: "0.0075",
            GBP: "0.0064",
            USD: "0",
            CNY: "0.059",
          },
        };
      },
    } as ExchangeRateProvider;

    await expect(
      refreshExchangeRates({ provider, repository, now: () => NOW }),
    ).rejects.toBeInstanceOf(ExchangeRateRefreshError);
    expect(repository.writeCalls).toBe(0);
  });

  it("turns six Prisma upserts into one transaction", async () => {
    const rows = [
      ["BDT", "1"],
      ["AUD", "0.012"],
      ["EUR", "0.0075"],
      ["GBP", "0.0064"],
      ["USD", "0.0082"],
      ["CNY", "0.059"],
    ].map(([currency, rate]) => ({
      baseCurrency: "BDT" as const,
      currency: currency as CurrencyCode,
      rate,
      fetchedAt: NOW,
    }));
    prismaMocks.upsert.mockImplementation((args) =>
      Promise.resolve(args),
    );
    prismaMocks.transaction.mockResolvedValue([]);

    await prismaExchangeRateRepository.upsertAll(rows);

    expect(prismaMocks.upsert).toHaveBeenCalledTimes(6);
    expect(prismaMocks.transaction).toHaveBeenCalledOnce();
    expect(prismaMocks.transaction.mock.calls[0]?.[0]).toHaveLength(6);
  });

  it("uses six hours for missing or invalid freshness configuration", () => {
    const sixHours = 6 * 60 * 60 * 1_000;
    expect(getExchangeRateFreshnessMs(undefined)).toBe(sixHours);
    expect(getExchangeRateFreshnessMs("not-a-number")).toBe(sixHours);
    expect(getExchangeRateFreshnessMs("0")).toBe(sixHours);
    expect(getExchangeRateFreshnessMs("12")).toBe(2 * sixHours);
  });
});
