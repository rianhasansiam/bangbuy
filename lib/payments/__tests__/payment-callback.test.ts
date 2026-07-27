import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  paymentFindFirst: vi.fn(),
  paymentFindUnique: vi.fn(),
  paymentCreate: vi.fn(),
  paymentCreateMany: vi.fn(),
  paymentUpdate: vi.fn(),
  paymentUpdateMany: vi.fn(),
  paymentUpsert: vi.fn(),
  orderCreate: vi.fn(),
  orderCreateMany: vi.fn(),
  orderUpdate: vi.fn(),
  orderUpdateMany: vi.fn(),
  orderUpsert: vi.fn(),
  transaction: vi.fn(),
  txPaymentFindFirst: vi.fn(),
  txPaymentFindUnique: vi.fn(),
  txPaymentUpdate: vi.fn(),
  txOrderUpdate: vi.fn(),
  validatePayment: vi.fn(),
  queryTransaction: vi.fn(),
  lockOrder: vi.fn(),
  lockPayment: vi.fn(),
  recordStatusHistory: vi.fn(),
  releasePromotionUsage: vi.fn(),
  restoreStock: vi.fn(),
  invalidateProductsById: vi.fn(),
  revalidateCacheTags: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    paymentTransaction: {
      findFirst: mocks.paymentFindFirst,
      findUnique: mocks.paymentFindUnique,
      create: mocks.paymentCreate,
      createMany: mocks.paymentCreateMany,
      update: mocks.paymentUpdate,
      updateMany: mocks.paymentUpdateMany,
      upsert: mocks.paymentUpsert,
    },
    order: {
      create: mocks.orderCreate,
      createMany: mocks.orderCreateMany,
      update: mocks.orderUpdate,
      updateMany: mocks.orderUpdateMany,
      upsert: mocks.orderUpsert,
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
vi.mock("@/lib/cache/catalog-invalidation", () => ({
  invalidateProductsById: mocks.invalidateProductsById,
}));
vi.mock("@/lib/cache/revalidation", () => ({
  revalidateCacheTags: mocks.revalidateCacheTags,
}));

import { GET as cancelGet, POST as cancelPost } from "@/app/api/payments/sslcommerz/cancel/route";
import { GET as failGet, POST as failPost } from "@/app/api/payments/sslcommerz/fail/route";
import { GET as successGet, POST as successPost } from "@/app/api/payments/sslcommerz/success/route";
import { handleSslCommerzBrowserCallback } from "@/lib/payments/callbacks/payment-callback.service";
import { SslCommerzNetworkError } from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";

import {
  ORDER_ID,
  PAYMENT_ID,
  TRANSACTION_ID,
  candidate,
  storedPayment,
  validationResult,
} from "./helpers";
const mutationMocks = [
  mocks.paymentCreate,
  mocks.paymentCreateMany,
  mocks.paymentUpdate,
  mocks.paymentUpdateMany,
  mocks.paymentUpsert,
  mocks.orderCreate,
  mocks.orderCreateMany,
  mocks.orderUpdate,
  mocks.orderUpdateMany,
  mocks.orderUpsert,
  mocks.transaction,
];

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

function authenticatedSession(userId = "owner-user") {
  return {
    expires: "2099-01-01T00:00:00.000Z",
    user: {
      id: userId,
      name: "Order Owner",
      email: "owner@example.com",
      role: "USER",
    },
  };
}

function expectRedirect(
  response: Response,
  pathname: string,
  searchParams: Record<string, string>,
) {
  expect(response.status).toBe(303);

  const location = response.headers.get("location");
  expect(location).not.toBeNull();

  const url = new URL(location!);
  expect(url.pathname).toBe(pathname);
  expect(Object.fromEntries(url.searchParams)).toEqual(searchParams);

  return url;
}

function expectNoMutations() {
  for (const mutation of mutationMocks) {
    expect(mutation).not.toHaveBeenCalled();
  }
}

describe("SSLCommerz browser callbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.paymentFindFirst.mockResolvedValue(null);
    mocks.paymentFindUnique.mockResolvedValue(null);
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
    mocks.txPaymentFindFirst.mockResolvedValue(null);
    mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());
    mocks.txPaymentUpdate.mockResolvedValue({});
    mocks.txOrderUpdate.mockResolvedValue({});
    mocks.lockOrder.mockResolvedValue(undefined);
    mocks.lockPayment.mockResolvedValue(undefined);
    mocks.recordStatusHistory.mockResolvedValue({});
    mocks.releasePromotionUsage.mockResolvedValue(true);
    mocks.restoreStock.mockResolvedValue(undefined);
    mocks.invalidateProductsById.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Original UX-only behavior preserved ──────────────────────────────

  it("sends unauthenticated callbacks to login without exposing supplied identifiers", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await handleSslCommerzBrowserCallback(
      new Request(
        "https://bangbuy.test/api/payments/sslcommerz/success" +
          "?tran_id=victim-transaction&order_id=victim-order",
      ),
      "processing",
    );

    const redirect = expectRedirect(response, "/login", {
      callbackUrl: "/profile?tab=orders&payment=processing",
    });
    expect(redirect.toString()).not.toContain("victim-transaction");
    expect(redirect.toString()).not.toContain("victim-order");
    expect(mocks.paymentFindFirst).not.toHaveBeenCalled();
    expectNoMutations();
  });

  it.each([
    ["missing", ""],
    ["empty", "?tran_id=%20%20"],
    ["oversized", `?tran_id=${"x".repeat(31)}`],
  ])(
    "does not perform a lookup or expose request data for a %s GET transaction id",
    async (_case, query) => {
      mocks.auth.mockResolvedValue(authenticatedSession());

      const response = await handleSslCommerzBrowserCallback(
        new Request(
          `https://bangbuy.test/api/payments/sslcommerz/success${query}`,
        ),
        "processing",
      );

      const redirect = expectRedirect(response, "/profile", {
        tab: "orders",
        payment: "processing",
      });
      expect(redirect.toString()).not.toContain("x".repeat(31));
      expect(mocks.paymentFindFirst).not.toHaveBeenCalled();
      expectNoMutations();
    },
  );

  it("treats a malformed POST body as an identifier-free callback", async () => {
    mocks.auth.mockResolvedValue(authenticatedSession());

    const response = await handleSslCommerzBrowserCallback(
      new Request("https://bangbuy.test/api/payments/sslcommerz/success", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not-json-or-form-data",
      }),
      "processing",
    );

    expectRedirect(response, "/profile", {
      tab: "orders",
      payment: "processing",
    });
    expect(mocks.paymentFindFirst).not.toHaveBeenCalled();
    expectNoMutations();
  });

  it("does not expose an order for an unknown transaction", async () => {
    mocks.auth.mockResolvedValue(authenticatedSession());

    const response = await handleSslCommerzBrowserCallback(
      new Request(
        "https://bangbuy.test/api/payments/sslcommerz/fail" +
          "?tran_id=unknown-transaction&order_id=victim-order",
      ),
      "failed",
    );

    const redirect = expectRedirect(response, "/profile", {
      tab: "orders",
      payment: "unknown",
    });
    expect(redirect.toString()).not.toContain("unknown-transaction");
    expect(redirect.toString()).not.toContain("victim-order");
    expectNoMutations();
  });

  it("uses an owner-scoped lookup and does not expose another user's order", async () => {
    mocks.auth.mockResolvedValue(authenticatedSession("current-user"));
    mocks.paymentFindFirst.mockResolvedValue(null);

    const response = await handleSslCommerzBrowserCallback(
      new Request(
        "https://bangbuy.test/api/payments/sslcommerz/cancel" +
          "?tran_id=victim-transaction&order_id=victim-order",
      ),
      "cancelled",
    );

    expect(mocks.paymentFindFirst).toHaveBeenCalledWith({
      where: {
        provider: "SSLCOMMERZ",
        transactionId: "victim-transaction",
        order: { userId: "current-user" },
      },
      select: { orderId: true },
    });
    const redirect = expectRedirect(response, "/profile", {
      tab: "orders",
      payment: "unknown",
    });
    expect(redirect.toString()).not.toContain("victim-transaction");
    expect(redirect.toString()).not.toContain("victim-order");
    expectNoMutations();
  });

  const routes = [
    {
      name: "success",
      outcome: "processing",
      get: successGet,
      post: successPost,
    },
    { name: "fail", outcome: "failed", get: failGet, post: failPost },
    {
      name: "cancel",
      outcome: "cancelled",
      get: cancelGet,
      post: cancelPost,
    },
  ] as const;

  it.each(routes)(
    "$name GET parses the query transaction and redirects only to the owner's order",
    async ({ outcome, get }) => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      mocks.paymentFindFirst.mockResolvedValue({ orderId: "owner-order" });

      const response = await get(
        new Request(
          "https://bangbuy.test/api/payments/sslcommerz/callback" +
            "?tran_id=%20owner-get-transaction%20&order_id=victim-order",
        ),
      );

      expect(mocks.paymentFindFirst).toHaveBeenCalledWith({
        where: {
          provider: "SSLCOMMERZ",
          transactionId: "owner-get-transaction",
          order: { userId: "owner-user" },
        },
        select: { orderId: true },
      });
      const expectedParams: Record<string, string> =
        outcome === "processing"
          ? { "just-placed": "1", payment: outcome }
          : { payment: outcome };
      const redirect = expectRedirect(response, "/orders/owner-order", expectedParams);
      expect(redirect.toString()).not.toContain("victim-order");
    },
  );

  it.each(routes)(
    "$name POST parses the form transaction and redirects only to the owner's order",
    async ({ outcome, post }) => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      mocks.paymentFindFirst.mockResolvedValue({ orderId: "owner-order" });

      const response = await post(
        new Request(
          "https://bangbuy.test/api/payments/sslcommerz/callback?order_id=victim-order",
          {
            method: "POST",
            headers: {
              "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: new URLSearchParams({
              tran_id: " owner-post-transaction ",
              order_id: "victim-order",
            }),
          },
        ),
      );

      expect(mocks.paymentFindFirst).toHaveBeenCalledWith({
        where: {
          provider: "SSLCOMMERZ",
          transactionId: "owner-post-transaction",
          order: { userId: "owner-user" },
        },
        select: { orderId: true },
      });
      const expectedParams: Record<string, string> =
        outcome === "processing"
          ? { "just-placed": "1", payment: outcome }
          : { payment: outcome };
      const redirect = expectRedirect(response, "/orders/owner-order", expectedParams);
      expect(redirect.toString()).not.toContain("victim-order");
    },
  );

  // ── Callback verification tests ──────────────────────────────────────

  describe("success callback server-side verification", () => {
    function successCallbackRequest(fields: Record<string, string> = {}) {
      const params = {
        tran_id: TRANSACTION_ID,
        val_id: "validation-1",
        status: "VALID",
        ...fields,
      };
      return new Request(
        "https://bangbuy.test/api/payments/sslcommerz/success",
        {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: new URLSearchParams(params),
        },
      );
    }

    it("triggers server-side verification on success callback and does NOT directly mark PAID", async () => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      // verifyAndFinalizePayment looks up the payment by provider+transactionId
      mocks.paymentFindUnique.mockResolvedValue(candidate());
      mocks.validatePayment.mockResolvedValue(validationResult());
      mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());
      // Owner lookup for redirect
      mocks.paymentFindFirst.mockResolvedValue({ orderId: ORDER_ID });

      const response = await handleSslCommerzBrowserCallback(
        successCallbackRequest(),
        "processing",
      );

      // The callback called validateSslCommerzPayment (server-to-server)
      expect(mocks.validatePayment).toHaveBeenCalledWith("validation-1");
      // It went through the DB transaction (applySuccessfulPayment)
      expect(mocks.transaction).toHaveBeenCalled();
      // The redirect still works
      expect(response.status).toBe(303);
    });

    it("valid callback verification can finalize payment through the shared pipeline", async () => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      mocks.paymentFindUnique.mockResolvedValue(candidate());
      mocks.validatePayment.mockResolvedValue(validationResult());
      mocks.txPaymentFindUnique.mockResolvedValue(storedPayment());
      mocks.paymentFindFirst.mockResolvedValue({ orderId: ORDER_ID });

      const response = await handleSslCommerzBrowserCallback(
        successCallbackRequest(),
        "processing",
      );

      // The payment transaction was updated to SUCCESS
      expect(mocks.txPaymentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: PAYMENT_ID },
          data: expect.objectContaining({ status: "SUCCESS" }),
        }),
      );
      // The order paymentStatus was set to PAID
      expect(mocks.txOrderUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ paymentStatus: "PAID" }),
        }),
      );
      expect(response.status).toBe(303);
    });

    it("fake callback cannot finalize payment — server verification rejects unknown transaction", async () => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      // verifyAndFinalizePayment finds no payment for the fake transaction
      mocks.paymentFindUnique.mockResolvedValue(null);
      // Simulate a payment disappearing after the owner-scoped lookup.
      mocks.paymentFindFirst.mockResolvedValue({ orderId: ORDER_ID });

      const response = await handleSslCommerzBrowserCallback(
        successCallbackRequest({ tran_id: "FAKE-TRANSACTION" }),
        "processing",
      );

      // No mutations happened
      expect(mocks.paymentFindUnique).toHaveBeenCalled();
      expect(mocks.validatePayment).not.toHaveBeenCalled();
      expect(mocks.transaction).not.toHaveBeenCalled();
      expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
      expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
      // Still redirects (no error page)
      expect(response.status).toBe(303);
    });

    it("does not verify a payment outside the authenticated owner's scope", async () => {
      mocks.auth.mockResolvedValue(authenticatedSession("current-user"));
      mocks.paymentFindFirst.mockResolvedValue(null);
      mocks.paymentFindUnique.mockResolvedValue(candidate());

      const response = await handleSslCommerzBrowserCallback(
        successCallbackRequest(),
        "processing",
      );

      expect(mocks.paymentFindUnique).not.toHaveBeenCalled();
      expect(mocks.validatePayment).not.toHaveBeenCalled();
      expect(mocks.queryTransaction).not.toHaveBeenCalled();
      expect(mocks.transaction).not.toHaveBeenCalled();
      expectRedirect(response, "/profile", {
        tab: "orders",
        payment: "unknown",
      });
    });

    it("callback provider timeout leaves PENDING and redirects normally", async () => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      mocks.paymentFindUnique.mockResolvedValue(candidate());
      // Provider times out
      mocks.validatePayment.mockRejectedValue(
        new SslCommerzNetworkError("TIMEOUT"),
      );
      mocks.paymentFindFirst.mockResolvedValue({ orderId: ORDER_ID });

      const response = await handleSslCommerzBrowserCallback(
        successCallbackRequest(),
        "processing",
      );

      // No state transition happened (payment stays PENDING)
      expect(mocks.txPaymentUpdate).not.toHaveBeenCalled();
      expect(mocks.txOrderUpdate).not.toHaveBeenCalled();
      // Still redirects normally — no error page
      expect(response.status).toBe(303);
      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe(`/orders/${ORDER_ID}`);
    });

    it("already-PAID callback is a safe no-op", async () => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      // Payment is already SUCCESS
      mocks.paymentFindUnique.mockResolvedValue(
        candidate({ status: "SUCCESS", validationId: "validation-1" }),
      );
      mocks.paymentFindFirst.mockResolvedValue({ orderId: ORDER_ID });

      const response = await handleSslCommerzBrowserCallback(
        successCallbackRequest(),
        "processing",
      );

      // No provider call, no mutations
      expect(mocks.validatePayment).not.toHaveBeenCalled();
      expect(mocks.queryTransaction).not.toHaveBeenCalled();
      expect(mocks.transaction).not.toHaveBeenCalled();
      // Normal redirect
      expect(response.status).toBe(303);
    });

    it("does not trigger verification for fail/cancel callbacks", async () => {
      mocks.auth.mockResolvedValue(authenticatedSession());
      mocks.paymentFindFirst.mockResolvedValue({ orderId: ORDER_ID });

      await handleSslCommerzBrowserCallback(
        new Request(
          `https://bangbuy.test/api/payments/sslcommerz/fail?tran_id=${TRANSACTION_ID}`,
        ),
        "failed",
      );

      expect(mocks.validatePayment).not.toHaveBeenCalled();
      expect(mocks.queryTransaction).not.toHaveBeenCalled();
      expect(mocks.paymentFindUnique).not.toHaveBeenCalled();
    });

    it("forwards val_id and status through the SameSite cookie redirect for unauthenticated POSTs", async () => {
      mocks.auth.mockResolvedValue(null);

      const response = await handleSslCommerzBrowserCallback(
        new Request("https://bangbuy.test/api/payments/sslcommerz/success", {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: new URLSearchParams({
            tran_id: TRANSACTION_ID,
            val_id: "validation-1",
            status: "VALID",
          }),
        }),
        "processing",
      );

      expect(response.status).toBe(303);
      const location = new URL(response.headers.get("location")!);
      expect(location.searchParams.get("tran_id")).toBe(TRANSACTION_ID);
      expect(location.searchParams.get("val_id")).toBe("validation-1");
      expect(location.searchParams.get("status")).toBe("VALID");
    });
  });
});
