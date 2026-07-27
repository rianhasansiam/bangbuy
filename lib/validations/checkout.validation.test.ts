import { describe, expect, it } from "vitest";

import {
  adminCheckoutSchema,
  checkoutSchema,
} from "@/lib/validations/checkout.validation";

const baseCheckout = {
  items: [{ productId: "product-1", variantId: "variant-1", quantity: 1 }],
  customerName: "Test Buyer",
  customerPhone: "01700000000",
  customerAddress: "123 Test Road",
  deliveryZone: "INSIDE_DHAKA" as const,
};

describe("checkout payment validation", () => {
  it("preserves COD without requiring payment metadata", () => {
    expect(checkoutSchema.parse(baseCheckout)).toMatchObject({
      paymentMethod: "CASH_ON_DELIVERY",
      clearCart: true,
    });
  });

  it("requires a UUID idempotency key for SSLCommerz", () => {
    const missing = checkoutSchema.safeParse({
      ...baseCheckout,
      paymentMethod: "SSLCOMMERZ",
    });
    expect(missing.success).toBe(false);

    expect(
      checkoutSchema.parse({
        ...baseCheckout,
        paymentMethod: "SSLCOMMERZ",
        idempotencyKey: "1d79bc20-c0c8-42b1-b15c-42632372247f",
      }),
    ).toMatchObject({
      paymentMethod: "SSLCOMMERZ",
      idempotencyKey: "1d79bc20-c0c8-42b1-b15c-42632372247f",
    });
  });

  it.each(["PAYPAL", "ONLINE", "CARD", ""])(
    "rejects unsupported customer payment method %j",
    (paymentMethod) => {
      expect(
        checkoutSchema.safeParse({ ...baseCheckout, paymentMethod }).success,
      ).toBe(false);
    },
  );

  it("strips client attempts to set totals or payment state", () => {
    const parsed = checkoutSchema.parse({
      ...baseCheckout,
      totalAmount: 1,
      paymentStatus: "PAID",
      status: "PAYMENT_CONFIRMED",
    });

    expect(parsed).not.toHaveProperty("totalAmount");
    expect(parsed).not.toHaveProperty("paymentStatus");
    expect(parsed).not.toHaveProperty("status");
  });

  it("keeps admin-created orders restricted to COD", () => {
    const adminInput = {
      ...baseCheckout,
      customerId: "",
      advancePayment: 0,
      paymentMethod: "SSLCOMMERZ",
      idempotencyKey: "1d79bc20-c0c8-42b1-b15c-42632372247f",
    };
    expect(adminCheckoutSchema.safeParse(adminInput).success).toBe(false);
  });
});
