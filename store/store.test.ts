import { describe, expect, it } from "vitest";

import { makeStore } from "@/store";
import { setReportError, setReportPayload, clearReport } from "@/store/slices/admin-reports.slice";
import { setCartData } from "@/store/slices/cart.slice";
import { setWishlistItems } from "@/store/slices/wishlist.slice";

describe("application store", () => {
  it("creates isolated store instances for separate provider trees", () => {
    const first = makeStore();
    const second = makeStore();

    first.dispatch(
      setCartData({
        items: [
          {
            id: "local:product-1",
            productId: "product-1",
            name: "Product",
            image: null,
            quantity: 2,
            unitPrice: 100,
            originalPrice: 120,
            lineTotal: 200,
            stock: 10,
            status: "ACTIVE",
          },
        ],
        summary: {
          totalItems: 2,
          subtotal: 200,
          totalDiscount: 40,
          finalTotal: 200,
        },
      }),
    );

    expect(first.getState().cart.items).toHaveLength(1);
    expect(second.getState().cart.items).toHaveLength(0);
  });

  it("registers the wishlist reducer under the expected root key", () => {
    const store = makeStore();

    store.dispatch(
      setWishlistItems([
        {
          id: "product-1",
          name: "Product",
          brand: "BangBuy",
          image: "/product.png",
          price: 100,
          rating: 5,
          reviewCount: 1,
          category: "Tools",
          inStock: true,
          addedAt: "2026-07-21T00:00:00.000Z",
        },
      ]),
    );

    expect(store.getState().wishlist.items[0]?.id).toBe("product-1");
    expect(store.getState().wishlist.isHydrated).toBe(true);
  });

  it("keeps report errors visible when a stale report is cleared", () => {
    const store = makeStore();
    const generatedAt = "2026-07-21T00:00:00.000Z";

    store.dispatch(
      setReportPayload({
        meta: {
          type: "sales",
          from: "2026-06-21",
          to: "2026-07-21",
          generatedAt,
          limit: 100,
          allTime: false,
        },
      }),
    );
    store.dispatch(setReportError("Failed to refresh report."));
    store.dispatch(clearReport());

    const report = store.getState().adminReports;
    expect(report.payload).toBeNull();
    expect(report.generatedAt).toBeNull();
    expect(report.error).toBe("Failed to refresh report.");
  });
});
