import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findPayment: vi.fn(), verify: vi.fn() }));
vi.mock("@/lib/auth/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/api/guards", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/db/prisma", () => ({
  prisma: { paymentTransaction: { findFirst: mocks.findPayment } },
}));
vi.mock("@/lib/cache/catalog-invalidation", () => ({ invalidateProductsById: vi.fn() }));
vi.mock("@/lib/cache/revalidation", () => ({ revalidateCacheTags: vi.fn() }));
vi.mock("@/lib/payments/core/payment-logger", () => ({ logPaymentEvent: vi.fn() }));
vi.mock("@/lib/payments/core/payment-verification.service", () => ({ verifyAndFinalizePayment: mocks.verify }));
vi.mock("@/lib/seo/site", () => ({ absoluteUrl: (path: string) => `https://shop.example.test${path}` }));

import { guestOrderToken, hashGuestToken } from "@/lib/orders/checkout-customer";
import { handleSslCommerzBrowserCallback } from "@/lib/payments/callbacks/payment-callback.service";

const ORDER_ID = "guest-order-1";
const TOKEN = guestOrderToken(`guest:${"a".repeat(64)}`, ORDER_ID);
const CALLBACK_URL = "https://shop.example.test/api/payments/sslcommerz/success?tran_id=BB-RANDOM&val_id=verified-id";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue(null);
  mocks.findPayment.mockResolvedValue({
    orderId: ORDER_ID,
    order: { id: ORDER_ID, userId: null, guestAccessTokenHash: hashGuestToken(TOKEN) },
  });
  mocks.verify.mockResolvedValue({ status: "SUCCESS", duplicate: true, affectedProductIds: [] });
});

describe("guest SSLCommerz browser callbacks", () => {
  it("verifies with the provider and confirms an order for its guest cookie holder", async () => {
    const response = await handleSslCommerzBrowserCallback(new Request(CALLBACK_URL, {
      headers: { cookie: `bangbuy-guest-order-${ORDER_ID}=${TOKEN}` },
    }), "processing");

    expect(mocks.verify).toHaveBeenCalledWith({ trigger: "CALLBACK", transactionId: "BB-RANDOM", validationId: "verified-id" });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`https://shop.example.test/orders/${ORDER_ID}?just-placed=1&payment=processing`);
  });

  it("does not reveal an order or trigger verification for a guessed cookie", async () => {
    const response = await handleSslCommerzBrowserCallback(new Request(CALLBACK_URL, {
      headers: { cookie: `bangbuy-guest-order-${ORDER_ID}=${"b".repeat(64)}` },
    }), "processing");

    expect(mocks.verify).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://shop.example.test/checkout?payment=unknown");
  });

  it("restores SameSite cookies through a GET after a cross-site provider POST", async () => {
    const response = await handleSslCommerzBrowserCallback(new Request(CALLBACK_URL, { method: "POST" }), "processing");

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(CALLBACK_URL);
    expect(mocks.findPayment).not.toHaveBeenCalled();
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it("requires order authorization even when the callback names a valid transaction", async () => {
    const response = await handleSslCommerzBrowserCallback(new Request(CALLBACK_URL), "processing");

    expect(mocks.verify).not.toHaveBeenCalled();
    expect(response.headers.get("location")).not.toContain(ORDER_ID);
  });

  it("does not mark a guest payment failed based on a browser callback", async () => {
    const response = await handleSslCommerzBrowserCallback(new Request(CALLBACK_URL, {
      headers: { cookie: `bangbuy-guest-order-${ORDER_ID}=${TOKEN}` },
    }), "failed");

    expect(mocks.verify).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(`https://shop.example.test/orders/${ORDER_ID}?payment=failed`);
  });
});
