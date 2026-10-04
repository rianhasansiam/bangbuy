import type { CartItem } from "@/features/cart/api";
import type {
  CheckoutPreview,
  CheckoutSummary,
} from "@/features/checkout/api";

/** Canonical BDT totals consumed by cart components that use CurrencyAmount. */
export type CanonicalCartSummary = {
  subtotalBDT: number;
  totalSavingsBDT: number;
  totalSavedBDT: number;
  discountBDT: number;
  shippingBDT: number;
  taxBDT: number;
  totalBDT: number;
  taxRate: number;
  freeShippingThresholdBDT: number;
  shippingFeeBDT: number;
  isOutsideDhaka: boolean;
  isFreeShippingApplied: boolean;
};

export type CartBootstrapState = {
  isHydrated: boolean;
  isLoading: boolean;
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
};

/** Hide cart content until client storage or the active server sync is ready. */
export function shouldShowCartBootstrap({
  isHydrated,
  isLoading,
  sessionStatus,
}: CartBootstrapState): boolean {
  return !isHydrated && (sessionStatus === "loading" || isLoading);
}

/**
 * Keep the cart's pricing boundary canonical. Checkout display fields have
 * already been converted, while CurrencyAmount expects BDT and converts once.
 */
export function toCanonicalCartSummary(
  summary: CheckoutSummary,
): CanonicalCartSummary {
  return {
    subtotalBDT: summary.baseSubtotal,
    totalSavingsBDT: summary.baseTotalSavings,
    totalSavedBDT: summary.baseTotalSaved,
    discountBDT: summary.baseDiscount,
    shippingBDT: summary.baseShipping,
    taxBDT: summary.baseTax,
    totalBDT: summary.baseTotal,
    taxRate: summary.taxRate,
    freeShippingThresholdBDT: summary.baseFreeShippingThreshold,
    shippingFeeBDT: summary.baseShippingFee,
    isOutsideDhaka: summary.isOutsideDhaka,
    isFreeShippingApplied: summary.isFreeShippingApplied,
  };
}

/** Merge authoritative preview details without storing display-currency money. */
export function mergeCartItemWithCheckoutPreview(
  item: CartItem,
  preview: CheckoutPreview | null,
): CartItem {
  const priced = preview?.items.find((candidate) =>
    item.variantId
      ? candidate.variantId === item.variantId
      : candidate.productId === item.productId,
  );
  if (!priced) return item;

  return {
    ...item,
    productId: priced.productId,
    productCode: priced.productCode ?? item.productCode,
    variantId: priced.variantId,
    sku: priced.sku,
    variantName: priced.variantName,
    color: priced.color,
    size: priced.size,
    attributes: priced.attributes,
    attributeSummary: priced.attributeSummary,
    name: priced.name,
    image: priced.image ?? item.image,
    unitPrice: priced.baseUnitPrice,
    originalPrice: priced.baseOriginalPrice,
    lineTotal: priced.baseLineTotal,
    stock: priced.stock,
    status: "ACTIVE",
  };
}
