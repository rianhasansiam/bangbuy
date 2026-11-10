import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getServerTrackingConfig, getTrackingRuntimePolicy } from "./config";
import { deliverCapiProjection, type CapiConfiguration, type CapiDeliveryResult } from "./capi-adapter";
import { assessConversion } from "./conversion-policy";
import { conversionSnapshotSchema, type ClaimedConversion, type ConversionConsent, type OutboxState } from "./conversion-contract";
import type { TrackingRuntimePolicy } from "./policy";

export const MAX_MARKETING_ATTEMPTS = 6;
export const MARKETING_LEASE_MS = 120_000;

export type ConversionStore = {
  claim(now: Date): Promise<ClaimedConversion | null>;
  consent(id: string): Promise<ConversionConsent | null>;
  businessEligible(record: ClaimedConversion): Promise<boolean>;
  ownsLease(record: ClaimedConversion): Promise<boolean>;
  finish(record: ClaimedConversion, state: OutboxState, code: string | null, now: Date, nextAttemptAt?: Date): Promise<boolean>;
};

/** One row per claim avoids leases expiring while earlier records are sent. */
export const postgresConversionStore: ConversionStore = {
  async claim(now) {
    const token = randomUUID();
    const stale = new Date(now.getTime() - MARKETING_LEASE_MS);
    const rows = await prisma.$queryRaw<ClaimedConversion[]>(Prisma.sql`
      WITH candidate AS (
        SELECT "id" FROM "MarketingConversionOutbox"
        WHERE (("state" IN ('PENDING','RETRY') AND "nextAttemptAt" <= ${now})
          OR ("state" = 'PROCESSING' AND "lockedAt" < ${stale}))
        ORDER BY "createdAt", "id" FOR UPDATE SKIP LOCKED LIMIT 1
      )
      UPDATE "MarketingConversionOutbox" AS event
      SET "state" = 'PROCESSING', "attempts" = event."attempts" + 1,
          "lockedAt" = ${now}, "lockToken" = ${token}, "updatedAt" = ${now}
      FROM candidate WHERE event."id" = candidate."id"
      RETURNING event."id", event."eventName", event."occurredAt", event."payload",
        event."consentId", event."policyVersion", event."sourceUrl", event."matching",
        event."context", event."attempts", event."expiresAt", event."lockToken"
    `);
    return rows[0] ?? null;
  },
  async consent(id) { return prisma.marketingConsent.findUnique({ where: { id } }); },
  async ownsLease(record) {
    return (await prisma.marketingConversionOutbox.count({
      where: { id: record.id, state: 'PROCESSING', lockToken: record.lockToken },
    })) === 1;
  },
  async businessEligible(record) {
    const row = await prisma.marketingConversionOutbox.findUnique({ where: { id: record.id }, select: { orderId: true } });
    if (!row) return false;
    const order = await prisma.order.findUnique({
      where: { id: row.orderId },
      select: { userId: true, status: true, paymentStatus: true, paymentMethod: true,
        payments: { select: { provider: true, status: true, requiresReview: true, amount: true, currency: true } } },
    });
    if (!order?.userId || ['CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'].includes(order.status)) return false;
    if (record.eventName === 'InitiateCheckout') return true;
    const snapshot = conversionSnapshotSchema.safeParse(record.payload);
    if (!snapshot.success || record.eventName !== 'Purchase' || order.paymentStatus !== 'PAID' || order.status === 'PENDING' ||
        !['AIRWALLEX', 'SSLCOMMERZ'].includes(order.paymentMethod) || order.payments.some((payment) => payment.requiresReview)) return false;
    const paid = order.payments.filter((payment) => payment.status === 'SUCCESS');
    return paid.length === 1 && paid[0].provider === order.paymentMethod &&
      paid[0].amount.equals(snapshot.data.value) && paid[0].currency === snapshot.data.currency;
  },
  async finish(record, state, code, now, nextAttemptAt) {
    const result = await prisma.marketingConversionOutbox.updateMany({
      where: { id: record.id, state: 'PROCESSING', lockToken: record.lockToken },
      data: {
        state, lastFailureCode: code, lockedAt: null, lockToken: null,
        ...(nextAttemptAt ? { nextAttemptAt } : {}),
        ...(state === 'DELIVERED' ? { deliveredAt: now } : {}),
      },
    });
    return result.count === 1;
  },
};

type AllowedProjection = Extract<ReturnType<typeof assessConversion>, { allowed: true }>['event'];
export type MarketingWorkerDependencies = {
  store?: ConversionStore;
  runtime?: () => TrackingRuntimePolicy;
  configuration?: () => CapiConfiguration;
  deliver?: (event: AllowedProjection, configuration: CapiConfiguration) => Promise<CapiDeliveryResult>;
  now?: () => Date;
};

function configuration(): CapiConfiguration {
  const policy = getTrackingRuntimePolicy();
  const config = getServerTrackingConfig();
  return {
    pixelId: config.pixelId ?? '', accessToken: config.accessToken,
    graphVersion: config.graphVersion ?? '', testEventCode: config.testEventCode ?? undefined,
    environment: policy.environment === 'production' ? 'production' : 'staging',
  };
}

export async function runMarketingOutboxBatch(batchSize = 20, dependencies: MarketingWorkerDependencies = {}) {
  const store = dependencies.store ?? postgresConversionStore;
  const runtime = dependencies.runtime ?? getTrackingRuntimePolicy;
  const deliver = dependencies.deliver ?? deliverCapiProjection;
  const config = dependencies.configuration ?? configuration;
  const now = dependencies.now ?? (() => new Date());
  const counts = { claimed: 0, delivered: 0, retry: 0, suppressed: 0, blocked: 0, expired: 0, deadLetter: 0, leaseLost: 0, unavailable: 0 };
  const take = Math.min(Math.max(Math.trunc(batchSize), 1), 100);
  for (let index = 0; index < take; index += 1) {
    let record: ClaimedConversion | null;
    try { record = await store.claim(now()); } catch { counts.unavailable += 1; break; }
    if (!record) break;
    counts.claimed += 1;
    try {
      if (record.expiresAt <= now()) {
        await store.finish(record, 'EXPIRED', 'EVENT_EXPIRED', now()); counts.expired += 1; continue;
      }
      if (record.attempts > MAX_MARKETING_ATTEMPTS) {
        await store.finish(record, 'DEAD_LETTER', 'RETRY_EXHAUSTED', now()); counts.deadLetter += 1; continue;
      }
      const consent = record.consentId ? await store.consent(record.consentId) : null;
      const decision = assessConversion({ record, consent, policy: runtime(), now: now() });
      if (!decision.allowed) {
        const blocked = ['SOURCE_CONTEXT_REQUIRED', 'REQUIRED_MATCHING_ABSENT', 'INVALID_MATCHING', 'MISSING_SOURCE_URL'].includes(decision.reason);
        await store.finish(record, blocked ? 'BLOCKED' : 'SUPPRESSED', decision.reason, now());
        counts[blocked ? 'blocked' : 'suppressed'] += 1; continue;
      }
      if (!await store.businessEligible(record)) {
        await store.finish(record, 'SUPPRESSED', 'BUSINESS_STATE_INELIGIBLE', now()); counts.suppressed += 1; continue;
      }
      // Consent and the runtime file are checked again after database work,
      // immediately before network I/O. Neither a retry nor a stale lease can
      // revive revoked/expired marketing eligibility.
      const latest = record.consentId ? await store.consent(record.consentId) : null;
      const final = assessConversion({ record, consent: latest, policy: runtime(), now: now() });
      if (!final.allowed) {
        await store.finish(record, 'SUPPRESSED', final.reason, now()); counts.suppressed += 1; continue;
      }
      if (!await store.ownsLease(record)) { counts.leaseLost += 1; continue; }
      const result = await deliver(final.event, config());
      if (result.delivered) {
        if (await store.finish(record, 'DELIVERED', null, now())) counts.delivered += 1;
        else counts.leaseLost += 1;
      } else if (result.retry && record.attempts < MAX_MARKETING_ATTEMPTS) {
        const delayMs = Math.min(30_000 * 2 ** (record.attempts - 1), 30 * 60_000);
        await store.finish(record, 'RETRY', result.code, now(), new Date(now().getTime() + delayMs)); counts.retry += 1;
      } else {
        await store.finish(record, 'DEAD_LETTER', result.retry ? 'RETRY_EXHAUSTED' : result.code, now()); counts.deadLetter += 1;
      }
    } catch {
      // No raw provider or database error/URL/payload is persisted or logged.
      // A lost persistence connection leaves the leased row recoverable.
      counts.unavailable += 1;
      try {
        await store.finish(record, record.attempts >= MAX_MARKETING_ATTEMPTS ? 'DEAD_LETTER' : 'RETRY', 'WORKER_UNAVAILABLE', now(), new Date(now().getTime() + 60_000));
      } catch { /* Stale lease recovery preserves the same event identity. */ }
    }
  }
  return counts;
}

/** Read-only operations report. No customer/context data or credentials. */
export async function marketingOutboxStatus() {
  return prisma.marketingConversionOutbox.groupBy({ by: ['state', 'lastFailureCode'], _count: { _all: true } });
}
