/**
 * Core payment types — provider-agnostic.
 *
 * Extracted from payment.service.ts during the payment module restructuring.
 * SSLCommerz-specific types live in gateways/sslcommerz/sslcommerz.types.ts.
 */

import type { Prisma } from "@/app/generated/prisma/client";

/** Supported payment providers. Only SSLCommerz is implemented today. */
export type PaymentProvider = "SSLCOMMERZ";

/**
 * The canonical server-verified representation of a provider payment.
 * Built from SSLCommerz validation/query responses after server-to-server
 * verification.
 */
export type AuthoritativePayment =
  | {
      kind: "SUCCESS";
      transactionId: string;
      validationId: string;
      amount: string;
      currency: string;
      bankTransactionId: string | null;
      cardType: string | null;
      riskLevel: 0 | 1 | null;
      paidAt: string;
      raw: object;
      metadata: { orderId: string | null; paymentRecordId: string | null };
    }
  | {
      kind: "PENDING" | "FAILED" | "CANCELLED" | "EXPIRED";
      transactionId: string;
      validationId: string | null;
      amount: string | null;
      currency: string | null;
      bankTransactionId: string | null;
      cardType: string | null;
      riskLevel: 0 | 1 | null;
      paidAt: string | null;
      raw: object;
      metadata: { orderId: string | null; paymentRecordId: string | null };
    };

/** Result returned after processing any payment notification or reconciliation event. */
export type ProcessedPaymentNotification = {
  orderId: string;
  paymentId: string;
  status:
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"
    | "EXPIRED"
    | "REFUNDED";
  duplicate: boolean;
  requiresReview: boolean;
  affectedProductIds: string[];
};

/** The order shape required by the gateway session builder. */
export type GatewayOrder = {
  id: string;
  orderNumber: string;
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  deliveryCharge: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  customerName: string;
  customerEmail: string | null;
  customerAddress: string;
  customerCity: string | null;
  customerPostalCode: string | null;
  customerPhone: string;
  items: Array<{
    sku: string | null;
    productName: string;
    quantity: number;
    totalPrice: Prisma.Decimal;
  }>;
};

/** A pending payment attempt eligible for reconciliation. */
export type ReconciliationCandidate = {
  id: string;
  orderId: string;
  transactionId: string | null;
  amount: Prisma.Decimal;
  currency: string;
  createdAt: Date;
  gatewayUrl: string | null;
};

/** Extended notification result with reconciliation resolution context. */
export type ReconciledAttempt = ProcessedPaymentNotification & {
  resolution: "PROVIDER" | "LOCAL_EXPIRY" | "STILL_PENDING";
};

/** Summary returned by the batch reconciliation worker. */
export type SslCommerzReconciliationSummary = {
  examined: number;
  confirmed: number;
  terminalized: number;
  locallyExpired: number;
  stillPending: number;
  errors: number;
  affectedProductIds: string[];
};
