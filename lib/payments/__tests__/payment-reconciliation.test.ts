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

import { toDecimal } from "@/lib/money";
import {
  reconcileStaleSslCommerzPayments,
} from "@/lib/payments/core/payment.service";
import {
  SslCommerzGatewayResponseError,
  SslCommerzNetworkError,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";

import {
  ORDER_ID,
  PAYMENT_ID,
  TRANSACTION_ID,
  candidate,
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

describe("SSLCommerz stale payment reconciliation", () => {
  const now = new Date("2026-07-26T22:30:00.000Z");

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
    mocks.paymentFindUnique.mockResolvedValue(candidate());
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

  it("expires and releases an unusable reservation absent from SSLCommerz", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T22:00:00.000Z"), gatewayUrl: null,
    }]);
    mocks.queryTransaction.mockRejectedValue(new SslCommerzGatewayResponseError("TRANSACTION_NOT_FOUND"));
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({
        status: "EXPIRED",
        rawResponse: expect.objectContaining({ reconciliation: "LOCALLY_EXPIRED", reason: "NO_PROVIDER_TRANSACTION" }),
      }),
    });
    expect(mocks.restoreStock).toHaveBeenCalledOnce();
    expect(mocks.releasePromotionUsage).toHaveBeenCalledOnce();
    expect(result).toEqual({
      examined: 1, confirmed: 0, terminalized: 1, locallyExpired: 1,
      stillPending: 0, errors: 0, affectedProductIds: ["product-1"],
    });
  });

  it("keeps a just-created no-record attempt during the consistency grace window", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T22:28:00.000Z"), gatewayUrl: null,
    }]);
    mocks.queryTransaction.mockRejectedValue(new SslCommerzGatewayResponseError("TRANSACTION_NOT_FOUND"));

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(result).toMatchObject({ examined: 1, stillPending: 1, locallyExpired: 0 });
    expect(mocks.paymentUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          rawResponse: expect.objectContaining({ reconciliation: "NOT_FOUND" }),
        }),
      }),
    );
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("expires a provider-pending session that was never handed to the customer", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T22:00:00.000Z"), gatewayUrl: null,
    }]);
    mocks.queryTransaction.mockResolvedValue(queryResult({ status: "PENDING", validationId: null }));
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(result).toMatchObject({ terminalized: 1, locallyExpired: 1, affectedProductIds: ["product-1"] });
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: expect.objectContaining({
        status: "EXPIRED",
        rawResponse: expect.objectContaining({ reason: "UNUSABLE_SESSION" }),
      }),
    });
  });

  it("does not expire when gateway session persistence wins the row-lock race", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T22:00:00.000Z"), gatewayUrl: null,
    }]);
    mocks.queryTransaction.mockResolvedValue(queryResult({ status: "PENDING", validationId: null }));
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({ gatewayUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?SESSIONKEY=fresh" }),
    );

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(mocks.lockOrder).toHaveBeenCalledWith(transactionClient, ORDER_ID);
    expect(mocks.lockPayment).toHaveBeenCalledWith(transactionClient, PAYMENT_ID);
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.releasePromotionUsage).not.toHaveBeenCalled();
    expect(result).toEqual({
      examined: 1, confirmed: 0, terminalized: 0, locallyExpired: 0,
      stillPending: 1, errors: 0, affectedProductIds: [],
    });
  });

  it("does not release again if a concurrent IPN already succeeded", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T22:00:00.000Z"), gatewayUrl: null,
    }]);
    mocks.queryTransaction.mockRejectedValue(new SslCommerzGatewayResponseError("TRANSACTION_NOT_FOUND"));
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment({ status: "SUCCESS", validationId: "validation-1" }),
    );

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(result).toMatchObject({ confirmed: 1, terminalized: 0, locallyExpired: 0, affectedProductIds: [] });
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.releasePromotionUsage).not.toHaveBeenCalled();
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
  });

  it("keeps an issued gateway session reserved while the provider says pending", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T22:00:00.000Z"),
      gatewayUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?SESSIONKEY=x",
    }]);
    mocks.queryTransaction.mockResolvedValue(queryResult({ status: "PENDING", validationId: null }));

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(mocks.paymentUpdateMany).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID, provider: "SSLCOMMERZ", status: "PENDING" },
      data: expect.objectContaining({
        rawResponse: expect.objectContaining({ reconciliation: "PENDING" }),
      }),
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(result).toMatchObject({ examined: 1, stillPending: 1, errors: 0 });
  });

  it("recovers a successful payment through the shared authoritative pipeline when IPN is absent", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T20:00:00.000Z"),
      gatewayUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?SESSIONKEY=x",
    }]);
    mocks.paymentFindUnique.mockResolvedValue(candidate());
    mocks.queryTransaction.mockResolvedValue(
      queryResult({ status: "VALID", validationId: "validation-1" }),
    );
    mocks.validatePayment.mockResolvedValue(validationResult());
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(mocks.queryTransaction).toHaveBeenCalledWith(TRANSACTION_ID);
    expect(mocks.validatePayment).toHaveBeenCalledWith("validation-1");
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PAYMENT_ID },
        data: expect.objectContaining({
          status: "SUCCESS",
          validationId: "validation-1",
        }),
      }),
    );
    expect(mocks.txOrderUpdate).toHaveBeenCalledWith({
      where: { id: ORDER_ID },
      data: { paymentStatus: "PAID", status: "PAYMENT_CONFIRMED" },
    });
    expect(result).toEqual({
      examined: 1, confirmed: 1, terminalized: 0, locallyExpired: 0,
      stillPending: 0, errors: 0, affectedProductIds: [],
    });
  });

  it("contains provider outages to the bounded batch without mutating orders", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T20:00:00.000Z"), gatewayUrl: null,
    }]);
    mocks.queryTransaction.mockRejectedValue(new SslCommerzNetworkError("TIMEOUT"));

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(result).toMatchObject({ examined: 1, errors: 1, affectedProductIds: [] });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
  });

  it("quarantines a provider-success amount mismatch instead of releasing stock", async () => {
    mocks.paymentFindMany.mockResolvedValue([{
      id: PAYMENT_ID, orderId: ORDER_ID, transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"), currency: "BDT",
      createdAt: new Date("2026-07-26T20:00:00.000Z"),
      gatewayUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?SESSIONKEY=x",
    }]);
    mocks.queryTransaction.mockResolvedValue(queryResult({ status: "VALID", validationId: "validation-1" }));
    mocks.validatePayment.mockResolvedValue(validationResult({ currencyAmount: "999.00" }));

    const result = await reconcileStaleSslCommerzPayments(now);

    expect(mocks.lockOrder).toHaveBeenCalledWith(transactionClient, ORDER_ID);
    expect(mocks.lockPayment).toHaveBeenCalledWith(transactionClient, PAYMENT_ID);
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: {
        requiresReview: true, reviewReason: "RECONCILIATION_MISMATCH",
        reviewResolvedAt: null, reviewResolvedBy: null,
        reviewResolution: null, reviewResolutionReference: null,
      },
    });
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.releasePromotionUsage).not.toHaveBeenCalled();
    expect(result).toMatchObject({ examined: 1, errors: 1, terminalized: 0, affectedProductIds: [] });
  });
});
