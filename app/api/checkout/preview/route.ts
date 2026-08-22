import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, ok } from "@/lib/api/response";
import { airwallexConfig } from "@/lib/airwallex/config/airwallex.config";
import {
  AirwallexConfigurationError,
  AirwallexExchangeRateUnavailableError,
  AirwallexValidationError,
} from "@/lib/airwallex/errors/airwallex.errors";
import {
  quoteAirwallexPayment,
  toPublicAirwallexPaymentQuote,
  type PublicAirwallexPaymentQuote,
} from "@/lib/airwallex/services/airwallex-currency.service";
import { createAirwallexPaymentQuoteToken } from "@/lib/airwallex/security/airwallex-payment-quote-token";
import { auth } from "@/lib/auth/auth";
import { toAppSession } from "@/lib/auth/session";
import { getCurrencyContextFromRequest } from "@/lib/currency/request-currency";
import { previewCheckout } from "@/lib/services/checkout.service";
import { handleServiceError } from "@/lib/services/service-error";
import { checkoutPreviewSchema } from "@/lib/validations/checkout.validation";

/**
 * POST /api/checkout/preview
 *
 * Read-only for guests and authenticated customers. Guests provide
 * explicit items; authenticated customers may omit them to use their
 * persisted cart. Nothing in the DB is mutated. All money math (tax,
 * shipping, free-shipping threshold, and promos) happens server-side.
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError(415, "Content-Type must be application/json.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON payload.");
  }

  const parsed = checkoutPreviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Please review the highlighted fields and try again.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  try {
    const session = toAppSession((await auth()) as Session | null);
    const currencyContext = await getCurrencyContextFromRequest(request);
    const preview = await previewCheckout(
      session?.user.id ?? null,
      parsed.data,
      currencyContext,
    );

    let airwallexPaymentQuote:
      | (PublicAirwallexPaymentQuote & { quoteToken: string })
      | null = null;
    if (airwallexConfig.enabled && session?.user.id) {
      try {
        const quote = await quoteAirwallexPayment({
          baseAmount: preview.summary.baseTotal,
          displayContext: currencyContext,
        });
        airwallexPaymentQuote = {
          ...toPublicAirwallexPaymentQuote(quote),
          quoteToken: createAirwallexPaymentQuoteToken({
            userId: session.user.id,
            quote,
          }),
        };
      } catch (error) {
        if (
          !(error instanceof AirwallexConfigurationError) &&
          !(error instanceof AirwallexExchangeRateUnavailableError) &&
          !(error instanceof AirwallexValidationError)
        ) {
          throw error;
        }
      }
    }

    return ok({
      ...preview,
      airwallexPaymentQuote,
      availablePaymentMethods: [
        "CASH_ON_DELIVERY" as const,
        ...(airwallexPaymentQuote ? (["AIRWALLEX"] as const) : []),
      ],
    });
  } catch (error) {
    return handleServiceError("checkout.preview.POST", error);
  }
}
