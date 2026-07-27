import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CheckoutSubmissionError,
  placeCheckoutOrder,
  type PlaceOrderRequest,
} from "@/features/checkout/api";

const request: PlaceOrderRequest = {
  items: [{ productId: "product-1", quantity: 1 }],
  customerName: "Test Buyer",
  customerPhone: "01700000000",
  customerAddress: "123 Test Road",
  deliveryZone: "INSIDE_DHAKA",
  paymentMethod: "SSLCOMMERZ",
  idempotencyKey: "1d79bc20-c0c8-42b1-b15c-42632372247f",
};

describe("checkout API payment recovery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preserves only safe committed-order recovery details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            error: "Payment validation is pending.",
            details: {
              orderId: "order-1",
              paymentState: "PENDING",
              ignored: "not surfaced",
            },
          },
          { status: 503 },
        ),
      ),
    );

    const error = await placeCheckoutOrder(request).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(CheckoutSubmissionError);
    expect(error).toMatchObject({
      message: "Payment validation is pending.",
      orderId: "order-1",
      paymentState: "PENDING",
    });
    expect(error).not.toHaveProperty("ignored");
  });

  it("does not invent an order destination for ordinary API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ error: "Invalid checkout." }, { status: 400 }),
      ),
    );

    await expect(placeCheckoutOrder(request)).rejects.toMatchObject({
      orderId: null,
      paymentState: null,
    });
  });
});
