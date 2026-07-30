/**
 * Payment state transitions.
 *
 * Row-locked transitions that apply an authoritative provider verdict
 * (success, failure, expiry, cancellation) to a payment attempt and its
 * parent order. Risk assessment and duplicate detection are embedded.
 */

import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { toDecimal } from "@/lib/money";
import {
  lockOrderForStatusChange,
  lockPaymentAttempt,
  recordStatusHistory,
  releasePromotionUsage,
  restoreStockForItems,
} from "@/lib/orders/mutations";

import { PROVIDER } from "./payment.constants";
import { PaymentError } from "./payment.errors";
import type {
  AuthoritativePayment,
  ProcessedPaymentNotification,
} from "./payment.types";

// ── Helpers ────────────────────────────────────────────────────────────

export function parseGatewayDate(value: string | null): Date | null {
  if (!value) return null;
  const isoLike = value.includes("T")
    ? value
    : `${value.replace(" ", "T")}+06:00`;
  const parsed = new Date(isoLike);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function reviewedValidationId(raw: Prisma.JsonValue | null): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = (raw as Record<string, Prisma.JsonValue>)[
    "additionalValidationId"
  ];
  return typeof value === "string" ? value : null;
}

export function verifyAuthoritativePayment(
  payment: {
    id: string;
    orderId: string;
    transactionId: string | null;
    amount: Prisma.Decimal;
    currency: string;
  },
  authoritative: AuthoritativePayment,
) {
  if (
    !payment.transactionId ||
    authoritative.transactionId !== payment.transactionId
  ) {
    throw new PaymentError(422, "Validated transaction ID does not match.");
  }
  if (
    authoritative.metadata.orderId &&
    authoritative.metadata.orderId !== payment.orderId
  ) {
    throw new PaymentError(422, "Validated payment order does not match.");
  }
  if (
    authoritative.metadata.paymentRecordId &&
    authoritative.metadata.paymentRecordId !== payment.id
  ) {
    throw new PaymentError(422, "Validated payment attempt does not match.");
  }

  if (
    authoritative.amount &&
    !toDecimal(authoritative.amount).equals(toDecimal(payment.amount))
  ) {
    throw new PaymentError(422, "Validated payment amount does not match.");
  }
  if (
    authoritative.currency &&
    authoritative.currency.toUpperCase() !== payment.currency.toUpperCase()
  ) {
    throw new PaymentError(422, "Validated payment currency does not match.");
  }
  if (
    authoritative.kind === "SUCCESS" &&
    (!authoritative.amount || !authoritative.currency)
  ) {
    throw new PaymentError(422, "Validated payment totals are incomplete.");
  }
}

// ── State Transitions ──────────────────────────────────────────────────

export async function applySuccessfulPayment(
  candidate: {
    id: string;
    orderId: string;
    transactionId: string | null;
    amount: Prisma.Decimal;
    currency: string;
  },
  authoritative: Extract<AuthoritativePayment, { kind: "SUCCESS" }>,
): Promise<ProcessedPaymentNotification> {
  return prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, candidate.orderId);
    await lockPaymentAttempt(tx, candidate.id);

    const payment = await tx.paymentTransaction.findUnique({
      where: { id: candidate.id },
      include: { order: { include: { items: true } } },
    });
    if (!payment || payment.provider !== PROVIDER) {
      throw new PaymentError(404, "Payment attempt not found.");
    }

    verifyAuthoritativePayment(payment, authoritative);

    if (payment.status === "REFUNDED") {
      const sameRefundedValidation =
        payment.validationId === authoritative.validationId ||
        reviewedValidationId(payment.rawResponse) ===
          authoritative.validationId;
      if (!sameRefundedValidation) {
        await tx.paymentTransaction.update({
          where: { id: payment.id },
          data: {
            requiresReview: true,
            reviewReason: "DISTINCT_VALIDATED_PAYMENT_AFTER_REFUND",
            rawResponse: {
              reviewReason: "DISTINCT_VALIDATED_PAYMENT_AFTER_REFUND",
              primaryValidationId: payment.validationId ?? "UNKNOWN",
              additionalValidationId: authoritative.validationId,
              additionalValidatedPayment:
                authoritative.raw as Prisma.InputJsonObject,
              ...(payment.rawResponse === null
                ? {}
                : {
                    refundedPaymentEvidence:
                      payment.rawResponse as Prisma.InputJsonValue,
                  }),
            },
          },
        });
      }
      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        status: "REFUNDED",
        duplicate: sameRefundedValidation,
        requiresReview: payment.requiresReview || !sameRefundedValidation,
        affectedProductIds: [],
      };
    }

    if (payment.status === "SUCCESS") {
      const samePrimaryValidation =
        payment.validationId === authoritative.validationId;
      const sameReviewedValidation =
        reviewedValidationId(payment.rawResponse) ===
        authoritative.validationId;
      if (!samePrimaryValidation && !sameReviewedValidation) {
        const reviewEvidence: Prisma.InputJsonObject = {
          reviewReason: "DISTINCT_VALIDATED_PAYMENT",
          primaryValidationId: payment.validationId ?? "UNKNOWN",
          additionalValidationId: authoritative.validationId,
          additionalValidatedPayment:
            authoritative.raw as Prisma.InputJsonObject,
          ...(payment.rawResponse === null
            ? {}
            : {
                primaryValidatedPayment:
                  payment.rawResponse as Prisma.InputJsonValue,
              }),
        };
        await tx.paymentTransaction.update({
          where: { id: payment.id },
          data: {
            requiresReview: true,
            reviewReason: "DISTINCT_VALIDATED_PAYMENT",
            reviewResolvedAt: null,
            reviewResolvedBy: null,
            reviewResolution: null,
            reviewResolutionReference: null,
            rawResponse: reviewEvidence,
          },
        });
        return {
          orderId: payment.orderId,
          paymentId: payment.id,
          status: "SUCCESS",
          duplicate: false,
          requiresReview: true,
          affectedProductIds: [],
        };
      }

      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        status: "SUCCESS",
        duplicate: true,
        requiresReview: payment.requiresReview,
        affectedProductIds: [],
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
    const reviewReasons: string[] = [];
    if (authoritative.riskLevel === null) {
      reviewReasons.push("RISK_LEVEL_MISSING");
    } else if (authoritative.riskLevel !== 0) {
      reviewReasons.push("PROVIDER_RISK");
    }
    if (otherSuccess) {
      reviewReasons.push("MULTIPLE_SUCCESSFUL_PAYMENTS");
    }
    if (!["PENDING", "PAYMENT_CONFIRMED"].includes(payment.order.status)) {
      reviewReasons.push("LATE_SUCCESS_AFTER_ORDER_STATE");
    }
    const reviewReason =
      reviewReasons.length > 0 ? reviewReasons.join(",") : null;
    const requiresReview = reviewReason !== null;
    const confirmable =
      payment.order.status === "PENDING" && !requiresReview;

    await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        validationId: authoritative.validationId,
        bankTransactionId: authoritative.bankTransactionId,
        cardType: authoritative.cardType,
        riskLevel: authoritative.riskLevel,
        paidAt: parseGatewayDate(authoritative.paidAt) ?? new Date(),
        requiresReview,
        reviewReason,
        reviewResolvedAt: null,
        reviewResolvedBy: null,
        reviewResolution: null,
        reviewResolutionReference: null,
        rawResponse: authoritative.raw as Prisma.InputJsonObject,
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: "PAID",
        ...(confirmable ? { status: "PAYMENT_CONFIRMED" as const } : {}),
      },
    });
    if (confirmable) {
      await recordStatusHistory(tx, payment.orderId, "PAYMENT_CONFIRMED", {
        note: "Payment verified server-to-server by SSLCommerz.",
      });
    }

    return {
      orderId: payment.orderId,
      paymentId: payment.id,
      status: "SUCCESS",
      duplicate: false,
      requiresReview,
      affectedProductIds: [],
    };
  });
}

export async function applyNonSuccessfulPayment(
  candidate: {
    id: string;
    orderId: string;
    transactionId: string | null;
    amount: Prisma.Decimal;
    currency: string;
  },
  authoritative: Exclude<AuthoritativePayment, { kind: "SUCCESS" }>,
): Promise<ProcessedPaymentNotification> {
  if (authoritative.kind === "PENDING") {
    return {
      orderId: candidate.orderId,
      paymentId: candidate.id,
      status: "PENDING",
      duplicate: false,
      requiresReview: false,
      affectedProductIds: [],
    };
  }

  return prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, candidate.orderId);
    await lockPaymentAttempt(tx, candidate.id);

    const payment = await tx.paymentTransaction.findUnique({
      where: { id: candidate.id },
      include: { order: { include: { items: true } } },
    });
    if (!payment || payment.provider !== PROVIDER) {
      throw new PaymentError(404, "Payment attempt not found.");
    }
    if (payment.status === "REFUNDED") {
      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        status: "REFUNDED",
        duplicate: true,
        requiresReview: payment.requiresReview,
        affectedProductIds: [],
      };
    }
    if (payment.status === "SUCCESS") {
      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        status: "SUCCESS",
        duplicate: true,
        requiresReview: payment.requiresReview,
        affectedProductIds: [],
      };
    }

    verifyAuthoritativePayment(payment, authoritative);
    const nextStatus =
      authoritative.kind === "FAILED"
        ? "FAILED"
        : authoritative.kind === "EXPIRED"
          ? "EXPIRED"
          : "CANCELLED";
    const isDuplicate =
      payment.status === nextStatus && payment.order.status === "CANCELLED";
    if (isDuplicate) {
      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        status: nextStatus,
        duplicate: true,
        requiresReview: false,
        affectedProductIds: [],
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

    await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        validationId: authoritative.validationId,
        bankTransactionId: authoritative.bankTransactionId,
        cardType: authoritative.cardType,
        riskLevel: authoritative.riskLevel,
        rawResponse: authoritative.raw as Prisma.InputJsonObject,
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
        note: `SSLCommerz payment ${authoritative.kind.toLowerCase()}.`,
      });
    }

    return {
      orderId: payment.orderId,
      paymentId: payment.id,
      status: nextStatus,
      duplicate: false,
      requiresReview: Boolean(otherSuccess),
      affectedProductIds,
    };
  });
}
