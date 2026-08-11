export const PRODUCT_COLOR_HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const PRODUCT_COLOR_VALIDATION_MESSAGE =
  "Color must be a 6-digit HEX value in #RRGGBB format.";

export function isSixDigitProductColor(value: string): boolean {
  return PRODUCT_COLOR_HEX_PATTERN.test(value);
}

export function normalizeProductColor(value: string): string {
  return value.toUpperCase();
}

type StoredProductColor = { value: string | null };

export type ProductColorWriteResult =
  | { success: true; value: string | null | undefined }
  | { success: false; message: string };

/**
 * Preserve an existing color byte-for-byte only when the submitted value is
 * unchanged. Every new or changed non-null value must use strict six-digit
 * HEX and is normalized before it reaches persistence.
 */
export function resolveProductColorWrite(
  value: string | null | undefined,
  stored?: StoredProductColor,
): ProductColorWriteResult {
  if (stored && value === stored.value) {
    return { success: true, value: stored.value };
  }

  if (value == null) {
    return { success: true, value };
  }

  const trimmed = value.trim();
  if (!isSixDigitProductColor(trimmed)) {
    return { success: false, message: PRODUCT_COLOR_VALIDATION_MESSAGE };
  }

  return { success: true, value: normalizeProductColor(trimmed) };
}
