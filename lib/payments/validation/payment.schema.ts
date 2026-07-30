/**
 * Payment notification validation schemas.
 *
 * Moved from lib/validations/payment.validation.ts during the payment
 * module restructuring.
 */

import { z } from "zod";

const DECIMAL_MONEY = /^\d{1,10}(?:\.\d{1,2})?$/;

/**
 * SSLCommerz sends IPN/callback data as form fields. Extra provider fields
 * are intentionally stripped; only the correlation/validation inputs enter
 * the payment service.
 */
export const sslCommerzNotificationSchema = z
  .object({
    tran_id: z.string().trim().min(1).max(30),
    // Failed/cancelled query results may carry an empty validation ID.
    // Successful notifications must have one so they can be validated
    // directly against SSLCommerz's validation API.
    val_id: z.string().trim().max(50).optional().default(""),
    status: z.enum([
      "VALID",
      "VALIDATED",
      "FAILED",
      "CANCELLED",
      "CANCEL",
      "EXPIRED",
      "UNATTEMPTED",
    ]),
    amount: z.string().trim().regex(DECIMAL_MONEY).optional(),
    currency: z.string().trim().length(3).toUpperCase().optional(),
    value_a: z.string().trim().max(255).optional(),
    value_b: z.string().trim().max(255).optional(),
  })
  .superRefine((notification, context) => {
    if (
      (notification.status === "VALID" ||
        notification.status === "VALIDATED") &&
      !notification.val_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["val_id"],
        message: "Validation ID is required for a successful payment.",
      });
    }
  });

export type SslCommerzNotificationInput = z.infer<
  typeof sslCommerzNotificationSchema
>;
