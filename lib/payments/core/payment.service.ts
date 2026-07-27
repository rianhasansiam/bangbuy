/**
 * Payment service — thin facade.
 *
 * Re-exports the three public entry points from their focused sub-services.
 * External code should import from the barrel (`@/lib/payments`) rather than
 * this file directly.
 */

export { initiateSslCommerzCheckout } from "./payment-initiation.service";
export { processSslCommerzNotification } from "./payment-verification.service";
export { reconcileStaleSslCommerzPayments } from "../reconciliation/payment-reconciliation.service";

// Re-export error classes for backward compatibility
export { PaymentError, CommittedPaymentError } from "./payment.errors";
// Re-export types for backward compatibility
export type {
  ProcessedPaymentNotification,
  SslCommerzReconciliationSummary,
} from "./payment.types";
