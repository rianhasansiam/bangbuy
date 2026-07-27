/**
 * SSLCommerz HTTP communication layer.
 *
 * Extracted from sslcommerz.ts during the payment module restructuring.
 * Handles raw HTTP requests, timeouts, configuration reading, form building,
 * and payment URL validation. No domain logic lives here.
 */

import "server-only";

import { z } from "zod";

import {
  LIVE_SESSION_ENDPOINT,
  LIVE_TRANSACTION_QUERY_ENDPOINT,
  LIVE_VALIDATION_ENDPOINT,
  REQUEST_TIMEOUT_MS,
  SANDBOX_SESSION_ENDPOINT,
  SANDBOX_TRANSACTION_QUERY_ENDPOINT,
  SANDBOX_VALIDATION_ENDPOINT,
} from "./sslcommerz.constants";
import {
  environmentSchema,
  sessionInputSchema,
} from "./sslcommerz.schemas";
import {
  SslCommerzConfigurationError,
  SslCommerzGatewayResponseError,
  SslCommerzNetworkError,
} from "./sslcommerz.types";

export interface SslCommerzConfiguration {
  readonly storeId: string;
  readonly storePassword: string;
  readonly sessionEndpoint: string;
  readonly validationEndpoint: string;
  readonly transactionQueryEndpoint: string;
  readonly gatewayHost: string;
}

export function readConfiguration(): SslCommerzConfiguration {
  const parsed = environmentSchema.safeParse({
    storeId: process.env.SSLCOMMERZ_STORE_ID,
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD,
    isLive: process.env.SSLCOMMERZ_IS_LIVE,
  });

  if (!parsed.success) {
    throw new SslCommerzConfigurationError();
  }

  if (parsed.data.isLive === "true") {
    return {
      storeId: parsed.data.storeId,
      storePassword: parsed.data.storePassword,
      sessionEndpoint: LIVE_SESSION_ENDPOINT,
      validationEndpoint: LIVE_VALIDATION_ENDPOINT,
      transactionQueryEndpoint: LIVE_TRANSACTION_QUERY_ENDPOINT,
      gatewayHost: "securepay.sslcommerz.com",
    };
  }

  return {
    storeId: parsed.data.storeId,
    storePassword: parsed.data.storePassword,
    sessionEndpoint: SANDBOX_SESSION_ENDPOINT,
    validationEndpoint: SANDBOX_VALIDATION_ENDPOINT,
    transactionQueryEndpoint: SANDBOX_TRANSACTION_QUERY_ENDPOINT,
    gatewayHost: "sandbox.sslcommerz.com",
  };
}

export async function requestJson(url: string, init: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new SslCommerzNetworkError("TIMEOUT"));
    }, REQUEST_TIMEOUT_MS);
  });

  const request = (async () => {
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
      });
    } catch {
      throw new SslCommerzNetworkError(
        controller.signal.aborted ? "TIMEOUT" : "NETWORK_FAILURE",
      );
    }

    if (!response.ok) {
      throw new SslCommerzGatewayResponseError(
        "HTTP_ERROR",
        response.status,
      );
    }

    try {
      return (await response.json()) as unknown;
    } catch {
      if (controller.signal.aborted) {
        throw new SslCommerzNetworkError("TIMEOUT");
      }
      throw new SslCommerzGatewayResponseError("INVALID_RESPONSE");
    }
  })();

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export function appendOptional(
  form: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value !== undefined) form.set(key, value);
}

export function buildSessionForm(
  input: z.infer<typeof sessionInputSchema>,
  configuration: SslCommerzConfiguration,
) {
  const itemCount = input.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const productName = input.items.map((item) => item.name).join(",");
  const productCategory = [
    ...new Set(input.items.map((item) => item.category)),
  ].join(",");

  const form = new URLSearchParams({
    store_id: configuration.storeId,
    store_passwd: configuration.storePassword,
    total_amount: input.totalAmount,
    currency: input.currency,
    tran_id: input.transactionId,
    success_url: input.callbacks.successUrl,
    fail_url: input.callbacks.failUrl,
    cancel_url: input.callbacks.cancelUrl,
    ipn_url: input.callbacks.ipnUrl,
    emi_option: "0",
    cus_name: input.customer.name,
    cus_email: input.customer.email,
    cus_add1: input.customer.address1,
    cus_city: input.customer.city,
    cus_postcode: input.customer.postcode,
    cus_country: input.customer.country,
    cus_phone: input.customer.phone,
    shipping_method: "YES",
    num_of_item: String(itemCount),
    ship_name: input.shipping.name,
    ship_add1: input.shipping.address1,
    ship_city: input.shipping.city,
    ship_postcode: input.shipping.postcode,
    ship_country: input.shipping.country,
    product_name: productName,
    product_category: productCategory,
    product_profile: "physical-goods",
    product_amount: input.invoice.productAmount,
    vat: input.invoice.vat,
    discount_amount: input.invoice.discountAmount,
    convenience_fee: input.invoice.convenienceFee,
    cart: JSON.stringify(
      input.items.map((item) => ({
        sku: item.sku,
        product: item.name,
        quantity: String(item.quantity),
        amount: item.totalAmount,
        unit_price: item.unitPrice,
      })),
    ),
    value_a: input.orderId,
    value_b: input.paymentRecordId,
  });

  appendOptional(form, "cus_add2", input.customer.address2);
  appendOptional(form, "cus_state", input.customer.state);
  appendOptional(form, "cus_fax", input.customer.fax);
  appendOptional(form, "ship_add2", input.shipping.address2);
  appendOptional(form, "ship_area", input.shipping.area);
  appendOptional(form, "ship_sub_city", input.shipping.subCity);
  appendOptional(form, "ship_state", input.shipping.state);

  return form;
}

export function parsePaymentUrl(
  value: string,
  configuration: SslCommerzConfiguration,
) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new SslCommerzGatewayResponseError("UNSAFE_PAYMENT_URL");
  }

  const containsCredentialField = [...url.searchParams.keys()].some((key) =>
    ["store_passwd", "store_password", "password"].includes(key.toLowerCase()),
  );
  const containsStorePassword = [...url.searchParams.values()].some(
    (entry) => entry === configuration.storePassword,
  );

  if (
    url.protocol !== "https:" ||
    url.hostname !== configuration.gatewayHost ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== "" ||
    containsCredentialField ||
    containsStorePassword
  ) {
    throw new SslCommerzGatewayResponseError("UNSAFE_PAYMENT_URL");
  }

  return url.href;
}
