import { describe, expect, it } from "vitest";

import { resolvePaymentReviewSchema } from "./order.validation";

describe("payment review validation", () => {
  it("accepts only the explicit approval decision", () => {
    expect(
      resolvePaymentReviewSchema.safeParse({ decision: "APPROVE" }).success,
    ).toBe(true);
    expect(
      resolvePaymentReviewSchema.safeParse({ decision: "REJECT" }).success,
    ).toBe(false);
    expect(resolvePaymentReviewSchema.safeParse({}).success).toBe(false);
  });

  it("requires a bounded provider reference for refund cancellation", () => {
    expect(
      resolvePaymentReviewSchema.safeParse({
        decision: "REFUND_AND_CANCEL",
        refundReference: "refund-1234",
      }).success,
    ).toBe(true);
    expect(
      resolvePaymentReviewSchema.safeParse({
        decision: "REFUND_AND_CANCEL",
        refundReference: "",
      }).success,
    ).toBe(false);
    expect(
      resolvePaymentReviewSchema.safeParse({
        decision: "REFUND_AND_CANCEL",
        refundReference: "<script>",
      }).success,
    ).toBe(false);
  });
});
