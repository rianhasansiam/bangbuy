import { afterEach, describe, expect, it, vi } from "vitest";

import {
  approvePaymentReview,
  parseOrdersPayload,
  recordPaymentRefundAndCancel,
} from "./api";

describe("admin order payment parsing", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preserves explicit gateway methods and asynchronous statuses", () => {
    const result = parseOrdersPayload({
      success: true,
      data: [
        {
          id: "order-1",
          paymentMethod: "SSLCOMMERZ",
          paymentStatus: "PENDING",
          requiresPaymentReview: true,
          paymentReviewReasons: ["PROVIDER_RISK"],
          paymentReviewApprovalAllowed: true,
          paymentReviewRefundCancellationAllowed: true,
        },
        {
          id: "order-2",
          paymentMethod: "PAYPAL",
          paymentStatus: "FAILED",
        },
        {
          id: "order-3",
          paymentMethod: "SSLCOMMERZ",
          paymentStatus: "PENDING",
          requiresPaymentReview: true,
          paymentReviewReasons: ["RECONCILIATION_MISMATCH"],
          paymentReviewApprovalAllowed: false,
          paymentReviewRefundCancellationAllowed: true,
        },
      ],
    });

    expect(result.items).toEqual([
      expect.objectContaining({
        id: "order-1",
        paymentMethod: "SSLCOMMERZ",
        paymentStatus: "PENDING",
        requiresPaymentReview: true,
        paymentReviewReasons: ["PROVIDER_RISK"],
        paymentReviewApprovalAllowed: true,
        paymentReviewRefundCancellationAllowed: true,
      }),
      expect.objectContaining({
        id: "order-2",
        paymentMethod: "PAYPAL",
        paymentStatus: "FAILED",
        paymentReviewReasons: [],
        paymentReviewApprovalAllowed: false,
        paymentReviewRefundCancellationAllowed: false,
      }),
      expect.objectContaining({
        id: "order-3",
        requiresPaymentReview: true,
        paymentReviewReasons: ["RECONCILIATION_MISMATCH"],
        paymentReviewApprovalAllowed: false,
        paymentReviewRefundCancellationAllowed: true,
      }),
    ]);
  });

  it("uses the dedicated reviewed-payment approval endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await approvePaymentReview("order-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/orders/order-1/payment-review",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "APPROVE" }),
        cache: "no-store",
      },
    );
  });

  it("submits external refund evidence through the review endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await recordPaymentRefundAndCancel("order-1", "refund-1234");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/orders/order-1/payment-review",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "REFUND_AND_CANCEL",
          refundReference: "refund-1234",
        }),
        cache: "no-store",
      },
    );
  });
});
