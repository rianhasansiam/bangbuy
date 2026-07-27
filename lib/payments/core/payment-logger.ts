/**
 * Structured payment lifecycle logging.
 *
 * Emits safe, structured log entries for payment events across IPN,
 * callback, and reconciliation triggers. Never logs credentials,
 * API secrets, authorization tokens, or unnecessary customer data.
 */

import "server-only";

// ── Event Types ────────────────────────────────────────────────────────

export type PaymentTrigger = "IPN" | "CALLBACK" | "RECONCILIATION";

export type PaymentLogEvent =
  | "PAYMENT_INITIATED"
  | "CALLBACK_RECEIVED"
  | "CALLBACK_VERIFICATION_STARTED"
  | "CALLBACK_VERIFICATION_SUCCEEDED"
  | "CALLBACK_VERIFICATION_PENDING"
  | "CALLBACK_VERIFICATION_FAILED"
  | "CALLBACK_VERIFICATION_SKIPPED"
  | "IPN_RECEIVED"
  | "IPN_PARSED"
  | "IPN_PAYMENT_FOUND"
  | "IPN_VALIDATION_STARTED"
  | "IPN_VALIDATION_SUCCEEDED"
  | "IPN_VALIDATION_FAILED"
  | "VERIFICATION_STARTED"
  | "VERIFICATION_PROVIDER_CALLED"
  | "VERIFICATION_SUCCEEDED"
  | "VERIFICATION_FAILED"
  | "VERIFICATION_IDEMPOTENT"
  | "PAYMENT_AMOUNT_VERIFIED"
  | "PAYMENT_CURRENCY_VERIFIED"
  | "PAYMENT_TRANSACTION_VERIFIED"
  | "PAYMENT_RISK_ACCEPTED"
  | "PAYMENT_RISK_REVIEW_REQUIRED"
  | "PAYMENT_STATUS_COMMITTED"
  | "RECONCILIATION_STARTED"
  | "RECONCILIATION_PAYMENT_FOUND"
  | "RECONCILIATION_VERIFIED"
  | "RECONCILIATION_COMMITTED";

// ── Log Context ────────────────────────────────────────────────────────

export interface PaymentLogContext {
  event: PaymentLogEvent;
  trigger?: PaymentTrigger;
  orderId?: string;
  paymentId?: string;
  transactionId?: string;
  provider?: string;
  currentStatus?: string;
  targetStatus?: string;
  duplicate?: boolean;
  requiresReview?: boolean;
  error?: string;
  /** Extra safe metadata — never include credentials or PII here. */
  meta?: Record<string, unknown>;
}

// ── Logger ─────────────────────────────────────────────────────────────

const PREFIX = "[payments]";

/**
 * Emit a structured payment log entry. Uses `console.info` for normal
 * lifecycle events and `console.warn` for failures/anomalies.
 */
export function logPaymentEvent(context: PaymentLogContext): void {
  const { event, error, ...safe } = context;
  const payload = { ...safe, ...(error ? { error } : {}) };

  if (error || event.endsWith("_FAILED")) {
    console.warn(`${PREFIX} ${event}`, payload);
  } else {
    console.info(`${PREFIX} ${event}`, payload);
  }
}
