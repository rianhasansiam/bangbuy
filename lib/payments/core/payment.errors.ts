/**
 * Payment-specific error classes.
 *
 * Extracted from payment.service.ts during the payment module restructuring.
 */

import { ServiceError } from "@/lib/services/service-error";

export class PaymentError extends ServiceError {
  constructor(
    status: number,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(status, message, details);
    this.name = "PaymentError";
  }
}

/**
 * Signals that the authoritative checkout transaction committed before a
 * provider-stage failure. Routes use the private product IDs only to expire
 * stock caches; response details never include them.
 */
export class CommittedPaymentError extends PaymentError {
  readonly productIds: string[];

  constructor(
    status: number,
    message: string,
    orderId: string,
    paymentState:
      | "PENDING"
      | "SUCCESS"
      | "FAILED"
      | "CANCELLED"
      | "EXPIRED"
      | "REFUNDED",
    productIds: string[],
  ) {
    super(status, message, { orderId, paymentState });
    this.name = "CommittedPaymentError";
    this.productIds = productIds;
  }
}
