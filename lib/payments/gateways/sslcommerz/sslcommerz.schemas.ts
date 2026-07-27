/**
 * SSLCommerz Zod validation schemas.
 *
 * Extracted from sslcommerz.ts during the payment module restructuring.
 * These schemas validate inputs to the gateway client and responses
 * from the SSLCommerz API.
 */

import { z } from "zod";

export const exactDecimalSchema = z
  .string()
  .regex(/^(?:0|[1-9]\d{0,7})\.\d{2}$/);
export const positiveExactDecimalSchema = exactDecimalSchema.refine(
  (value) => value !== "0.00",
);
export const responseDecimalSchema = z
  .string()
  .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/);
export const currencySchema = z.string().regex(/^[A-Z]{3}$/);
export const identifierSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[A-Za-z0-9_-]+$/);
export const transactionIdentifierSchema = identifierSchema.max(30);
export const validationIdentifierSchema = identifierSchema.max(50);

function isSafeCallbackUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.username === "" &&
      url.password === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

const callbackUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .refine(isSafeCallbackUrl);

const customerSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    email: z.string().trim().email().max(50),
    address1: z.string().trim().min(1).max(50),
    address2: z.string().trim().min(1).max(50).optional(),
    city: z.string().trim().min(1).max(50),
    state: z.string().trim().min(1).max(50).optional(),
    postcode: z.string().trim().min(1).max(30),
    country: z.string().trim().min(1).max(50),
    phone: z.string().trim().min(1).max(20),
    fax: z.string().trim().min(1).max(20).optional(),
  })
  .strict();

const shippingSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    address1: z.string().trim().min(1).max(50),
    address2: z.string().trim().min(1).max(50).optional(),
    area: z.string().trim().min(1).max(50).optional(),
    city: z.string().trim().min(1).max(50),
    subCity: z.string().trim().min(1).max(50).optional(),
    state: z.string().trim().min(1).max(50).optional(),
    postcode: z.string().trim().min(1).max(50),
    country: z.string().trim().min(1).max(50),
  })
  .strict();

const sessionItemSchema = z
  .object({
    sku: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(255),
    category: z.string().trim().min(1).max(100),
    quantity: z.number().int().positive().max(999),
    unitPrice: positiveExactDecimalSchema,
    totalAmount: positiveExactDecimalSchema,
  })
  .strict();

export function decimalToMinorUnits(value: string) {
  const [whole, fraction] = value.split(".");
  return Number(whole) * 100 + Number(fraction);
}

export const sessionInputSchema = z
  .object({
    transactionId: transactionIdentifierSchema,
    orderId: identifierSchema,
    paymentRecordId: identifierSchema,
    totalAmount: positiveExactDecimalSchema,
    currency: currencySchema,
    invoice: z
      .object({
        productAmount: positiveExactDecimalSchema,
        vat: exactDecimalSchema,
        discountAmount: exactDecimalSchema,
        convenienceFee: exactDecimalSchema,
      })
      .strict(),
    callbacks: z
      .object({
        successUrl: callbackUrlSchema,
        failUrl: callbackUrlSchema,
        cancelUrl: callbackUrlSchema,
        ipnUrl: callbackUrlSchema,
      })
      .strict(),
    customer: customerSchema,
    shipping: shippingSchema,
    items: z.array(sessionItemSchema).min(1).max(100),
  })
  .strict()
  .superRefine((input, context) => {
    const productAmount = decimalToMinorUnits(input.invoice.productAmount);
    const invoiceTotal =
      productAmount +
      decimalToMinorUnits(input.invoice.vat) +
      decimalToMinorUnits(input.invoice.convenienceFee) -
      decimalToMinorUnits(input.invoice.discountAmount);
    if (invoiceTotal !== decimalToMinorUnits(input.totalAmount)) {
      context.addIssue({
        code: "custom",
        message: "Invoice breakdown must reconcile with the payment total.",
        path: ["invoice"],
      });
    }

    for (const [index, item] of input.items.entries()) {
      const expectedTotal =
        decimalToMinorUnits(item.unitPrice) * item.quantity;
      if (expectedTotal !== decimalToMinorUnits(item.totalAmount)) {
        context.addIssue({
          code: "custom",
          message: "Line total must equal unit price multiplied by quantity.",
          path: ["items", index, "totalAmount"],
        });
      }
    }

    const productName = input.items.map((item) => item.name).join(",");
    if (productName.length > 255) {
      context.addIssue({
        code: "custom",
        message: "Combined product name is too long.",
        path: ["items"],
      });
    }

    const productCategory = [
      ...new Set(input.items.map((item) => item.category)),
    ].join(",");
    if (productCategory.length > 100) {
      context.addIssue({
        code: "custom",
        message: "Combined product category is too long.",
        path: ["items"],
      });
    }

    const cartTotal = input.items.reduce(
      (total, item) => total + decimalToMinorUnits(item.totalAmount),
      0,
    );
    if (cartTotal !== productAmount) {
      context.addIssue({
        code: "custom",
        message: "Cart lines must reconcile with the invoice product amount.",
        path: ["invoice", "productAmount"],
      });
    }
  });

export const environmentSchema = z
  .object({
    storeId: z.string().trim().min(1).max(30),
    storePassword: z.string().min(1).max(30),
    isLive: z.enum(["true", "false"]),
  })
  .strict();

export const sessionResponseSchema = z.object({
  status: z.string().min(1).max(20),
  sessionkey: z.string().min(1).max(100).optional(),
  GatewayPageURL: z.string().min(1).max(2_048).optional(),
});

export const validationStatusSchema = z.object({
  status: z.string().min(1).max(30),
});

export const riskLevelSchema = z
  .union([z.literal(0), z.literal(1), z.literal("0"), z.literal("1")])
  .transform((value): 0 | 1 => (Number(value) === 1 ? 1 : 0));

export const successfulValidationResponseSchema = z
  .object({
    status: z.enum(["VALID", "VALIDATED"]),
    tran_date: z.string().min(1).max(40),
    tran_id: z.string().min(1).max(30),
    val_id: z.string().min(1).max(50),
    amount: responseDecimalSchema,
    currency: currencySchema,
    currency_amount: responseDecimalSchema.optional(),
    currency_type: currencySchema.optional(),
    bank_tran_id: z.string().min(1).max(80).nullish(),
    card_type: z.string().min(1).max(50).nullish(),
    risk_level: riskLevelSchema.nullish(),
    value_a: z
      .union([identifierSchema, z.literal("")])
      .nullish(),
    value_b: z
      .union([identifierSchema, z.literal("")])
      .nullish(),
    APIConnect: z.literal("DONE").optional(),
  })
  .superRefine((response, context) => {
    if (
      (response.currency_amount === undefined) !==
      (response.currency_type === undefined)
    ) {
      context.addIssue({
        code: "custom",
        message: "Original amount and currency must be returned together.",
        path: ["currency_amount"],
      });
    }
  });

export const transactionQueryStatusSchema = z.enum([
  "VALID",
  "VALIDATED",
  "PENDING",
  "FAILED",
  "CANCELLED",
  "CANCEL",
  "EXPIRED",
  "UNATTEMPTED",
]);

const optionalIdentifierSchema = z
  .union([identifierSchema, z.literal("")])
  .nullish();
const optionalTextSchema = (maximum: number) =>
  z.string().max(maximum).nullish();
const optionalResponseDecimalSchema = z
  .union([responseDecimalSchema, z.literal("")])
  .nullish();
const optionalCurrencySchema = z
  .union([currencySchema, z.literal("")])
  .nullish();
const optionalRiskLevelSchema = z
  .union([riskLevelSchema, z.literal("")])
  .nullish();

export const transactionQueryElementSchema = z.object({
  status: transactionQueryStatusSchema,
  tran_id: z.string().min(1).max(50),
  val_id: optionalTextSchema(50),
  tran_date: optionalTextSchema(40),
  amount: optionalResponseDecimalSchema,
  currency: optionalCurrencySchema,
  currency_amount: optionalResponseDecimalSchema,
  currency_type: optionalCurrencySchema,
  bank_tran_id: optionalTextSchema(80),
  card_type: optionalTextSchema(50),
  risk_level: optionalRiskLevelSchema,
  value_a: optionalIdentifierSchema,
  value_b: optionalIdentifierSchema,
});

export const transactionQueryResponseSchema = z.object({
  APIConnect: z.literal("DONE"),
  no_of_trans_found: z.number().int().nonnegative(),
  element: z.array(z.unknown()),
});
