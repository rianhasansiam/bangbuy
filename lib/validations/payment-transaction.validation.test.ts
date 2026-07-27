import { describe, expect, it } from "vitest";

import {
  adminTransactionQuerySchema,
  customerTransactionQuerySchema,
} from "@/lib/payments/validation/payment-transaction.schema";

describe("payment transaction query validation", () => {
  it("applies bounded pagination defaults and normalizes providers", () => {
    expect(
      customerTransactionQuerySchema.parse({
        provider: " sslcommerz ",
        status: "SUCCESS",
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
      provider: "SSLCOMMERZ",
      status: "SUCCESS",
    });
  });

  it("treats empty optional filters as absent", () => {
    expect(
      adminTransactionQuerySchema.parse({
        search: "  ",
        provider: "",
        status: "",
        review: "",
      }),
    ).toEqual({ page: 1, pageSize: 20 });
  });

  it("rejects unsupported statuses, providers, and oversized pages", () => {
    expect(
      customerTransactionQuerySchema.safeParse({ status: "PAID" }).success,
    ).toBe(false);
    expect(
      customerTransactionQuerySchema.safeParse({
        provider: "SSL COMMERZ<script>",
      }).success,
    ).toBe(false);
    expect(
      customerTransactionQuerySchema.safeParse({ pageSize: 101 }).success,
    ).toBe(false);
    expect(
      customerTransactionQuerySchema.safeParse({ page: 10_001 }).success,
    ).toBe(false);
  });

  it("accepts only supported admin review states", () => {
    expect(
      adminTransactionQuerySchema.parse({ review: "OPEN" }).review,
    ).toBe("OPEN");
    expect(
      adminTransactionQuerySchema.parse({ review: "RESOLVED" }).review,
    ).toBe("RESOLVED");
    expect(
      adminTransactionQuerySchema.safeParse({ review: "CLOSED" }).success,
    ).toBe(false);
  });
});
