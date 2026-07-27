import { createHash } from "node:crypto";

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
  reserveOrder: vi.fn(),
  getOrderForUser: vi.fn(),
  createSession: vi.fn(),
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
  createSslCommerzSession: mocks.createSession,
  querySslCommerzTransaction: mocks.queryTransaction,
  validateSslCommerzPayment: mocks.validatePayment,
}));
vi.mock("@/lib/seo/site", () => ({
  absoluteUrl: (path: string) => `https://bangbuy.test${path}`,
}));
vi.mock("@/lib/services/checkout.service", () => {
  class CheckoutError extends Error {
    readonly status: number;
    readonly details?: Record<string, unknown>;

    constructor(
      status: number,
      message: string,
      details?: Record<string, unknown>,
    ) {
      super(message);
      this.name = "CheckoutError";
      this.status = status;
      this.details = details;
    }
  }

  return {
    CheckoutError,
    reserveOrderForSslCommerz: mocks.reserveOrder,
  };
});
vi.mock("@/lib/services/order.service", () => ({
  getOrderForUser: mocks.getOrderForUser,
}));

import {
  CommittedPaymentError,
  initiateSslCommerzCheckout,
} from "@/lib/payments/core/payment.service";
import {
  SslCommerzGatewayResponseError,
  SslCommerzNetworkError,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";

import {
  USER_ID,
  ORDER_ID,
  PAYMENT_ID,
  TRANSACTION_ID,
  IDEMPOTENCY_KEY,
  checkoutInput,
  reservedCheckout,
  storedPayment,
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

describe("SSLCommerz checkout initiation", () => {
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

  it("replays an owned initialized attempt without reserving stock or creating another provider session", async () => {
    const existingIdempotencyKey = createHash("sha256")
      .update(`SSLCOMMERZ:${USER_ID}:${IDEMPOTENCY_KEY}`, "utf8")
      .digest("hex");
    const existingGatewayUrl =
      "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?SESSIONKEY=existing";
    const existing = {
      ...storedPayment(),
      idempotencyKey: existingIdempotencyKey,
      gatewayUrl: existingGatewayUrl,
    };
    const loadedOrder = { id: ORDER_ID, status: "PENDING" };
    mocks.paymentFindFirst.mockResolvedValue(existing);
    mocks.getOrderForUser.mockResolvedValue(loadedOrder);

    const result = await initiateSslCommerzCheckout(
      USER_ID,
      checkoutInput(),
    );

    expect(mocks.paymentFindFirst).toHaveBeenCalledWith({
      where: {
        provider: "SSLCOMMERZ",
        idempotencyKey: existingIdempotencyKey,
        order: { userId: USER_ID },
      },
      include: { order: { include: { items: true } } },
    });
    expect(result).toMatchObject({
      order: loadedOrder,
      paymentUrl: existingGatewayUrl,
      idempotentReplay: true,
    });
    expect(mocks.reserveOrder).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.paymentUpdate).not.toHaveBeenCalled();
  });

  it("sends only the reservation's authoritative total and persisted identifiers to the gateway", async () => {
    const reserved = reservedCheckout();
    const loadedOrder = { id: ORDER_ID, status: "PENDING" };
    const paymentUrl =
      "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?SESSIONKEY=new";
    mocks.reserveOrder.mockResolvedValue(reserved);
    mocks.createSession.mockResolvedValue({
      sessionKey: "new-session",
      paymentUrl,
    });
    mocks.getOrderForUser.mockResolvedValue(loadedOrder);

    const result = await initiateSslCommerzCheckout(
      USER_ID,
      checkoutInput(),
    );

    expect(mocks.reserveOrder).toHaveBeenCalledWith(
      USER_ID,
      checkoutInput(),
      expect.objectContaining({
        provider: "SSLCOMMERZ",
        id: expect.any(String),
        transactionId: expect.stringMatching(/^BB-[A-Z0-9]+-[A-F0-9]{12}$/),
        idempotencyKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: TRANSACTION_ID,
        orderId: ORDER_ID,
        paymentRecordId: PAYMENT_ID,
        totalAmount: "1235.00",
        currency: "BDT",
        invoice: {
          productAmount: "1200.00",
          vat: "0.00",
          discountAmount: "25.00",
          convenienceFee: "60.00",
        },
        callbacks: {
          successUrl:
            "https://bangbuy.test/api/payments/sslcommerz/success",
          failUrl: "https://bangbuy.test/api/payments/sslcommerz/fail",
          cancelUrl:
            "https://bangbuy.test/api/payments/sslcommerz/cancel",
          ipnUrl: "https://bangbuy.test/api/payments/sslcommerz/ipn",
        },
        items: [
          expect.objectContaining({
            sku: "SKU-1",
            quantity: 1,
            unitPrice: "1200.00",
            totalAmount: "1200.00",
          }),
        ],
      }),
    );
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: {
        gatewayUrl: paymentUrl,
        gatewaySessionKey: "new-session",
        rawResponse: { initialization: "SUCCESS" },
      },
    });
    expect(result).toMatchObject({
      order: loadedOrder,
      paymentUrl,
      idempotentReplay: false,
    });
  });

  it("does not return a gateway URL when the order was cancelled during session creation", async () => {
    const reserved = reservedCheckout();
    mocks.reserveOrder.mockResolvedValue(reserved);
    mocks.createSession.mockResolvedValue({
      sessionKey: "new-session",
      paymentUrl:
        "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?SESSIONKEY=new",
    });
    mocks.txPaymentFindUnique.mockResolvedValue(
      storedPayment(
        { status: "CANCELLED" },
        { status: "CANCELLED", paymentStatus: "FAILED" },
      ),
    );

    const error = await initiateSslCommerzCheckout(
      USER_ID,
      checkoutInput(),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CommittedPaymentError);
    expect(error).toMatchObject({
      status: 409,
      details: { orderId: ORDER_ID, paymentState: "CANCELLED" },
    });
    expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
    expect(mocks.getOrderForUser).not.toHaveBeenCalled();
  });

  it("keeps the committed order pending after an ambiguous provider network failure", async () => {
    const reserved = reservedCheckout();
    mocks.reserveOrder.mockResolvedValue(reserved);
    mocks.createSession.mockRejectedValue(
      new SslCommerzNetworkError("TIMEOUT"),
    );

    const error = await initiateSslCommerzCheckout(
      USER_ID,
      checkoutInput(),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CommittedPaymentError);
    expect(error).toMatchObject({
      status: 503,
      details: { orderId: ORDER_ID, paymentState: "PENDING" },
      productIds: ["product-1"],
    });
    expect(mocks.paymentUpdateMany).toHaveBeenCalledWith({
      where: {
        id: PAYMENT_ID,
        provider: "SSLCOMMERZ",
        status: "PENDING",
      },
      data: {
        rawResponse: {
          initialization: "UNKNOWN",
          category: "TIMEOUT",
        },
      },
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.restoreStock).not.toHaveBeenCalled();
    expect(mocks.releasePromotionUsage).not.toHaveBeenCalled();
  });

  it("fails the attempt and releases the reservation once after a definitive provider rejection", async () => {
    const reserved = reservedCheckout();
    const payment = storedPayment();
    mocks.reserveOrder.mockResolvedValue(reserved);
    mocks.createSession.mockRejectedValue(
      new SslCommerzGatewayResponseError("SESSION_REJECTED"),
    );
    mocks.txPaymentFindUnique.mockResolvedValue(payment);

    const error = await initiateSslCommerzCheckout(
      USER_ID,
      checkoutInput(),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CommittedPaymentError);
    expect(error).toMatchObject({
      status: 502,
      details: { orderId: ORDER_ID, paymentState: "FAILED" },
      productIds: ["product-1"],
    });
    expect(mocks.lockOrder).toHaveBeenCalledWith(
      transactionClient,
      ORDER_ID,
    );
    expect(mocks.lockPayment).toHaveBeenCalledWith(
      transactionClient,
      PAYMENT_ID,
    );
    expect(mocks.txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: PAYMENT_ID },
      data: {
        status: "FAILED",
        rawResponse: {
          initialization: "FAILED",
          category: "SESSION_REJECTED",
        },
      },
    });
    expect(mocks.restoreStock).toHaveBeenCalledOnce();
    expect(mocks.releasePromotionUsage).toHaveBeenCalledWith(
      transactionClient,
      ORDER_ID,
    );
    expect(mocks.txOrderUpdate).toHaveBeenCalledWith({
      where: { id: ORDER_ID },
      data: { status: "CANCELLED", paymentStatus: "FAILED" },
    });
    expect(mocks.recordStatusHistory).toHaveBeenCalledOnce();
  });
});
