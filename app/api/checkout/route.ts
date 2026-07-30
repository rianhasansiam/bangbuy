import type { NextRequest } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/api/guards";
import { created, jsonError, tooManyRequests } from "@/lib/api/response";
import { rateLimitPersistent } from "@/lib/auth/rate-limit";
import { invalidateProductsById } from "@/lib/cache/catalog-invalidation";
import { revalidateCacheTags } from "@/lib/cache/revalidation";
import {
  CommittedPaymentError,
  initiateSslCommerzCheckout,
} from "@/lib/payments";
import { placeOrder } from "@/lib/services/checkout.service";
import { handleServiceError } from "@/lib/services/service-error";
import { checkoutSchema } from "@/lib/validations/checkout.validation";

/**
 * POST /api/checkout
 *
 * Authenticated users only. Totals are recomputed from the DB so
 * nothing in the body can shift the price. Customers can omit `items`
 * to have their persisted cart used, or pass `items` directly for the
 * "Buy now" flow. The order is always attached to the session userId.
 */
export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  try {
    const limit = await rateLimitPersistent(
      `checkout-submit:${guard.session.user.id}`,
      6,
      5 * 60_000,
    );
    if (!limit.allowed) return tooManyRequests(limit.resetMs);
  } catch (error) {
    return handleServiceError("checkout.POST.rateLimit", error);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError(415, "Content-Type must be application/json.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON payload.");
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Please review the highlighted fields and try again.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  try {
    const result =
      parsed.data.paymentMethod === "SSLCOMMERZ"
        ? await initiateSslCommerzCheckout(
            guard.session.user.id,
            parsed.data,
          )
        : await placeOrder(guard.session.user.id, parsed.data);
    // Order placement decrements stock and empties the cart. Bust the
    // cached surfaces that embed product/stock data. (The cart itself is
    // uncached and refetched fresh by the client.)
    await invalidateProductsById(
      result.order.items.flatMap((item) =>
        item.productId ? [item.productId] : [],
      ),
      { reason: `checkout stock decrement: ${result.order.id}` },
    );
    revalidateCacheTags(["admin-orders", "promo-codes"]);
    return created(result);
  } catch (error) {
    if (error instanceof CommittedPaymentError) {
      try {
        if (error.productIds.length > 0) {
          await invalidateProductsById(error.productIds, {
            reason: "payment initialization state change",
          });
        }
        revalidateCacheTags(["admin-orders", "promo-codes"]);
      } catch (cacheError) {
        console.error("[checkout.POST] payment cache invalidation failed", {
          category: "CACHE_INVALIDATION",
          cacheError,
        });
      }
    }
    return handleServiceError("checkout.POST", error);
  }
}
