import type { OrderDetail } from "@/features/orders/api";
import { hasPurchaseIntent, trackPurchase } from "@/lib/analytics/meta-pixel";

/** One browser tracking point for both receipt reads and payment-return reads. */
export function trackPendingOrderPurchase(
  order: Pick<OrderDetail, "id" | "userId" | "metaPurchase">,
  ownerId: string | undefined,
): void {
  try {
    if (!ownerId || order.userId !== ownerId || !order.metaPurchase || !hasPurchaseIntent(order.id)) return;
    trackPurchase(order.metaPurchase, order.metaPurchase.eventId);
  } catch {
    // Receipt rendering and payment confirmation must never depend on analytics.
  }
}
