/**
 * Payment reconciliation service.
 *
 * Bounded recovery worker for lost IPNs and ambiguous session creation.
 * A scheduler calls the authenticated route; each candidate is re-queried
 * server-to-server before any provider-driven state transition.
 */

import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  lockOrderForStatusChange,
  lockPaymentAttempt,
  recordStatusHistory,
  releasePromotionUsage,
  restoreStockForItems,
} from "@/lib/orders/mutations";
import {
  SslCommerzGatewayResponseError,
  SslCommerzNetworkError,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";
import { logPaymentEvent } from "../core/payment-logger";

import {
  PROVIDER,
  RECONCILIATION_BATCH_SIZE,
  RECONCILIATION_STALE_MS,
  UNUSABLE_SESSION_GRACE_MS,
} from "../core/payment.constants";
import { PaymentError } from "../core/payment.errors";
import type {
  ProcessedPaymentNotification,
  ReconciliationCandidate,
  ReconciledAttempt,
  SslCommerzReconciliationSummary,
} from "../core/payment.types";
import {
  verifyAndFinalizePayment,
} from "../core/payment-verification.service";

// ── Helpers ────────────────────────────────────────────────────────────

async function expireStaleReservation(
  candidate: ReconciliationCandidate,
  reason: "NO_PROVIDER_TRANSACTION" | "UNUSABLE_SESSION",
  now: Date,
): Promise<ReconciledAttempt> {
  const result = await prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, candidate.orderId);
    await lockPaymentAttempt(tx, candidate.id);

    const payment = await tx.paymentTransaction.findUnique({
      where: { id: candidate.id },
      include: { order: { include: { items: true } } },
    });
    if (!payment || payment.provider !== PROVIDER) {
      throw new PaymentError(404, "Payment attempt not found.");
    }
    if (payment.status !== "PENDING") {
      const status: ProcessedPaymentNotification["status"] =
        payment.status === "SUCCESS"
          ? "SUCCESS"
          : payment.status === "REFUNDED"
            ? "REFUNDED"
          : payment.status === "FAILED"
            ? "FAILED"
            : payment.status === "EXPIRED"
              ? "EXPIRED"
              : "CANCELLED";
      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        status,
        duplicate: true,
        requiresReview: payment.requiresReview,
        affectedProductIds: [],
        resolution: "PROVIDER" as const,
      };
    }

    // Candidate selection happens before either row lock. Gateway-session
    // persistence uses the same order -> payment lock order, so this fresh
    // row is authoritative. A URL may already have been returned to the
    // customer and therefore makes local expiry unsafe.
    if (payment.gatewayUrl) {
      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        status: "PENDING" as const,
        duplicate: false,
        requiresReview: payment.requiresReview,
        affectedProductIds: [],
        resolution: "STILL_PENDING" as const,
      };
    }

    const otherSuccess = await tx.paymentTransaction.findFirst({
      where: {
        orderId: payment.orderId,
        provider: PROVIDER,
        status: "SUCCESS",
        id: { not: payment.id },
      },
      select: { id: true },
    });
    const canRelease = payment.order.status === "PENDING" && !otherSuccess;
    const affectedProductIds = canRelease
      ? payment.order.items.flatMap((item) =>
          item.productId ? [item.productId] : [],
        )
      : [];
    const requiresReview =
      Boolean(otherSuccess) ||
      !["PENDING", "CANCELLED"].includes(payment.order.status);

    await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: "EXPIRED",
        requiresReview,
        reviewReason: requiresReview
          ? otherSuccess
            ? "MULTIPLE_SUCCESSFUL_PAYMENTS"
            : "LOCAL_EXPIRY_ORDER_STATE_CONFLICT"
          : null,
        ...(requiresReview
          ? {
              reviewResolvedAt: null,
              reviewResolvedBy: null,
              reviewResolution: null,
              reviewResolutionReference: null,
            }
          : {}),
        rawResponse: {
          reconciliation: "LOCALLY_EXPIRED",
          reason,
          checkedAt: now.toISOString(),
        },
      },
    });

    if (canRelease) {
      await restoreStockForItems(
        tx,
        payment.order.items,
        payment.order.orderNumber,
      );
      await releasePromotionUsage(tx, payment.order.id);
      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      await recordStatusHistory(tx, payment.order.id, "CANCELLED", {
        note: "Online payment reservation expired after reconciliation.",
      });
    }

    return {
      orderId: payment.orderId,
      paymentId: payment.id,
      status: "EXPIRED" as const,
      duplicate: false,
      requiresReview,
      affectedProductIds,
      resolution: "LOCAL_EXPIRY" as const,
    };
  });

  return result;
}

async function touchPendingReconciliation(
  candidate: ReconciliationCandidate,
  state: "NOT_FOUND" | "PENDING" | "ERROR",
  now: Date,
  raw?: object,
) {
  await prisma.paymentTransaction.updateMany({
    where: {
      id: candidate.id,
      provider: PROVIDER,
      status: "PENDING",
    },
    data: {
      rawResponse: {
        reconciliation: state,
        checkedAt: now.toISOString(),
        ...(raw ? { provider: raw as Prisma.InputJsonObject } : {}),
      },
    },
  });
}

// ── Single-Attempt Reconciliation ──────────────────────────────────────

export async function reconcilePaymentAttempt(
  candidate: ReconciliationCandidate,
  now: Date,
): Promise<ReconciledAttempt> {
  if (!candidate.transactionId) {
    throw new PaymentError(500, "Payment transaction ID is missing.");
  }

  logPaymentEvent({
    event: "RECONCILIATION_STARTED",
    trigger: "RECONCILIATION",
    orderId: candidate.orderId,
    paymentId: candidate.id,
    transactionId: candidate.transactionId,
  });

  const ageMs = Math.max(0, now.getTime() - candidate.createdAt.getTime());
  let processed: ProcessedPaymentNotification;
  try {
    processed = await verifyAndFinalizePayment({
      trigger: "RECONCILIATION",
      transactionId: candidate.transactionId,
    });
  } catch (error) {
    if (
      error instanceof SslCommerzGatewayResponseError &&
      error.reason === "TRANSACTION_NOT_FOUND"
    ) {
      if (
        !candidate.gatewayUrl &&
        ageMs >= UNUSABLE_SESSION_GRACE_MS
      ) {
        return expireStaleReservation(
          candidate,
          "NO_PROVIDER_TRANSACTION",
          now,
        );
      }
      await touchPendingReconciliation(candidate, "NOT_FOUND", now);
      return {
        orderId: candidate.orderId,
        paymentId: candidate.id,
        status: "PENDING",
        duplicate: false,
        requiresReview: false,
        affectedProductIds: [],
        resolution: "STILL_PENDING",
      };
    }
    throw error;
  }

  logPaymentEvent({
    event: "RECONCILIATION_VERIFIED",
    trigger: "RECONCILIATION",
    orderId: candidate.orderId,
    paymentId: candidate.id,
    transactionId: candidate.transactionId,
    targetStatus: processed.status,
    duplicate: processed.duplicate,
    requiresReview: processed.requiresReview,
  });
  if (
    processed.status === "PENDING" &&
    !candidate.gatewayUrl &&
    ageMs >= UNUSABLE_SESSION_GRACE_MS
  ) {
    return expireStaleReservation(
      candidate,
      "UNUSABLE_SESSION",
      now,
    );
  }

  if (processed.status === "PENDING") {
    await touchPendingReconciliation(candidate, "PENDING", now);
    return {
      ...processed,
      status: "PENDING",
      resolution: "STILL_PENDING",
    };
  }

  logPaymentEvent({
    event: "RECONCILIATION_COMMITTED",
    trigger: "RECONCILIATION",
    orderId: processed.orderId,
    paymentId: processed.paymentId,
    transactionId: candidate.transactionId,
    targetStatus: processed.status,
    duplicate: processed.duplicate,
    requiresReview: processed.requiresReview,
  });

  return { ...processed, resolution: "PROVIDER" };
}

// ── Batch Reconciliation ───────────────────────────────────────────────

/**
 * Bounded recovery worker for lost IPNs and ambiguous session creation.
 * A scheduler calls the authenticated route; each candidate is re-queried
 * server-to-server before any provider-driven state transition.
 */
export async function reconcileStaleSslCommerzPayments(
  now = new Date(),
): Promise<SslCommerzReconciliationSummary> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const password = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const live = process.env.SSLCOMMERZ_IS_LIVE;
  if (!storeId || !password || (live !== "true" && live !== "false")) {
    throw new PaymentError(
      503,
      "Online payment is temporarily unavailable. Please choose Cash on Delivery or try again later.",
    );
  }

  const candidates = await prisma.paymentTransaction.findMany({
    where: {
      provider: PROVIDER,
      status: "PENDING",
      updatedAt: {
        lte: new Date(now.getTime() - RECONCILIATION_STALE_MS),
      },
    },
    orderBy: { createdAt: "asc" },
    take: RECONCILIATION_BATCH_SIZE,
    select: {
      id: true,
      orderId: true,
      transactionId: true,
      amount: true,
      currency: true,
      createdAt: true,
      gatewayUrl: true,
    },
  });

  const outcomes = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        return await reconcilePaymentAttempt(candidate, now);
      } catch (error) {
        const category =
          error instanceof PaymentError
            ? `PAYMENT_${error.status}`
            : error instanceof SslCommerzGatewayResponseError
              ? error.reason
              : error instanceof SslCommerzNetworkError
                ? error.reason
                : "PROCESSING_ERROR";
        console.warn("[payments.sslcommerz] reconciliation failed", {
          orderId: candidate.orderId,
          paymentId: candidate.id,
          category,
        });
        try {
          if (!(error instanceof PaymentError && error.status < 500)) {
            await touchPendingReconciliation(
              candidate,
              "ERROR",
              now,
              { category },
            );
          }
        } catch {
          console.error(
            "[payments.sslcommerz] reconciliation retry state could not be saved",
            {
              orderId: candidate.orderId,
              paymentId: candidate.id,
              category: "PERSISTENCE_ERROR",
            },
          );
        }
        return null;
      }
    }),
  );

  const successful = outcomes.filter(
    (outcome): outcome is ReconciledAttempt => outcome !== null,
  );
  return {
    examined: candidates.length,
    confirmed: successful.filter(
      (outcome) => outcome.status === "SUCCESS",
    ).length,
    terminalized: successful.filter((outcome) =>
      ["FAILED", "CANCELLED", "EXPIRED", "REFUNDED"].includes(
        outcome.status,
      ),
    ).length,
    locallyExpired: successful.filter(
      (outcome) => outcome.resolution === "LOCAL_EXPIRY",
    ).length,
    stillPending: successful.filter(
      (outcome) => outcome.status === "PENDING",
    ).length,
    errors: outcomes.filter((outcome) => outcome === null).length,
    affectedProductIds: [
      ...new Set(
        successful.flatMap((outcome) => outcome.affectedProductIds),
      ),
    ],
  };
}
