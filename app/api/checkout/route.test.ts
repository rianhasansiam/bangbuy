import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  rateLimitPersistent: vi.fn(),
  initiateSslCommerzCheckout: vi.fn(),
  placeOrder: vi.fn(),
  invalidateProductsById: vi.fn(),
  revalidateCacheTags: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/guards", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/auth/rate-limit", () => ({
  rateLimitPersistent: mocks.rateLimitPersistent,
}));
vi.mock("@/lib/services/checkout.service", () => ({
  placeOrder: mocks.placeOrder,
}));
vi.mock("@/lib/cache/catalog-invalidation", () => ({
  invalidateProductsById: mocks.invalidateProductsById,
}));
vi.mock("@/lib/cache/revalidation", () => ({
  revalidateCacheTags: mocks.revalidateCacheTags,
}));
vi.mock("@/lib/payments", async () => {
  const { ServiceError } = await vi.importActual<
    typeof import("@/lib/services/service-error")
  >("@/lib/services/service-error");

  class CommittedPaymentError extends ServiceError {
    readonly productIds: string[];

    constructor(
      status: number,
      message: string,
      orderId: string,
      paymentState: "PENDING" | "FAILED",
      productIds: string[],
    ) {
      super(status, message, { orderId, paymentState });
      this.productIds = productIds;
    }
  }

  return {
    CommittedPaymentError,
    initiateSslCommerzCheckout: mocks.initiateSslCommerzCheckout,
  };
});

import {
  CommittedPaymentError,
} from "@/lib/payments";
import { POST } from "@/app/api/checkout/route";

const customerDetails = {
  customerName: "Route Tester",
  customerPhone: "01700000000",
  customerEmail: "CLIENT@EXAMPLE.COM",
  customerAddress: "123 Test Street",
  customerCity: "Dhaka",
  customerPostalCode: "1207",
};

const result = {
  order: {
    id: "order-1",
    orderNumber: "BB-1",
    items: [
      { productId: "product-1" },
      { productId: null },
      { productId: "product-2" },
    ],
  },
  summary: { total: 1250, currency: "BDT" },
  promo: null,
};

function checkoutRequest(
  body: unknown,
  contentType = "application/json",
) {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({
      ok: true,
      session: {
        expires: "2099-01-01T00:00:00.000Z",
        user: { id: "user-1", role: "USER" },
      },
    });
    mocks.rateLimitPersistent.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetMs: 300_000,
    });
    mocks.placeOrder.mockResolvedValue(result);
    mocks.initiateSslCommerzCheckout.mockResolvedValue({
      ...result,
      paymentUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php",
    });
    mocks.invalidateProductsById.mockResolvedValue(undefined);
  });

  it("returns the guard response without rate limiting or parsing", async () => {
    mocks.requireUser.mockResolvedValue({
      ok: false,
      response: Response.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    });

    const response = await POST(checkoutRequest("{broken-json"));

    expect(response.status).toBe(401);
    expect(mocks.rateLimitPersistent).not.toHaveBeenCalled();
    expect(mocks.placeOrder).not.toHaveBeenCalled();
    expect(mocks.initiateSslCommerzCheckout).not.toHaveBeenCalled();
  });

  it("enforces the shared per-user checkout limit before body parsing", async () => {
    mocks.rateLimitPersistent.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetMs: 2_500,
    });

    const response = await POST(checkoutRequest("{broken-json"));

    expect(mocks.rateLimitPersistent).toHaveBeenCalledWith(
      "checkout-submit:user-1",
      6,
      5 * 60_000,
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("3");
    expect(mocks.placeOrder).not.toHaveBeenCalled();
    expect(mocks.initiateSslCommerzCheckout).not.toHaveBeenCalled();
  });

  it("maps a persistent rate-limit failure without continuing checkout", async () => {
    mocks.rateLimitPersistent.mockRejectedValue(
      new Error("rate limit storage unavailable"),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(
      checkoutRequest({
        ...customerDetails,
        paymentMethod: "CASH_ON_DELIVERY",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("checkout.POST.rateLimit"),
      scope: "checkout.POST.rateLimit",
    });
    expect(mocks.placeOrder).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("requires JSON and reports malformed payloads", async () => {
    const wrongType = await POST(
      checkoutRequest("name=Route+Tester", "application/x-www-form-urlencoded"),
    );
    expect(wrongType.status).toBe(415);

    const malformed = await POST(checkoutRequest("{broken-json"));
    expect(malformed.status).toBe(400);
    await expect(malformed.json()).resolves.toEqual({
      error: "Invalid JSON payload.",
    });
    expect(mocks.placeOrder).not.toHaveBeenCalled();
  });

  it("returns validation fields before selecting a checkout service", async () => {
    const response = await POST(
      checkoutRequest({
        ...customerDetails,
        paymentMethod: "SSLCOMMERZ",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Please review the highlighted fields and try again.",
      fieldErrors: {
        idempotencyKey: expect.any(Array),
      },
    });
    expect(mocks.placeOrder).not.toHaveBeenCalled();
    expect(mocks.initiateSslCommerzCheckout).not.toHaveBeenCalled();
  });

  it("routes COD through placeOrder with sanitized client choices", async () => {
    const response = await POST(
      checkoutRequest({
        ...customerDetails,
        paymentMethod: "CASH_ON_DELIVERY",
        customerName: " Route Tester ",
        customerEmail: "CLIENT@EXAMPLE.COM",
        totalAmount: 1,
        paymentStatus: "PAID",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.placeOrder).toHaveBeenCalledWith("user-1", {
      ...customerDetails,
      customerName: "Route Tester",
      customerEmail: "client@example.com",
      paymentMethod: "CASH_ON_DELIVERY",
      deliveryZone: "INSIDE_DHAKA",
      clearCart: true,
    });
    expect(mocks.initiateSslCommerzCheckout).not.toHaveBeenCalled();
    expect(mocks.invalidateProductsById).toHaveBeenCalledWith(
      ["product-1", "product-2"],
      { reason: "checkout stock decrement: order-1" },
    );
    expect(mocks.revalidateCacheTags).toHaveBeenCalledWith([
      "admin-orders",
      "promo-codes",
    ]);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { order: { id: "order-1" } },
    });
  });

  it("routes an idempotent online checkout only through SSLCommerz initiation", async () => {
    const input = {
      ...customerDetails,
      paymentMethod: "SSLCOMMERZ",
      idempotencyKey: "13b58aa4-3706-43db-bc71-c3ba3b54a7a3",
      clearCart: false,
    };

    const response = await POST(checkoutRequest(input));

    expect(response.status).toBe(201);
    expect(mocks.initiateSslCommerzCheckout).toHaveBeenCalledWith("user-1", {
      ...input,
      customerEmail: "client@example.com",
      deliveryZone: "INSIDE_DHAKA",
    });
    expect(mocks.placeOrder).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        paymentUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php",
      },
    });
  });

  it("invalidates a committed reservation state before returning its error", async () => {
    mocks.initiateSslCommerzCheckout.mockRejectedValue(
      new CommittedPaymentError(
        503,
        "The provider did not respond.",
        "order-pending",
        "PENDING",
        ["product-3"],
      ),
    );

    const response = await POST(
      checkoutRequest({
        ...customerDetails,
        paymentMethod: "SSLCOMMERZ",
        idempotencyKey: "6a256a74-1cff-4ac8-bd1c-c524f35dbf81",
      }),
    );

    expect(mocks.invalidateProductsById).toHaveBeenCalledWith(["product-3"], {
      reason: "payment initialization state change",
    });
    expect(mocks.revalidateCacheTags).toHaveBeenCalledWith([
      "admin-orders",
      "promo-codes",
    ]);
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "The provider did not respond.",
      details: {
        orderId: "order-pending",
        paymentState: "PENDING",
      },
    });
  });
});
