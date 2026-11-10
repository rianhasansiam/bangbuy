import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OrderDetail } from "@/features/orders/api";

const purchaseDelivery = vi.hoisted(() => ({
  hasPurchaseIntent: vi.fn(),
  trackPurchase: vi.fn(),
}));
vi.mock("@/lib/analytics/meta-pixel", () => purchaseDelivery);

import { trackPendingOrderPurchase } from "@/lib/analytics/order-purchase-browser";

type Receipt = Pick<OrderDetail, "id" | "userId" | "metaPurchase">;

function guestReceipt(): Receipt {
  return {
    id: "guest-order-verified",
    userId: null,
    metaPurchase: {
      eventId: "purchase:guest-order-verified",
      eventTime: 1791093600,
      value: 1500,
      currency: "BDT",
      items: [{ productId: "product-1", productCode: "CATALOG-1", quantity: 1, unitPrice: 1400 }],
    },
  };
}

describe("cookie-authorized receipts never initialize browser marketing", () => {
  beforeEach(() => {
    purchaseDelivery.hasPurchaseIntent.mockReset().mockReturnValue(true);
    purchaseDelivery.trackPurchase.mockReset();
  });

  it("does not externally deliver the verified guest order payload", () => {
    const receipt = guestReceipt();
    trackPendingOrderPurchase(receipt, undefined);
    expect(purchaseDelivery.hasPurchaseIntent).not.toHaveBeenCalled();
    expect(purchaseDelivery.trackPurchase).not.toHaveBeenCalled();
  });

  it("keeps the scoped guest receipt untracked when a session is also present", () => {
    trackPendingOrderPurchase(guestReceipt(), "signed-in-later");
    expect(purchaseDelivery.trackPurchase).not.toHaveBeenCalled();
  });

  it("does not turn a guest receipt revisit into a purchase without checkout intent", () => {
    purchaseDelivery.hasPurchaseIntent.mockReturnValue(false);
    trackPendingOrderPurchase(guestReceipt(), undefined);
    expect(purchaseDelivery.trackPurchase).not.toHaveBeenCalled();
  });

  it("does not emit from a pending or failed guest payment without a verified payload", () => {
    trackPendingOrderPurchase({ ...guestReceipt(), metaPurchase: null }, undefined);
    expect(purchaseDelivery.trackPurchase).not.toHaveBeenCalled();
  });

  it("rejects a payload belonging to another order even with local checkout intent", () => {
    const receipt = guestReceipt();
    receipt.metaPurchase!.eventId = "purchase:another-order";
    trackPendingOrderPurchase(receipt, undefined);
    expect(purchaseDelivery.trackPurchase).not.toHaveBeenCalled();
  });

  it.each([undefined, "administrator", "another-customer"])(
    "preserves registered-order owner checks for viewer %s",
    (viewerId) => {
      trackPendingOrderPurchase({ ...guestReceipt(), userId: "order-owner" }, viewerId);
      expect(purchaseDelivery.trackPurchase).not.toHaveBeenCalled();
    },
  );

  it("does not externally deliver a registered owner's verified receipt", () => {
    const receipt = { ...guestReceipt(), userId: "order-owner" };
    trackPendingOrderPurchase(receipt, "order-owner");
    expect(purchaseDelivery.trackPurchase).not.toHaveBeenCalled();
  });

  it("keeps guest receipt rendering successful when analytics throws", () => {
    purchaseDelivery.trackPurchase.mockImplementation(() => {
      throw new Error("tracking unavailable");
    });
    expect(() => trackPendingOrderPurchase(guestReceipt(), undefined)).not.toThrow();
  });
});
