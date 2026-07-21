import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  queryRaw: vi.fn(),
  orderFindFirst: vi.fn(),
  orderFindUnique: vi.fn(),
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
  cancelOrderAsCustomer,
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
      },
    };
    mocks.transaction.mockImplementation(async (operation: unknown) => {
      if (typeof operation !== "function") {
        throw new Error("Expected a transaction callback.");
      }
      return (operation as (tx: typeof client) => Promise<unknown>)(client);
    });
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
});
