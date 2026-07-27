import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    paymentTransaction: {
      findMany: mocks.findMany,
      count: mocks.count,
    },
  },
}));

import {
  listTransactionsForAdmin,
  listTransactionsForUser,
} from "@/lib/payments/transactions/payment-transaction.service";

const baseRow = {
  id: "payment-1",
  provider: "SSLCOMMERZ",
  transactionId: "BB-TRANSACTION-1",
  bankTransactionId: "BANK-1",
  cardType: "VISA",
  amount: "1250.50",
  currency: "BDT",
  status: "SUCCESS",
  paidAt: new Date("2026-07-27T10:05:00.000Z"),
  requiresReview: false,
  createdAt: new Date("2026-07-27T10:00:00.000Z"),
  updatedAt: new Date("2026-07-27T10:05:00.000Z"),
  order: {
    id: "order-1",
    orderNumber: "BB-1001",
    status: "PAYMENT_CONFIRMED",
    paymentMethod: "SSLCOMMERZ",
    paymentStatus: "PAID",
  },
};

describe("payment transaction history service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    mocks.transaction.mockImplementation(
      async (
        callback: (tx: {
          paymentTransaction: {
            findMany: typeof mocks.findMany;
            count: typeof mocks.count;
          };
        }) => Promise<unknown>,
      ) =>
        callback({
          paymentTransaction: {
            findMany: mocks.findMany,
            count: mocks.count,
          },
        }),
    );
  });

  it("enforces customer ownership inside the database predicate", async () => {
    mocks.findMany.mockResolvedValue([baseRow]);
    mocks.count.mockResolvedValue(1);

    const result = await listTransactionsForUser("user-1", {
      page: 2,
      pageSize: 10,
      status: "SUCCESS",
      provider: "SSLCOMMERZ",
    });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "SUCCESS",
          provider: "SSLCOMMERZ",
          order: { userId: "user-1" },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: 0,
        take: 10,
      }),
    );
    expect(mocks.count).toHaveBeenCalledWith({
      where: {
        status: "SUCCESS",
        provider: "SSLCOMMERZ",
        order: { userId: "user-1" },
      },
    });
    expect(result.items[0]?.amount).toBe(1250.5);
    expect(result.meta).toEqual({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "RepeatableRead",
    });

    const select = mocks.findMany.mock.calls[0]?.[0]?.select;
    expect(select).not.toHaveProperty("rawResponse");
    expect(select).not.toHaveProperty("gatewayUrl");
    expect(select).not.toHaveProperty("gatewaySessionKey");
    expect(select).not.toHaveProperty("validationId");
    expect(select).not.toHaveProperty("idempotencyKey");
    expect(select).not.toHaveProperty("reviewReason");
    expect(select).not.toHaveProperty("riskLevel");
  });

  it("builds the searchable, resolved-review admin ledger safely", async () => {
    mocks.findMany.mockResolvedValue([
      {
        ...baseRow,
        riskLevel: 1,
        reviewReason: "RISK_REVIEW",
        reviewResolvedAt: new Date("2026-07-27T11:00:00.000Z"),
        reviewResolvedBy: "admin-1",
        reviewResolution: "APPROVED",
        reviewResolutionReference: null,
        order: {
          ...baseRow.order,
          customerName: "Customer One",
          customerEmail: "customer@example.com",
          customerPhone: "01700000000",
          user: {
            id: "user-1",
            name: "Customer One",
            email: "customer@example.com",
          },
        },
      },
    ]);
    mocks.count.mockResolvedValue(1);

    const result = await listTransactionsForAdmin({
      page: 1,
      pageSize: 20,
      search: "BB-1001",
      review: "RESOLVED",
    });

    const call = mocks.findMany.mock.calls[0]?.[0];
    expect(call.where).toMatchObject({
      requiresReview: false,
      reviewResolvedAt: { not: null },
    });
    expect(call.where.OR).toEqual(
      expect.arrayContaining([
        {
          order: {
            orderNumber: {
              contains: "BB-1001",
              mode: "insensitive",
            },
          },
        },
        {
          order: {
            user: {
              is: {
                email: {
                  contains: "BB-1001",
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ]),
    );
    expect(result.items[0]).toMatchObject({
      id: "payment-1",
      amount: 1250.5,
      reviewResolution: "APPROVED",
      order: { orderNumber: "BB-1001" },
    });

    expect(call.select).not.toHaveProperty("rawResponse");
    expect(call.select).not.toHaveProperty("gatewayUrl");
    expect(call.select).not.toHaveProperty("gatewaySessionKey");
    expect(call.select).not.toHaveProperty("validationId");
    expect(call.select).not.toHaveProperty("idempotencyKey");
  });

  it("filters open reviews without conflating resolved reviews", async () => {
    await listTransactionsForAdmin({
      page: 1,
      pageSize: 20,
      review: "OPEN",
    });

    expect(mocks.findMany.mock.calls[0]?.[0]?.where).toEqual({
      requiresReview: true,
    });
  });

  it("clamps an out-of-range page inside the same read snapshot", async () => {
    mocks.count.mockResolvedValue(21);

    const result = await listTransactionsForUser("user-1", {
      page: 99,
      pageSize: 10,
    });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
    expect(result.meta).toEqual({
      page: 3,
      pageSize: 10,
      total: 21,
      totalPages: 3,
    });
  });
});
