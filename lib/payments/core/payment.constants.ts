/**
 * Payment domain constants.
 *
 * Extracted from payment.service.ts during the payment module restructuring.
 * These are payment-specific constants; provider-specific constants live
 * under gateways/sslcommerz/sslcommerz.constants.ts.
 */

import { toDecimal } from "@/lib/money";

/** The currently active payment provider identifier. */
export const PROVIDER = "SSLCOMMERZ" as const;

/** SSLCommerz minimum supported payment amount (BDT). */
export const MIN_GATEWAY_AMOUNT = toDecimal("10.00");

/** SSLCommerz maximum supported payment amount (BDT). */
export const MAX_GATEWAY_AMOUNT = toDecimal("500000.00");

/** Maximum number of stale payment attempts to reconcile per batch. */
export const RECONCILIATION_BATCH_SIZE = 5;

/** How old a PENDING payment must be (ms) before reconciliation picks it up. */
export const RECONCILIATION_STALE_MS = 10 * 60_000;

/**
 * Grace period (ms) before a payment attempt without a gateway URL can be
 * locally expired. Prevents expiring a payment whose session is still being
 * initialized.
 */
export const UNUSABLE_SESSION_GRACE_MS = 5 * 60_000;
