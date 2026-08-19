import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

const MAX_AUTHORIZATION_LENGTH = 512;

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Constant-time comparison for the scheduler Bearer credential. Invalid
 * header shapes are still digested so token comparison never uses `===`.
 */
export function isExchangeRateRefreshAuthorized(
  request: Request,
  secret: string,
): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const hasSafeLength =
    authorization.length > 0 &&
    authorization.length <= MAX_AUTHORIZATION_LENGTH;
  const match = hasSafeLength
    ? /^Bearer ([^\s]+)$/i.exec(authorization)
    : null;
  const candidate = match?.[1] ?? "";
  const normalizedSecret = secret.trim();
  const equal = timingSafeEqual(
    digest(candidate),
    digest(normalizedSecret),
  );

  return Boolean(match && normalizedSecret && equal);
}
