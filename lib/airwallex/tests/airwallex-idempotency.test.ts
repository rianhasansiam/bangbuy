import { describe, expect, it } from "vitest";

import {
  createAirwallexRequestId,
  deriveAirwallexRequestId,
  isAirwallexRequestId,
} from "../security/airwallex-idempotency";

describe("Airwallex request IDs", () => {
  it("creates a provider-safe random request ID", () => {
    expect(isAirwallexRequestId(createAirwallexRequestId())).toBe(true);
  });

  it("derives the same opaque request ID for the same owner checkout retry", () => {
    const ownerId = "user_private_identifier";
    const checkoutAttemptId = "040f06ec-3394-4a77-bad2-8c8ec9150479";
    const first = deriveAirwallexRequestId(ownerId, checkoutAttemptId);
    const second = deriveAirwallexRequestId(ownerId, checkoutAttemptId);

    expect(first).toBe(second);
    expect(isAirwallexRequestId(first)).toBe(true);
    expect(first).not.toContain(ownerId);
  });

  it("domain-separates different owners and browser attempts", () => {
    const checkoutAttemptId = "040f06ec-3394-4a77-bad2-8c8ec9150479";

    expect(
      deriveAirwallexRequestId("user_a", checkoutAttemptId),
    ).not.toBe(deriveAirwallexRequestId("user_b", checkoutAttemptId));
    expect(
      deriveAirwallexRequestId("user_a", checkoutAttemptId),
    ).not.toBe(
      deriveAirwallexRequestId(
        "user_a",
        "3fb0a9e6-5f28-4482-a8f1-6911e6e5a5ac",
      ),
    );
  });
});
