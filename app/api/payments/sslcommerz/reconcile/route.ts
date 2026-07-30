import { jsonError, ok } from "@/lib/api/response";
import { invalidateProductsById } from "@/lib/cache/catalog-invalidation";
import { revalidateCacheTags } from "@/lib/cache/revalidation";
import { reconcileStaleSslCommerzPayments } from "@/lib/payments";
import { isReconciliationAuthorized } from "@/lib/payments/reconciliation/reconciliation-security";
import { handleServiceError } from "@/lib/services/service-error";

export const dynamic = "force-dynamic";

/**
 * Scheduler-only recovery endpoint. A dedicated high-entropy bearer secret
 * protects it; no caller identity or provider credential is accepted in the
 * body. Run it periodically to reconcile bounded batches of stale attempts.
 */
export async function POST(request: Request) {
  const secret = process.env.PAYMENT_RECONCILIATION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    return jsonError(503, "Payment reconciliation is not configured.");
  }
  if (!isReconciliationAuthorized(request, secret)) {
    return jsonError(401, "Unauthorized.");
  }

  try {
    const result = await reconcileStaleSslCommerzPayments();
    if (result.affectedProductIds.length > 0) {
      await invalidateProductsById(result.affectedProductIds, {
        reason: "stale payment reconciliation stock restore",
      });
    }
    revalidateCacheTags(["admin-orders", "promo-codes"]);

    return ok({
      examined: result.examined,
      confirmed: result.confirmed,
      terminalized: result.terminalized,
      locallyExpired: result.locallyExpired,
      stillPending: result.stillPending,
      errors: result.errors,
    });
  } catch (error) {
    return handleServiceError(
      "payments.sslcommerz.reconcile.POST",
      error,
    );
  }
}
