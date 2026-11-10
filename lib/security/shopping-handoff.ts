import { z } from "zod";
import { getBrowserSurfaceOrigins, surfaceHref } from "./surfaces";
import { localizeHref } from "@/lib/i18n/paths";

export const shoppingSelectionSchema = z.object({
  action: z.enum(["cart", "buy", "wishlist"]),
  productId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  variantId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  quantity: z.coerce.number().int().min(1).max(1000),
}).strict();
export type ShoppingSelection = z.infer<typeof shoppingSelectionSchema>;

/** Public identifiers only; no price, customer, bearer token, attribution or arbitrary return URL. */
export function shoppingHandoffHref(selection: ShoppingSelection, locale: string): string {
  const safe = shoppingSelectionSchema.parse(selection);
  if (safe.action === "buy") {
    const buy = [safe.productId, safe.quantity, safe.variantId ?? ""].join(":");
    return surfaceHref(localizeHref(`/checkout?${new URLSearchParams({ buy })}`, locale), getBrowserSurfaceOrigins());
  }
  const params = new URLSearchParams({ action: safe.action, productId: safe.productId, quantity: String(safe.quantity), ...(safe.variantId ? { variantId: safe.variantId } : {}) });
  return surfaceHref(localizeHref(`/shopping-handoff?${params}`, locale), getBrowserSurfaceOrigins());
}

export function navigateShoppingHandoff(selection: ShoppingSelection, locale: string): void {
  window.location.assign(shoppingHandoffHref(selection, locale));
}
