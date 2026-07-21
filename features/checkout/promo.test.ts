import { describe, expect, it } from "vitest";

import {
  buildCheckoutHref,
  normalizeCheckoutPromoCode,
} from "@/features/checkout/promo";

describe("checkout promo navigation", () => {
  it("normalizes a carried promo to the checkout DTO format", () => {
    expect(normalizeCheckoutPromoCode("  save 10  ")).toBe("SAVE 10");
    expect(normalizeCheckoutPromoCode("x")).toBeNull();
    expect(normalizeCheckoutPromoCode("x".repeat(41))).toBeNull();
  });

  it("builds an encoded checkout URL only for a valid promo", () => {
    expect(buildCheckoutHref(" save+10 ")).toBe(
      "/checkout?promo=SAVE%2B10",
    );
    expect(buildCheckoutHref(null)).toBe("/checkout");
  });
});
