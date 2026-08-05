import { describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/client";

vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import {
  createAirwallexRequestId,
  isAirwallexRequestId,
} from "../security/airwallex-idempotency";
import {
  isLegalAirwallexTransition,
  isTerminalAirwallexStatus,
  mapAirwallexPaymentStatus,
  toPublicAirwallexStatus,
} from "../services/airwallex-payment-status.service";
import { findAirwallexVerificationMismatch } from "../services/airwallex-payment-verification.service";

describe("Airwallex request IDs", () => {
  it("creates UUID v4 request IDs within Airwallex's length limit", () => {
    const requestId = createAirwallexRequestId();

    expect(requestId.length).toBeLessThanOrEqual(64);
    expect(isAirwallexRequestId(requestId)).toBe(true);
  });

  it("rejects malformed, non-v4, and oversized request IDs", () => {
    expect(isAirwallexRequestId("not-a-uuid")).toBe(false);
    expect(
      isAirwallexRequestId("6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
    ).toBe(false);
    expect(isAirwallexRequestId(`123e4567-e89b-42d3-a456-${"0".repeat(60)}`)).toBe(
      false,
    );
  });
});

describe("Airwallex payment status mapping", () => {
  it("does not treat lifecycle request_id changes as an identity mismatch", () => {
    const order = {
      id: "order-1",
      subtotal: new Decimal("100.00"),
      deliveryCharge: new Decimal("10.00"),
      discountAmount: new Decimal("5.00"),
      taxAmount: new Decimal("2.00"),
      totalAmount: new Decimal("107.00"),
      currency: "USD",
      promoCode: null,
      promoCodeUsages: [],
      items: [
        {
          quantity: 1,
          unitPrice: new Decimal("100.00"),
          totalPrice: new Decimal("100.00"),
        },
      ],
    };

    expect(
      findAirwallexVerificationMismatch(
        {
          transactionId: "int_test123",
          amount: new Decimal("107.00"),
          currency: "USD",
          order,
        },
        {
          paymentIntentId: "int_test123",
          requestId: "request-from-a-later-confirm-operation",
          merchantOrderId: "order-1",
          amount: 107,
          currency: "USD",
          providerStatus: "SUCCEEDED",
        },
      ),
    ).toBeNull();
  });

  it.each([
    ["REQUIRES_PAYMENT_METHOD", "REQUIRES_PAYMENT_METHOD"],
    ["REQUIRES_CUSTOMER_ACTION", "PROCESSING"],
    ["REQUIRES_CAPTURE", "PROCESSING"],
    ["PENDING", "PENDING"],
    ["PENDING_REVIEW", "PENDING_REVIEW"],
    ["SUCCEEDED", "SUCCESS"],
    ["CANCELLED", "CANCELLED"],
  ] as const)("maps %s to %s", (providerStatus, internalStatus) => {
    expect(mapAirwallexPaymentStatus(providerStatus)).toBe(internalStatus);
  });

  it("quarantines unknown statuses without terminalizing failed attempts", () => {
    expect(mapAirwallexPaymentStatus("A_NEW_PROVIDER_STATUS")).toBe(
      "REQUIRES_REVIEW",
    );
    expect(mapAirwallexPaymentStatus("A_NEW_PROVIDER_STATUS")).toBe(
      "REQUIRES_REVIEW",
    );
    expect(mapAirwallexPaymentStatus("REQUIRES_PAYMENT_METHOD")).toBe(
      "REQUIRES_PAYMENT_METHOD",
    );
  });

  it("keeps success monotonic while allowing a verified refund", () => {
    expect(isLegalAirwallexTransition("SUCCESS", "FAILED")).toBe(false);
    expect(isLegalAirwallexTransition("SUCCESS", "PENDING")).toBe(false);
    expect(isLegalAirwallexTransition("SUCCESS", "CANCELLED")).toBe(false);
    expect(isLegalAirwallexTransition("SUCCESS", "REQUIRES_REVIEW")).toBe(
      false,
    );
    expect(isLegalAirwallexTransition("SUCCESS", "SUCCESS")).toBe(true);
    expect(isLegalAirwallexTransition("SUCCESS", "REFUNDED")).toBe(true);
  });

  it("accepts authoritative late success without reopening terminal failures", () => {
    expect(isLegalAirwallexTransition("FAILED", "SUCCESS")).toBe(true);
    expect(isLegalAirwallexTransition("CANCELLED", "SUCCESS")).toBe(true);
    expect(isLegalAirwallexTransition("EXPIRED", "SUCCESS")).toBe(true);
    expect(isLegalAirwallexTransition("FAILED", "PENDING")).toBe(false);
    expect(isLegalAirwallexTransition("CANCELLED", "FAILED")).toBe(false);
    expect(isLegalAirwallexTransition("EXPIRED", "PROCESSING")).toBe(false);
  });

  it("never reopens a refunded payment on an out-of-order event", () => {
    expect(isLegalAirwallexTransition("REFUNDED", "REFUNDED")).toBe(true);
    expect(isLegalAirwallexTransition("REFUNDED", "SUCCESS")).toBe(false);
    expect(isLegalAirwallexTransition("REFUNDED", "FAILED")).toBe(false);
    expect(isLegalAirwallexTransition("REFUNDED", "PENDING")).toBe(false);
  });

  it("identifies terminal and public status equivalents", () => {
    expect(isTerminalAirwallexStatus("SUCCESS")).toBe(true);
    expect(isTerminalAirwallexStatus("PENDING_REVIEW")).toBe(false);
    expect(toPublicAirwallexStatus("SUCCESS")).toBe("SUCCEEDED");
    expect(toPublicAirwallexStatus("EXPIRED")).toBe("CANCELLED");
  });
});
