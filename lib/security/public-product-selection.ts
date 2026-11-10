import { z } from "zod";

const KEY = "bangbuy:public-product-selection";
const MAX_AGE = 10 * 60 * 1000;
const schema = z.object({ productId: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/), selectedVariantId: z.string().max(100), quantity: z.number().int().min(1).max(1000), savedAt: z.number().finite() }).strict();

/** A single current public selection, never a cart, customer profile or view history. */
export function savePublicProductSelection(productId: string, value: unknown, now = Date.now()): void {
  if (typeof window === "undefined" || !value || typeof value !== "object") return;
  const fields = value as Record<string, unknown>;
  const result = schema.safeParse({ productId, selectedVariantId: fields.selectedVariantId, quantity: fields.quantity, savedAt: now });
  if (!result.success) return;
  try { window.sessionStorage.setItem(KEY, JSON.stringify(result.data)); } catch { /* Optional recovery never blocks shopping. */ }
}

export function readPublicProductSelection(productId: string, now = Date.now()): { selectedVariantId: string; quantity: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const result = schema.safeParse(JSON.parse(window.sessionStorage.getItem(KEY) ?? "null"));
    if (!result.success || result.data.productId !== productId || now - result.data.savedAt < 0 || now - result.data.savedAt > MAX_AGE) return null;
    return { selectedVariantId: result.data.selectedVariantId, quantity: result.data.quantity };
  } catch { return null; }
}
