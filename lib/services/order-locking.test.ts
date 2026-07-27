import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  queryRaw: vi.fn(),
  orderFindFirst: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
  paymentUpdateMany: vi.fn(),
  statusHistoryCreate: vi.fn(),
  promoUsageFindMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (operation: unknown) => operation,
}));
vi.mock("@/lib/orders/notifications", () => ({
  notifyOrderStatusChange: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

import {
  approveSslCommerzPaymentReview,
  cancelOrderAsCustomer,
  recordSslCommerzRefundAndCancel,
  updateOrderStatus,
} from "@/lib/services/order.service";

describe("order status locking", () => {
  const lockFailure = new Error("lock failed");

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queryRaw.mockRejectedValue(lockFailure);

    const client = {
      $queryRaw: mocks.queryRaw,
      order: {
        findFirst: mocks.orderFindFirst,
        findUnique: mocks.orderFindUnique,
        update: mocks.orderUpdate,
      },
      paymentTransaction: {
        updateMany: mocks.paymentUpdateMany,
      },
      orderStatusHistory: {
        create: mocks.statusHistoryCreate,
      },
      promoCodeUsage: {
        findMany: mocks.promoUsageFindMany,
      },
    };
    mocks.transaction.mockImplementation(async (operation: unknown) => {
      if (typeof operation !== "function") {
        throw new Error("Expected a transaction callback.");
      }
      return (operation as (tx: typeof client) => Promise<unknown>)(client);
    });
    mocks.promoUsageFindMany.mockResolvedValue([]);
  });

  it("locks before a customer cancellation reads the order", async () => {
    await expect(
      cancelOrderAsCustomer("order-1", "user-1"),
    ).rejects.toBe(lockFailure);

    expect(mocks.queryRaw).toHaveBeenCalledOnce();
    expect(mocks.orderFindFirst).not.toHaveBeenCalled();
  });

  it("locks before an admin transition reads the order", async () => {
    await expect(
      updateOrderStatus("order-1", { status: "CANCELLED" }, "admin-1"),
    ).rejects.toBe(lockFailure);

    expect(mocks.queryRaw).toHaveBeenCalledOnce();
    expect(mocks.orderFindUnique).not.toHaveBeenCalled();
  });

  it("blocks fulfillment while a validated SSLCommerz payment requires review", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PAID",
      items: [],
      payments: [
        { id: "payment-1", status: "SUCCESS", requiresReview: true },
      ],
    });

    await expect(
      updateOrderStatus(
        "order-1",
        { status: "PAYMENT_CONFIRMED" },
        "admin-1",
      ),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "This payment requires fraud or operations review before fulfillment.",
    });
  });

  it("blocks later fulfillment steps if a second validated charge creates a review hold", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      status: "PAYMENT_CONFIRMED",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PAID",
      items: [],
      payments: [
        { id: "payment-1", status: "SUCCESS", requiresReview: true },
      ],
    });

    await expect(
      updateOrderStatus(
        "order-1",
        { status: "SELLER_TO_PACK" },
        "admin-1",
      ),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "This payment requires fraud or operations review before fulfillment.",
    });
  });

  it("blocks cancellation while a gateway-validation mismatch is unresolved", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PENDING",
      items: [],
      payments: [
        { id: "payment-1", status: "PENDING", requiresReview: true },
      ],
    });

    await expect(
      updateOrderStatus(
        "order-1",
        { status: "CANCELLED" },
        "admin-1",
      ),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "This payment requires fraud or operations review before fulfillment.",
    });
  });

  it("blocks customer cancellation while a gateway-validation mismatch is unresolved", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindFirst.mockResolvedValue({
      id: "order-1",
      orderNumber: "ORD-1",
      userId: "user-1",
      status: "PENDING",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PENDING",
      items: [],
      payments: [
        { id: "payment-1", status: "PENDING", requiresReview: true },
      ],
    });

    await expect(
      cancelOrderAsCustomer("order-1", "user-1"),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "This online payment has succeeded or requires investigation; cancellation needs a verified refund resolution.",
    });
  });

  it("locks and resolves every reviewed success before confirming fulfillment", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PAID",
      payments: [
        { id: "payment-1", status: "SUCCESS", requiresReview: true },
        { id: "payment-2", status: "SUCCESS", requiresReview: true },
      ],
    });
    mocks.paymentUpdateMany.mockResolvedValue({ count: 2 });
    mocks.orderUpdate.mockResolvedValue({
      id: "order-1",
      orderNumber: "ORD-1",
      status: "PAYMENT_CONFIRMED",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PAID",
      subtotal: 100,
      deliveryCharge: 20,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 120,
      advancePayment: 0,
      items: [],
      statusHistory: [],
      payments: [],
      user: null,
    });
    mocks.statusHistoryCreate.mockResolvedValue({});

    const result = await approveSslCommerzPaymentReview(
      "order-1",
      "admin-1",
    );

    // Parent order first, then both payment attempts in deterministic order.
    expect(mocks.queryRaw).toHaveBeenCalledTimes(3);
    expect(mocks.paymentUpdateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["payment-1", "payment-2"] },
        provider: "SSLCOMMERZ",
        status: "SUCCESS",
        requiresReview: true,
      },
      data: {
        requiresReview: false,
        reviewResolvedAt: expect.any(Date),
        reviewResolvedBy: "admin-1",
        reviewResolution: "APPROVED",
        reviewResolutionReference: null,
      },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: { status: "PAYMENT_CONFIRMED" },
      }),
    );
    expect(mocks.statusHistoryCreate).toHaveBeenCalledWith({
      data: {
        orderId: "order-1",
        status: "PAYMENT_CONFIRMED",
        note: "SSLCommerz payment review approved and payment confirmed.",
        updatedBy: "admin-1",
      },
    });
    expect(result.status).toBe("PAYMENT_CONFIRMED");
  });

  it("removes a late review hold without rewinding an in-flight order", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      status: "PACKED",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PAID",
      payments: [
        { id: "payment-2", status: "SUCCESS", requiresReview: true },
      ],
    });
    mocks.paymentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderUpdate.mockResolvedValue({
      id: "order-1",
      orderNumber: "ORD-1",
      status: "PACKED",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PAID",
      subtotal: 100,
      deliveryCharge: 20,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 120,
      advancePayment: 0,
      items: [],
      statusHistory: [],
      payments: [],
      user: null,
    });
    mocks.statusHistoryCreate.mockResolvedValue({});

    const result = await approveSslCommerzPaymentReview(
      "order-1",
      "admin-1",
    );

    expect(mocks.orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: {},
      }),
    );
    expect(mocks.statusHistoryCreate).toHaveBeenCalledWith({
      data: {
        orderId: "order-1",
        status: "PACKED",
        note: "SSLCommerz payment review approved; fulfillment hold removed.",
        updatedBy: "admin-1",
      },
    });
    expect(result.status).toBe("PACKED");
    expect(result.requiresPaymentReview).toBe(false);
  });

  it("does not use review approval to bypass a cancelled order's refund requirement", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      status: "CANCELLED",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PAID",
      payments: [
        { id: "payment-1", status: "SUCCESS", requiresReview: true },
      ],
    });

    await expect(
      approveSslCommerzPaymentReview("order-1", "admin-1"),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "A terminal order requires a verified refund workflow, not payment-review approval.",
    });
    expect(mocks.paymentUpdateMany).not.toHaveBeenCalled();
  });

  it("does not approve a pending gateway-verification anomaly for fulfillment", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PENDING",
      payments: [
        { id: "payment-1", status: "PENDING", requiresReview: true },
      ],
    });

    await expect(
      approveSslCommerzPaymentReview("order-1", "admin-1"),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "This hold is a gateway verification anomaly and requires payment/refund investigation; it cannot be approved for fulfillment.",
    });
    expect(mocks.paymentUpdateMany).not.toHaveBeenCalled();
  });

  it("records external refund evidence and cancels an anomalous reservation once", async () => {
    mocks.queryRaw.mockResolvedValue([]);
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      orderNumber: "ORD-1",
      status: "PENDING",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PENDING",
      items: [],
      payments: [
        { id: "payment-1", status: "PENDING", requiresReview: true },
      ],
    });
    mocks.paymentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderUpdate.mockResolvedValue({
      id: "order-1",
      orderNumber: "ORD-1",
      status: "CANCELLED",
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "REFUNDED",
      subtotal: 100,
      deliveryCharge: 20,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 120,
      advancePayment: 0,
      items: [],
      statusHistory: [],
      payments: [],
      user: null,
    });
    mocks.statusHistoryCreate.mockResolvedValue({});

    const result = await recordSslCommerzRefundAndCancel(
      "order-1",
      "refund-1234",
      "admin-1",
    );

    expect(mocks.queryRaw).toHaveBeenCalledTimes(2);
    expect(mocks.paymentUpdateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["payment-1"] },
        provider: "SSLCOMMERZ",
      },
      data: {
        status: "REFUNDED",
        requiresReview: false,
        reviewResolvedAt: expect.any(Date),
        reviewResolvedBy: "admin-1",
        reviewResolution: "REFUND_CONFIRMED",
        reviewResolutionReference: "refund-1234",
      },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: {
          status: "CANCELLED",
          paymentStatus: "REFUNDED",
        },
      }),
    );
    expect(result.order).toMatchObject({
      status: "CANCELLED",
      paymentStatus: "REFUNDED",
      requiresPaymentReview: false,
    });
  });
});
