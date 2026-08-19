import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import {
  cleanVariantAttributes,
  formatVariantAttributes,
  type VariantAttributeMap,
} from "@/lib/catalog/variant-options";
import { prisma } from "@/lib/db/prisma";
import {
  greaterThanOrEqual,
  minDecimal,
  multiply,
  percentOf,
  round2,
  subtractClamped,
  sumDecimals,
  toDecimal,
} from "@/lib/money";
import { ServiceError } from "@/lib/services/service-error";
import { getEffectiveActiveCategoryIds } from "@/lib/services/category.service";
import {
  findActivePromoCode,
  getStoreSettings,
} from "@/lib/services/settings.service";
import type {
  CheckoutInput,
  CheckoutPreviewInput,
} from "@/lib/validations/checkout.validation";
import { createAirwallexAttempt } from "@/lib/airwallex/repositories/airwallex-payment.repository";
import {
  BASE_CURRENCY,
  parseCurrencyCode,
  type CurrencyContext,
} from "@/lib/currency/config";
import {
  createOrderCurrencySnapshot,
  createOrderItemCurrencySnapshot,
} from "@/lib/currency/order-currency-snapshot";
import {
  createPricingContext,
  priceFromBDT,
} from "@/lib/currency/pricing.service";
import { getBaseCurrencyContext } from "@/lib/currency/request-currency";
import { formatMoney } from "@/lib/currency/format-money";

/**
 * Single home for checkout pricing + order creation.
 *
 * Routes stay thin. Domain rules live here:
 *   - prices, taxes, shipping fees, and free-shipping thresholds are
 *     always read from `StoreSettings` and `Product` rows; never from
 *     the client.
 *   - promo codes are validated against `PromoCode` rules (status,
 *     start/end dates, min order, percent caps, usage limits).
 *   - stock is decremented atomically with `updateMany` + a stock
 *     guard so the last unit can't be sold to two carts at once.
 *   - customer checkout orders are attached to the signed-in user;
 *     an admin-only path may record a guest order without an account.
 */

export class CheckoutError extends ServiceError {
  constructor(
    status: number,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(status, message, details);
    this.name = "CheckoutError";
  }
}

/* -------------------------------------------------------------------------- */
/*  Money helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Pick the effective unit price for a product as an exact Decimal:
 * the discount price when set and lower than the sale price, otherwise
 * the sale price. Pricing lives on the product (variants are inventory).
 */
function effectiveProductPrice(product: {
  salePrice: Prisma.Decimal;
  discountPrice: Prisma.Decimal | null;
}): Prisma.Decimal {
  if (
    product.discountPrice != null &&
    toDecimal(product.discountPrice).lessThan(toDecimal(product.salePrice))
  ) {
    return toDecimal(product.discountPrice);
  }
  return toDecimal(product.salePrice);
}

function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `ORD-${yy}${mm}${dd}-${rand}`;
}

/* -------------------------------------------------------------------------- */
/*  Item resolution                                                           */
/* -------------------------------------------------------------------------- */

type ResolvedItem = { productId: string; variantId?: string; quantity: number };

type ResolvedItems = {
  items: ResolvedItem[];
  /** True when items came from the user's persisted cart (so we can clear it). */
  fromCart: boolean;
};

/**
 * Pick the source of truth for the items being checked out.
 *
 * Priority:
 *   1. Body-provided items (Buy Now or selected-cart checkout).
 *   2. The user's persisted cart, when no items are supplied.
 */
async function resolveItems(
  userId: string | null,
  bodyItems: ResolvedItem[] | undefined,
): Promise<ResolvedItems> {
  if (bodyItems && bodyItems.length > 0) {
    // Merge duplicates so the same variant can't appear twice. Lines
    // without an explicit variant are keyed by product (the service
    // resolves them to the primary variant during pricing).
    const merged = new Map<string, ResolvedItem>();
    for (const item of bodyItems) {
      const key = item.variantId ?? `product:${item.productId}`;
      const current = merged.get(key);
      merged.set(key, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: (current?.quantity ?? 0) + item.quantity,
      });
    }
    return { items: Array.from(merged.values()), fromCart: false };
  }

  if (!userId) {
    throw new CheckoutError(
      400,
      "Guest orders must include at least one product.",
    );
  }

  const cart = await prisma.cartItem.findMany({
    where: { userId },
    select: {
      variantId: true,
      quantity: true,
      variant: { select: { productId: true } },
    },
  });

  if (cart.length === 0) {
    throw new CheckoutError(
      400,
      "Your cart is empty. Add items before placing an order.",
    );
  }

  return {
    items: cart.map((row) => ({
      productId: row.variant.productId,
      variantId: row.variantId,
      quantity: row.quantity,
    })),
    fromCart: true,
  };
}

/* -------------------------------------------------------------------------- */
/*  Line pricing                                                              */
/* -------------------------------------------------------------------------- */

type PricedLine = {
  productId: string;
  variantId: string;
  sku: string | null;
  variantKey: string;
  variantName: string | null;
  modelNumber: string | null;
  color: string | null;
  size: string | null;
  attributes: VariantAttributeMap | null;
  attributeSummary: string | null;
  name: string;
  image: string | null;
  quantity: number;
  // Money kept as exact Decimals internally; converted to number only
  // at the JSON boundary (see previewCheckout / summarize).
  unitPrice: Prisma.Decimal;
  originalPrice: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
  /** Admin-only source cost snapshot for OrderItem profit analytics. */
  buyingPrice: Prisma.Decimal;
  stock: number;
};

type CheckoutCatalogReader = Pick<
  Prisma.TransactionClient,
  "category" | "product"
>;

async function priceLines(
  items: ResolvedItem[],
  client: CheckoutCatalogReader = prisma,
): Promise<PricedLine[]> {
  const productIds = items.map((item) => item.productId);
  const [products, activeCategoryIds] = await Promise.all([
    client.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        status: true,
        categoryId: true,
        salePrice: true,
        discountPrice: true,
        buyingPrice: true,
        images: {
          orderBy: { position: "asc" },
          take: 1,
          select: { url: true },
        },
        variants: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            variantKey: true,
            name: true,
            sku: true,
            modelNumber: true,
            color: true,
            size: true,
            attributes: true,
            stock: true,
            isActive: true,
          },
        },
      },
    }),
    getEffectiveActiveCategoryIds(client),
  ]);
  const activeCategoryIdSet = new Set(activeCategoryIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  return items.map((line) => {
    const product = productMap.get(line.productId);
    if (!product) {
      throw new CheckoutError(404, `Product not found: ${line.productId}`);
    }
    if (
      product.status !== "ACTIVE" ||
      !activeCategoryIdSet.has(product.categoryId)
    ) {
      throw new CheckoutError(
        409,
        `"${product.name}" is no longer available.`,
        { productId: product.id },
      );
    }
    const activeVariants = product.variants.filter((variant) => variant.isActive);
    // Multi-variant products require an explicit option selection.
    if (!line.variantId && activeVariants.length > 1) {
      throw new CheckoutError(
        409,
        `Please select product options for "${product.name}" before checkout.`,
        { productId: product.id, requiresVariantSelection: true },
      );
    }
    // Use the exact selected variant when provided, else the primary one.
    const variant = line.variantId
      ? activeVariants.find((v) => v.id === line.variantId)
      : activeVariants[0];
    if (!variant) {
      throw new CheckoutError(
        409,
        line.variantId
          ? `Selected variant for "${product.name}" is no longer available.`
          : `"${product.name}" has no purchasable variant.`,
        { productId: product.id },
      );
    }
    if (variant.stock < line.quantity) {
      throw new CheckoutError(
        409,
        `Only ${variant.stock} unit(s) of "${product.name}" left in stock.`,
        { productId: product.id, available: variant.stock },
      );
    }
    const unitPrice = effectiveProductPrice(product);
    const attributes = cleanVariantAttributes(variant.attributes);
    return {
      productId: product.id,
      variantId: variant.id,
      sku: variant.sku,
      variantKey: variant.variantKey,
      variantName: variant.name,
      modelNumber: variant.modelNumber,
      color: variant.color,
      size: variant.size,
      attributes,
      attributeSummary: formatVariantAttributes(attributes),
      name: product.name,
      image: product.images[0]?.url ?? null,
      quantity: line.quantity,
      unitPrice,
      originalPrice: toDecimal(product.salePrice),
      lineTotal: multiply(unitPrice, line.quantity),
      buyingPrice: toDecimal(product.buyingPrice),
      stock: variant.stock,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Promo + summary                                                           */
/* -------------------------------------------------------------------------- */

type PromoApplication =
  | {
      ok: true;
      id: string;
      code: string;
      description: string | null;
      discount: Prisma.Decimal;
      usageLimit: number | null;
    }
  | {
      ok: false;
      code: string;
      reason: string;
    }
  | null;

async function applyPromoCode(
  rawCode: string | null | undefined,
  subtotal: Prisma.Decimal,
  currencyContext: CurrencyContext = getBaseCurrencyContext(),
): Promise<PromoApplication> {
  if (!rawCode) return null;
  const trimmed = rawCode.trim();
  if (!trimmed) return null;

  const code = trimmed.toUpperCase();
  const promo = await findActivePromoCode(code);
  if (!promo) {
    return { ok: false, code, reason: "Promo code is invalid or expired." };
  }

  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) {
    return {
      ok: false,
      code,
      reason: "This promo code has reached its usage limit.",
    };
  }

  if (promo.minOrder != null && subtotal.lessThan(toDecimal(promo.minOrder))) {
    const minimum = priceFromBDT({
      baseAmount: promo.minOrder,
      context: currencyContext,
    });
    return {
      ok: false,
      code,
      reason: `Spend at least ${formatMoney(minimum.amount, minimum.currency)} to use this code.`,
    };
  }

  let discount =
    promo.discountType === "PERCENT"
      ? percentOf(subtotal, promo.value)
      : toDecimal(promo.value);

  if (promo.maxDiscount != null) {
    discount = minDecimal(discount, promo.maxDiscount);
  }

  // Round to 2 dp and never exceed the subtotal.
  discount = minDecimal(toDecimal(round2(discount)), subtotal);

  return {
    ok: true,
    id: promo.id,
    code,
    description: promo.description,
    discount,
    usageLimit: promo.usageLimit,
  };
}

/** JSON-facing promo shape (Decimal discount converted to a number). */
type PromoApplicationJson =
  | {
      ok: true;
      code: string;
      description: string | null;
      discount: number;
      baseDiscount: number;
    }
  | { ok: false; code: string; reason: string }
  | null;

function promoToJson(
  promo: PromoApplication,
  currencyContext: CurrencyContext,
): PromoApplicationJson {
  if (promo == null) return null;
  if (!promo.ok) return promo;
  const baseDiscount = round2(promo.discount);
  return {
    ok: true,
    code: promo.code,
    description: promo.description,
    discount: priceFromBDT({
      baseAmount: baseDiscount,
      context: currencyContext,
    }).amount,
    baseDiscount,
  };
}

type StoreSettingsSnapshot = {
  taxRate: number;
  standardShippingFee: number;
  freeShippingThreshold: number;
  expressShippingFee: number;
};

type BaseCheckoutSummary = {
  subtotal: number;
  totalSavings: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  taxRate: number;
  freeShippingThreshold: number;
  shippingFee: number;
  isOutsideDhaka: boolean;
  isFreeShippingApplied: boolean;
  currency: typeof BASE_CURRENCY;
};

export type CheckoutSummary = Omit<BaseCheckoutSummary, "currency"> & {
  currency: CurrencyContext["currency"];
  totalSaved: number;
  baseCurrency: typeof BASE_CURRENCY;
  baseSubtotal: number;
  baseTotalSavings: number;
  baseTotalSaved: number;
  baseDiscount: number;
  baseShipping: number;
  baseTax: number;
  baseTotal: number;
  baseFreeShippingThreshold: number;
  baseShippingFee: number;
  exchangeRate: string;
  exchangeRateTimestamp: string | null;
};

type DeliveryZone = "INSIDE_DHAKA" | "OUTSIDE_DHAKA";

function summarize(
  lines: PricedLine[],
  promo: PromoApplication,
  settings: StoreSettingsSnapshot,
  deliveryZone: DeliveryZone,
): BaseCheckoutSummary {
  const subtotal = sumDecimals(lines.map((line) => line.lineTotal));
  const totalSavings = sumDecimals(
    lines.map((line) =>
      subtractClamped(
        multiply(line.originalPrice, line.quantity),
        multiply(line.unitPrice, line.quantity),
      ),
    ),
  );

  const discount = promo?.ok ? promo.discount : toDecimal(0);
  const afterDiscount = subtractClamped(subtotal, discount);

  const freeShippingThreshold = toDecimal(settings.freeShippingThreshold);
  const isFreeShipping =
    subtotal.isZero() ||
    (freeShippingThreshold.greaterThan(0) &&
      greaterThanOrEqual(afterDiscount, freeShippingThreshold));
  const outsideDhaka = deliveryZone === "OUTSIDE_DHAKA";
  const shippingFee = outsideDhaka
    ? settings.expressShippingFee
    : settings.standardShippingFee;
  const shipping = isFreeShipping
    ? toDecimal(0)
    : toDecimal(shippingFee);

  const tax = percentOf(afterDiscount, multiply(settings.taxRate, 100));
  const total = toDecimal(round2(afterDiscount)).plus(shipping).plus(
    toDecimal(round2(tax)),
  );

  return {
    subtotal: round2(subtotal),
    totalSavings: round2(totalSavings),
    discount: round2(discount),
    shipping: round2(shipping),
    tax: round2(tax),
    total: round2(total),
    taxRate: settings.taxRate,
    freeShippingThreshold: settings.freeShippingThreshold,
    shippingFee,
    isOutsideDhaka: outsideDhaka,
    isFreeShippingApplied: isFreeShipping,
    currency: BASE_CURRENCY,
  };
}

/**
 * Project final canonical BDT components into one request-scoped display
 * currency. No business rule consumes these values, and an invalid context
 * downgrades both amount and label to BDT in the currency core.
 */
function presentSummary(
  summary: BaseCheckoutSummary,
  currencyContext: CurrencyContext,
): CheckoutSummary {
  const convert = (amount: number) =>
    priceFromBDT({ baseAmount: amount, context: currencyContext });
  const displayedSubtotal = convert(summary.subtotal);
  const baseTotalSaved = round2(
    sumDecimals([summary.totalSavings, summary.discount]),
  );

  return {
    ...summary,
    subtotal: displayedSubtotal.amount,
    totalSavings: convert(summary.totalSavings).amount,
    totalSaved: convert(baseTotalSaved).amount,
    discount: convert(summary.discount).amount,
    shipping: convert(summary.shipping).amount,
    tax: convert(summary.tax).amount,
    total: convert(summary.total).amount,
    freeShippingThreshold: convert(summary.freeShippingThreshold).amount,
    shippingFee: convert(summary.shippingFee).amount,
    currency: displayedSubtotal.currency,
    baseCurrency: BASE_CURRENCY,
    baseSubtotal: summary.subtotal,
    baseTotalSavings: summary.totalSavings,
    baseTotalSaved,
    baseDiscount: summary.discount,
    baseShipping: summary.shipping,
    baseTax: summary.tax,
    baseTotal: summary.total,
    baseFreeShippingThreshold: summary.freeShippingThreshold,
    baseShippingFee: summary.shippingFee,
    exchangeRate: displayedSubtotal.exchangeRate,
    exchangeRateTimestamp: displayedSubtotal.exchangeRateTimestamp,
  };
}

type PersistedSummaryOrder = {
  subtotal: Prisma.Decimal;
  deliveryCharge: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  displayCurrency: string;
  displaySubtotal: Prisma.Decimal;
  displayDeliveryCharge: Prisma.Decimal;
  displayDiscountAmount: Prisma.Decimal;
  displayTaxAmount: Prisma.Decimal;
  displayTotalAmount: Prisma.Decimal;
  exchangeRate: Prisma.Decimal;
  exchangeRateAt: Date | null;
};

/** Rehydrate a checkout response exclusively from the persisted FX snapshot. */
export function presentPersistedOrderSummary(
  order: PersistedSummaryOrder,
): CheckoutSummary {
  const requestedCurrency = parseCurrencyCode(order.displayCurrency);
  const context = createPricingContext({
    currency: requestedCurrency,
    exchangeRate: order.exchangeRate,
    exchangeRateTimestamp: order.exchangeRateAt,
    source: "fallback",
  });
  const useDisplaySnapshot =
    context.currency !== BASE_CURRENCY && context.currency === requestedCurrency;
  const amount = (displayValue: Prisma.Decimal, baseValue: Prisma.Decimal) =>
    round2(useDisplaySnapshot ? displayValue : baseValue);
  const baseDeliveryCharge = round2(order.deliveryCharge);

  return {
    subtotal: amount(order.displaySubtotal, order.subtotal),
    totalSavings: 0,
    totalSaved: amount(
      order.displayDiscountAmount,
      order.discountAmount,
    ),
    discount: amount(order.displayDiscountAmount, order.discountAmount),
    shipping: amount(order.displayDeliveryCharge, order.deliveryCharge),
    tax: amount(order.displayTaxAmount, order.taxAmount),
    total: amount(order.displayTotalAmount, order.totalAmount),
    taxRate: 0,
    freeShippingThreshold: 0,
    shippingFee: amount(
      order.displayDeliveryCharge,
      order.deliveryCharge,
    ),
    isOutsideDhaka: false,
    isFreeShippingApplied: order.deliveryCharge.isZero(),
    currency: context.currency,
    baseCurrency: BASE_CURRENCY,
    baseSubtotal: round2(order.subtotal),
    baseTotalSavings: 0,
    baseTotalSaved: round2(order.discountAmount),
    baseDiscount: round2(order.discountAmount),
    baseShipping: baseDeliveryCharge,
    baseTax: round2(order.taxAmount),
    baseTotal: round2(order.totalAmount),
    baseFreeShippingThreshold: 0,
    baseShippingFee: baseDeliveryCharge,
    exchangeRate: context.exchangeRate,
    exchangeRateTimestamp: context.exchangeRateTimestamp,
  };
}

function settingsToSnapshot(
  settings: Awaited<ReturnType<typeof getStoreSettings>>,
): StoreSettingsSnapshot {
  return {
    taxRate: settings.taxRate,
    standardShippingFee: settings.standardShippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    expressShippingFee: settings.expressShippingFee,
  };
}

/* -------------------------------------------------------------------------- */
/*  Public: preview                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Compute totals without writing anything. Used by the checkout page
 * to render the order summary as the customer types a promo code or
 * adjusts items. Always trustworthy — pricing comes from the DB.
 */
export async function previewCheckout(
  userId: string | null,
  input: CheckoutPreviewInput,
  currencyContext: CurrencyContext = getBaseCurrencyContext(),
) {
  const { items: resolved } = await resolveItems(userId, input.items);
  const lines = await priceLines(resolved);

  const settings = settingsToSnapshot(await getStoreSettings());
  const subtotal = sumDecimals(lines.map((line) => line.lineTotal));
  const promo = await applyPromoCode(
    input.promoCode,
    subtotal,
    currencyContext,
  );
  const baseSummary = summarize(lines, promo, settings, input.deliveryZone);
  const summary = presentSummary(baseSummary, currencyContext);

  return {
    items: lines.map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      sku: line.sku,
      variantKey: line.variantKey,
      variantName: line.variantName,
      modelNumber: line.modelNumber,
      color: line.color,
      size: line.size,
      attributes: line.attributes,
      attributeSummary: line.attributeSummary,
      name: line.name,
      image: line.image,
      quantity: line.quantity,
      unitPrice: priceFromBDT({
        baseAmount: line.unitPrice,
        context: currencyContext,
      }).amount,
      originalPrice: priceFromBDT({
        baseAmount: line.originalPrice,
        context: currencyContext,
      }).amount,
      lineTotal: priceFromBDT({
        baseAmount: line.lineTotal,
        context: currencyContext,
      }).amount,
      lineSavings: priceFromBDT({
        baseAmount: subtractClamped(
          multiply(line.originalPrice, line.quantity),
          line.lineTotal,
        ),
        context: currencyContext,
      }).amount,
      baseUnitPrice: round2(line.unitPrice),
      baseOriginalPrice: round2(line.originalPrice),
      baseLineTotal: round2(line.lineTotal),
      baseLineSavings: round2(
        subtractClamped(
          multiply(line.originalPrice, line.quantity),
          line.lineTotal,
        ),
      ),
      stock: line.stock,
    })),
    summary,
    promo: promoToJson(promo, currencyContext),
  };
}

/* -------------------------------------------------------------------------- */
/*  Public: place order                                                       */
/* -------------------------------------------------------------------------- */

const orderInclude = {
  items: true,
} satisfies Prisma.OrderInclude;

type SslCommerzPaymentAttempt = {
  id: string;
  provider: "SSLCOMMERZ";
  transactionId: string;
  idempotencyKey: string;
};

type AirwallexPaymentAttempt = {
  id: string;
  provider: "AIRWALLEX";
  idempotencyKey: string;
};

type OnlinePaymentAttempt =
  | SslCommerzPaymentAttempt
  | AirwallexPaymentAttempt;

type OrderPaymentOptions = {
  /** Amount collected by an admin at order creation; not a discount. */
  advancePayment?: number;
  /** Persisted atomically with inventory before any provider request. */
  paymentAttempt?: OnlinePaymentAttempt;
};

async function lockCheckoutCatalogRows(
  tx: Prisma.TransactionClient,
  items: readonly ResolvedItem[],
): Promise<void> {
  const productIds = [...new Set(items.map((item) => item.productId))].sort();
  if (productIds.length === 0) return;

  await tx.$queryRaw(
    Prisma.sql`SELECT "id" FROM "Product" WHERE "id" IN (${Prisma.join(productIds)}) ORDER BY "id" FOR SHARE`,
  );
  await tx.$queryRaw(
    Prisma.sql`SELECT "id" FROM "ProductVariant" WHERE "productId" IN (${Prisma.join(productIds)}) ORDER BY "id" FOR UPDATE`,
  );
  await tx.$queryRaw`SELECT "id" FROM "Category" ORDER BY "id" FOR SHARE`;
}

async function placeOrderInternal(
  userId: string | null,
  input: CheckoutInput,
  options: OrderPaymentOptions = {},
  currencyContext: CurrencyContext = getBaseCurrencyContext(),
) {
  const isOnlinePayment =
    input.paymentMethod === "SSLCOMMERZ" ||
    input.paymentMethod === "AIRWALLEX";
  if (isOnlinePayment !== Boolean(options.paymentAttempt)) {
    throw new CheckoutError(
      400,
      isOnlinePayment
        ? "Online payment must be initiated through the payment service."
        : "Payment attempt metadata is not valid for this payment method.",
    );
  }
  if (
    options.paymentAttempt &&
    input.paymentMethod !== options.paymentAttempt.provider
  ) {
    throw new CheckoutError(
      400,
      "Payment attempt metadata does not match the selected payment method.",
    );
  }

  const { items: resolved, fromCart } = await resolveItems(
    userId,
    input.items,
  );
  const settings = settingsToSnapshot(await getStoreSettings());

  // Account-backed orders always use the account email, never a client
  // override. Guest orders preserve the optional contact email entered by
  // the admin so a receipt can still be sent where available.
  let customerEmail: string | null;
  if (userId) {
    const account = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!account) {
      throw new CheckoutError(
        401,
        "Your account could not be found. Please sign in again.",
      );
    }
    const accountEmail = account.email?.trim().toLowerCase();
    if (!accountEmail) {
      throw new CheckoutError(
        400,
        "Your account is missing an email address. Please add one on your profile page before checking out.",
      );
    }
    customerEmail = accountEmail;
  } else {
    customerEmail = input.customerEmail?.trim().toLowerCase() || null;
  }

  const orderNumber = generateOrderNumber();
  const trimmedCity = input.customerCity?.trim();
  const customerCity = trimmedCity ? trimmedCity : null;
  const trimmedPostal = input.customerPostalCode?.trim();
  const customerPostalCode = trimmedPostal ? trimmedPostal : null;
  const trimmedNote = input.customerNote?.trim();
  const customerNote = trimmedNote ? trimmedNote : null;

  try {
    return await prisma.$transaction(async (tx) => {
      await lockCheckoutCatalogRows(tx, resolved);
      const lines = await priceLines(resolved, tx);
      const subtotal = sumDecimals(lines.map((line) => line.lineTotal));
      const promo = await applyPromoCode(
        input.promoCode,
        subtotal,
        currencyContext,
      );

      if (input.promoCode && promo && !promo.ok) {
        throw new CheckoutError(409, promo.reason);
      }

      const baseSummary = summarize(lines, promo, settings, input.deliveryZone);
      const advancePayment = toDecimal(round2(options.advancePayment ?? 0));
      const totalAmount = toDecimal(baseSummary.total);
      if (advancePayment.isNegative()) {
        throw new CheckoutError(400, "Advance payment cannot be negative.");
      }
      if (advancePayment.greaterThan(totalAmount)) {
        throw new CheckoutError(
          400,
          "Advance payment cannot exceed the order total.",
        );
      }
      const isPaidInFull =
        totalAmount.greaterThan(0) &&
        advancePayment.greaterThanOrEqualTo(totalAmount);
      const currencySnapshot = createOrderCurrencySnapshot(
        {
          subtotal: baseSummary.subtotal,
          discount: baseSummary.discount,
          shipping: baseSummary.shipping,
          tax: baseSummary.tax,
          total: baseSummary.total,
          advancePayment,
        },
        currencyContext,
      );
      const summary = presentSummary(baseSummary, currencyContext);

      // Atomic stock decrement on the variant: the WHERE clause guards
      // against the last unit being sold twice.
      for (const line of lines) {
        const result = await tx.productVariant.updateMany({
          where: {
            id: line.variantId,
            stock: { gte: line.quantity },
          },
          data: { stock: { decrement: line.quantity } },
        });
        if (result.count !== 1) {
          throw new CheckoutError(
            409,
            `Stock changed for "${line.name}". Please review your cart and try again.`,
            { productId: line.productId },
          );
        }

        // Ledger entry so stock movements are auditable.
        await tx.inventoryLog.create({
          data: {
            variantId: line.variantId,
            type: "ORDER_PLACED",
            quantity: -line.quantity,
            note: `Order ${orderNumber}`,
          },
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal: baseSummary.subtotal,
          deliveryCharge: baseSummary.shipping,
          discountAmount: baseSummary.discount,
          taxAmount: baseSummary.tax,
          totalAmount: baseSummary.total,
          advancePayment: round2(advancePayment),
          currency: BASE_CURRENCY,
          baseCurrency: currencySnapshot.baseCurrency,
          displayCurrency: currencySnapshot.displayCurrency,
          displaySubtotal: currencySnapshot.displaySubtotal,
          displayDeliveryCharge: currencySnapshot.displayDeliveryCharge,
          displayDiscountAmount: currencySnapshot.displayDiscountAmount,
          displayTaxAmount: currencySnapshot.displayTaxAmount,
          displayTotalAmount: currencySnapshot.displayTotalAmount,
          displayAdvancePayment: currencySnapshot.displayAdvancePayment,
          exchangeRate: currencySnapshot.exchangeRate,
          exchangeRateAt: currencySnapshot.exchangeRateAt
            ? new Date(currencySnapshot.exchangeRateAt)
            : null,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          customerEmail,
          customerCity,
          customerPostalCode,
          customerNote,
          paymentMethod: input.paymentMethod,
          paymentStatus: isOnlinePayment
            ? "PENDING"
            : isPaidInFull
              ? "PAID"
              : "UNPAID",
          promoCode: promo?.ok ? promo.code : null,
          ...(advancePayment.greaterThan(0)
            ? {
                payments: {
                  create: {
                    provider: "ADMIN_ADVANCE",
                    amount: round2(advancePayment),
                    status: "SUCCESS",
                    paidAt: new Date(),
                  },
                },
              }
            : {}),
          items: {
            create: lines.map((line) => {
              const itemSnapshot = createOrderItemCurrencySnapshot(
                {
                  unitPrice: line.unitPrice,
                  totalPrice: line.lineTotal,
                },
                currencyContext,
              );
              return {
                productId: line.productId,
                variantId: line.variantId,
                productName: line.name,
                productImage: line.image,
                sku: line.sku,
                variantName: line.variantName,
                color: line.color,
                size: line.size,
                variantAttributes: line.attributes ?? Prisma.DbNull,
                quantity: line.quantity,
                unitPrice: round2(line.unitPrice),
                totalPrice: round2(line.lineTotal),
                displayUnitPrice: itemSnapshot.displayUnitPrice,
                displayTotalPrice: itemSnapshot.displayTotalPrice,
                buyingPrice: round2(line.buyingPrice),
              };
            }),
          },
        },
        include: orderInclude,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "PENDING",
          note: isOnlinePayment
            ? "Order created; awaiting verified online payment."
            : "Order placed.",
          updatedBy: userId,
        },
      });

      const paymentAttempt = options.paymentAttempt
        ? options.paymentAttempt.provider === "AIRWALLEX"
          ? await createAirwallexAttempt(tx, {
              id: options.paymentAttempt.id,
              orderId: order.id,
              requestId: options.paymentAttempt.idempotencyKey,
              amount: toDecimal(baseSummary.total),
              currency: BASE_CURRENCY,
            })
          : await tx.paymentTransaction.create({
              data: {
                id: options.paymentAttempt.id,
                orderId: order.id,
                provider: options.paymentAttempt.provider,
                transactionId: options.paymentAttempt.transactionId,
                idempotencyKey: options.paymentAttempt.idempotencyKey,
                amount: baseSummary.total,
                currency: BASE_CURRENCY,
                status: "PENDING",
              },
            })
        : null;

      // Bump usedCount when a real promo was applied.
      if (promo?.ok) {
        const promoUpdate = await tx.promoCode.updateMany({
          where:
            promo.usageLimit == null
              ? { id: promo.id, status: "ACTIVE", usageLimit: null }
              : {
                  id: promo.id,
                  status: "ACTIVE",
                  usageLimit: promo.usageLimit,
                  usedCount: { lt: promo.usageLimit },
                },
          data: { usedCount: { increment: 1 } },
        });
        if (promoUpdate.count !== 1) {
          throw new CheckoutError(
            409,
            "This promo code is no longer available. Please review your order and try again.",
          );
        }

        await tx.promoCodeUsage.create({
          data: {
            promoCodeId: promo.id,
            userId,
            orderId: order.id,
          },
        });
      }

      // Full-cart checkout clears every line. Explicit cart selections carry
      // `clearCart: true`, so only the purchased variants are removed and
      // unselected cart lines remain available for later.
      if (input.clearCart && userId) {
        await tx.cartItem.deleteMany({
          where: fromCart
            ? { userId }
            : {
                userId,
                variantId: { in: lines.map((line) => line.variantId) },
              },
        });
      }

      return {
        order,
        summary,
        promo: promoToJson(promo, currencyContext),
        paymentAttempt,
      };
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [String(error.meta?.target ?? "")];
      if (target.some((field) => field.includes("idempotencyKey"))) {
        throw new CheckoutError(
          409,
          "This payment request is already being processed.",
          { code: "PAYMENT_IDEMPOTENCY_CONFLICT" },
        );
      }
      throw new CheckoutError(
        500,
        "Failed to generate a unique order number. Please retry.",
      );
    }
    throw error;
  }
}

/** Place an account-backed customer checkout order. */
export async function placeOrder(
  userId: string,
  input: CheckoutInput,
  currencyContext: CurrencyContext = getBaseCurrencyContext(),
) {
  if (input.paymentMethod !== "CASH_ON_DELIVERY") {
    throw new CheckoutError(
      400,
      "Online payment must be initiated through the checkout payment service.",
    );
  }
  const result = await placeOrderInternal(userId, input, {}, currencyContext);
  return {
    order: result.order,
    summary: result.summary,
    promo: result.promo,
  };
}

/** Reserve inventory/promo and persist an SSLCommerz attempt atomically. */
export async function reserveOrderForSslCommerz(
  userId: string,
  input: CheckoutInput,
  paymentAttempt: SslCommerzPaymentAttempt,
  currencyContext: CurrencyContext = getBaseCurrencyContext(),
) {
  if (input.paymentMethod !== "SSLCOMMERZ") {
    throw new CheckoutError(400, "SSLCommerz payment method is required.");
  }

  const result = await placeOrderInternal(
    userId,
    input,
    { paymentAttempt },
    currencyContext,
  );
  const persistedAttempt = result.paymentAttempt;
  if (!persistedAttempt || persistedAttempt.provider !== "SSLCOMMERZ") {
    throw new CheckoutError(500, "Payment attempt could not be persisted.");
  }
  return { ...result, paymentAttempt: persistedAttempt };
}

async function findAirwallexReservationReplay(
  userId: string,
  idempotencyKey: string,
) {
  const persisted = await prisma.paymentTransaction.findFirst({
    where: {
      provider: "AIRWALLEX",
      idempotencyKey,
      order: { userId },
    },
    include: {
      order: { include: orderInclude },
    },
  });
  if (!persisted) return null;

  const { order, ...paymentAttempt } = persisted;
  const summary = presentPersistedOrderSummary(order);
  return {
    order,
    summary,
    promo: order.promoCode
      ? {
          ok: true as const,
          code: order.promoCode,
          description: null,
          discount: summary.discount,
          baseDiscount: summary.baseDiscount,
        }
      : null,
    paymentAttempt,
    idempotentReplay: true as const,
  };
}

/** Reserve inventory/promo and persist an Airwallex attempt atomically. */
export async function reserveOrderForAirwallex(
  userId: string,
  input: CheckoutInput,
  paymentAttempt: AirwallexPaymentAttempt,
  currencyContext: CurrencyContext = getBaseCurrencyContext(),
) {
  if (input.paymentMethod !== "AIRWALLEX") {
    throw new CheckoutError(400, "Airwallex payment method is required.");
  }

  const existing = await findAirwallexReservationReplay(
    userId,
    paymentAttempt.idempotencyKey,
  );
  if (existing) return existing;

  let result: Awaited<ReturnType<typeof placeOrderInternal>>;
  try {
    result = await placeOrderInternal(
      userId,
      input,
      { paymentAttempt },
      currencyContext,
    );
  } catch (error) {
    if (
      error instanceof CheckoutError &&
      error.details?.code === "PAYMENT_IDEMPOTENCY_CONFLICT"
    ) {
      const replay = await findAirwallexReservationReplay(
        userId,
        paymentAttempt.idempotencyKey,
      );
      if (replay) return replay;
    }
    throw error;
  }
  const persistedAttempt = result.paymentAttempt;
  if (!persistedAttempt || persistedAttempt.provider !== "AIRWALLEX") {
    throw new CheckoutError(500, "Payment attempt could not be persisted.");
  }
  return {
    ...result,
    paymentAttempt: persistedAttempt,
    idempotentReplay: false as const,
  };
}

/**
 * Place an order on behalf of a registered customer from the admin panel.
 * The shared checkout path remains the sole source of truth for pricing,
 * stock, promo usage, order-item cost snapshots, and all order totals.
 */
export async function placeOrderForCustomer(
  customerId: string | null | undefined,
  input: CheckoutInput,
  options: OrderPaymentOptions = {},
) {
  if (!customerId) {
    // Admin-created guest orders still receive the same authoritative prices,
    // stock updates, promotion handling, and buying-cost snapshots.
    return placeOrderInternal(null, { ...input, clearCart: false }, options);
  }

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: { id: true, role: true },
  });

  if (!customer) {
    throw new CheckoutError(404, "Customer not found.");
  }
  if (customer.role !== "USER") {
    throw new CheckoutError(
      409,
      "Orders can only be placed for customer accounts.",
    );
  }

  // Admin-created orders always use explicitly chosen line items. Never
  // mutate the customer's saved cart as a side effect of staff entry.
  return placeOrderInternal(customer.id, { ...input, clearCart: false }, options);
}
