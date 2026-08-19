/**
 * Payment initiation service.
 *
 * Reserve an order/stock/promo once, persist the attempt, then initialize
 * the hosted SSLCommerz gateway outside the database transaction.
 */

import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { toDecimal } from "@/lib/money";
import {
  lockOrderForStatusChange,
  lockPaymentAttempt,
  recordStatusHistory,
  releasePromotionUsage,
  restoreStockForItems,
} from "@/lib/orders/mutations";
import {
  createSslCommerzSession,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.service";
import {
  SslCommerzConfigurationError,
  SslCommerzGatewayResponseError,
  SslCommerzInputError,
  SslCommerzNetworkError,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";
import type {
  SslCommerzSessionInput,
} from "@/lib/payments/gateways/sslcommerz/sslcommerz.types";
import { absoluteUrl } from "@/lib/seo/site";
import {
  CheckoutError,
  presentPersistedOrderSummary,
  reserveOrderForSslCommerz,
} from "@/lib/services/checkout.service";
import type { CurrencyContext } from "@/lib/currency/config";
import { getBaseCurrencyContext } from "@/lib/currency/request-currency";
import { getOrderForUser } from "@/lib/services/order.service";
import type { CheckoutInput } from "@/lib/validations/checkout.validation";

import {
  PROVIDER,
  MIN_GATEWAY_AMOUNT,
  MAX_GATEWAY_AMOUNT,
} from "./payment.constants";
import { PaymentError, CommittedPaymentError } from "./payment.errors";
import { logPaymentEvent } from "./payment-logger";
import type {
  GatewayOrder,
  ReconciledAttempt,
} from "./payment.types";
import { mapProviderValidationError } from "./payment-verification.service";
import { reconcilePaymentAttempt } from "../reconciliation/payment-reconciliation.service";

// ── Helpers ────────────────────────────────────────────────────────────

export function assertSslCommerzConfiguration(): void {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const password = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const live = process.env.SSLCOMMERZ_IS_LIVE;

  if (!storeId || !password || (live !== "true" && live !== "false")) {
    throw new PaymentError(
      503,
      "Online payment is temporarily unavailable. Please choose Cash on Delivery or try again later.",
    );
  }
}

function paymentRequestDigest(userId: string, requestId: string): string {
  return createHash("sha256")
    .update(`${PROVIDER}:${userId}:${requestId}`, "utf8")
    .digest("hex");
}

function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const entropy = randomBytes(6).toString("hex").toUpperCase();
  return `BB-${timestamp}-${entropy}`;
}

function trimTo(value: string, maximum: number): string {
  return Array.from(value.trim()).slice(0, maximum).join("");
}

function gatewayItemNames(
  items: readonly { productName: string; quantity: number }[],
): string[] {
  const separators = Math.max(0, items.length - 1);
  const perItem = Math.max(1, Math.floor((255 - separators) / items.length));
  return items.map((item) =>
    trimTo(`${item.productName} (qty ${item.quantity})`, perItem),
  );
}

const existingAttemptInclude = {
  order: { include: { items: true } },
} satisfies Prisma.PaymentTransactionInclude;

function buildSessionInput(
  order: GatewayOrder,
  payment: {
    id: string;
    transactionId: string | null;
    amount: Prisma.Decimal;
    currency: string;
  },
): SslCommerzSessionInput {
  if (!payment.transactionId) {
    throw new PaymentError(500, "Payment transaction ID is missing.");
  }
  if (!order.customerEmail || order.customerEmail.length > 50) {
    throw new PaymentError(
      400,
      "Your account email is not compatible with online payment. Please update it or choose Cash on Delivery.",
    );
  }

  const amount = toDecimal(payment.amount);
  if (amount.lessThan(MIN_GATEWAY_AMOUNT) || amount.greaterThan(MAX_GATEWAY_AMOUNT)) {
    throw new PaymentError(
      400,
      "SSLCommerz supports payments from BDT 10.00 to BDT 500,000.00.",
    );
  }

  const city = trimTo(order.customerCity || "Dhaka", 50);
  const postcode = trimTo(order.customerPostalCode || "0000", 30);
  const names = gatewayItemNames(order.items);

  return {
    transactionId: payment.transactionId,
    orderId: order.id,
    paymentRecordId: payment.id,
    totalAmount: amount.toFixed(2),
    currency: payment.currency.toUpperCase(),
    invoice: {
      productAmount: toDecimal(order.subtotal).toFixed(2),
      vat: toDecimal(order.taxAmount).toFixed(2),
      discountAmount: toDecimal(order.discountAmount).toFixed(2),
      convenienceFee: toDecimal(order.deliveryCharge).toFixed(2),
    },
    callbacks: {
      successUrl: absoluteUrl("/api/payments/sslcommerz/success"),
      failUrl: absoluteUrl("/api/payments/sslcommerz/fail"),
      cancelUrl: absoluteUrl("/api/payments/sslcommerz/cancel"),
      ipnUrl: absoluteUrl("/api/payments/sslcommerz/ipn"),
    },
    customer: {
      name: trimTo(order.customerName, 50),
      email: order.customerEmail,
      address1: trimTo(order.customerAddress, 50),
      city,
      state: city,
      postcode,
      country: "Bangladesh",
      phone: trimTo(order.customerPhone, 20),
    },
    shipping: {
      name: trimTo(order.customerName, 50),
      address1: trimTo(order.customerAddress, 50),
      city,
      state: city,
      postcode,
      country: "Bangladesh",
    },
    items: order.items.map((item, index) => {
      const lineAmount = toDecimal(item.totalPrice).toFixed(2);
      return {
        sku: trimTo(item.sku || `ITEM-${index + 1}`, 100),
        name: names[index]!,
        category: "ecommerce",
        // Each cart line is represented as one priced bundle. The original
        // quantity remains in the name, and exact line totals still reconcile.
        quantity: 1,
        unitPrice: lineAmount,
        totalAmount: lineAmount,
      };
    }),
  };
}

// ── Idempotency ────────────────────────────────────────────────────────

async function findOwnedAttemptByIdempotency(
  userId: string,
  idempotencyKey: string,
) {
  return prisma.paymentTransaction.findFirst({
    where: {
      provider: PROVIDER,
      idempotencyKey,
      order: { userId },
    },
    include: existingAttemptInclude,
  });
}

function replaySummary(
  attempt: Awaited<ReturnType<typeof findOwnedAttemptByIdempotency>>,
) {
  if (!attempt) throw new PaymentError(404, "Payment attempt not found.");
  return presentPersistedOrderSummary(attempt.order);
}

async function replayExistingAttempt(
  userId: string,
  attempt: NonNullable<
    Awaited<ReturnType<typeof findOwnedAttemptByIdempotency>>
  >,
) {
  if (
    attempt.status !== "PENDING" ||
    attempt.order.status !== "PENDING"
  ) {
    throw new PaymentError(409, "This payment attempt can no longer be used.", {
      orderId: attempt.orderId,
      paymentState: attempt.status,
    });
  }
  if (!attempt.gatewayUrl) {
    throw new PaymentError(
      409,
      "This payment request is already being initialized. Please wait and check your order.",
      { orderId: attempt.orderId, paymentState: attempt.status },
    );
  }

  const order = await getOrderForUser(attempt.orderId, userId);
  if (!order) throw new PaymentError(404, "Order not found.");

  return {
    order,
    summary: replaySummary(attempt),
    promo: null,
    paymentUrl: attempt.gatewayUrl,
    idempotentReplay: true,
  };
}

// ── Gateway Session Lifecycle ──────────────────────────────────────────

async function persistGatewaySession(
  orderId: string,
  paymentId: string,
  session: Awaited<ReturnType<typeof createSslCommerzSession>>,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, orderId);
    await lockPaymentAttempt(tx, paymentId);

    const payment = await tx.paymentTransaction.findUnique({
      where: { id: paymentId },
      select: {
        provider: true,
        status: true,
        order: { select: { status: true } },
      },
    });
    if (
      !payment ||
      payment.provider !== PROVIDER ||
      payment.status !== "PENDING" ||
      payment.order.status !== "PENDING"
    ) {
      return false;
    }

    await tx.paymentTransaction.update({
      where: { id: paymentId },
      data: {
        gatewayUrl: session.paymentUrl,
        gatewaySessionKey: session.sessionKey,
        rawResponse: { initialization: "SUCCESS" },
      },
    });
    return true;
  });
}

async function markAmbiguousInitialization(
  paymentId: string,
  reason: "NETWORK_FAILURE" | "TIMEOUT",
) {
  await prisma.paymentTransaction.updateMany({
    where: { id: paymentId, provider: PROVIDER, status: "PENDING" },
    data: {
      rawResponse: {
        initialization: "UNKNOWN",
        category: reason,
      },
    },
  });
}

async function failInitializedReservation(
  orderId: string,
  paymentId: string,
  category: string,
): Promise<string[]> {
  return prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, orderId);
    await lockPaymentAttempt(tx, paymentId);

    const payment = await tx.paymentTransaction.findUnique({
      where: { id: paymentId },
      include: { order: { include: { items: true } } },
    });
    if (!payment || payment.provider !== PROVIDER) return [];
    if (payment.status === "SUCCESS") return [];

    const productIds = payment.order.items.flatMap((item) =>
      item.productId ? [item.productId] : [],
    );

    await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        rawResponse: {
          initialization: "FAILED",
          category,
        },
      },
    });

    if (payment.order.status === "PENDING") {
      await restoreStockForItems(
        tx,
        payment.order.items,
        payment.order.orderNumber,
      );
      await releasePromotionUsage(tx, payment.order.id);
      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      await recordStatusHistory(tx, payment.order.id, "CANCELLED", {
        note: "Online payment session could not be created.",
      });
    }

    return productIds;
  });
}

// ── Checkout Entry Point ───────────────────────────────────────────────

/**
 * Reserve an order/stock/promo once, persist the attempt, then initialize the
 * hosted gateway outside the database transaction.
 */
export async function initiateSslCommerzCheckout(
  userId: string,
  input: CheckoutInput,
  currencyContext: CurrencyContext = getBaseCurrencyContext(),
) {
  assertSslCommerzConfiguration();
  if (input.paymentMethod !== "SSLCOMMERZ" || !input.idempotencyKey) {
    throw new PaymentError(400, "Valid SSLCommerz payment metadata is required.");
  }

  const idempotencyKey = paymentRequestDigest(userId, input.idempotencyKey);
  const existing = await findOwnedAttemptByIdempotency(userId, idempotencyKey);
  if (existing) {
    if (existing.status === "PENDING" && !existing.gatewayUrl) {
      let reconciliation: ReconciledAttempt;
      try {
        reconciliation = await reconcilePaymentAttempt(existing, new Date());
      } catch (error) {
        mapProviderValidationError(error);
      }
      if (reconciliation.affectedProductIds.length > 0) {
        throw new CommittedPaymentError(
          409,
          "The previous payment attempt is no longer active. Its reserved inventory has been released.",
          reconciliation.orderId,
          reconciliation.status,
          reconciliation.affectedProductIds,
        );
      }
      const refreshed = await findOwnedAttemptByIdempotency(
        userId,
        idempotencyKey,
      );
      if (refreshed) return replayExistingAttempt(userId, refreshed);
    }
    return replayExistingAttempt(userId, existing);
  }

  const attemptSeed = {
    id: randomUUID(),
    provider: "SSLCOMMERZ" as const,
    transactionId: generateTransactionId(),
    idempotencyKey,
  };

  let reserved: Awaited<ReturnType<typeof reserveOrderForSslCommerz>>;
  try {
    reserved = await reserveOrderForSslCommerz(
      userId,
      input,
      attemptSeed,
      currencyContext,
    );
  } catch (error) {
    if (
      error instanceof CheckoutError &&
      error.details?.code === "PAYMENT_IDEMPOTENCY_CONFLICT"
    ) {
      const raced = await findOwnedAttemptByIdempotency(userId, idempotencyKey);
      if (raced) return replayExistingAttempt(userId, raced);
    }
    throw error;
  }

  const productIds = reserved.order.items.flatMap((item) =>
    item.productId ? [item.productId] : [],
  );

  logPaymentEvent({
    event: "PAYMENT_INITIATED",
    orderId: reserved.order.id,
    paymentId: reserved.paymentAttempt.id,
    transactionId: reserved.paymentAttempt.transactionId ?? undefined,
    provider: PROVIDER,
    currentStatus: reserved.paymentAttempt.status,
  });

  let session;
  try {
    const gatewayInput = buildSessionInput(
      reserved.order as GatewayOrder,
      reserved.paymentAttempt,
    );
    session = await createSslCommerzSession(gatewayInput);
  } catch (error) {
    if (error instanceof SslCommerzNetworkError) {
      await markAmbiguousInitialization(
        reserved.paymentAttempt.id,
        error.reason,
      );
      console.warn("[payments.sslcommerz] session initialization uncertain", {
        orderId: reserved.order.id,
        paymentId: reserved.paymentAttempt.id,
        category: error.reason,
      });
      throw new CommittedPaymentError(
        503,
        "The payment provider did not respond in time. Your order is pending and has not been marked paid.",
        reserved.order.id,
        "PENDING",
        productIds,
      );
    }

    const category =
      error instanceof SslCommerzGatewayResponseError
        ? error.reason
        : error instanceof SslCommerzInputError
          ? "INVALID_PROVIDER_INPUT"
          : error instanceof SslCommerzConfigurationError
            ? "CONFIGURATION_CHANGED"
            : error instanceof PaymentError
              ? "UNSUPPORTED_ORDER"
              : "UNEXPECTED_PROVIDER_ERROR";
    const affectedProductIds = await failInitializedReservation(
      reserved.order.id,
      reserved.paymentAttempt.id,
      category,
    );
    console.warn("[payments.sslcommerz] session initialization failed", {
      orderId: reserved.order.id,
      paymentId: reserved.paymentAttempt.id,
      category,
    });
    throw new CommittedPaymentError(
      error instanceof PaymentError ? error.status : 502,
      error instanceof PaymentError
        ? error.message
        : "Online payment could not be initialized. No payment was taken.",
      reserved.order.id,
      "FAILED",
      affectedProductIds,
    );
  }

  let sessionPersisted: boolean;
  try {
    sessionPersisted = await persistGatewaySession(
      reserved.order.id,
      reserved.paymentAttempt.id,
      session,
    );
  } catch {
    console.error("[payments.sslcommerz] session persistence failed", {
      orderId: reserved.order.id,
      paymentId: reserved.paymentAttempt.id,
    });
    throw new CommittedPaymentError(
      503,
      "Payment was initialized but its redirect could not be saved. Please check your order before retrying.",
      reserved.order.id,
      "PENDING",
      productIds,
    );
  }
  if (!sessionPersisted) {
    throw new CommittedPaymentError(
      409,
      "This order changed while payment was being initialized. The gateway session will not be used.",
      reserved.order.id,
      "CANCELLED",
      [],
    );
  }

  const order = await getOrderForUser(reserved.order.id, userId);
  if (!order) {
    throw new CommittedPaymentError(
      500,
      "Created order could not be loaded.",
      reserved.order.id,
      "PENDING",
      productIds,
    );
  }

  console.info("[payments.sslcommerz] session initialized", {
    orderId: reserved.order.id,
    paymentId: reserved.paymentAttempt.id,
    provider: PROVIDER,
  });

  return {
    order,
    summary: reserved.summary,
    promo: reserved.promo,
    paymentUrl: session.paymentUrl,
    idempotentReplay: false,
  };
}
