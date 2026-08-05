import "server-only";

import { z } from "zod";

import { requireUser } from "@/lib/api/guards";
import { jsonError, ok, tooManyRequests } from "@/lib/api/response";
import { getClientIp, rateLimitPersistent } from "@/lib/auth/rate-limit";

import {
  AirwallexValidationError,
  handleAirwallexApiError,
} from "../errors/airwallex.errors";
import { airwallexInitiatePaymentRequestSchema } from "../schemas/airwallex.schemas";
import { assertAirwallexInitiationOrigin } from "../security/airwallex-origin-validation";
import { initiateAirwallexPayment } from "../services/airwallex-payment-initiation.service";

const MAX_INITIATION_BYTES = 16 * 1024;

export async function POST(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  try {
    assertAirwallexInitiationOrigin(request);
    const userId = guard.session.user.id;
    const ip = getClientIp(request);
    const baseLimits = await Promise.all([
      rateLimitPersistent(`airwallex-initiate-user:${userId}`, 10, 5 * 60_000),
      rateLimitPersistent(`airwallex-initiate-ip:${ip}`, 30, 5 * 60_000),
    ]);
    const blockedBaseLimit = baseLimits.find((limit) => !limit.allowed);
    if (blockedBaseLimit) return tooManyRequests(blockedBaseLimit.resetMs);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonError(415, "Content-Type must be application/json.");
    }

    const declaredLength = request.headers.get("content-length");
    if (
      declaredLength &&
      /^\d+$/.test(declaredLength) &&
      Number(declaredLength) > MAX_INITIATION_BYTES
    ) {
      return jsonError(413, "Payment request is too large.");
    }

    let body: unknown;
    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_INITIATION_BYTES) {
        return jsonError(413, "Payment request is too large.");
      }
      body = JSON.parse(rawBody);
    } catch {
      throw new AirwallexValidationError("Invalid JSON payload.");
    }
    const parsed = airwallexInitiatePaymentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Invalid payment request.", {
        code: "AIRWALLEX_VALIDATION_ERROR",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      });
    }

    const orderLimit = await rateLimitPersistent(
      `airwallex-initiate-order:${userId}:${parsed.data.orderId}`,
      8,
      5 * 60_000,
    );
    if (!orderLimit.allowed) return tooManyRequests(orderLimit.resetMs);

    return ok(
      await initiateAirwallexPayment(userId, parsed.data.orderId),
    );
  } catch (error) {
    return handleAirwallexApiError("initiate", error);
  }
}
