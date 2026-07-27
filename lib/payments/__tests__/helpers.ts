/**
 * Shared test fixtures for payment service tests.
 */

import { toDecimal } from "@/lib/money";
import type {
  SslCommerzTransactionQueryResult,
  SslCommerzValidationResult,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";
import type { CheckoutInput } from "@/lib/validations/checkout.validation";
import type { SslCommerzNotificationInput } from "@/lib/payments/validation/payment.schema";

export const USER_ID = "user-1";
export const ORDER_ID = "order-1";
export const PAYMENT_ID = "payment-1";
export const TRANSACTION_ID = "BB-TEST-TRANSACTION";
export const IDEMPOTENCY_KEY = "b72807d9-7bac-4882-bcf8-d8c2814dfc5b";

export function checkoutInput(): CheckoutInput {
  return {
    items: [{ productId: "product-1", variantId: "variant-1", quantity: 2 }],
    customerName: "Authoritative Buyer",
    customerPhone: "01700000000",
    customerEmail: "buyer@example.com",
    customerAddress: "27/A Example Road",
    customerCity: "Dhaka",
    customerPostalCode: "1205",
    customerNote: "",
    deliveryZone: "INSIDE_DHAKA",
    paymentMethod: "SSLCOMMERZ",
    idempotencyKey: IDEMPOTENCY_KEY,
    promoCode: null,
    clearCart: true,
  };
}

export function reservedCheckout() {
  return {
    order: {
      id: ORDER_ID,
      orderNumber: "ORD-TEST-1",
      subtotal: toDecimal("1200.00"),
      discountAmount: toDecimal("25.00"),
      deliveryCharge: toDecimal("60.00"),
      taxAmount: toDecimal("0.00"),
      totalAmount: toDecimal("1235.00"),
      customerName: "Authoritative Buyer",
      customerEmail: "buyer@example.com",
      customerAddress: "27/A Example Road",
      customerCity: "Dhaka",
      customerPostalCode: "1205",
      customerPhone: "01700000000",
      status: "PENDING",
      items: [
        {
          id: "item-1",
          productId: "product-1",
          variantId: "variant-1",
          sku: "SKU-1",
          productName: "Industrial Motor",
          quantity: 2,
          totalPrice: toDecimal("1200.00"),
        },
      ],
    },
    paymentAttempt: {
      id: PAYMENT_ID,
      orderId: ORDER_ID,
      provider: "SSLCOMMERZ",
      transactionId: TRANSACTION_ID,
      amount: toDecimal("1235.00"),
      currency: "BDT",
      status: "PENDING",
    },
    summary: {
      subtotal: 1200,
      totalSavings: 25,
      discount: 25,
      shipping: 60,
      tax: 0,
      total: 1235,
      taxRate: 0,
      freeShippingThreshold: 2000,
      shippingFee: 60,
      isOutsideDhaka: false,
      isFreeShippingApplied: false,
      currency: "BDT",
    },
    promo: null,
  };
}

export function storedPayment(
  overrides: Record<string, unknown> = {},
  orderOverrides: Record<string, unknown> = {},
) {
  return {
    id: PAYMENT_ID,
    orderId: ORDER_ID,
    provider: "SSLCOMMERZ",
    transactionId: TRANSACTION_ID,
    amount: toDecimal("1235.00"),
    currency: "BDT",
    status: "PENDING",
    validationId: null,
    requiresReview: false,
    gatewayUrl: null,
    createdAt: new Date("2026-07-26T20:00:00.000Z"),
    order: {
      id: ORDER_ID,
      orderNumber: "ORD-TEST-1",
      userId: USER_ID,
      status: "PENDING",
      paymentStatus: "PENDING",
      subtotal: toDecimal("1200.00"),
      discountAmount: toDecimal("25.00"),
      deliveryCharge: toDecimal("60.00"),
      taxAmount: toDecimal("0.00"),
      totalAmount: toDecimal("1235.00"),
      items: [
        {
          id: "item-1",
          productId: "product-1",
          variantId: "variant-1",
          sku: "SKU-1",
          quantity: 2,
        },
      ],
      ...orderOverrides,
    },
    ...overrides,
  };
}

export function notification(
  overrides: Partial<SslCommerzNotificationInput> = {},
): SslCommerzNotificationInput {
  return {
    tran_id: TRANSACTION_ID,
    val_id: "validation-1",
    status: "VALID",
    amount: "1235.00",
    currency: "BDT",
    ...overrides,
  };
}

export function validationResult(
  overrides: Partial<SslCommerzValidationResult> = {},
): SslCommerzValidationResult {
  return {
    transactionId: TRANSACTION_ID,
    validationId: "validation-1",
    amount: "1235.00",
    currency: "BDT",
    currencyAmount: "1235.00",
    currencyType: "BDT",
    bankTransactionId: "bank-1",
    cardType: "VISA",
    riskLevel: 0,
    paidAt: "2026-07-26 21:10:11",
    status: "VALID",
    metadata: {
      orderId: ORDER_ID,
      paymentRecordId: PAYMENT_ID,
    },
    raw: {
      status: "VALID",
      tran_date: "2026-07-26 21:10:11",
      tran_id: TRANSACTION_ID,
      val_id: "validation-1",
      amount: "1235.00",
      currency: "BDT",
      currency_amount: "1235.00",
      currency_type: "BDT",
      bank_tran_id: "bank-1",
      card_type: "VISA",
      risk_level: 0,
    },
    ...overrides,
  };
}

export function queryResult(
  overrides: Partial<SslCommerzTransactionQueryResult> = {},
): SslCommerzTransactionQueryResult {
  return {
    transactionId: TRANSACTION_ID,
    status: "FAILED",
    validationId: "validation-1",
    transactionDate: "2026-07-26 21:10:11",
    amount: "1235.00",
    currency: "BDT",
    currencyAmount: "1235.00",
    currencyType: "BDT",
    bankTransactionId: null,
    cardType: null,
    riskLevel: 0,
    metadata: {
      orderId: ORDER_ID,
      paymentRecordId: PAYMENT_ID,
    },
    raw: {
      status: "FAILED",
      tran_id: TRANSACTION_ID,
      val_id: "validation-1",
      tran_date: "2026-07-26 21:10:11",
      amount: "1235.00",
      currency: "BDT",
      currency_amount: "1235.00",
      currency_type: "BDT",
      risk_level: 0,
      value_a: ORDER_ID,
      value_b: PAYMENT_ID,
    },
    ...overrides,
  };
}

export function candidate(overrides: Record<string, unknown> = {}) {
  return {
    id: PAYMENT_ID,
    orderId: ORDER_ID,
    transactionId: TRANSACTION_ID,
    amount: toDecimal("1235.00"),
    currency: "BDT",
    status: "PENDING",
    validationId: null,
    requiresReview: false,
    ...overrides,
  };
}
