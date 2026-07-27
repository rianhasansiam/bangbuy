/**
 * SSLCommerz domain-aware service layer.
 *
 * Extracted from sslcommerz.ts during the payment module restructuring.
 * Orchestrates session creation, payment validation, and transaction queries
 * using the HTTP client and Zod schemas.
 */

import "server-only";

import { z } from "zod";

import {
  buildSessionForm,
  parsePaymentUrl,
  readConfiguration,
  requestJson,
} from "./sslcommerz.client";
import {
  sessionInputSchema,
  sessionResponseSchema,
  successfulValidationResponseSchema,
  transactionQueryElementSchema,
  transactionQueryResponseSchema,
  transactionIdentifierSchema,
  validationIdentifierSchema,
  validationStatusSchema,
} from "./sslcommerz.schemas";
import type {
  SslCommerzSanitizedTransactionRaw,
  SslCommerzSanitizedValidationRaw,
  SslCommerzSessionInput,
  SslCommerzSessionResult,
  SslCommerzTransactionQueryResult,
  SslCommerzValidationResult,
} from "./sslcommerz.types";
import {
  SslCommerzGatewayResponseError,
  SslCommerzInputError,
} from "./sslcommerz.types";

function nonEmptyOrNull(value: string | null | undefined) {
  return value == null || value === "" ? null : value;
}

function newestTransactionMatch(
  matches: readonly z.infer<typeof transactionQueryElementSchema>[],
) {
  return matches.reduce((selected, candidate) => {
    const selectedDate = selected.tran_date ?? "";
    const candidateDate = candidate.tran_date ?? "";
    return candidateDate > selectedDate ? candidate : selected;
  });
}

export async function createSslCommerzSession(
  input: SslCommerzSessionInput,
): Promise<SslCommerzSessionResult> {
  const configuration = readConfiguration();
  const parsedInput = sessionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new SslCommerzInputError();
  }

  const responseBody = await requestJson(configuration.sessionEndpoint, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: buildSessionForm(parsedInput.data, configuration),
  });
  const parsedResponse = sessionResponseSchema.safeParse(responseBody);

  if (!parsedResponse.success) {
    throw new SslCommerzGatewayResponseError("INVALID_RESPONSE");
  }
  if (parsedResponse.data.status !== "SUCCESS") {
    throw new SslCommerzGatewayResponseError("SESSION_REJECTED");
  }
  if (!parsedResponse.data.GatewayPageURL) {
    throw new SslCommerzGatewayResponseError("MISSING_PAYMENT_URL");
  }
  if (
    !parsedResponse.data.sessionkey ||
    parsedResponse.data.sessionkey === configuration.storePassword
  ) {
    throw new SslCommerzGatewayResponseError("INVALID_RESPONSE");
  }

  return Object.freeze({
    sessionKey: parsedResponse.data.sessionkey,
    paymentUrl: parsePaymentUrl(
      parsedResponse.data.GatewayPageURL,
      configuration,
    ),
  });
}

export async function validateSslCommerzPayment(
  valId: string,
): Promise<SslCommerzValidationResult> {
  const configuration = readConfiguration();
  const parsedValidationId = validationIdentifierSchema.safeParse(valId);
  if (!parsedValidationId.success) {
    throw new SslCommerzInputError();
  }

  const validationUrl = new URL(configuration.validationEndpoint);
  validationUrl.searchParams.set("val_id", parsedValidationId.data);
  validationUrl.searchParams.set("store_id", configuration.storeId);
  validationUrl.searchParams.set(
    "store_passwd",
    configuration.storePassword,
  );
  validationUrl.searchParams.set("format", "json");

  const responseBody = await requestJson(validationUrl.href, {
    method: "GET",
    headers: { accept: "application/json" },
  });
  const status = validationStatusSchema.safeParse(responseBody);
  if (!status.success) {
    throw new SslCommerzGatewayResponseError("INVALID_RESPONSE");
  }
  if (status.data.status !== "VALID" && status.data.status !== "VALIDATED") {
    throw new SslCommerzGatewayResponseError("PAYMENT_NOT_VALID");
  }

  const parsedResponse =
    successfulValidationResponseSchema.safeParse(responseBody);
  if (!parsedResponse.success) {
    throw new SslCommerzGatewayResponseError("INVALID_RESPONSE");
  }

  const response = parsedResponse.data;
  const riskLevel = response.risk_level ?? null;
  const orderId = nonEmptyOrNull(response.value_a);
  const paymentRecordId = nonEmptyOrNull(response.value_b);
  const raw: SslCommerzSanitizedValidationRaw = Object.freeze({
    status: response.status,
    tran_date: response.tran_date,
    tran_id: response.tran_id,
    val_id: response.val_id,
    amount: response.amount,
    currency: response.currency,
    ...(response.currency_amount === undefined
      ? {}
      : { currency_amount: response.currency_amount }),
    ...(response.currency_type === undefined
      ? {}
      : { currency_type: response.currency_type }),
    ...(response.bank_tran_id == null
      ? {}
      : { bank_tran_id: response.bank_tran_id }),
    ...(response.card_type == null ? {} : { card_type: response.card_type }),
    risk_level: riskLevel,
    ...(orderId === null ? {} : { value_a: orderId }),
    ...(paymentRecordId === null ? {} : { value_b: paymentRecordId }),
  });

  return Object.freeze({
    transactionId: response.tran_id,
    validationId: response.val_id,
    amount: response.amount,
    currency: response.currency,
    ...(response.currency_amount === undefined
      ? {}
      : { currencyAmount: response.currency_amount }),
    ...(response.currency_type === undefined
      ? {}
      : { currencyType: response.currency_type }),
    bankTransactionId: response.bank_tran_id ?? null,
    cardType: response.card_type ?? null,
    riskLevel,
    paidAt: response.tran_date,
    status: response.status,
    metadata: Object.freeze({ orderId, paymentRecordId }),
    raw,
  });
}

export async function querySslCommerzTransaction(
  transactionId: string,
): Promise<SslCommerzTransactionQueryResult> {
  const configuration = readConfiguration();
  const parsedTransactionId =
    transactionIdentifierSchema.safeParse(transactionId);
  if (!parsedTransactionId.success) {
    throw new SslCommerzInputError();
  }

  const queryUrl = new URL(configuration.transactionQueryEndpoint);
  queryUrl.searchParams.set("tran_id", parsedTransactionId.data);
  queryUrl.searchParams.set("store_id", configuration.storeId);
  queryUrl.searchParams.set("store_passwd", configuration.storePassword);
  queryUrl.searchParams.set("format", "json");

  const responseBody = await requestJson(queryUrl.href, {
    method: "GET",
    headers: { accept: "application/json" },
  });
  const parsedResponse =
    transactionQueryResponseSchema.safeParse(responseBody);
  if (!parsedResponse.success) {
    throw new SslCommerzGatewayResponseError("INVALID_RESPONSE");
  }

  const matches = parsedResponse.data.element.flatMap((element) => {
    const parsedElement = transactionQueryElementSchema.safeParse(element);
    return parsedElement.success &&
      parsedElement.data.tran_id === parsedTransactionId.data
      ? [parsedElement.data]
      : [];
  });

  if (matches.length === 0) {
    throw new SslCommerzGatewayResponseError("TRANSACTION_NOT_FOUND");
  }

  const successfulMatches = matches.filter(
    (match) => match.status === "VALID" || match.status === "VALIDATED",
  );
  const response =
    successfulMatches.length > 0
      ? newestTransactionMatch(successfulMatches)
      : newestTransactionMatch(matches);

  const validationId = nonEmptyOrNull(response.val_id);
  const transactionDate = nonEmptyOrNull(response.tran_date);
  const amount = nonEmptyOrNull(response.amount);
  const currency = nonEmptyOrNull(response.currency);
  const currencyAmount = nonEmptyOrNull(response.currency_amount);
  const currencyType = nonEmptyOrNull(response.currency_type);
  const bankTransactionId = nonEmptyOrNull(response.bank_tran_id);
  const cardType = nonEmptyOrNull(response.card_type);
  const orderId = nonEmptyOrNull(response.value_a);
  const paymentRecordId = nonEmptyOrNull(response.value_b);
  const riskLevel =
    response.risk_level === "" ? null : (response.risk_level ?? null);
  const metadata = Object.freeze({ orderId, paymentRecordId });
  const raw: SslCommerzSanitizedTransactionRaw = Object.freeze({
    status: response.status,
    tran_id: response.tran_id,
    ...(validationId === null ? {} : { val_id: validationId }),
    ...(transactionDate === null ? {} : { tran_date: transactionDate }),
    ...(amount === null ? {} : { amount }),
    ...(currency === null ? {} : { currency }),
    ...(currencyAmount === null ? {} : { currency_amount: currencyAmount }),
    ...(currencyType === null ? {} : { currency_type: currencyType }),
    ...(bankTransactionId === null
      ? {}
      : { bank_tran_id: bankTransactionId }),
    ...(cardType === null ? {} : { card_type: cardType }),
    risk_level: riskLevel,
    ...(orderId === null ? {} : { value_a: orderId }),
    ...(paymentRecordId === null ? {} : { value_b: paymentRecordId }),
  });

  return Object.freeze({
    transactionId: response.tran_id,
    status: response.status,
    validationId,
    transactionDate,
    amount,
    currency,
    currencyAmount,
    currencyType,
    bankTransactionId,
    cardType,
    riskLevel,
    metadata,
    raw,
  });
}
