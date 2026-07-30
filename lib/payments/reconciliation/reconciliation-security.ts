/**
 * Reconciliation endpoint security.
 *
 * Moved from app/api/payments/sslcommerz/reconcile/route.ts during the
 * payment module restructuring. Timing-safe token validation lives here
 * so the route handler stays thin.
 */

import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Validate a Bearer token against the reconciliation secret using
 * constant-time comparison. Never replace this with `===`.
 */
export function isReconciliationAuthorized(
  request: Request,
  secret: string,
): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  if (
    !authorization.startsWith("Bearer ") ||
    authorization.length > 512
  ) {
    return false;
  }
  const candidate = authorization.slice("Bearer ".length);
  return timingSafeEqual(digest(candidate), digest(secret));
}
