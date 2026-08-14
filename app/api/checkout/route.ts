import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
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
import {
  CheckoutError,
  placeOrder,
  reserveOrderForAirwallex,
} from "@/lib/services/checkout.service";
import { handleServiceError } from "@/lib/services/service-error";
import { checkoutSchema } from "@/lib/validations/checkout.validation";
import { airwallexConfig } from "@/lib/airwallex/config/airwallex.config";
import { deriveAirwallexRequestId } from "@/lib/airwallex/security/airwallex-idempotency";

/**
 * POST /api/checkout
 *
 * Authenticated users only. Totals are recomputed from the DB so
 * nothing in the body can shift the price. Customers can omit `items`
 * to have their persisted cart used, or pass `items` directly for the
 * Buy Now or selected-cart flow. The order is always attached to the session
 * userId.
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
    const userId = guard.session.user.id;
    let result;
    if (parsed.data.paymentMethod === "SSLCOMMERZ") {
      result = await initiateSslCommerzCheckout(userId, parsed.data);
    } else if (parsed.data.paymentMethod === "AIRWALLEX") {
      if (!airwallexConfig.enabled) {
        throw new CheckoutError(
          503,
          "Airwallex payments are temporarily unavailable. Please choose another payment method.",
        );
      }
      if (!parsed.data.idempotencyKey) {
        throw new CheckoutError(400, "A payment request ID is required.");
      }
      const reserved = await reserveOrderForAirwallex(userId, parsed.data, {
        id: randomUUID(),
        provider: "AIRWALLEX",
        idempotencyKey: deriveAirwallexRequestId(
          userId,
          parsed.data.idempotencyKey,
        ),
      });
      result = {
        order: reserved.order,
        summary: reserved.summary,
        promo: reserved.promo,
      };
    } else {
      result = await placeOrder(userId, parsed.data);
    }
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
