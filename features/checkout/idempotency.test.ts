import { describe, expect, it, vi } from "vitest";

import { resolveCheckoutIdempotencyAttempt } from "./idempotency";

describe("SSLCommerz checkout idempotency", () => {
  it("reuses the key when the same submission is retried", () => {
    const createKey = vi.fn(() => "attempt-2");
    const previous = { fingerprint: '{"cart":"same"}', key: "attempt-1" };

    const attempt = resolveCheckoutIdempotencyAttempt(
      previous,
      previous.fingerprint,
      createKey,
    );

    expect(attempt).toBe(previous);
    expect(createKey).not.toHaveBeenCalled();
  });

  it("creates a new key after checkout input changes", () => {
    const createKey = vi.fn(() => "attempt-2");

    const attempt = resolveCheckoutIdempotencyAttempt(
      { fingerprint: '{"cart":"old"}', key: "attempt-1" },
      '{"cart":"new"}',
      createKey,
    );

    expect(attempt).toEqual({
      fingerprint: '{"cart":"new"}',
      key: "attempt-2",
    });
    expect(createKey).toHaveBeenCalledOnce();
  });
});
