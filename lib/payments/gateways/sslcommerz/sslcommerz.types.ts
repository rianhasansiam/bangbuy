/**
 * SSLCommerz-specific types and error classes.
 *
 * Moved from lib/payments/payment.types.ts during the payment module
 * restructuring. Core provider-agnostic types live in core/payment.types.ts.
 */

/**
 * A canonical decimal money string (for example, "1250.00").
 *
 * Provider inputs deliberately use strings instead of JavaScript numbers so
 * the checkout service can pass its authoritative Decimal value without
 * introducing floating-point rounding.
 */
export type ExactDecimalString = string;

export interface SslCommerzCallbackUrls {
  readonly successUrl: string;
  readonly failUrl: string;
  readonly cancelUrl: string;
  readonly ipnUrl: string;
}

export interface SslCommerzCustomer {
  readonly name: string;
  readonly email: string;
  readonly address1: string;
  readonly address2?: string;
  readonly city: string;
  readonly state?: string;
  readonly postcode: string;
  readonly country: string;
  readonly phone: string;
  readonly fax?: string;
}

export interface SslCommerzShippingAddress {
  readonly name: string;
  readonly address1: string;
  readonly address2?: string;
  readonly area?: string;
  readonly city: string;
  readonly subCity?: string;
  readonly state?: string;
  readonly postcode: string;
  readonly country: string;
}

export interface SslCommerzSessionItem {
  readonly sku: string;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly unitPrice: ExactDecimalString;
  readonly totalAmount: ExactDecimalString;
}

export interface SslCommerzSessionInput {
  readonly transactionId: string;
  readonly orderId: string;
  readonly paymentRecordId: string;
  readonly totalAmount: ExactDecimalString;
  readonly currency: string;
  readonly invoice: {
    readonly productAmount: ExactDecimalString;
    readonly vat: ExactDecimalString;
    readonly discountAmount: ExactDecimalString;
    readonly convenienceFee: ExactDecimalString;
  };
  readonly callbacks: SslCommerzCallbackUrls;
  readonly customer: SslCommerzCustomer;
  readonly shipping: SslCommerzShippingAddress;
  readonly items: readonly SslCommerzSessionItem[];
}

export interface SslCommerzSessionResult {
  readonly sessionKey: string;
  readonly paymentUrl: string;
}

export type SslCommerzValidationStatus = "VALID" | "VALIDATED";

export interface SslCommerzSanitizedValidationRaw {
  readonly status: SslCommerzValidationStatus;
  readonly tran_date: string;
  readonly tran_id: string;
  readonly val_id: string;
  readonly amount: ExactDecimalString;
  readonly currency: string;
  readonly currency_amount?: ExactDecimalString;
  readonly currency_type?: string;
  readonly bank_tran_id?: string;
  readonly card_type?: string;
  readonly risk_level: 0 | 1 | null;
  readonly value_a?: string;
  readonly value_b?: string;
}

export interface SslCommerzValidationResult {
  readonly transactionId: string;
  readonly validationId: string;
  readonly amount: ExactDecimalString;
  readonly currency: string;
  readonly currencyAmount?: ExactDecimalString;
  readonly currencyType?: string;
  readonly bankTransactionId: string | null;
  readonly cardType: string | null;
  readonly riskLevel: 0 | 1 | null;
  readonly paidAt: string;
  readonly status: SslCommerzValidationStatus;
  readonly metadata: Readonly<SslCommerzTransactionMetadata>;
  readonly raw: Readonly<SslCommerzSanitizedValidationRaw>;
}

export type SslCommerzTransactionQueryStatus =
  | SslCommerzValidationStatus
  | "PENDING"
  | "FAILED"
  | "CANCELLED"
  | "CANCEL"
  | "EXPIRED"
  | "UNATTEMPTED";

export interface SslCommerzTransactionMetadata {
  readonly orderId: string | null;
  readonly paymentRecordId: string | null;
}

export interface SslCommerzSanitizedTransactionRaw {
  readonly status: SslCommerzTransactionQueryStatus;
  readonly tran_id: string;
  readonly val_id?: string;
  readonly tran_date?: string;
  readonly amount?: ExactDecimalString;
  readonly currency?: string;
  readonly currency_amount?: ExactDecimalString;
  readonly currency_type?: string;
  readonly bank_tran_id?: string;
  readonly card_type?: string;
  readonly risk_level: 0 | 1 | null;
  readonly value_a?: string;
  readonly value_b?: string;
}

export interface SslCommerzTransactionQueryResult {
  readonly transactionId: string;
  readonly status: SslCommerzTransactionQueryStatus;
  readonly validationId: string | null;
  readonly transactionDate: string | null;
  readonly amount: ExactDecimalString | null;
  readonly currency: string | null;
  readonly currencyAmount: ExactDecimalString | null;
  readonly currencyType: string | null;
  readonly bankTransactionId: string | null;
  readonly cardType: string | null;
  readonly riskLevel: 0 | 1 | null;
  readonly metadata: Readonly<SslCommerzTransactionMetadata>;
  readonly raw: Readonly<SslCommerzSanitizedTransactionRaw>;
}

export type SslCommerzErrorCode =
  | "SSLCOMMERZ_CONFIGURATION_ERROR"
  | "SSLCOMMERZ_INPUT_ERROR"
  | "SSLCOMMERZ_NETWORK_ERROR"
  | "SSLCOMMERZ_GATEWAY_RESPONSE_ERROR";

export abstract class SslCommerzError extends Error {
  readonly code: SslCommerzErrorCode;

  protected constructor(
    name: string,
    code: SslCommerzErrorCode,
    message: string,
  ) {
    super(message);
    this.name = name;
    this.code = code;
  }
}

export class SslCommerzConfigurationError extends SslCommerzError {
  constructor() {
    super(
      "SslCommerzConfigurationError",
      "SSLCOMMERZ_CONFIGURATION_ERROR",
      "SSLCommerz server configuration is missing or invalid.",
    );
  }
}

export class SslCommerzInputError extends SslCommerzError {
  constructor() {
    super(
      "SslCommerzInputError",
      "SSLCOMMERZ_INPUT_ERROR",
      "SSLCommerz payment input is invalid.",
    );
  }
}

export type SslCommerzNetworkFailure = "NETWORK_FAILURE" | "TIMEOUT";

const NETWORK_ERROR_MESSAGES: Record<SslCommerzNetworkFailure, string> = {
  NETWORK_FAILURE: "Unable to reach SSLCommerz.",
  TIMEOUT: "The SSLCommerz request timed out.",
};

export class SslCommerzNetworkError extends SslCommerzError {
  readonly reason: SslCommerzNetworkFailure;

  constructor(reason: SslCommerzNetworkFailure) {
    super(
      "SslCommerzNetworkError",
      "SSLCOMMERZ_NETWORK_ERROR",
      NETWORK_ERROR_MESSAGES[reason],
    );
    this.reason = reason;
  }
}

export type SslCommerzGatewayResponseFailure =
  | "HTTP_ERROR"
  | "INVALID_RESPONSE"
  | "SESSION_REJECTED"
  | "MISSING_PAYMENT_URL"
  | "UNSAFE_PAYMENT_URL"
  | "PAYMENT_NOT_VALID"
  | "TRANSACTION_NOT_FOUND";

const GATEWAY_ERROR_MESSAGES: Record<
  SslCommerzGatewayResponseFailure,
  string
> = {
  HTTP_ERROR: "SSLCommerz returned an unsuccessful HTTP response.",
  INVALID_RESPONSE: "SSLCommerz returned an invalid response.",
  SESSION_REJECTED: "SSLCommerz rejected the payment session.",
  MISSING_PAYMENT_URL: "SSLCommerz did not return a payment URL.",
  UNSAFE_PAYMENT_URL: "SSLCommerz returned an untrusted payment URL.",
  PAYMENT_NOT_VALID: "SSLCommerz did not validate the payment.",
  TRANSACTION_NOT_FOUND:
    "SSLCommerz did not return the requested transaction.",
};

export class SslCommerzGatewayResponseError extends SslCommerzError {
  readonly reason: SslCommerzGatewayResponseFailure;
  readonly httpStatus: number | null;

  constructor(
    reason: SslCommerzGatewayResponseFailure,
    httpStatus: number | null = null,
  ) {
    super(
      "SslCommerzGatewayResponseError",
      "SSLCOMMERZ_GATEWAY_RESPONSE_ERROR",
      GATEWAY_ERROR_MESSAGES[reason],
    );
    this.reason = reason;
    this.httpStatus = httpStatus;
  }
}
