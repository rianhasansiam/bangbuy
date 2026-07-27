import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  paymentFindFirst: vi.fn(),
  paymentFindMany: vi.fn(),
  paymentFindUnique: vi.fn(),
  paymentUpdate: vi.fn(),
  paymentUpdateMany: vi.fn(),
  transaction: vi.fn(),
  txPaymentFindFirst: vi.fn(),
  txPaymentFindUnique: vi.fn(),
  txPaymentUpdate: vi.fn(),
  txOrderUpdate: vi.fn(),
  queryTransaction: vi.fn(),
  validatePayment: vi.fn(),
  lockOrder: vi.fn(),
  lockPayment: vi.fn(),
  recordStatusHistory: vi.fn(),
  releasePromotionUsage: vi.fn(),
  restoreStock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    paymentTransaction: {
      findFirst: mocks.paymentFindFirst,
      findMany: mocks.paymentFindMany,
      findUnique: mocks.paymentFindUnique,
      update: mocks.paymentUpdate,
      updateMany: mocks.paymentUpdateMany,
    },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/lib/orders/mutations", () => ({
  lockOrderForStatusChange: mocks.lockOrder,
  lockPaymentAttempt: mocks.lockPayment,
  recordStatusHistory: mocks.recordStatusHistory,
  releasePromotionUsage: mocks.releasePromotionUsage,
  restoreStockForItems: mocks.restoreStock,
}));
vi.mock("@/lib/payments/gateways/sslcommerz/sslcommerz.service", () => ({
  querySslCommerzTransaction: mocks.queryTransaction,
  validateSslCommerzPayment: mocks.validatePayment,
}));

import {
  PaymentError,
  processSslCommerzNotification,
} from "@/lib/payments/core/payment.service";
import {
  SslCommerzGatewayResponseError,
  SslCommerzNetworkError,
  type SslCommerzValidationResult,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";

import {
  ORDER_ID,
  PAYMENT_ID,
  TRANSACTION_ID,
  candidate,
  notification,
  queryResult,
  storedPayment,
  validationResult,
} from "./helpers";

const transactionClient = {
  paymentTransaction: {
    findFirst: mocks.txPaymentFindFirst,
    findUnique: mocks.txPaymentFindUnique,
    update: mocks.txPaymentUpdate,
  },
  order: {
    update: mocks.txOrderUpdate,
  },
};

describe("SSLCommerz IPN verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SSLCOMMERZ_STORE_ID", "sandbox-store");
    vi.stubEnv("SSLCOMMERZ_STORE_PASSWORD", "sandbox-secret");
    vi.stubEnv("SSLCOMMERZ_IS_LIVE", "false");
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    mocks.transaction.mockImplementation(async (operation: unknown) => {
      if (typeof operation !== "function") {
        throw new Error("Expected a transaction callback.");
      }
      return (
        operation as (tx: typeof transactionClient) => Promise<unknown>
      )(transactionClient);
    });
    mocks.paymentFindFirst.mockResolvedValue(null);
    mocks.paymentFindMany.mockResolvedValue([]);
    mocks.txPaymentFindFirst.mockResolvedValue(null);
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.paymentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.txPaymentUpdate.mockResolvedValue({});
    mocks.txOrderUpdate.mockResolvedValue({});
    mocks.lockOrder.mockResolvedValue(undefined);
    mocks.lockPayment.mockResolvedValue(undefined);
    mocks.recordStatusHistory.mockResolvedValue({});
    mocks.releasePromotionUsage.mockResolvedValue(true);
    mocks.restoreStock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("confirms a server-validated exact payment once without deducting inventory again", async () => {
    const payment = storedPayment();
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockResolvedValue(validationResult());
    mocks.txPaymentFindUnique.mockResolvedValue(payment);

    const result = await processSslCommerzNotification(notification());

    expect(mocks.validatePayment).toHaveBeenCalledWith("validation-1");
    expect(mocks.queryTransaction).not.toHaveBeenCalled();
    expect(mocks.lockOrder).toHaveBeenCalledWith(transactionClient, ORDER_ID);
    expect(mocks.lockPayment).toHaveBeenCalledWith(transactionClient, PAYMENT_ID);
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({
        status: "SUCCESS",
        validationId: "validation-1",
        bankTransactionId: "bank-1",
        cardType: "VISA",
        riskLevel: 0,
        paidAt: expect.any(Date),
        requiresReview: false,
      }),
    });
    expect(mocks.txOrderUpdate).toHaveBeenCalledWith({
      where: { id: ORDER_ID },
      data: { paymentStatus: "PAID", status: "PAYMENT_CONFIRMED" },
    });
    expect(mocks.recordStatusHistory).toHaveBeenCalledWith(
      transactionClient, ORDER_ID, "PAYMENT_CONFIRMED",
      { note: "Payment verified server-to-server by SSLCommerz." },
    );
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.releasePromotionUsage).not.toHaveBeenCalled();
    expect(result).toEqual({
      orderId: ORDER_ID, paymentId: PAYMENT_ID, status: "SUCCESS",
      duplicate: false, requiresReview: false, affectedProductIds: [],
    });
  });

  it("returns an already successful notification as a duplicate before calling the provider or transaction", async () => {
    mocks.paymentFindUnique.mockResolvedValue(
      candidate({ status: "SUCCESS", validationId: "validation-1", requiresReview: true }),
    );
    const result = await processSslCommerzNotification(notification());
    expect(result).toEqual({
      orderId: ORDER_ID, paymentId: PAYMENT_ID, status: "SUCCESS",
      duplicate: true, requiresReview: true, affectedProductIds: [],
    });
    expect(mocks.validatePayment).not.toHaveBeenCalled();
    expect(mocks.queryTransaction).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("validates and flags a distinct successful capture on an already-paid attempt", async () => {
    const additional = validationResult({
      validationId: "validation-2", bankTransactionId: "bank-2",
      raw: { ...validationResult().raw, val_id: "validation-2", bank_tran_id: "bank-2" },
    });
    mocks.paymentFindUnique.mockResolvedValue(
      candidate({ status: "SUCCESS", validationId: "validation-1" }),
    );
    mocks.validatePayment.mockResolvedValue(additional);
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({ status: "SUCCESS", validationId: "validation-1", rawResponse: validationResult().raw }),
    );

    const result = await processSslCommerzNotification(notification({ val_id: "validation-2" }));

    expect(mocks.validatePayment).toHaveBeenCalledWith("validation-2");
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({
        requiresReview: true, reviewReason: "DISTINCT_VALIDATED_PAYMENT",
        rawResponse: expect.objectContaining({
          reviewReason: "DISTINCT_VALIDATED_PAYMENT",
          primaryValidationId: "validation-1",
          additionalValidationId: "validation-2",
        }),
      }),
    });
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
    expect(mocks.recordStatusHistory).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "SUCCESS", duplicate: false, requiresReview: true });
  });

  it("keeps a refunded attempt immutable when the original success IPN retries", async () => {
    mocks.paymentFindUnique.mockResolvedValue(
      candidate({ status: "REFUNDED", validationId: "validation-1" }),
    );
    mocks.validatePayment.mockResolvedValue(validationResult());
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({ status: "REFUNDED", validationId: "validation-1" }),
    );
    const result = await processSslCommerzNotification(notification());
    expect(result).toEqual({
      orderId: ORDER_ID, paymentId: PAYMENT_ID, status: "REFUNDED",
      duplicate: true, requiresReview: false, affectedProductIds: [],
    });
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
    expect(mocks.restoreStock).not.toHaveBeenCalled();
  });

  it("preserves REFUNDED and reopens review only for a distinct validated charge", async () => {
    const additional = validationResult({
      validationId: "validation-2",
      raw: { ...validationResult().raw, val_id: "validation-2" },
    });
    mocks.paymentFindUnique.mockResolvedValue(
      candidate({ status: "REFUNDED", validationId: "validation-1" }),
    );
    mocks.validatePayment.mockResolvedValue(additional);
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({ status: "REFUNDED", validationId: "validation-1" }),
    );
    const result = await processSslCommerzNotification(notification({ val_id: "validation-2" }));
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({
        requiresReview: true,
        reviewReason: "DISTINCT_VALIDATED_PAYMENT_AFTER_REFUND",
      }),
    });
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "REFUNDED", duplicate: false, requiresReview: true });
  });

  it("keeps a reopened post-refund review active on duplicate distinct-charge retries", async () => {
    const additional = validationResult({
      validationId: "validation-2",
      raw: { ...validationResult().raw, val_id: "validation-2" },
    });
    mocks.paymentFindUnique.mockResolvedValue(
      candidate({ status: "REFUNDED", validationId: "validation-1", requiresReview: true }),
    );
    mocks.validatePayment.mockResolvedValue(additional);
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({
        status: "REFUNDED", validationId: "validation-1", requiresReview: true,
        rawResponse: { additionalValidationId: "validation-2" },
      }),
    );
    const result = await processSslCommerzNotification(notification({ val_id: "validation-2" }));
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "REFUNDED", duplicate: true, requiresReview: true });
  });

  it("rejects an unknown transaction without consulting the provider or mutating data", async () => {
    mocks.paymentFindUnique.mockResolvedValue(null);
    const error = await processSslCommerzNotification(notification()).catch((c: unknown) => c);
    expect(error).toBeInstanceOf(PaymentError);
    expect(error).toMatchObject({ status: 404, message: "Payment attempt not found." });
    expect(mocks.validatePayment).not.toHaveBeenCalled();
    expect(mocks.queryTransaction).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it.each([
    [{ transactionId: "BB-DIFFERENT-TRANSACTION" }, "Validated transaction ID does not match."],
    [{ currencyAmount: "1234.99" }, "Validated payment amount does not match."],
    [{ currencyType: "USD" }, "Validated payment currency does not match."],
    [{ metadata: { orderId: "another-order", paymentRecordId: PAYMENT_ID } }, "Validated payment order does not match."],
  ] satisfies Array<[Partial<SslCommerzValidationResult>, string]>)(
    "rejects and quarantines provider-validated transaction, amount, and currency mismatches: %s",
    async (providerOverride, expectedMessage) => {
      mocks.paymentFindUnique.mockResolvedValue(candidate());
      mocks.validatePayment.mockResolvedValue(validationResult(providerOverride));
      const error = await processSslCommerzNotification(notification()).catch((c: unknown) => c);
      expect(error).toBeInstanceOf(PaymentError);
      expect(error).toMatchObject({ status: 422, message: expectedMessage });
      expect(mocks.lockOrder).toHaveBeenCalledWith(transactionClient, ORDER_ID);
      expect(mocks.lockPayment).toHaveBeenCalledWith(transactionClient, PAYMENT_ID);
      expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
        where: { id: PAYMENT_ID },
        data: {
          requiresReview: true, reviewReason: "IPN_VALIDATION_MISMATCH",
          reviewResolvedAt: null, reviewResolvedBy: null,
          reviewResolution: null, reviewResolutionReference: null,
        },
      });
      expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
    },
  );

  it("preserves mismatch evidence when cancellation wins before quarantine locks", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockResolvedValue(validationResult({ currencyAmount: "999.00" }));
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({ status: "CANCELLED" }, { status: "CANCELLED", paymentStatus: "FAILED" }),
    );
    await expect(processSslCommerzNotification(notification())).rejects.toMatchObject({
      status: 422, message: "Validated payment amount does not match.",
    });
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: {
        requiresReview: true, reviewReason: "IPN_VALIDATION_MISMATCH",
        reviewResolvedAt: null, reviewResolvedBy: null,
        reviewResolution: null, reviewResolutionReference: null,
      },
    });
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
  });

  it("returns a retryable error and performs no mutation during a provider validation outage", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockRejectedValue(new SslCommerzNetworkError("NETWORK_FAILURE"));
    const error = await processSslCommerzNotification(notification()).catch((c: unknown) => c);
    expect(error).toBeInstanceOf(PaymentError);
    expect(error).toMatchObject({
      status: 503,
      message: "Payment validation is temporarily unavailable. SSLCommerz should retry the notification.",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
  });

  it("treats provider HTTP/response failures as retryable IPN outages", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockRejectedValue(new SslCommerzGatewayResponseError("HTTP_ERROR", 503));
    await expect(processSslCommerzNotification(notification())).rejects.toMatchObject({
      status: 503,
      message: "Payment validation is temporarily unavailable. SSLCommerz should retry the notification.",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("queries terminal failure server-to-server and releases stock and promotion once", async () => {
    const payment = storedPayment();
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.queryTransaction.mockResolvedValue(queryResult());
    mocks.txPaymentFindUnique.mockResolvedValue(payment);

    const result = await processSslCommerzNotification(notification({ status: "FAILED" }));

    expect(mocks.queryTransaction).toHaveBeenCalledWith(TRANSACTION_ID);
    expect(mocks.validatePayment).not.toHaveBeenCalled();
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({
        status: "FAILED", validationId: "validation-1", rawResponse: queryResult().raw,
      }),
    });
    expect(mocks.restoreStock).toHaveBeenCalledWith(transactionClient, payment.order.items, "ORD-TEST-1");
    expect(mocks.releasePromotionUsage).toHaveBeenCalledWith(transactionClient, ORDER_ID);
    expect(mocks.txOrderUpdate).toHaveBeenCalledWith({
      where: { id: ORDER_ID }, data: { status: "CANCELLED", paymentStatus: "FAILED" },
    });
    expect(result).toEqual({
      orderId: ORDER_ID, paymentId: PAYMENT_ID, status: "FAILED",
      duplicate: false, requiresReview: false, affectedProductIds: ["product-1"],
    });
  });

  it("does not rewrite REFUNDED when a later failure notification arrives", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate({ status: "REFUNDED", validationId: "validation-1" }));
    mocks.queryTransaction.mockResolvedValue(queryResult());
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment({ status: "REFUNDED", validationId: "validation-1" }));
    const result = await processSslCommerzNotification(notification({ status: "FAILED" }));
    expect(result).toMatchObject({ status: "REFUNDED", duplicate: true });
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
    expect(mocks.restoreStock).not.toHaveBeenCalled();
  });

  it("does not release inventory again for a duplicate terminal failure", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate({ status: "FAILED" }));
    mocks.queryTransaction.mockResolvedValue(queryResult());
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment({ status: "FAILED" }, { status: "CANCELLED" }));
    const result = await processSslCommerzNotification(notification({ status: "FAILED" }));
    expect(result).toMatchObject({ status: "FAILED", duplicate: true, affectedProductIds: [] });
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.releasePromotionUsage).not.toHaveBeenCalled();
    expect(mocks.recordStatusHistory).not.toHaveBeenCalled();
  });

  it("records a late successful payment for review without restoring or rededucting inventory", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate({ status: "CANCELLED" }));
    mocks.validatePayment.mockResolvedValue(validationResult());
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({ status: "CANCELLED" }, { status: "CANCELLED", paymentStatus: "FAILED" }),
    );
    const result = await processSslCommerzNotification(notification());
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({ status: "SUCCESS", requiresReview: true, reviewReason: "LATE_SUCCESS_AFTER_ORDER_STATE" }),
    });
    expect(mocks.txOrderUpdate).toHaveBeenCalledWith({ where: { id: ORDER_ID }, data: { paymentStatus: "PAID" } });
    expect(mocks.recordStatusHistory).not.toHaveBeenCalled();
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.releasePromotionUsage).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "SUCCESS", duplicate: false, requiresReview: true, affectedProductIds: [] });
  });

  it("marks a high-risk valid payment paid but leaves fulfillment pending for review", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockResolvedValue(validationResult({ riskLevel: 1 }));
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());
    const result = await processSslCommerzNotification(notification());
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({ status: "SUCCESS", riskLevel: 1, requiresReview: true, reviewReason: "PROVIDER_RISK" }),
    });
    expect(mocks.txOrderUpdate).toHaveBeenCalledWith({ where: { id: ORDER_ID }, data: { paymentStatus: "PAID" } });
    expect(mocks.recordStatusHistory).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "SUCCESS", requiresReview: true });
  });

  it("fails closed to review when SSLCommerz omits the risk level", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockResolvedValue(validationResult({ riskLevel: null }));
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());
    const result = await processSslCommerzNotification(notification());
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({ riskLevel: null, requiresReview: true, reviewReason: "RISK_LEVEL_MISSING" }),
    });
    expect(mocks.txOrderUpdate).toHaveBeenCalledWith({ where: { id: ORDER_ID }, data: { paymentStatus: "PAID" } });
    expect(mocks.recordStatusHistory).not.toHaveBeenCalled();
    expect(result.requiresReview).toBe(true);
  });
});

// ── Shared verification pipeline tests ─────────────────────────────────

import { verifyAndFinalizePayment } from "@/lib/payments/core/payment-verification.service";

describe("verifyAndFinalizePayment (shared pipeline)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SSLCOMMERZ_STORE_ID", "sandbox-store");
    vi.stubEnv("SSLCOMMERZ_STORE_PASSWORD", "sandbox-secret");
    vi.stubEnv("SSLCOMMERZ_IS_LIVE", "false");
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    mocks.transaction.mockImplementation(async (operation: unknown) => {
      if (typeof operation !== "function") {
        throw new Error("Expected a transaction callback.");
      }
      return (
        operation as (tx: typeof transactionClient) => Promise<unknown>
      )(transactionClient);
    });
    mocks.paymentFindFirst.mockResolvedValue(null);
    mocks.paymentFindMany.mockResolvedValue([]);
    mocks.txPaymentFindFirst.mockResolvedValue(null);
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.paymentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.txPaymentUpdate.mockResolvedValue({});
    mocks.txOrderUpdate.mockResolvedValue({});
    mocks.lockOrder.mockResolvedValue(undefined);
    mocks.lockPayment.mockResolvedValue(undefined);
    mocks.recordStatusHistory.mockResolvedValue({});
    mocks.releasePromotionUsage.mockResolvedValue(true);
    mocks.restoreStock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each(["IPN", "CALLBACK", "RECONCILIATION"] as const)(
    "finalizes a valid payment from %s trigger",
    async (trigger) => {
      mocks.paymentFindUnique.mockResolvedValue(candidate());
      mocks.validatePayment.mockResolvedValue(validationResult());

      const result = await verifyAndFinalizePayment({
        trigger,
        transactionId: TRANSACTION_ID,
        validationId: "validation-1",
      });

      expect(mocks.validatePayment).toHaveBeenCalledWith("validation-1");
      expect(mocks.txPaymentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "SUCCESS" }),
        }),
      );
      expect(mocks.txOrderUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ paymentStatus: "PAID" }),
        }),
      );
      expect(result).toMatchObject({
        orderId: ORDER_ID,
        paymentId: PAYMENT_ID,
        status: "SUCCESS",
        duplicate: false,
      });
    },
  );

  it("returns idempotent no-op when payment is already SUCCESS with same validation ID", async () => {
    mocks.paymentFindUnique.mockResolvedValue(
      candidate({ status: "SUCCESS", validationId: "validation-1" }),
    );

    const result = await verifyAndFinalizePayment({
      trigger: "CALLBACK",
      transactionId: TRANSACTION_ID,
      validationId: "validation-1",
    });

    expect(result).toMatchObject({
      status: "SUCCESS",
      duplicate: true,
    });
    expect(mocks.validatePayment).not.toHaveBeenCalled();
    expect(mocks.queryTransaction).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects unknown transactions without consulting provider", async () => {
    mocks.paymentFindUnique.mockResolvedValue(null);

    const error = await verifyAndFinalizePayment({
      trigger: "CALLBACK",
      transactionId: "FAKE-ID",
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PaymentError);
    expect(error).toMatchObject({ status: 404 });
    expect(mocks.validatePayment).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("quarantines amount mismatch with CALLBACK_VALIDATION_MISMATCH for callback trigger", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockResolvedValue(
      validationResult({ currencyAmount: "999.00" }),
    );

    const error = await verifyAndFinalizePayment({
      trigger: "CALLBACK",
      transactionId: TRANSACTION_ID,
      validationId: "validation-1",
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PaymentError);
    expect(error).toMatchObject({ status: 422 });
    // Quarantine uses CALLBACK-specific reason
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requiresReview: true,
          reviewReason: "CALLBACK_VALIDATION_MISMATCH",
        }),
      }),
    );
  });

  it("quarantines currency mismatch with IPN_VALIDATION_MISMATCH for IPN trigger", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockResolvedValue(
      validationResult({ currencyType: "USD" }),
    );

    const error = await verifyAndFinalizePayment({
      trigger: "IPN",
      transactionId: TRANSACTION_ID,
      validationId: "validation-1",
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PaymentError);
    expect(error).toMatchObject({ status: 422 });
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requiresReview: true,
          reviewReason: "IPN_VALIDATION_MISMATCH",
        }),
      }),
    );
  });

  it("propagates provider network errors without mutations", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    // Both validation paths fail with network error
    mocks.validatePayment.mockRejectedValue(
      new SslCommerzNetworkError("TIMEOUT"),
    );
    mocks.queryTransaction.mockRejectedValue(
      new SslCommerzNetworkError("TIMEOUT"),
    );

    await expect(
      verifyAndFinalizePayment({
        trigger: "CALLBACK",
        transactionId: TRANSACTION_ID,
        validationId: "validation-1",
      }),
    ).rejects.toBeInstanceOf(SslCommerzNetworkError);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("falls back to transaction query when val_id validation fails", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    // val_id validation fails
    mocks.validatePayment.mockRejectedValue(
      new SslCommerzGatewayResponseError("PAYMENT_NOT_VALID"),
    );
    // Transaction query succeeds with FAILED status
    mocks.queryTransaction.mockResolvedValue(queryResult({ status: "FAILED" }));
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());

    const result = await verifyAndFinalizePayment({
      trigger: "CALLBACK",
      transactionId: TRANSACTION_ID,
      validationId: "validation-1",
    });

    expect(mocks.queryTransaction).toHaveBeenCalledWith(TRANSACTION_ID);
    expect(result).toMatchObject({ status: "FAILED" });
  });

  it("uses transaction query when no validationId is provided", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.queryTransaction.mockResolvedValue(
      queryResult({ status: "VALID", validationId: "val-from-query" }),
    );
    mocks.validatePayment.mockResolvedValue(validationResult());

    await verifyAndFinalizePayment({
      trigger: "RECONCILIATION",
      transactionId: TRANSACTION_ID,
    });

    // queryAuthoritativePayment was called (no direct val_id validation)
    expect(mocks.queryTransaction).toHaveBeenCalledWith(TRANSACTION_ID);
  });

  it("marks high-risk payment for review but still transitions to SUCCESS", async () => {
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.validatePayment.mockResolvedValue(
      validationResult({ riskLevel: 1 }),
    );
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());

    const result = await verifyAndFinalizePayment({
      trigger: "CALLBACK",
      transactionId: TRANSACTION_ID,
      validationId: "validation-1",
    });

    expect(result).toMatchObject({
      status: "SUCCESS",
      requiresReview: true,
    });
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SUCCESS",
          riskLevel: 1,
          requiresReview: true,
          reviewReason: "PROVIDER_RISK",
        }),
      }),
    );
  });
});
