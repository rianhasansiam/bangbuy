const MIN_PROMO_LENGTH = 2;
const MAX_PROMO_LENGTH = 40;

export function normalizeCheckoutPromoCode(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (
    normalized.length < MIN_PROMO_LENGTH ||
    normalized.length > MAX_PROMO_LENGTH
  ) {
    return null;
  }

  return normalized;
}

export function buildCheckoutHref(promoCode?: string | null): string {
  const normalized = normalizeCheckoutPromoCode(promoCode);
  if (!normalized) return "/checkout";

  const params = new URLSearchParams({ promo: normalized });
  return `/checkout?${params.toString()}`;
}
