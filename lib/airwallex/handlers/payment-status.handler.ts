import "server-only";

import { requireUser } from "@/lib/api/guards";
import { jsonError, ok, tooManyRequests } from "@/lib/api/response";
import { rateLimitPersistent } from "@/lib/auth/rate-limit";

import { handleAirwallexApiError } from "../errors/airwallex.errors";
import { airwallexInitiatePaymentRequestSchema } from "../schemas/airwallex.schemas";
import { getOwnerScopedAirwallexPaymentStatus } from "../services/airwallex-payment-status.service";

type PaymentStatusRouteContext = {
  params: Promise<{ orderId: string }>;
};

const STATUS_RATE_LIMIT = 90;
const STATUS_RATE_WINDOW_MS = 60_000;

export async function GET(
  _request: Request,
  context: PaymentStatusRouteContext,
): Promise<Response> {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const params = await context.params;
  const parsed = airwallexInitiatePaymentRequestSchema.safeParse(params);
  if (!parsed.success) return jsonError(400, "Invalid order identifier.");

  try {
    const limit = await rateLimitPersistent(
      `airwallex-status:${guard.session.user.id}:${parsed.data.orderId}`,
      STATUS_RATE_LIMIT,
      STATUS_RATE_WINDOW_MS,
    );
    if (!limit.allowed) return tooManyRequests(limit.resetMs);

    const status = await getOwnerScopedAirwallexPaymentStatus(
      guard.session.user.id,
      parsed.data.orderId,
    );
    if (!status) return jsonError(404, "Order not found.");
    return ok(status);
  } catch (error) {
    return handleAirwallexApiError("airwallex.status.GET", error);
  }
}
