import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  previewCheckout: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/services/checkout.service", () => ({
  previewCheckout: mocks.previewCheckout,
}));

import { POST } from "@/app/api/checkout/preview/route";

const preview = {
  items: [],
  summary: {
    subtotal: 0,
    totalSavings: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    taxRate: 0,
    freeShippingThreshold: 0,
    shippingFee: 0,
    isOutsideDhaka: false,
    isFreeShippingApplied: true,
    currency: "BDT",
  },
  promo: null,
};

function previewRequest(body: unknown) {
  return new NextRequest("http://localhost/api/checkout/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout/preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.previewCheckout.mockResolvedValue(preview);
  });

  it("prices explicit guest items without requiring a session", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(
      previewRequest({
        items: [{ productId: "product-1", variantId: "variant-1", quantity: 2 }],
        promoCode: " save10 ",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.previewCheckout).toHaveBeenCalledWith(null, {
      items: [{ productId: "product-1", variantId: "variant-1", quantity: 2 }],
      deliveryZone: "INSIDE_DHAKA",
      promoCode: "save10",
    });
  });

  it("keeps persisted-cart previews tied to the authenticated user", async () => {
    mocks.auth.mockResolvedValue({
      expires: "2099-01-01T00:00:00.000Z",
      user: { id: "user-1", role: "USER" },
    });

    const response = await POST(previewRequest({}));

    expect(response.status).toBe(200);
    expect(mocks.previewCheckout).toHaveBeenCalledWith("user-1", {
      deliveryZone: "INSIDE_DHAKA",
    });
  });
});
