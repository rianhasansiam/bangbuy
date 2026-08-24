import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FreeShippingBar from "@/app/(shop)/cart/components/FreeShippingBar";
import OrderSummary from "@/app/(shop)/cart/components/OrderSummary";
import { CurrencyAmount } from "@/components/currency/CurrencyAmount";
import CurrencyProvider from "@/components/currency/CurrencyProvider";
import type { CartItem } from "@/features/cart/api";
import {
  mergeCartItemWithCheckoutPreview,
  shouldShowCartBootstrap,
  toCanonicalCartSummary,
} from "@/features/cart/checkout-preview";
import type { CheckoutPreview } from "@/features/checkout/api";
import { createPricingContext } from "@/lib/currency/pricing.service";

const usdContext = createPricingContext({
  currency: "USD",
  exchangeRate: "0.01",
  exchangeRateTimestamp: "2026-08-25T00:00:00.000Z",
  countryCode: "US",
  source: "geo",
});

const preview: CheckoutPreview = {
  items: [
    {
      productId: "product-1",
      variantId: "variant-1",
      sku: "SKU-1",
      variantKey: "default",
      variantName: "Default",
      modelNumber: null,
      color: null,
      size: null,
      attributes: null,
      attributeSummary: null,
      name: "Test product",
      image: null,
      quantity: 2,
      unitPrice: 50,
      originalPrice: 55,
      lineTotal: 100,
      lineSavings: 10,
      baseUnitPrice: 5_000,
      baseOriginalPrice: 5_500,
      baseLineTotal: 10_000,
      baseLineSavings: 1_000,
      stock: 10,
    },
  ],
  summary: {
    subtotal: 100,
    totalSavings: 10,
    totalSaved: 15,
    discount: 5,
    shipping: 1,
    tax: 9.5,
    total: 105.5,
    taxRate: 0.1,
    freeShippingThreshold: 150,
    shippingFee: 1,
    isOutsideDhaka: false,
    isFreeShippingApplied: false,
    currency: "USD",
    baseCurrency: "BDT",
    baseSubtotal: 10_000,
    baseTotalSavings: 1_000,
    baseTotalSaved: 1_500,
    baseDiscount: 500,
    baseShipping: 100,
    baseTax: 950,
    baseTotal: 10_550,
    baseFreeShippingThreshold: 15_000,
    baseShippingFee: 100,
    exchangeRate: "0.01",
    exchangeRateTimestamp: "2026-08-25T00:00:00.000Z",
  },
  promo: {
    ok: true,
    code: "SAVE5",
    description: null,
    discount: 5,
    baseDiscount: 500,
  },
  airwallexPaymentQuote: null,
  availablePaymentMethods: ["CASH_ON_DELIVERY"],
};

function renderWithCurrency(children: ReactNode): string {
  return renderToStaticMarkup(
    CurrencyProvider({ initialContext: usdContext, children }),
  );
}

function textContent(markup: string): string {
  return markup.replace(/<[^>]*>/g, "");
}

describe("cart currency display", () => {
  it("renders the IP-resolved currency on the first markup", () => {
    const markup = renderWithCurrency(
      createElement(CurrencyAmount, { amountBDT: 5_000 }),
    );

    expect(markup).toContain("$50.00");
    expect(markup).not.toContain("BDT");
  });

  it("keeps cart content behind its loader until hydration completes", () => {
    expect(
      shouldShowCartBootstrap({
        isHydrated: false,
        isLoading: false,
        sessionStatus: "loading",
      }),
    ).toBe(true);
    expect(
      shouldShowCartBootstrap({
        isHydrated: false,
        isLoading: true,
        sessionStatus: "authenticated",
      }),
    ).toBe(true);
    expect(
      shouldShowCartBootstrap({
        isHydrated: true,
        isLoading: true,
        sessionStatus: "authenticated",
      }),
    ).toBe(false);
    expect(
      shouldShowCartBootstrap({
        isHydrated: false,
        isLoading: false,
        sessionStatus: "unauthenticated",
      }),
    ).toBe(false);
  });

  it("keeps checkout preview money canonical inside the cart", () => {
    const cartItem: CartItem = {
      id: "cart-1",
      productId: "product-1",
      variantId: "variant-1",
      name: "Stale product name",
      image: null,
      quantity: 2,
      unitPrice: 4_900,
      originalPrice: 5_400,
      lineTotal: 9_800,
      stock: 8,
      status: "ACTIVE",
    };

    const merged = mergeCartItemWithCheckoutPreview(cartItem, preview);

    expect(merged).toMatchObject({
      name: "Test product",
      unitPrice: 5_000,
      originalPrice: 5_500,
      lineTotal: 10_000,
      stock: 10,
    });
    expect(merged.unitPrice).not.toBe(preview.items[0].unitPrice);
    expect(cartItem.unitPrice).toBe(4_900);
  });

  it("projects every verified summary value from its BDT base field", () => {
    expect(toCanonicalCartSummary(preview.summary)).toEqual({
      subtotalBDT: 10_000,
      totalSavingsBDT: 1_000,
      totalSavedBDT: 1_500,
      discountBDT: 500,
      shippingBDT: 100,
      taxBDT: 950,
      totalBDT: 10_550,
      taxRate: 0.1,
      freeShippingThresholdBDT: 15_000,
      shippingFeeBDT: 100,
      isOutsideDhaka: false,
      isFreeShippingApplied: false,
    });
  });

  it("converts verified cart totals exactly once", () => {
    const markup = renderWithCurrency(
      createElement(OrderSummary, {
        summary: toCanonicalCartSummary(preview.summary),
        fallbackSubtotalBDT: 10_000,
        itemCount: 2,
        promo: {
          code: "SAVE5",
          discountBDT: 500,
          description: null,
        },
        promoError: null,
        onApplyPromo: () => undefined,
        onRemovePromo: () => undefined,
        onPromoErrorClear: () => undefined,
        onCheckout: () => undefined,
      }),
    );
    const text = textContent(markup);

    expect(text).toContain("$100.00");
    expect(text).toContain("-$5.00");
    expect(text).toContain("$1.00");
    expect(text).toContain("$9.50");
    expect(text).toContain("$105.50");
    expect(text).toContain("$15.00");
    expect(text).not.toContain("$1.06");
  });

  it("converts the free-shipping remainder from BDT exactly once", () => {
    const markup = renderWithCurrency(
      createElement(FreeShippingBar, {
        subtotalBDT: 10_000,
        thresholdBDT: 15_000,
      }),
    );

    expect(textContent(markup)).toContain("Add $50.00 more");
    expect(textContent(markup)).not.toContain("$0.50");
  });
});
