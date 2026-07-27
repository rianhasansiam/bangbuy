/**
 * Payment-specific state transition rules.
 *
 * Centralizes the payment transaction status transitions that are
 * currently implicit across IPN processing, reconciliation, and
 * callback handling in payment.service.ts.
 *
 * Order status transitions live in lib/orders/status.ts and are not
 * duplicated here.
 */

/** Every payment transaction status. */
export const PAYMENT_STATUSES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Allowed forward transitions for payment transaction status.
 *
 * Rules:
 *   - PENDING is the only status that can transition to any outcome.
 *   - SUCCESS and REFUNDED are terminal for transition purposes.
 *     (Duplicate events on these are handled via review flags, not transitions.)
 *   - FAILED/CANCELLED/EXPIRED are also terminal once applied.
 */
export const PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  readonly PaymentStatus[]
> = {
  PENDING: ["SUCCESS", "FAILED", "CANCELLED", "EXPIRED"],
  SUCCESS: [],
  FAILED: [],
  CANCELLED: [],
  EXPIRED: [],
  REFUNDED: [],
};

/** Is this transition allowed? */
export function canTransitionPayment(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  return PAYMENT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/** A payment status with no outgoing transitions. */
export function isTerminalPaymentStatus(status: PaymentStatus): boolean {
  return PAYMENT_STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Statuses that represent a completed payment — these should not be
 * overwritten by a later provider event (duplicate IPN, late callback).
 * Instead, anomalies on these statuses trigger a review flag.
 */
export function isImmutablePaymentStatus(status: PaymentStatus): boolean {
  return status === "SUCCESS" || status === "REFUNDED";
}
