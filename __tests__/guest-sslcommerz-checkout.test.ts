import { Decimal } from "@prisma/client/runtime/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findAttempt: vi.fn(),
  reserve: vi.fn(),
  getOrder: vi.fn(),
  createSession: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: { paymentTransaction: { findFirst: mocks.findAttempt } } }));
vi.mock("@/lib/orders/mutations", () => ({
  lockOrderForStatusChange: vi.fn(),
  lockPaymentAttempt: vi.fn(),
  recordStatusHistory: vi.fn(),
  releasePromotionUsage: vi.fn(),
  restoreStockForItems: vi.fn(),
}));
vi.mock("@/lib/services/checkout.service", async () => {
  const { ServiceError } = await import("@/lib/services/service-error");
  return {
    CheckoutError: class extends ServiceError {},
    reserveOrderForSslCommerz: mocks.reserve,
    presentPersistedOrderSummary: () => ({ total: 100 }),
  };
});
vi.mock("@/lib/services/order.service", () => ({ getOrderForCheckoutCustomer: mocks.getOrder }));
vi.mock("@/lib/payments/gateways/sslcommerz/sslcommerz.service", () => ({ createSslCommerzSession: mocks.createSession }));
vi.mock("@/lib/payments/core/payment-verification.service", () => ({ mapProviderValidationError: vi.fn() }));
vi.mock("@/lib/payments/reconciliation/payment-reconciliation.service", () => ({ reconcilePaymentAttempt: vi.fn() }));

import { guestOrderToken, hashGuestToken } from "@/lib/orders/checkout-customer";
import { initiateSslCommerzCheckout } from "@/lib/payments/core/payment-initiation.service";
import type { CheckoutInput } from "@/lib/validations/checkout.validation";

const CUSTOMER = { guestKey: `guest:${"a".repeat(64)}` };
const ORDER_ID = "guest-order-1";
const INPUT = {
  paymentMethod: "SSLCOMMERZ",
  idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
} as CheckoutInput;

function makeAttempt(gatewayUrl: string | null = "https://gateway.example.test/session") {
  const order = {
    id: ORDER_ID,
    userId: null,
    guestAccessTokenHash: hashGuestToken(guestOrderToken(CUSTOMER.guestKey, ORDER_ID)),
    status: "PENDING",
    items: [],
  };
  return {
    id: "payment-1",
    orderId: ORDER_ID,
    order,
    status: "PENDING",
    gatewayUrl,
    amount: new Decimal("100"),
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SSLCOMMERZ_STORE_ID", "store-id");
  vi.stubEnv("SSLCOMMERZ_STORE_PASSWORD", "password");
  vi.stubEnv("SSLCOMMERZ_IS_LIVE", "false");
  const attempt = makeAttempt();
  mocks.findAttempt.mockResolvedValueOnce(null).mockResolvedValue(attempt);
  mocks.reserve.mockResolvedValue({ order: attempt.order, paymentAttempt: attempt, idempotentReplay: true });
  mocks.getOrder.mockResolvedValue({ id: ORDER_ID, paymentStatus: "UNPAID" });
});

afterEach(() => vi.unstubAllEnvs());

describe("guest SSLCommerz checkout reservation replay", () => {
  it("replays a committed guest reservation without opening a second gateway session", async () => {
    const result = await initiateSslCommerzCheckout(CUSTOMER, INPUT);

    expect(result.idempotentReplay).toBe(true);
    expect(result.paymentUrl).toBe("https://gateway.example.test/session");
    expect(mocks.reserve).toHaveBeenCalledWith(CUSTOMER, INPUT, expect.any(Object), expect.any(Object));
    expect(mocks.getOrder).toHaveBeenCalledWith(ORDER_ID, CUSTOMER);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("returns initialization-in-progress after a concurrent reservation instead of creating a second session", async () => {
    mocks.findAttempt.mockReset().mockResolvedValueOnce(null).mockResolvedValue(makeAttempt(null));

    await expect(initiateSslCommerzCheckout(CUSTOMER, INPUT)).rejects.toMatchObject({ status: 409, details: { orderId: ORDER_ID, paymentState: "PENDING" } });
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});
