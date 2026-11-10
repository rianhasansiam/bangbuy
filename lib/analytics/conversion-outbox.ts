import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma } from "@/app/generated/prisma/client";
import { toDecimal, type DecimalInput } from "@/lib/money";
import { getTrackingRuntimePolicy } from "./config";
import { CURRENT_TRACKING_POLICY_VERSION } from "./consent";
import { assessConversion } from "./conversion-policy";
import type { ClaimedConversion, ConversionConsent, ConversionName } from "./conversion-contract";

type Tx = Prisma.TransactionClient;

export async function captureCurrentCheckoutMarketingConsent(): Promise<ConversionConsent | null> {
  if (!getTrackingRuntimePolicy().capiEnabled) return null;
  try {
    const { getMarketingConsentForCurrentRequest } = await import('./consent-server');
    const consent = await getMarketingConsentForCurrentRequest();
    if (!consent?.occurredAt || !consent.expiresAt) return null;
    return {
      id: consent.id, state: consent.state, policyVersion: consent.policyVersion,
      occurredAt: new Date(consent.occurredAt), expiresAt: new Date(consent.expiresAt),
      origin: consent.origin, sourceUrl: consent.sourceUrl, matching: consent.matching,
      context: consent.context,
    };
  } catch { return null; }
}

/** Marketing is optional even when an additive migration has not run yet.
 * PostgreSQL errors MUST be rolled back to a savepoint before commerce can
 * continue; a JS catch alone leaves the parent transaction aborted.
 */
export async function withMarketingSavepoint<T>(tx: Tx, work: () => Promise<T>): Promise<T | null> {
  // Older test clients and migrations do not expose optional marketing tables.
  if (!tx.marketingConversionOutbox || !tx.$executeRawUnsafe) return null;
  let created = false;
  try {
    await tx.$executeRawUnsafe('SAVEPOINT marketing_conversion_write');
    created = true;
    const result = await work();
    await tx.$executeRawUnsafe('RELEASE SAVEPOINT marketing_conversion_write');
    return result;
  } catch {
    if (created) {
      await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT marketing_conversion_write');
      await tx.$executeRawUnsafe('RELEASE SAVEPOINT marketing_conversion_write');
    }
    // Only a fixed failure classification. No IDs, payload, URL or exception.
    console.warn('[marketing.outbox]', { code: 'OPTIONAL_WRITE_UNAVAILABLE' });
    return null;
  }
}

function savedAmount(value: DecimalInput): number | null {
  try {
    if (value == null) return null;
    const decimal = toDecimal(value);
    return decimal.isFinite() && decimal.greaterThan(0) && decimal.decimalPlaces() <= 2
      ? decimal.toNumber() : null;
  } catch { return null; }
}

async function enqueueInsideSavepoint(tx: Tx, input: {
  orderId: string;
  eventName: ConversionName;
  occurredAt: Date;
  amount: DecimalInput;
  currency: string;
}) {
  const policy = getTrackingRuntimePolicy();
  // No pre-enable backlog, and no incidental consent reads when disabled.
  if (!policy.runtimeEnabled || !policy.capiEnabled) return null;
  // The current guest privacy contract limits guest checkout data to delivery
  // and support. Generic marketing consent/approvals cannot override it.
  const owner = await tx.order.findUnique({ where: { id: input.orderId }, select: { userId: true } });
  if (!owner?.userId) return null;
  const linkage = await tx.marketingOrderConsent.findUnique({
    where: { orderId: input.orderId }, include: { consent: true },
  });
  if (!linkage || linkage.policyVersion !== linkage.consent.policyVersion) return null;
  const items = await tx.orderItem.findMany({ where: { orderId: input.orderId }, select: { productId: true } });
  if (!items.length || items.some((item) => !item.productId)) return null;
  const value = savedAmount(input.amount);
  if (value === null) return null;
  const contentIds = [...new Set(items.map((item) => item.productId!))];
  const consent = linkage.consent as ConversionConsent;
  const record: ClaimedConversion = {
    id: randomUUID(), eventName: input.eventName, occurredAt: input.occurredAt,
    payload: { value, currency: input.currency, contentIds },
    consentId: consent.id, policyVersion: consent.policyVersion,
    sourceUrl: consent.sourceUrl, matching: consent.matching, context: consent.context,
    attempts: 0, lockToken: '',
    expiresAt: new Date(Math.min(input.occurredAt.getTime() + 7 * 86_400_000, consent.expiresAt.getTime())),
  };
  const decision = assessConversion({ record, consent, policy });
  return tx.marketingConversionOutbox.upsert({
    where: { businessKey: `${input.eventName}:${input.orderId}` },
    update: {},
    create: {
      id: record.id, businessKey: `${input.eventName}:${input.orderId}`,
      orderId: input.orderId, eventName: input.eventName, occurredAt: input.occurredAt,
      payload: record.payload as Prisma.InputJsonObject,
      consentId: consent.id, policyVersion: record.policyVersion,
      sourceUrl: record.sourceUrl,
      matching: consent.matching === null ? Prisma.DbNull : consent.matching as Prisma.InputJsonValue,
      context: consent.context == null ? Prisma.DbNull : consent.context as Prisma.InputJsonValue,
      state: decision.allowed ? 'PENDING' : 'BLOCKED',
      lastFailureCode: decision.allowed ? null : decision.reason,
      expiresAt: record.expiresAt,
    },
  });
}

/** Called only from the already-authoritative, non-review payment transaction.
 * The immutable payment amount/currency and original paidAt come from its
 * locked persisted payment record, never from checkout input or browser FX.
 */
export function recordVerifiedPurchase(tx: Tx, input: {
  orderId: string;
  paymentMethod: string;
  amount: DecimalInput;
  currency: string;
  paidAt: Date;
}) {
  if (!['AIRWALLEX', 'SSLCOMMERZ'].includes(input.paymentMethod)) return Promise.resolve(null);
  return withMarketingSavepoint(tx, () => enqueueInsideSavepoint(tx, {
    orderId: input.orderId, eventName: 'Purchase', occurredAt: input.paidAt,
    amount: input.amount, currency: input.currency,
  }));
}

/** Internal OrderPlaced is never exported as COD Purchase. A successful
 * created order also establishes the server-side InitiateCheckout transition.
 */
export function recordCommittedOrder(tx: Tx, input: {
  orderId: string;
  createdAt: Date;
  amount: DecimalInput;
  currency: string;
  consent: ConversionConsent | null;
}) {
  return withMarketingSavepoint(tx, async () => {
    await tx.marketingConversionOutbox.upsert({
      where: { businessKey: `OrderPlaced:${input.orderId}` }, update: {},
      create: {
        businessKey: `OrderPlaced:${input.orderId}`, orderId: input.orderId, eventName: 'OrderPlaced',
        occurredAt: input.createdAt, payload: {}, policyVersion: CURRENT_TRACKING_POLICY_VERSION,
        state: 'INTERNAL', expiresAt: new Date(input.createdAt.getTime() + 7 * 86_400_000),
      },
    });
    const owner = await tx.order.findUnique({ where: { id: input.orderId }, select: { userId: true } });
    // Never associate a guest order with a marketing consent profile under
    // the current guest privacy contract, even with synthetic full approvals.
    if (!owner?.userId) return true;
    if (input.consent?.state === 'granted' && input.consent.policyVersion === CURRENT_TRACKING_POLICY_VERSION &&
        input.consent.occurredAt <= input.createdAt && input.consent.expiresAt > input.createdAt) {
      const current = await tx.marketingConsent.findUnique({ where: { id: input.consent.id } });
      if (current?.state === 'granted' && current.policyVersion === input.consent.policyVersion && current.expiresAt > input.createdAt) {
        await tx.marketingOrderConsent.upsert({
          where: { orderId: input.orderId }, update: {},
          create: { orderId: input.orderId, consentId: current.id, policyVersion: current.policyVersion },
        });
      }
    }
    await enqueueInsideSavepoint(tx, {
      orderId: input.orderId, eventName: 'InitiateCheckout', occurredAt: input.createdAt,
      amount: input.amount, currency: input.currency,
    });
    return true;
  });
}
