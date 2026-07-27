import { describe, expect, it } from "vitest";

import {
  isAwaitingSslCommerzConfirmation,
  paymentMethodLabel,
} from "./payment";

describe("order payment presentation", () => {
  it("labels explicit providers without collapsing them into generic online", () => {
    expect(paymentMethodLabel("SSLCOMMERZ")).toBe(
      "SSLCommerz (Visa / Mastercard)",
    );
    expect(paymentMethodLabel("PAYPAL")).toBe("PayPal");
    expect(paymentMethodLabel("ONLINE")).toBe("Online payment");
  });

  it("polls only unresolved SSLCommerz payments", () => {
    expect(isAwaitingSslCommerzConfirmation("SSLCOMMERZ", "PENDING")).toBe(true);
    expect(isAwaitingSslCommerzConfirmation("SSLCOMMERZ", "UNPAID")).toBe(true);
    expect(isAwaitingSslCommerzConfirmation("SSLCOMMERZ", "PAID")).toBe(false);
    expect(isAwaitingSslCommerzConfirmation("PAYPAL", "PENDING")).toBe(false);
  });
});
