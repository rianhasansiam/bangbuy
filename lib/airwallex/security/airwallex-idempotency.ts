import "server-only";

import { createHash, randomUUID } from "node:crypto";

export function createAirwallexRequestId(): string {
  return randomUUID();
}

/**
 * Derive a stable provider request ID without exposing an owner identifier.
 * The browser UUID is only a retry token; the value persisted and sent to the
 * provider is a domain-separated UUIDv5-shaped digest produced by the server.
 */
export function deriveAirwallexRequestId(
  ownerId: string,
  checkoutAttemptId: string,
): string {
  const bytes = createHash("sha256")
    .update("bangbuy:airwallex:checkout-request:v1\0", "utf8")
    .update(ownerId, "utf8")
    .update("\0", "utf8")
    .update(checkoutAttemptId, "utf8")
    .digest()
    .subarray(0, 16);

  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}
