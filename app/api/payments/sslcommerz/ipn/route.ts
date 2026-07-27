import { z } from "zod";

import { jsonError, ok } from "@/lib/api/response";
import { invalidateProductsById } from "@/lib/cache/catalog-invalidation";
import { revalidateCacheTags } from "@/lib/cache/revalidation";
import { processSslCommerzNotification } from "@/lib/payments";
import { logPaymentEvent } from "@/lib/payments/core/payment-logger";
import { sslCommerzNotificationSchema } from "@/lib/payments/validation/payment.schema";
import { handleServiceError } from "@/lib/services/service-error";

export const dynamic = "force-dynamic";

const MAX_IPN_BYTES = 64 * 1024;

/**
 * SSLCommerz IPN is intentionally not rate-limited: dropping a legitimate
 * provider retry could leave a paid order pending. Size/content validation,
 * known-transaction lookup, server-to-server validation, and row locks are
 * the abuse/correctness boundaries here.
 */
export async function POST(request: Request) {
  logPaymentEvent({
    event: "IPN_RECEIVED",
    trigger: "IPN",
  });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_IPN_BYTES) {
    return jsonError(413, "Payment notification is too large.");
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (
    !contentType.includes("application/x-www-form-urlencoded") &&
    !contentType.includes("multipart/form-data")
  ) {
    return jsonError(415, "Payment notification must use form encoding.");
  }

  let rawBody: ArrayBuffer;
  try {
    rawBody = await request.arrayBuffer();
  } catch {
    return jsonError(400, "Invalid payment notification.");
  }
  if (rawBody.byteLength > MAX_IPN_BYTES) {
    return jsonError(413, "Payment notification is too large.");
  }

  let body: Record<string, FormDataEntryValue>;
  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      body = Object.fromEntries(
        new URLSearchParams(new TextDecoder().decode(rawBody)),
      );
    } else {
      const formRequest = new Request(request.url, {
        method: "POST",
        headers: { "content-type": contentType },
        body: rawBody,
      });
      body = Object.fromEntries(await formRequest.formData());
    }
  } catch {
    return jsonError(400, "Invalid payment notification.");
  }

  const parsed = sslCommerzNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Invalid payment notification.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  logPaymentEvent({
    event: "IPN_PARSED",
    trigger: "IPN",
    transactionId: parsed.data.tran_id,
    meta: { status: parsed.data.status },
  });

  try {
    const result = await processSslCommerzNotification(parsed.data);
    if (result.affectedProductIds.length > 0) {
      await invalidateProductsById(result.affectedProductIds, {
        reason: `payment ${result.status.toLowerCase()} stock restore: ${result.orderId}`,
      });
    }
    revalidateCacheTags(["admin-orders", "promo-codes"]);

    return ok({
      received: true,
      status: result.status,
      duplicate: result.duplicate,
      requiresReview: result.requiresReview,
    });
  } catch (error) {
    return handleServiceError("payments.sslcommerz.ipn.POST", error);
  }
}
