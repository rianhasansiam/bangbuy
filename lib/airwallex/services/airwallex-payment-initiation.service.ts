import "server-only";

import {
  Prisma,
  type PaymentTransactionStatus,
} from "@/app/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

import { prisma } from "@/lib/db/prisma";
import { toDecimal } from "@/lib/money";
import {
  lockOrderForStatusChange,
  lockPaymentAttempt,
} from "@/lib/orders/mutations";

import {
  buildAirwallexReturnUrls,
  requireAirwallexConfig,
} from "../config/airwallex.config";
import { AIRWALLEX_CLIENT_SECRET_LIFETIME_MS } from "../constants/airwallex.constants";
import {
  AirwallexError,
  AirwallexPaymentAlreadyProcessedError,
  AirwallexStateTransitionError,
  AirwallexValidationError,
} from "../errors/airwallex.errors";
import {
  airwallexInitiationOrderInclude,
  appendAirwallexTransition,
  createAirwallexAttempt,
  findOwnerScopedAirwallexOrder,
} from "../repositories/airwallex-payment.repository";
import {
  logAirwallexEvent,
  sanitizeAirwallexCode,
} from "../security/airwallex-redaction";
import { createAirwallexRequestId } from "../security/airwallex-idempotency";
import type {
  AirwallexHostedPaymentPageConfig,
  AirwallexPaymentIntentRetrieveResponse,
} from "../types/airwallex.types";
import {
  cancelAirwallexPaymentIntent,
  createAirwallexPaymentIntent,
  retrieveAirwallexPaymentIntent,
} from "./airwallex-payment-intent.service";
import {
  isLegalAirwallexTransition,
  mapAirwallexPaymentStatus,
} from "./airwallex-payment-status.service";
import {
  amountMatchesAirwallex,
  applyAuthoritativeAirwallexPayment,
  toAirwallexAuthoritativePayment,
  verifyPersistedAirwallexOrderSnapshot,
} from "./airwallex-payment-verification.service";
import {
  safeAirwallexReviewMessage,
  type AirwallexReviewReason,
} from "./airwallex-risk.service";
import {
  convertBdtToUsd,
  requiresCurrencyConversion,
  AIRWALLEX_SETTLEMENT_CURRENCY,
} from "./airwallex-currency.service";

const CLIENT_SECRET_REFRESH_SKEW_MS = 5 * 60_000;
const REDIRECTABLE_PROVIDER_STATUSES = new Set([
  "REQUIRES_PAYMENT_METHOD",
  "REQUIRES_CUSTOMER_ACTION",
]);
const CANCELLABLE_PROVIDER_STATUSES = new Set([
  "REQUIRES_PAYMENT_METHOD",
  "REQUIRES_CUSTOMER_ACTION",
]);

type PreparedAttempt = {
  orderId: string;
  attemptId: string;
  requestId: string;
  /** Settlement amount sent to Airwallex (USD when converted from BDT). */
  amount: string;
  /** Settlement currency sent to Airwallex (USD when converted from BDT). */
  currency: string;
  /** Original order amount before conversion (e.g. BDT amount). */
  originalAmount: string;
  /** Original order currency before conversion (e.g. "BDT"). */
  originalCurrency: string;
  paymentIntentId: string | null;
  status: PaymentTransactionStatus;
};

type PrepareResult =
  | { ok: true; value: PreparedAttempt }
  | { ok: false; reason: "REVIEW" };

function orderNotFound(): AirwallexError {
  return new AirwallexError({
    code: "AIRWALLEX_VALIDATION_ERROR",
    status: 404,
    message: "Order was not found.",
  });
}

function sanitizedIntent(
  intent: AirwallexPaymentIntentRetrieveResponse,
): Prisma.InputJsonValue {
  const attempt = intent.latest_payment_attempt;
  return {
    id: intent.id,
    request_id: intent.request_id,
    merchant_order_id: intent.merchant_order_id,
    amount: String(intent.amount),
    currency: intent.currency,
    status: intent.status,
    created_at: intent.created_at,
    updated_at: intent.updated_at,
    ...(intent.cancelled_at ? { cancelled_at: intent.cancelled_at } : {}),
    ...(attempt
      ? {
          latest_payment_attempt: {
            id: attempt.id,
            status: attempt.status,
            ...(attempt.failure_code
              ? { failure_code: sanitizeAirwallexCode(attempt.failure_code) }
              : {}),
          },
        }
      : {}),
  };
}

function isClientSecretFresh(createdAt: string, now = Date.now()): boolean {
  const created = Date.parse(createdAt);
  return (
    Number.isFinite(created) &&
    now - created <
      AIRWALLEX_CLIENT_SECRET_LIFETIME_MS - CLIENT_SECRET_REFRESH_SKEW_MS
  );
}

async function quarantineAttempt(
  tx: Prisma.TransactionClient,
  input: {
    attemptId: string;
    fromStatus: PaymentTransactionStatus;
    providerStatus: string;
    paymentIntentId?: string;
    reason: AirwallexReviewReason;
    rawResponse?: Prisma.InputJsonValue;
  },
): Promise<void> {
  await tx.paymentTransaction.update({
    where: { id: input.attemptId },
    data: {
      ...(input.paymentIntentId
        ? { transactionId: input.paymentIntentId }
        : {}),
      status: "REQUIRES_REVIEW",
      providerStatus: input.providerStatus,
      requiresReview: true,
      reviewReason: input.reason,
      failureMessage: safeAirwallexReviewMessage(input.reason),
      ...(input.rawResponse ? { rawResponse: input.rawResponse } : {}),
    },
  });
  await appendAirwallexTransition(tx, {
    paymentTransactionId: input.attemptId,
    source: "INITIATION",
    eventName: "airwallex.initiation.quarantined",
    fromStatus: input.fromStatus,
    toStatus: "REQUIRES_REVIEW",
    providerStatus: input.providerStatus,
    reasonCode: input.reason,
    requiresReview: true,
  });
}

async function prepareAttempt(
  userId: string,
  orderId: string,
): Promise<PrepareResult> {
  return prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, orderId);
    const order = await findOwnerScopedAirwallexOrder(tx, orderId, userId);
    if (!order) throw orderNotFound();
    if (order.paymentMethod !== "AIRWALLEX") {
      throw new AirwallexValidationError(
        "This order is not configured for Airwallex payment.",
      );
    }
    if (order.paymentStatus === "PAID") {
      throw new AirwallexPaymentAlreadyProcessedError();
    }
    if (order.status !== "PENDING") {
      throw new AirwallexStateTransitionError();
    }

    const orderCurrency = order.currency.trim().toUpperCase();
    const latest = order.payments[0];

    // ── BDT → USD conversion ──────────────────────────────────────────
    // The order stores amounts in BDT, but Airwallex settles in USD.
    // Convert once and use the settlement values for the PaymentTransaction
    // so reconciliation against Airwallex's USD response matches naturally.
    // Computed early so settlementCurrency is available for the stale-
    // attempt checks that follow.
    let settlementCurrency: string;
    let settlementAmount: Prisma.Decimal;

    if (requiresCurrencyConversion(orderCurrency)) {
      const { amountInUsd } = convertBdtToUsd(order.totalAmount);
      settlementCurrency = AIRWALLEX_SETTLEMENT_CURRENCY;
      settlementAmount = new Decimal(amountInUsd);
    } else {
      settlementCurrency = orderCurrency;
      settlementAmount = order.totalAmount;
    }

    if (order.payments.some((payment) => payment.status === "SUCCESS")) {
      throw new AirwallexPaymentAlreadyProcessedError();
    }
    // Only block on quarantined attempts whose currency matches the current
    // settlement currency. Old attempts created before BDT→USD conversion
    // was enabled may have been quarantined with "BDT"; those must not
    // permanently block new USD payment attempts for the same order.
    if (
      order.payments.some(
        (payment) =>
          (payment.requiresReview || payment.status === "REQUIRES_REVIEW") &&
          payment.currency.toUpperCase() === settlementCurrency,
      )
    ) {
      return { ok: false, reason: "REVIEW" };
    }
    const snapshotMismatch = verifyPersistedAirwallexOrderSnapshot(order);
    if (snapshotMismatch) {
      if (latest) {
        await lockPaymentAttempt(tx, latest.id);
        await quarantineAttempt(tx, {
          attemptId: latest.id,
          fromStatus: latest.status,
          providerStatus: latest.providerStatus ?? "LOCAL_VALIDATION_FAILED",
          reason: snapshotMismatch,
        });
      }
      return { ok: false, reason: "REVIEW" };
    }

    let attempt: (typeof order.payments)[number] | undefined = latest;
    if (attempt?.status === "SUCCESS") {
      throw new AirwallexPaymentAlreadyProcessedError();
    }
    if (attempt?.status === "REFUNDED") {
      throw new AirwallexPaymentAlreadyProcessedError();
    }
    if (
      attempt &&
      ["FAILED", "CANCELLED", "EXPIRED"].includes(attempt.status) &&
      (!attempt.transactionId || attempt.status === "CANCELLED")
    ) {
      attempt = undefined;
    }

    // When the settlement currency changed (e.g. after enabling BDT→USD
    // conversion), existing attempts with the old currency cannot be reused.
    // Skip them so a fresh attempt is created with the correct currency.
    if (attempt && attempt.currency.toUpperCase() !== settlementCurrency) {
      attempt = undefined;
    }

    if (!attempt) {
      attempt = await createAirwallexAttempt(tx, {
        orderId: order.id,
        requestId: createAirwallexRequestId(),
        amount: settlementAmount,
        currency: settlementCurrency,
      });
      if (order.paymentStatus !== "PENDING") {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PENDING" },
        });
      }
    }

    if (
      !attempt.idempotencyKey ||
      !toDecimal(attempt.amount).equals(settlementAmount) ||
      attempt.currency.toUpperCase() !== settlementCurrency
    ) {
      await lockPaymentAttempt(tx, attempt.id);
      await quarantineAttempt(tx, {
        attemptId: attempt.id,
        fromStatus: attempt.status,
        providerStatus: attempt.providerStatus ?? "LOCAL_VALIDATION_FAILED",
        reason: !toDecimal(attempt.amount).equals(settlementAmount)
          ? "AMOUNT_MISMATCH"
          : "CURRENCY_MISMATCH",
      });
      return { ok: false, reason: "REVIEW" };
    }

    return {
      ok: true,
      value: {
        orderId: order.id,
        attemptId: attempt.id,
        requestId: attempt.idempotencyKey,
        amount: settlementAmount.toFixed(2),
        currency: settlementCurrency,
        originalAmount: toDecimal(order.totalAmount).toFixed(2),
        originalCurrency: orderCurrency,
        paymentIntentId: attempt.transactionId,
        status: attempt.status,
      },
    };
  });
}

function creationMismatch(
  prepared: PreparedAttempt,
  intent: AirwallexPaymentIntentRetrieveResponse,
): AirwallexReviewReason | null {
  if (intent.request_id !== prepared.requestId) return "REQUEST_ID_MISMATCH";
  if (intent.merchant_order_id !== prepared.orderId) return "ORDER_ID_MISMATCH";
  if (!amountMatchesAirwallex(toDecimal(prepared.amount), intent.amount)) {
    return "AMOUNT_MISMATCH";
  }
  if (intent.currency.toUpperCase() !== prepared.currency) {
    return "CURRENCY_MISMATCH";
  }
  if (mapAirwallexPaymentStatus(intent.status) === "REQUIRES_REVIEW") {
    return "UNKNOWN_PROVIDER_STATUS";
  }
  return null;
}

async function persistCreatedIntent(
  userId: string,
  prepared: PreparedAttempt,
  intent: AirwallexPaymentIntentRetrieveResponse,
): Promise<{ status: PaymentTransactionStatus; requiresReview: boolean }> {
  return prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, prepared.orderId);
    await lockPaymentAttempt(tx, prepared.attemptId);
    const order = await tx.order.findFirst({
      where: { id: prepared.orderId, userId },
      include: airwallexInitiationOrderInclude,
    });
    const attempt = order?.payments.find(
      (candidate) => candidate.id === prepared.attemptId,
    );
    if (!order || !attempt) throw orderNotFound();
    if (order.paymentStatus === "PAID") {
      throw new AirwallexPaymentAlreadyProcessedError();
    }

    let mismatch = creationMismatch(prepared, intent);
    if (
      !mismatch &&
      attempt.transactionId &&
      attempt.transactionId !== intent.id
    ) {
      mismatch = "PAYMENT_INTENT_MISMATCH";
    }
    const rawResponse = sanitizedIntent(intent);
    const consumedIntent = await tx.paymentTransaction.findFirst({
      where: {
        provider: "AIRWALLEX",
        transactionId: intent.id,
        id: { not: attempt.id },
      },
      select: { id: true },
    });
    if (consumedIntent) {
      await quarantineAttempt(tx, {
        attemptId: attempt.id,
        fromStatus: attempt.status,
        providerStatus: intent.status,
        reason: "PAYMENT_INTENT_MISMATCH",
        rawResponse,
      });
      return { status: "REQUIRES_REVIEW", requiresReview: true };
    }
    if (mismatch) {
      await quarantineAttempt(tx, {
        attemptId: attempt.id,
        fromStatus: attempt.status,
        providerStatus: intent.status,
        paymentIntentId: intent.id,
        reason: mismatch,
        rawResponse,
      });
      return { status: "REQUIRES_REVIEW", requiresReview: true };
    }

    const status = mapAirwallexPaymentStatus(intent.status);
    if (!isLegalAirwallexTransition(attempt.status, status)) {
      await quarantineAttempt(tx, {
        attemptId: attempt.id,
        fromStatus: attempt.status,
        providerStatus: intent.status,
        paymentIntentId: intent.id,
        reason: "ILLEGAL_STATE_TRANSITION",
        rawResponse,
      });
      return { status: "REQUIRES_REVIEW", requiresReview: true };
    }

    const requiresReview = status === "PENDING_REVIEW";
    await tx.paymentTransaction.update({
      where: { id: attempt.id },
      data: {
        transactionId: intent.id,
        providerStatus: intent.status,
        status,
        rawResponse,
        failureCode: sanitizeAirwallexCode(
          intent.latest_payment_attempt?.failure_code,
        ),
        // Never persist provider free-text failure prose; safe customer copy
        // is derived from internal status/review codes at the API boundary.
        failureMessage: null,
        requiresReview,
        reviewReason: requiresReview ? "PENDING_REVIEW" : null,
      },
    });
    await appendAirwallexTransition(tx, {
      paymentTransactionId: attempt.id,
      source: "INITIATION",
      eventName: "payment_intent.created",
      fromStatus: attempt.status,
      toStatus: status,
      providerStatus: intent.status,
      requiresReview,
    });
    return { status, requiresReview };
  });
}

function hostedPageConfig(
  prepared: PreparedAttempt,
  intent: AirwallexPaymentIntentRetrieveResponse & { client_secret: string },
): AirwallexHostedPaymentPageConfig {
  const config = requireAirwallexConfig();
  const urls = buildAirwallexReturnUrls(prepared.orderId);
  return {
    intentId: intent.id,
    clientSecret: intent.client_secret,
    currency: prepared.currency,
    environment: config.browserEnvironment,
    successUrl: urls.successUrl,
    cancelUrl: urls.cancelUrl,
    // Include the USD amount when a BDT→USD conversion was applied so the
    // frontend knows the exact amount Airwallex will charge.
    ...(prepared.currency !== prepared.originalCurrency
      ? { amountInUsd: Number(prepared.amount) }
      : {}),
  };
}

async function applyRetrievedIntent(
  intent: AirwallexPaymentIntentRetrieveResponse,
): Promise<PaymentTransactionStatus> {
  const result = await applyAuthoritativeAirwallexPayment({
    authoritative: toAirwallexAuthoritativePayment(intent),
    source: "INITIATION",
  });
  if (result.requiresReview) {
    throw new AirwallexStateTransitionError();
  }
  if (result.status === "SUCCESS") {
    throw new AirwallexPaymentAlreadyProcessedError();
  }
  return result.status;
}

async function cancelUnusableIntent(
  intent: AirwallexPaymentIntentRetrieveResponse,
): Promise<void> {
  if (!CANCELLABLE_PROVIDER_STATUSES.has(intent.status)) {
    throw new AirwallexStateTransitionError();
  }
  const cancelled = await cancelAirwallexPaymentIntent(intent.id);
  await applyRetrievedIntent(cancelled);
}

/**
 * Initiate or safely resume one customer-owned Hosted Payment Page checkout.
 * The client secret exists only in this call stack and in the immediate JSON
 * response; it is never persisted or logged.
 */
export async function initiateAirwallexPayment(
  userId: string,
  orderId: string,
): Promise<AirwallexHostedPaymentPageConfig> {
  requireAirwallexConfig();

  let preparedResult = await prepareAttempt(userId, orderId);
  if (!preparedResult.ok) throw new AirwallexStateTransitionError();
  let prepared = preparedResult.value;

  if (prepared.paymentIntentId) {
    const existing = await retrieveAirwallexPaymentIntent(
      prepared.paymentIntentId,
    );
    const status = await applyRetrievedIntent(existing);
    const replacingTerminalAttempt = ["FAILED", "EXPIRED"].includes(
      prepared.status,
    );
    if (replacingTerminalAttempt) {
      if (existing.status !== "CANCELLED") {
        await cancelUnusableIntent(existing);
      }
      preparedResult = await prepareAttempt(userId, orderId);
      if (!preparedResult.ok) throw new AirwallexStateTransitionError();
      prepared = preparedResult.value;
    } else if (
      REDIRECTABLE_PROVIDER_STATUSES.has(existing.status) &&
      existing.client_secret &&
      isClientSecretFresh(existing.created_at)
    ) {
      logAirwallexEvent({
        event: "PAYMENT_INTENT_REUSED",
        orderId: prepared.orderId,
        paymentAttemptId: prepared.attemptId,
        paymentIntentId: existing.id,
        toStatus: status,
      });
      return hostedPageConfig(
        prepared,
        existing as AirwallexPaymentIntentRetrieveResponse & {
          client_secret: string;
        },
      );
    }

    if (!replacingTerminalAttempt && ["CANCELLED", "FAILED", "EXPIRED"].includes(status)) {
      preparedResult = await prepareAttempt(userId, orderId);
      if (!preparedResult.ok) throw new AirwallexStateTransitionError();
      prepared = preparedResult.value;
    } else if (!replacingTerminalAttempt) {
      await cancelUnusableIntent(existing);
      preparedResult = await prepareAttempt(userId, orderId);
      if (!preparedResult.ok) throw new AirwallexStateTransitionError();
      prepared = preparedResult.value;
    }
  }

  const urls = buildAirwallexReturnUrls(prepared.orderId);
  const created = await createAirwallexPaymentIntent({
    request_id: prepared.requestId,
    amount: Number(prepared.amount),
    currency: prepared.currency,
    merchant_order_id: prepared.orderId,
    return_url: urls.successUrl,
    metadata: {
      bangbuy_order_id: prepared.orderId,
      bangbuy_payment_attempt_id: prepared.attemptId,
      // Preserve original BDT values for audit trail when converted.
      ...(prepared.currency !== prepared.originalCurrency
        ? {
            bangbuy_original_currency: prepared.originalCurrency,
            bangbuy_original_amount: prepared.originalAmount,
          }
        : {}),
    },
  });
  const persisted = await persistCreatedIntent(userId, prepared, created);
  if (persisted.requiresReview) throw new AirwallexStateTransitionError();
  if (persisted.status === "SUCCESS") {
    await applyRetrievedIntent(created);
  }
  if (!REDIRECTABLE_PROVIDER_STATUSES.has(created.status)) {
    throw new AirwallexStateTransitionError();
  }

  logAirwallexEvent({
    event: "PAYMENT_INTENT_CREATED",
    orderId: prepared.orderId,
    paymentAttemptId: prepared.attemptId,
    paymentIntentId: created.id,
    toStatus: persisted.status,
  });
  return hostedPageConfig(prepared, created);
}
