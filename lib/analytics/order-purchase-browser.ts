import type { OrderDetail } from "@/features/orders/api";

/** Receipt reads never dispatch marketing. Conversion authority is server-side. */
export function trackPendingOrderPurchase(
  _order: Pick<OrderDetail, "id" | "userId" | "metaPurchase">,
  _ownerId: string | undefined,
): void { void _order; void _ownerId; /* Compatibility only; no transport, storage, or event publication. */ }
