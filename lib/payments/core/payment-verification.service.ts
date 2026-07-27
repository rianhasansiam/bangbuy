/**
 * Payment verification service.
 *
 * Server-to-server validation of SSLCommerz notifications. Normalizes
 * provider responses, verifies amounts/currencies against local records,
 * and delegates state transitions to the status service.
 *
 * Exposes `verifyAndFinalizePayment` as the single authoritative
 * verification pipeline shared by IPN, callback, and reconciliation.
 */

import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  querySslCommerzTransaction,
  validateSslCommerzPayment,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.service";
import {
  SslCommerzConfigurationError,
  SslCommerzGatewayResponseError,
  SslCommerzInputError,
  SslCommerzNetworkError,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";
import type {
  SslCommerzTransactionQueryResult,
  SslCommerzValidationResult,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";
import type { SslCommerzNotificationInput } from "@/lib/payments/validation/payment.schema";

import { PROVIDER } from "./payment.constants";
import { PaymentError } from "./payment.errors";
import { logPaymentEvent, type PaymentTrigger } from "./payment-logger";
import type {
  AuthoritativePayment,
  ProcessedPaymentNotification,
} from "./payment.types";
import { quarantineVerificationMismatch } from "./payment-risk.service";
import {
  applySuccessfulPayment,
  applyNonSuccessfulPayment,
  verifyAuthoritativePayment,
} from "./payment-status.service";

// ── Provider Response Normalization ────────────────────────────────────

export function normalizeValidatedPayment(
  result: SslCommerzValidationResult,
  metadata: { orderId: string | null; paymentRecordId: string | null } =
    result.metadata,
): AuthoritativePayment {
  return {
    kind: "SUCCESS",
    transactionId: result.transactionId,
    validationId: result.validationId,
    amount: result.currencyAmount ?? result.amount,
    currency: (result.currencyType ?? result.currency).toUpperCase(),
    bankTransactionId: result.bankTransactionId,
    cardType: result.cardType,
    riskLevel: result.riskLevel,
    paidAt: result.paidAt,
    raw: result.raw,
    metadata,
  };
}

export function mergeProviderMetadata(
  validated: SslCommerzValidationResult["metadata"],
  queried: SslCommerzTransactionQueryResult["metadata"],
) {
  if (
    validated.orderId &&
    queried.orderId &&
    validated.orderId !== queried.orderId
  ) {
    throw new PaymentError(422, "SSLCommerz order metadata does not match.");
  }
  if (
    validated.paymentRecordId &&
    queried.paymentRecordId &&
    validated.paymentRecordId !== queried.paymentRecordId
  ) {
    throw new PaymentError(
      422,
      "SSLCommerz payment metadata does not match.",
    );
  }
  return {
    orderId: validated.orderId ?? queried.orderId,
    paymentRecordId:
      validated.paymentRecordId ?? queried.paymentRecordId,
  };
}

export function normalizeQueriedPayment(
  result: SslCommerzTransactionQueryResult,
): AuthoritativePayment {
  const kind =
    result.status === "PENDING"
      ? "PENDING"
      : result.status === "FAILED"
        ? "FAILED"
        : result.status === "EXPIRED"
          ? "EXPIRED"
          : "CANCELLED";

  return {
    kind,
    transactionId: result.transactionId,
    validationId: result.validationId,
    amount: result.currencyAmount ?? result.amount,
    currency: (result.currencyType ?? result.currency)?.toUpperCase() ?? null,
    bankTransactionId: result.bankTransactionId,
    cardType: result.cardType,
    riskLevel: result.riskLevel,
    paidAt: result.transactionDate,
    raw: result.raw,
    metadata: result.metadata,
  };
}

// ── Server-to-Server Query ─────────────────────────────────────────────

export async function queryAuthoritativePayment(
  transactionId: string,
  fallbackValidationId = "",
): Promise<AuthoritativePayment> {
  const queried = await querySslCommerzTransaction(transactionId);
  if (queried.status === "VALID" || queried.status === "VALIDATED") {
    const validationId = queried.validationId ?? fallbackValidationId;
    const validated = await validateSslCommerzPayment(validationId);
    return normalizeValidatedPayment(
      validated,
      mergeProviderMetadata(validated.metadata, queried.metadata),
    );
  }
  return normalizeQueriedPayment(queried);
}

export function mapProviderValidationError(error: unknown): never {
  if (
    error instanceof SslCommerzNetworkError ||
    error instanceof SslCommerzConfigurationError ||
    (error instanceof SslCommerzGatewayResponseError &&
      error.reason !== "PAYMENT_NOT_VALID")
  ) {
    throw new PaymentError(
      503,
      "Payment validation is temporarily unavailable. SSLCommerz should retry the notification.",
    );
  }
  if (
    error instanceof SslCommerzGatewayResponseError ||
    error instanceof SslCommerzInputError
  ) {
    throw new PaymentError(422, "SSLCommerz payment validation failed.");
  }
  throw error;
}

// ── Shared Authoritative Verification Pipeline ─────────────────────────

/**
 * Quarantine reason per trigger source. Each trigger gets a distinct
 * review reason so operators can identify the source of anomalies.
 */
function quarantineReasonForTrigger(
  trigger: PaymentTrigger,
): "IPN_VALIDATION_MISMATCH" | "CALLBACK_VALIDATION_MISMATCH" | "RECONCILIATION_MISMATCH" {
  switch (trigger) {
    case "IPN":
      return "IPN_VALIDATION_MISMATCH";
    case "CALLBACK":
      return "CALLBACK_VALIDATION_MISMATCH";
    case "RECONCILIATION":
      return "RECONCILIATION_MISMATCH";
  }
}

/**
 * Single authoritative verification pipeline shared by IPN, callback,
 * and reconciliation. Locates the known payment attempt, queries
 * SSLCommerz server-to-server, verifies transaction/amount/currency,
 * runs risk assessment, and applies the state transition atomically.
 *
 * Idempotent: if the payment is already in a terminal state, returns
 * a duplicate/no-op result without re-mutating.
 */
export async function verifyAndFinalizePayment({
  trigger,
  transactionId,
  validationId,
}: {
  trigger: PaymentTrigger;
  transactionId: string;
  validationId?: string;
}): Promise<ProcessedPaymentNotification> {
  logPaymentEvent({
    event: "VERIFICATION_STARTED",
    trigger,
    transactionId,
    provider: PROVIDER,
  });

  // 1. Locate payment transaction
  const candidate = await prisma.paymentTransaction.findUnique({
    where: {
      provider_transactionId: {
        provider: PROVIDER,
        transactionId,
      },
    },
    select: {
      id: true,
      orderId: true,
      transactionId: true,
      amount: true,
      currency: true,
      status: true,
      validationId: true,
      requiresReview: true,
    },
  });
  if (!candidate) {
    logPaymentEvent({
      event: "VERIFICATION_FAILED",
      trigger,
      transactionId,
      error: "UNKNOWN_TRANSACTION",
    });
    throw new PaymentError(404, "Payment attempt not found.");
  }

  if (trigger === "IPN") {
    logPaymentEvent({
      event: "IPN_PAYMENT_FOUND",
      trigger,
      orderId: candidate.orderId,
      paymentId: candidate.id,
      transactionId,
      currentStatus: candidate.status,
    });
  } else if (trigger === "RECONCILIATION") {
    logPaymentEvent({
      event: "RECONCILIATION_PAYMENT_FOUND",
      trigger,
      orderId: candidate.orderId,
      paymentId: candidate.id,
      transactionId,
      currentStatus: candidate.status,
    });
  }

  // 2. Idempotent early return for already-finalized payments
  if (
    candidate.status === "SUCCESS" &&
    candidate.validationId === (validationId || candidate.validationId)
  ) {
    logPaymentEvent({
      event: "VERIFICATION_IDEMPOTENT",
      trigger,
      orderId: candidate.orderId,
      paymentId: candidate.id,
      transactionId,
      currentStatus: candidate.status,
    });
    return {
      orderId: candidate.orderId,
      paymentId: candidate.id,
      status: "SUCCESS",
      duplicate: true,
      requiresReview: candidate.requiresReview,
      affectedProductIds: [],
    };
  }

  // 3. Query SSLCommerz server-to-server
  logPaymentEvent({
    event: "VERIFICATION_PROVIDER_CALLED",
    trigger,
    orderId: candidate.orderId,
    paymentId: candidate.id,
    transactionId,
  });

  let authoritative: AuthoritativePayment;
  try {
    if (validationId) {
      // Use val_id validation API when available (fastest path)
      try {
        authoritative = normalizeValidatedPayment(
          await validateSslCommerzPayment(validationId),
        );
      } catch (error) {
        // A rejected or malformed callback val_id is untrusted input. Query
        // the known transaction instead. Provider outages remain retryable
        // and are not hidden behind a second call to the same service.
        const canQueryByTransaction =
          error instanceof SslCommerzInputError ||
          (error instanceof SslCommerzGatewayResponseError &&
            error.reason === "PAYMENT_NOT_VALID");
        if (!canQueryByTransaction) throw error;
        authoritative = await queryAuthoritativePayment(
          transactionId,
          validationId,
        );
      }
    } else {
      // No val_id available — use transaction query
      authoritative = await queryAuthoritativePayment(transactionId);
    }
  } catch (error) {
    logPaymentEvent({
      event: "VERIFICATION_FAILED",
      trigger,
      orderId: candidate.orderId,
      paymentId: candidate.id,
      transactionId,
      error: error instanceof Error ? error.message : "UNKNOWN",
    });
    throw error;
  }

  // 4. Verify transaction/amount/currency
  try {
    verifyAuthoritativePayment(candidate, authoritative);
  } catch (error) {
    if (error instanceof PaymentError && error.status < 500) {
      await quarantineVerificationMismatch(
        candidate,
        quarantineReasonForTrigger(trigger),
      );
    }
    logPaymentEvent({
      event: "VERIFICATION_FAILED",
      trigger,
      orderId: candidate.orderId,
      paymentId: candidate.id,
      transactionId,
      error: error instanceof Error ? error.message : "VERIFICATION_MISMATCH",
    });
    throw error;
  }

  logPaymentEvent({
    event: "PAYMENT_TRANSACTION_VERIFIED",
    trigger,
    orderId: candidate.orderId,
    paymentId: candidate.id,
    transactionId,
    meta: { kind: authoritative.kind },
  });
  if (authoritative.amount) {
    logPaymentEvent({
      event: "PAYMENT_AMOUNT_VERIFIED",
      trigger,
      orderId: candidate.orderId,
      paymentId: candidate.id,
      transactionId,
    });
  }
  if (authoritative.currency) {
    logPaymentEvent({
      event: "PAYMENT_CURRENCY_VERIFIED",
      trigger,
      orderId: candidate.orderId,
      paymentId: candidate.id,
      transactionId,
    });
  }

  // 5. Apply the state transition
  const result: ProcessedPaymentNotification =
    authoritative.kind === "SUCCESS"
      ? await applySuccessfulPayment(candidate, authoritative)
      : await applyNonSuccessfulPayment(candidate, authoritative);

  logPaymentEvent({
    event: result.duplicate ? "VERIFICATION_IDEMPOTENT" : "VERIFICATION_SUCCEEDED",
    trigger,
    orderId: result.orderId,
    paymentId: result.paymentId,
    transactionId,
    targetStatus: result.status,
    duplicate: result.duplicate,
    requiresReview: result.requiresReview,
  });

  if (result.requiresReview) {
    logPaymentEvent({
      event: "PAYMENT_RISK_REVIEW_REQUIRED",
      trigger,
      orderId: result.orderId,
      paymentId: result.paymentId,
      transactionId,
    });
  } else if (result.status === "SUCCESS") {
    logPaymentEvent({
      event: "PAYMENT_RISK_ACCEPTED",
      trigger,
      orderId: result.orderId,
      paymentId: result.paymentId,
      transactionId,
    });
  }

  if (result.status !== "PENDING" && !result.duplicate) {
    logPaymentEvent({
      event: "PAYMENT_STATUS_COMMITTED",
      trigger,
      orderId: result.orderId,
      paymentId: result.paymentId,
      transactionId,
      targetStatus: result.status === "SUCCESS" ? "PAID" : result.status,
    });
  }

  return result;
}

// ── IPN Processing ─────────────────────────────────────────────────────

/**
 * IPN authority: locate the known attempt, call SSLCommerz server-to-server,
 * verify transaction/amount/currency, then apply one row-locked transition.
 *
 * Delegates to the shared `verifyAndFinalizePayment` pipeline.
 */
export async function processSslCommerzNotification(
  input: SslCommerzNotificationInput,
): Promise<ProcessedPaymentNotification> {
  try {
    logPaymentEvent({
      event: "IPN_VALIDATION_STARTED",
      trigger: "IPN",
      transactionId: input.tran_id,
    });

    const result = await verifyAndFinalizePayment({
      trigger: "IPN",
      transactionId: input.tran_id,
      validationId:
        input.status === "VALID" || input.status === "VALIDATED"
          ? input.val_id
          : undefined,
    });

    logPaymentEvent({
      event: "IPN_VALIDATION_SUCCEEDED",
      trigger: "IPN",
      orderId: result.orderId,
      paymentId: result.paymentId,
      transactionId: input.tran_id,
      targetStatus: result.status,
      duplicate: result.duplicate,
      requiresReview: result.requiresReview,
    });

    console.info("[payments.sslcommerz] notification processed", {
      orderId: result.orderId,
      paymentId: result.paymentId,
      status: result.status,
      duplicate: result.duplicate,
      requiresReview: result.requiresReview,
    });
    return result;
  } catch (error) {
    logPaymentEvent({
      event: "IPN_VALIDATION_FAILED",
      trigger: "IPN",
      transactionId: input.tran_id,
      error: error instanceof Error ? error.message : "PROCESSING_ERROR",
    });

    console.warn("[payments.sslcommerz] notification rejected", {
      category:
        error instanceof PaymentError
          ? `PAYMENT_${error.status}`
          : error instanceof SslCommerzGatewayResponseError
            ? error.reason
            : "PROCESSING_ERROR",
    });
    mapProviderValidationError(error);
  }
}
