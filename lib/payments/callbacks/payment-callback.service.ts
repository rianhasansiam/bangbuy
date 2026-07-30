/**
 * Browser callback handler — UX signals + server-side verification trigger.
 *
 * Moved from lib/payments/callback.ts during the payment module
 * restructuring. Callbacks never directly mutate payment state.
 *
 * The success callback now triggers the shared authoritative verification
 * pipeline server-side. If verification succeeds, the payment transitions
 * to PAID before the redirect. If verification fails for any reason
 * (timeout, network, provider unavailability), the callback still
 * redirects the user — IPN or reconciliation will finalize later.
 *
 * Security invariant: the callback itself is NEVER proof of payment.
 * Payment authority comes exclusively from the server-to-server
 * SSLCommerz verification inside `verifyAndFinalizePayment`.
 */

import "server-only";

import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { toAppSession } from "@/lib/auth/session";
import { invalidateProductsById } from "@/lib/cache/catalog-invalidation";
import { revalidateCacheTags } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/db/prisma";
import { absoluteUrl } from "@/lib/seo/site";

import { logPaymentEvent } from "../core/payment-logger";
import { verifyAndFinalizePayment } from "../core/payment-verification.service";

type CallbackOutcome = "processing" | "failed" | "cancelled";

const MAX_CALLBACK_BYTES = 64 * 1024;

// ── Payload Parsing ────────────────────────────────────────────────────

interface CallbackPayload {
  transactionId: string | null;
  validationId: string | null;
  status: string | null;
}

function sanitizeField(
  value: FormDataEntryValue | string | null | undefined,
  maxLength: number,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : null;
}

async function readCallbackPayload(request: Request): Promise<CallbackPayload> {
  const empty: CallbackPayload = {
    transactionId: null,
    validationId: null,
    status: null,
  };

  // Try query string first
  const url = new URL(request.url);
  const queryTranId = sanitizeField(url.searchParams.get("tran_id"), 30);
  const queryValId = sanitizeField(url.searchParams.get("val_id"), 50);
  const queryStatus = sanitizeField(url.searchParams.get("status"), 20);
  if (queryTranId) {
    return {
      transactionId: queryTranId,
      validationId: queryValId,
      status: queryStatus,
    };
  }

  if (request.method !== "POST") return empty;

  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_CALLBACK_BYTES) return empty;

  try {
    const rawBody = await request.arrayBuffer();
    if (rawBody.byteLength > MAX_CALLBACK_BYTES) return empty;

    const contentType =
      request.headers.get("content-type")?.toLowerCase() ?? "";

    let entries: URLSearchParams | FormData;
    if (contentType.includes("application/x-www-form-urlencoded")) {
      entries = new URLSearchParams(new TextDecoder().decode(rawBody));
    } else if (contentType.includes("multipart/form-data")) {
      const formRequest = new Request(request.url, {
        method: "POST",
        headers: { "content-type": contentType },
        body: rawBody,
      });
      entries = await formRequest.formData();
    } else {
      return empty;
    }

    return {
      transactionId: sanitizeField(entries.get("tran_id"), 30),
      validationId: sanitizeField(entries.get("val_id"), 50),
      status: sanitizeField(entries.get("status"), 20),
    };
  } catch {
    return empty;
  }
}

// ── Redirect Helpers ───────────────────────────────────────────────────

function redirectTo(path: string) {
  return NextResponse.redirect(absoluteUrl(path), 303);
}

// ── Callback Verification ──────────────────────────────────────────────

/**
 * Attempt server-side verification for a success callback.
 *
 * This is a best-effort trigger — if verification fails for any
 * transient reason (timeout, network, provider busy), we swallow
 * the error gracefully and let IPN/reconciliation finish it.
 *
 * Security failures (amount mismatch, unknown transaction) are
 * logged but also swallowed — the callback must always redirect.
 */
async function attemptCallbackVerification(
  transactionId: string,
  validationId: string | null,
): Promise<void> {
  logPaymentEvent({
    event: "CALLBACK_VERIFICATION_STARTED",
    trigger: "CALLBACK",
    transactionId,
  });

  try {
    const result = await verifyAndFinalizePayment({
      trigger: "CALLBACK",
      transactionId,
      validationId: validationId || undefined,
    });

    if (result.affectedProductIds.length > 0) {
      await invalidateProductsById(result.affectedProductIds, {
        reason: `callback verification stock restore: ${result.orderId}`,
      });
    }
    if (!result.duplicate) {
      revalidateCacheTags(["admin-orders", "promo-codes"]);
    }

    logPaymentEvent({
      event: result.duplicate
        ? "CALLBACK_VERIFICATION_SKIPPED"
        : result.status === "SUCCESS"
          ? "CALLBACK_VERIFICATION_SUCCEEDED"
          : "CALLBACK_VERIFICATION_PENDING",
      trigger: "CALLBACK",
      transactionId,
      orderId: result.orderId,
      paymentId: result.paymentId,
      targetStatus: result.status,
      duplicate: result.duplicate,
    });
  } catch (error) {
    // All failures are non-fatal for callbacks — the user must be redirected.
    // IPN or reconciliation will finalize the payment later.
    logPaymentEvent({
      event: "CALLBACK_VERIFICATION_FAILED",
      trigger: "CALLBACK",
      transactionId,
      error: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
}

// ── Public Handler ─────────────────────────────────────────────────────

/**
 * Browser callbacks handle UX routing and, for success callbacks,
 * trigger server-side payment verification. A callback may reveal
 * an order route only after an owner-scoped lookup against the
 * authenticated session.
 *
 * The callback itself is NEVER treated as proof of payment.
 */
export async function handleSslCommerzBrowserCallback(
  request: Request,
  outcome: CallbackOutcome,
) {
  const payload = await readCallbackPayload(request);

  logPaymentEvent({
    event: "CALLBACK_RECEIVED",
    trigger: "CALLBACK",
    transactionId: payload.transactionId ?? undefined,
    meta: {
      outcome,
      providerStatus: payload.status,
      hasValId: !!payload.validationId,
    },
  });

  const session = toAppSession((await auth()) as Session | null);

  if (!session) {
    if (payload.transactionId && request.method === "POST") {
      // SSLCommerz POSTs cross-site, so the browser strips SameSite=Lax
      // session cookies. 303-redirect to a GET on our own origin so the
      // browser re-attaches the auth cookie on the follow-up request.
      const selfUrl = new URL(request.url);
      selfUrl.searchParams.set("tran_id", payload.transactionId);
      if (payload.validationId) {
        selfUrl.searchParams.set("val_id", payload.validationId);
      }
      if (payload.status) {
        selfUrl.searchParams.set("status", payload.status);
      }
      return NextResponse.redirect(selfUrl, 303);
    }
    const callbackUrl = `/profile?tab=orders&payment=${outcome}`;
    return redirectTo(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (!payload.transactionId) {
    return redirectTo(`/profile?tab=orders&payment=${outcome}`);
  }

  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      provider: "SSLCOMMERZ",
      transactionId: payload.transactionId,
      order: { userId: session.user.id },
    },
    select: { orderId: true },
  });

  if (!payment) {
    return redirectTo("/profile?tab=orders&payment=unknown");
  }

  // Only the authenticated owner can use a browser callback to trigger
  // verification. The callback is still not payment proof: the shared
  // pipeline must independently confirm the transaction with SSLCommerz.
  if (outcome === "processing") {
    await attemptCallbackVerification(
      payload.transactionId,
      payload.validationId,
    );
  }

  const query =
    outcome === "processing"
      ? `just-placed=1&payment=${outcome}`
      : `payment=${outcome}`;
  return redirectTo(`/orders/${payment.orderId}?${query}`);
}
