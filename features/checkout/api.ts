import {
  asRecord,
  readApiData,
  readApiError,
} from "@/features/http/api-envelope";
import type { OrderDetail } from "@/features/orders/api";

export type CheckoutPaymentMethod =
  | "CASH_ON_DELIVERY"
  | "SSLCOMMERZ"
  | "AIRWALLEX";
export type DeliveryZone = "INSIDE_DHAKA" | "OUTSIDE_DHAKA";

export type CheckoutItemInput = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CheckoutItemPriced = {
  productId: string;
  variantId: string;
  sku: string | null;
  variantKey: string;
  variantName: string | null;
  modelNumber: string | null;
  color: string | null;
  size: string | null;
  attributes: Record<string, string> | null;
  attributeSummary: string | null;
  name: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  lineTotal: number;
  stock: number;
};

export type CheckoutSummary = {
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
  currency: string;
};

export type CheckoutPromo =
  | {
      ok: true;
      code: string;
      description: string | null;
      discount: number;
    }
  | {
      ok: false;
      code: string;
      reason: string;
    }
  | null;

export type CheckoutPreview = {
  items: CheckoutItemPriced[];
  summary: CheckoutSummary;
  promo: CheckoutPromo;
  availablePaymentMethods: CheckoutPaymentMethod[];
};

export type PreviewRequest = {
  items?: CheckoutItemInput[];
  deliveryZone?: DeliveryZone;
  promoCode?: string | null;
};

export async function fetchCheckoutPreview(
  body: PreviewRequest,
): Promise<CheckoutPreview> {
  const response = await fetch("/api/checkout/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return readApiData<CheckoutPreview>(
    response,
    "Failed to compute order totals.",
  );
}

export type PlaceOrderRequest = {
  items?: CheckoutItemInput[];
  customerName: string;
  customerPhone: string;
  // Email is intentionally omitted: for authenticated checkout the server
  // always stamps the order with the account's DB email, so the client
  // never sends (or can override) it.
  customerAddress: string;
  customerCity?: string;
  deliveryZone: DeliveryZone;
  customerPostalCode?: string;
  customerNote?: string;
  paymentMethod: CheckoutPaymentMethod;
  promoCode?: string | null;
  clearCart?: boolean;
  /**
   * Stable key for retrying the same online-payment checkout submission.
   * It identifies the attempt only; prices and totals remain server-owned.
   */
  idempotencyKey?: string;
};

export type PlacedOrderResult = {
  order: OrderDetail;
  summary: CheckoutSummary;
  promo: CheckoutPromo;
  /** Present only when the customer must continue at an external gateway. */
  paymentUrl?: string;
};

export class CheckoutSubmissionError extends Error {
  readonly orderId: string | null;
  readonly paymentState: string | null;

  constructor(
    message: string,
    details: { orderId: string | null; paymentState: string | null },
  ) {
    super(message);
    this.name = "CheckoutSubmissionError";
    this.orderId = details.orderId;
    this.paymentState = details.paymentState;
  }
}

export async function placeCheckoutOrder(
  body: PlaceOrderRequest,
): Promise<PlacedOrderResult> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new CheckoutSubmissionError("Failed to place the order.", {
        orderId: null,
        paymentState: null,
      });
    }
    const details = asRecord(asRecord(payload)?.details);
    throw new CheckoutSubmissionError(
      readApiError(payload, "Failed to place the order."),
      {
        orderId:
          typeof details?.orderId === "string" ? details.orderId : null,
        paymentState:
          typeof details?.paymentState === "string"
            ? details.paymentState
            : null,
      },
    );
  }

  return readApiData<PlacedOrderResult>(
    response,
    "Failed to place the order.",
  );
}

export type CheckoutProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  area: string | null;
  postalCode: string | null;
};

export async function fetchCheckoutProfile(): Promise<CheckoutProfile | null> {
  try {
    const response = await fetch("/api/user/me", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return null;
    return await readApiData<CheckoutProfile>(
      response,
      "Failed to load profile.",
    );
  } catch {
    return null;
  }
}
