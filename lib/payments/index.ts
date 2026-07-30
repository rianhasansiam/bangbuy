/**
 * Payment domain — public API.
 *
 * Everything outside lib/payments/ should import from this barrel.
 * Internal modules, credentials, lock helpers, and raw gateway internals
 * are intentionally NOT exported.
 */

// Core orchestration
export {
  initiateSslCommerzCheckout,
  processSslCommerzNotification,
  reconcileStaleSslCommerzPayments,
} from "./core/payment.service";

// Shared verification pipeline
export {
  verifyAndFinalizePayment,
} from "./core/payment-verification.service";

// Error classes
export {
  PaymentError,
  CommittedPaymentError,
} from "./core/payment.errors";

// Core types
export type {
  ProcessedPaymentNotification,
  SslCommerzReconciliationSummary,
} from "./core/payment.types";

// Callback handling
export {
  handleSslCommerzBrowserCallback,
} from "./callbacks/payment-callback.service";

// Transaction ledger
export {
  listTransactionsForUser,
  listTransactionsForAdmin,
} from "./transactions/payment-transaction.service";

// Validation schemas
export {
  sslCommerzNotificationSchema,
} from "./validation/payment.schema";
export type {
  SslCommerzNotificationInput,
} from "./validation/payment.schema";

export {
  customerTransactionQuerySchema,
  adminTransactionQuerySchema,
} from "./validation/payment-transaction.schema";
export type {
  CustomerTransactionQueryInput,
  AdminTransactionQueryInput,
} from "./validation/payment-transaction.schema";

// Reconciliation security
export {
  isReconciliationAuthorized,
} from "./reconciliation/reconciliation-security";
