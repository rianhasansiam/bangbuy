import "server-only";

import type { CommerceItem } from "@/lib/analytics/ecommerce";
import { BASE_CURRENCY, parseCurrencyCode, type CurrencyCode } from "@/lib/currency/config";
import { round2, toDecimal, type DecimalInput } from "@/lib/money";

export type VerifiedPurchaseSnapshot = {
  eventId: string;
  items: CommerceItem[];
  currency: CurrencyCode;
  value: number;
};

type OrderPurchaseSource = {
  id: string;
  userId: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: DecimalInput;
  items: readonly {
    productId: string | null;
    variantId: string | null;
    productName: string;
    sku: string | null;
    quantity: number;
    unitPrice: DecimalInput;
    product: { productCode: string } | null;
  }[];
  payments: readonly {
    provider: string;
    status: string;
    requiresReview: boolean;
    transactionId: string | null;
    validationId: string | null;
    providerStatus: string | null;
    paidAt: Date | null;
    amount: DecimalInput;
    currency: string;
    baseAmount: DecimalInput;
    baseCurrency: string | null;
    exchangeRate: DecimalInput;
  }[];
};

const CONFIRMED_ORDER_STATUSES = new Set([
  "PAYMENT_CONFIRMED", "SELLER_TO_PACK", "PACKED", "READY_TO_SHIP",
  "WAREHOUSE", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED",
]);

/**
 * This is derived only from persisted, provider-verified payment evidence.
 * Neither a return URL nor a manually marked COD/legacy payment is sufficient.
 * No provider identifiers, customer fields, or raw evidence cross the boundary.
 */
export function buildVerifiedPurchaseSnapshot(
  order: OrderPurchaseSource,
): VerifiedPurchaseSnapshot | null {
  try {
    if (
      !order.id || !order.userId || order.paymentStatus !== "PAID" ||
      !CONFIRMED_ORDER_STATUSES.has(order.status) ||
      !["SSLCOMMERZ", "AIRWALLEX"].includes(order.paymentMethod) ||
      order.payments.some((payment) => payment.requiresReview)
    ) return null;

    const successes = order.payments.filter((payment) => payment.status === "SUCCESS");
    if (successes.length !== 1 || successes[0].provider !== order.paymentMethod) return null;
    const payment = successes[0];
    if (!payment.transactionId || !payment.paidAt || !Number.isFinite(payment.paidAt.getTime())) return null;
    if (order.paymentMethod === "SSLCOMMERZ" && !payment.validationId) return null;
    if (order.paymentMethod === "AIRWALLEX" && payment.providerStatus !== "SUCCEEDED") return null;

    const currency = parseCurrencyCode(payment.currency.trim().toUpperCase());
    const amount = toDecimal(payment.amount);
    const orderTotal = toDecimal(order.totalAmount);
    if (!currency || !amount.isFinite() || amount.lessThanOrEqualTo(0) || !orderTotal.isFinite()) return null;

    // SSLCommerz settles in BDT. Airwallex saves a direct BDT -> payment
    // currency quote on its transaction; the display-currency quote may differ.
    let rate = toDecimal(1);
    if (order.paymentMethod === "SSLCOMMERZ") {
      if (currency !== BASE_CURRENCY || !amount.equals(orderTotal)) return null;
    } else {
      if (payment.baseCurrency !== BASE_CURRENCY || payment.baseAmount == null || payment.exchangeRate == null) return null;
      rate = toDecimal(payment.exchangeRate);
      if (!rate.isFinite() || rate.lessThanOrEqualTo(0) || !toDecimal(payment.baseAmount).equals(orderTotal)) return null;
      if (round2(orderTotal.times(rate)) !== round2(amount)) return null;
    }

    if (order.items.length === 0) return null;
    const items: CommerceItem[] = [];
    for (const item of order.items) {
      const productCode = item.product?.productCode.trim();
      const price = toDecimal(item.unitPrice);
      if (!item.productId || !productCode || item.unitPrice == null || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || !price.isFinite() || price.isNegative()) return null;
      items.push({
        productId: item.productId,
        productCode,
        ...(item.variantId ? { variantId: item.variantId } : {}),
        ...(item.sku ? { sku: item.sku } : {}),
        name: item.productName,
        quantity: item.quantity,
        unitPrice: round2(price.times(rate)),
      });
    }

    return { eventId: `purchase:${order.id}`, items, currency, value: round2(amount) };
  } catch {
    // Invalid legacy snapshots must never make the order endpoint fail.
    return null;
  }
}
