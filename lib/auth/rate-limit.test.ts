import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: { $queryRaw: mocks.queryRaw },
}));

import { rateLimitPersistent } from "@/lib/auth/rate-limit";

const NOW = new Date("2026-07-26T12:00:00.000Z");

function rawQueryCall() {
  const [strings, ...values] = mocks.queryRaw.mock.calls[0] as [
    TemplateStringsArray,
    ...unknown[],
  ];

  return {
    sql: Array.from(strings).join("?"),
    values,
  };
}

describe("rateLimitPersistent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the remaining allowance from the atomic database result", async () => {
    mocks.queryRaw.mockResolvedValue([
      { count: 2, resetAt: new Date(NOW.getTime() + 60_000) },
    ]);

    await expect(
      rateLimitPersistent("payment:user-1", 3, 60_000),
    ).resolves.toEqual({
      allowed: true,
      remaining: 1,
      resetMs: 60_000,
    });
  });

  it("blocks once the returned count exceeds the limit", async () => {
    mocks.queryRaw.mockResolvedValue([
      { count: 4, resetAt: new Date(NOW.getTime() + 25_000) },
    ]);

    await expect(
      rateLimitPersistent("payment:user-1", 3, 60_000),
    ).resolves.toEqual({
      allowed: false,
      remaining: 0,
      resetMs: 25_000,
    });
  });

  it("maps a reset window to a fresh first request", async () => {
    mocks.queryRaw.mockResolvedValue([
      { count: 1, resetAt: new Date(NOW.getTime() + 10_000) },
    ]);

    await expect(
      rateLimitPersistent("payment:user-1", 5, 10_000),
    ).resolves.toEqual({
      allowed: true,
      remaining: 4,
      resetMs: 10_000,
    });

    const { sql } = rawQueryCall();
    expect(sql).toContain('ON CONFLICT ("keyDigest") DO UPDATE');
    expect(sql).toContain('"RateLimitBucket"."resetAt" <=');
    expect(sql).toContain('LEAST("RateLimitBucket"."count"');
  });

  it("stores a SHA-256 digest and never passes the raw key to PostgreSQL", async () => {
    mocks.queryRaw.mockResolvedValue([
      { count: 1, resetAt: new Date(NOW.getTime() + 1_000) },
    ]);

    await rateLimitPersistent("abc", 2, 1_000);

    const call = rawQueryCall();
    expect(call.values[0]).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(call.values).not.toContain("abc");
    expect(JSON.stringify(call)).not.toContain('"abc"');
  });

  it.each([
    ["", 1, 1_000],
    ["   ", 1, 1_000],
    ["key", 0, 1_000],
    ["key", 1.5, 1_000],
    ["key", 1, 0],
    ["key", 1, 1.5],
  ])(
    "rejects invalid arguments before querying for key=%j max=%j window=%j",
    async (key, max, windowMs) => {
      await expect(
        rateLimitPersistent(key, max, windowMs),
      ).rejects.toBeInstanceOf(Error);
      expect(mocks.queryRaw).not.toHaveBeenCalled();
    },
  );
});
