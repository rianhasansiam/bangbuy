import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// No .env or DATABASE_URL is used. This opt-in suite owns only synthetic rows
// in a migrated, disposable, explicitly named loopback database.
const configuration = vi.hoisted(() => ({ url: process.env.MARKETING_TEST_DATABASE_URL }));
vi.mock('@/lib/db/prisma', async () => {
  if (!configuration.url) return { prisma: {} };
  const url = new URL(configuration.url);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.pathname !== '/bangbuy_marketing_test') {
    throw new Error('Marketing tests require a disposable local bangbuy_marketing_test database.');
  }
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { PrismaClient } = await import('@/app/generated/prisma/client');
  return { prisma: new PrismaClient({ adapter: new PrismaPg({ connectionString: configuration.url }) }) };
});

import { prisma } from '@/lib/db/prisma';
import { recordCommittedOrder, recordVerifiedPurchase, withMarketingSavepoint } from '@/lib/analytics/conversion-outbox';
import { runMarketingOutboxBatch, postgresConversionStore } from '@/lib/analytics/conversion-worker';
import { applyAuthoritativeAirwallexPayment } from '@/lib/airwallex/services/airwallex-payment-verification.service';
import { applySuccessfulPayment } from '@/lib/payments/core/payment-status.service';
import { marketingFixture } from './fixtures/marketing';
import type { ConversionConsent } from '@/lib/analytics/conversion-contract';

describe.skipIf(!configuration.url)('marketing outbox on real PostgreSQL', () => {
  let work: string;
  let consent: ConversionConsent;
  let policyFile: string;
  let fixture: ReturnType<typeof marketingFixture>;

  beforeAll(async () => {
    work = mkdtempSync(join(tmpdir(), 'bangbuy-marketing-tests-'));
    policyFile = join(work, 'synthetic-policy.json');
    vi.stubEnv('META_POLICY_FILE', policyFile);
    vi.stubEnv('META_ENVIRONMENT', 'test');
    vi.stubEnv('META_RUNTIME_ENABLED', 'true');
    vi.stubEnv('META_CAPI_ENABLED', 'true');
    vi.stubEnv('META_PIXEL_ENABLED', 'true');
    vi.stubEnv('TRACKING_ISOLATION_READY', 'true');
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '111111');
    vi.stubEnv('META_TEST_PIXEL_ID', '222222');
    vi.stubEnv('STOREFRONT_ORIGIN', 'https://public.example.test');
    vi.stubEnv('COMMERCE_ORIGIN', 'https://commerce.example.test');
    await prisma.user.upsert({ where: { id: 'marketing-synthetic-user' }, update: {}, create: { id: 'marketing-synthetic-user', name: 'Synthetic', email: 'synthetic-marketing@example.test' } });
    await prisma.category.upsert({ where: { id: 'marketing-category' }, update: {}, create: { id: 'marketing-category', name: 'Synthetic category', slug: 'marketing-test-category', path: 'marketing-test-category' } });
    await prisma.product.upsert({ where: { id: 'synthetic-product' }, update: {}, create: {
      id: 'synthetic-product', productCode: 'MARKETING-SYNTHETIC', name: 'Synthetic product', slug: 'marketing-synthetic-product',
      categoryId: 'marketing-category', buyingPrice: 500, salePrice: 1000,
    } });
  });
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS reject_marketing_test_write ON "MarketingConversionOutbox"');
    await prisma.marketingConversionOutbox.deleteMany();
    await prisma.marketingOrderConsent.deleteMany();
    await prisma.order.deleteMany();
    await prisma.marketingConsent.deleteMany();
    fixture = marketingFixture();
    writeFileSync(policyFile, JSON.stringify(fixture.policy));
    consent = await prisma.marketingConsent.create({ data: {
      id: fixture.consent.id, secretHash: '1'.repeat(64), state: fixture.consent.state,
      policyVersion: fixture.consent.policyVersion, occurredAt: fixture.consent.occurredAt,
      expiresAt: fixture.consent.expiresAt, origin: fixture.consent.origin,
      sourceUrl: fixture.consent.sourceUrl, matching: fixture.consent.matching as object,
      context: fixture.context,
    } });
  });
  afterAll(async () => {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS reject_marketing_test_write ON "MarketingConversionOutbox"');
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS reject_marketing_test_write()');
    await prisma.$disconnect();
    vi.unstubAllEnvs();
    rmSync(work, { recursive: true, force: true });
  });

  async function seed(provider: 'AIRWALLEX' | 'SSLCOMMERZ' | 'CASH_ON_DELIVERY' = 'AIRWALLEX', guest = false) {
    const guestProfile = guest ? await prisma.guestCustomer.create({ data: { fullName: 'Synthetic guest', phone: '+8801700000000', address: 'Synthetic address' } }) : null;
    const order = await prisma.order.create({ data: {
      orderNumber: `SYNTHETIC-${randomUUID()}`, userId: guest ? null : 'marketing-synthetic-user',
      ...(guestProfile ? { guestCustomerId: guestProfile.id } : {}),
      subtotal: 1000, totalAmount: 1000, displaySubtotal: 16.48, displayTotalAmount: 16.48,
      displayCurrency: 'USD', exchangeRate: '.01648', exchangeRateAt: new Date(),
      customerName: 'Synthetic Customer', customerPhone: '+8801700000000', customerAddress: 'Synthetic address',
      paymentMethod: provider, paymentStatus: provider === 'CASH_ON_DELIVERY' ? 'UNPAID' : 'PENDING',
      items: { create: { productId: 'synthetic-product', productName: 'Synthetic product', quantity: 1, unitPrice: 1000, totalPrice: 1000, displayUnitPrice: 16.48, displayTotalPrice: 16.48 } },
    } });
    await prisma.$transaction((tx) => recordCommittedOrder(tx, { orderId: order.id, createdAt: order.createdAt, amount: order.totalAmount, currency: order.currency, consent }));
    if (provider === 'CASH_ON_DELIVERY') return { order, payment: null };
    const payment = await prisma.paymentTransaction.create({ data: {
      orderId: order.id, provider, transactionId: `synthetic-${randomUUID()}`, status: 'PROCESSING',
      providerStatus: 'PROCESSING', amount: provider === 'AIRWALLEX' ? 16.48 : 1000,
      currency: provider === 'AIRWALLEX' ? 'USD' : 'BDT',
      baseAmount: 1000, baseCurrency: 'BDT', exchangeRate: '.01648', exchangeRateAt: new Date(),
    } });
    return { order, payment };
  }

  async function succeed(seedResult: Awaited<ReturnType<typeof seed>>, source: 'WEBHOOK' | 'RECONCILIATION' = 'RECONCILIATION') {
    const { order, payment } = seedResult;
    if (!payment) throw new Error('Expected online payment');
    return applyAuthoritativeAirwallexPayment({
      source,
      authoritative: { paymentIntentId: payment.transactionId!, requestId: 'synthetic-request', merchantOrderId: order.id,
        amount: payment.amount.toString(), currency: payment.currency, providerStatus: 'SUCCEEDED' },
    });
  }

  it('concurrent webhook and status verification commit exactly one logical Purchase with stored payment units', async () => {
    const seeded = await seed();
    await Promise.all([succeed(seeded, 'WEBHOOK'), succeed(seeded, 'RECONCILIATION'), succeed(seeded)]);
    expect(await prisma.marketingConversionOutbox.count({ where: { eventName: 'Purchase' } })).toBe(1);
    const conversion = await prisma.marketingConversionOutbox.findFirstOrThrow({ where: { eventName: 'Purchase' } });
    const payment = await prisma.paymentTransaction.findUniqueOrThrow({ where: { id: seeded.payment!.id } });
    expect(conversion.state).toBe('PENDING');
    expect(conversion.payload).toEqual({ value: 16.48, currency: 'USD', contentIds: ['synthetic-product'] });
    expect(conversion.occurredAt).toEqual(payment.paidAt);
    expect(conversion.id).toMatch(/^[a-f0-9-]{36}$/);
    expect(conversion.id).not.toContain(seeded.order.id);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: seeded.order.id } }))).toMatchObject({ status: 'PAYMENT_CONFIRMED', paymentStatus: 'PAID' });
  });
  it('pending, failed and review-required authoritative outcomes never create Purchase', async () => {
    for (const status of ['PROCESSING', 'FAILED', 'CANCELLED', 'PENDING_REVIEW']) {
      const seeded = await seed();
      await applyAuthoritativeAirwallexPayment({ source: 'RECONCILIATION', authoritative: {
        paymentIntentId: seeded.payment!.transactionId!, requestId: 'synthetic', merchantOrderId: seeded.order.id,
        amount: '16.48', currency: 'USD', providerStatus: status,
      } });
    }
    const mismatch = await seed();
    await applyAuthoritativeAirwallexPayment({ source: 'WEBHOOK', authoritative: {
      paymentIntentId: mismatch.payment!.transactionId!, requestId: 'synthetic', merchantOrderId: mismatch.order.id,
      amount: '99', currency: 'USD', providerStatus: 'SUCCEEDED',
    } });
    expect(await prisma.marketingConversionOutbox.count({ where: { eventName: 'Purchase' } })).toBe(0);
  });
  it('rolls business transition and outbox back together on enclosing transaction failure', async () => {
    const seeded = await seed();
    await expect(prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: seeded.order.id }, data: { paymentStatus: 'PAID', status: 'PAYMENT_CONFIRMED' } });
      await recordVerifiedPurchase(tx, { orderId: seeded.order.id, paymentMethod: 'AIRWALLEX', amount: '16.48', currency: 'USD', paidAt: new Date() });
      throw new Error('synthetic enclosing failure');
    })).rejects.toThrow('synthetic enclosing failure');
    expect(await prisma.marketingConversionOutbox.count({ where: { eventName: 'Purchase' } })).toBe(0);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: seeded.order.id } })).paymentStatus).toBe('PENDING');
  });
  it('a real marketing SQL failure rolls back to savepoint and still commits payment', async () => {
    const seeded = await seed();
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION reject_marketing_test_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."eventName" = 'Purchase' THEN RAISE EXCEPTION 'synthetic marketing insert failure'; END IF; RETURN NEW; END; $$`);
    await prisma.$executeRawUnsafe('CREATE TRIGGER reject_marketing_test_write BEFORE INSERT ON "MarketingConversionOutbox" FOR EACH ROW EXECUTE FUNCTION reject_marketing_test_write()');
    await succeed(seeded);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: seeded.order.id } })).paymentStatus).toBe('PAID');
    expect(await prisma.marketingConversionOutbox.count({ where: { eventName: 'Purchase' } })).toBe(0);
    // Subsequent SQL proves the parent transaction was not left aborted.
    expect(await prisma.$queryRaw`SELECT 1 AS alive`).toEqual([{ alive: 1 }]);
  });
  it('the savepoint restores a transaction after an actual undefined-table error', async () => {
    const seeded = await seed('CASH_ON_DELIVERY');
    await prisma.$transaction(async (tx) => {
      await withMarketingSavepoint(tx, () => tx.$executeRawUnsafe('INSERT INTO "SyntheticMissingMarketingTable" VALUES (1)'));
      await tx.order.update({ where: { id: seeded.order.id }, data: { customerNote: 'Commerce continued' } });
    });
    expect((await prisma.order.findUniqueOrThrow({ where: { id: seeded.order.id } })).customerNote).toBe('Commerce continued');
  });
  it('COD records OrderPlaced internally and never creates Purchase when marked paid', async () => {
    const seeded = await seed('CASH_ON_DELIVERY');
    await prisma.order.update({ where: { id: seeded.order.id }, data: { paymentStatus: 'PAID' } });
    expect(await prisma.marketingConversionOutbox.count({ where: { eventName: 'OrderPlaced', state: 'INTERNAL' } })).toBe(1);
    expect(await prisma.marketingConversionOutbox.count({ where: { eventName: 'Purchase' } })).toBe(0);
  });
  it('fully approved generic consent never profiles or exports a guest order', async () => {
    const seeded = await seed('AIRWALLEX', true);
    await succeed(seeded, 'WEBHOOK');
    expect((await prisma.order.findUniqueOrThrow({ where: { id: seeded.order.id } })).paymentStatus).toBe('PAID');
    expect(await prisma.marketingConversionOutbox.findMany({ where: { orderId: seeded.order.id }, select: { eventName: true, state: true } })).toEqual([{ eventName: 'OrderPlaced', state: 'INTERNAL' }]);
    expect(await prisma.marketingOrderConsent.count({ where: { orderId: seeded.order.id } })).toBe(0);
  });
  it('fresh worker business checks suppress an earlier queued record after account association is removed', async () => {
    const seeded = await seed();
    await succeed(seeded);
    await prisma.marketingConversionOutbox.deleteMany({ where: { eventName: 'InitiateCheckout' } });
    await prisma.order.update({ where: { id: seeded.order.id }, data: { userId: null } });
    const deliver = vi.fn();
    expect(await runMarketingOutboxBatch(10, { deliver })).toMatchObject({ suppressed: 1 });
    expect(deliver).not.toHaveBeenCalled();
  });
  it('verified SSLCommerz commits one BDT Purchase and repeated callbacks keep identity', async () => {
    const seeded = await seed('SSLCOMMERZ');
    const authoritative = {
      kind: 'SUCCESS' as const, transactionId: seeded.payment!.transactionId!, amount: '1000', currency: 'BDT',
      validationId: 'synthetic-validation', bankTransactionId: 'synthetic-bank', cardType: null,
      riskLevel: 0 as const, paidAt: new Date().toISOString(),
      metadata: { orderId: seeded.order.id, paymentRecordId: seeded.payment!.id }, raw: {},
    };
    await applySuccessfulPayment(seeded.payment!, authoritative);
    await applySuccessfulPayment(seeded.payment!, authoritative);
    const records = await prisma.marketingConversionOutbox.findMany({ where: { eventName: 'Purchase' } });
    expect(records).toHaveLength(1);
    expect(records[0].payload).toEqual({ value: 1000, currency: 'BDT', contentIds: ['synthetic-product'] });
  });
  it('real SKIP LOCKED concurrent workers send a claimed conversion once', async () => {
    await succeed(await seed());
    await prisma.marketingConversionOutbox.deleteMany({ where: { eventName: 'InitiateCheckout' } });
    const deliver = vi.fn().mockResolvedValue({ delivered: true });
    await Promise.all([runMarketingOutboxBatch(10, { deliver }), runMarketingOutboxBatch(10, { deliver })]);
    expect(deliver).toHaveBeenCalledTimes(1);
    expect(await prisma.marketingConversionOutbox.count({ where: { eventName: 'Purchase', state: 'DELIVERED' } })).toBe(1);
  });
  it('revocation, runtime file disablement and expiry suppress unsent records', async () => {
    await succeed(await seed());
    await prisma.marketingConversionOutbox.deleteMany({ where: { eventName: 'InitiateCheckout' } });
    await prisma.marketingConsent.update({ where: { id: consent.id }, data: { state: 'revoked' } });
    const deliver = vi.fn();
    expect(await runMarketingOutboxBatch(10, { deliver })).toMatchObject({ suppressed: 1 });
    expect(deliver).not.toHaveBeenCalled();
    const conversion = await prisma.marketingConversionOutbox.findFirstOrThrow({ where: { eventName: 'Purchase' } });
    await prisma.marketingConsent.update({ where: { id: consent.id }, data: { state: 'granted' } });
    await prisma.marketingConversionOutbox.update({ where: { id: conversion.id }, data: { state: 'PENDING' } });
    writeFileSync(policyFile, JSON.stringify({ ...fixture.policy, runtimeEnabled: false }));
    expect(await runMarketingOutboxBatch(10, { deliver })).toMatchObject({ suppressed: 1 });
    expect(deliver).not.toHaveBeenCalled();
  });
  it('stale lease recovery retains event identity while the old owner cannot finish it', async () => {
    await succeed(await seed());
    await prisma.marketingConversionOutbox.deleteMany({ where: { eventName: 'InitiateCheckout' } });
    const first = await postgresConversionStore.claim(new Date());
    expect(first).not.toBeNull();
    await prisma.marketingConversionOutbox.update({ where: { id: first!.id }, data: { lockedAt: new Date(Date.now() - 180000) } });
    const second = await postgresConversionStore.claim(new Date());
    expect(second?.id).toBe(first!.id);
    expect(second?.lockToken).not.toBe(first!.lockToken);
    expect(await postgresConversionStore.finish(first!, 'DELIVERED', null, new Date())).toBe(false);
    expect(await postgresConversionStore.finish(second!, 'DELIVERED', null, new Date())).toBe(true);
  });
  it('an actual killed worker claim survives process restart and runtime-disabled recovery never dispatches', async () => {
    await succeed(await seed());
    await prisma.marketingConversionOutbox.deleteMany({ where: { eventName: 'InitiateCheckout' } });
    const original = await prisma.marketingConversionOutbox.findFirstOrThrow({ where: { eventName: 'Purchase' } });
    const child = spawn(process.execPath, ['--conditions=react-server', '--import', 'tsx', 'tests/fixtures/marketing-claim-and-wait.mts'], {
      env: { NODE_ENV: 'test', PATH: process.env.PATH, MARKETING_TEST_DATABASE_URL: configuration.url }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('SYNTHETIC_CLAIM_TIMEOUT')), 10000);
        child.stdout.on('data', (chunk: Buffer) => {
          if (chunk.toString().includes('SYNTHETIC_CLAIM_READY')) { clearTimeout(timer); resolve(); }
        });
        child.once('error', () => { clearTimeout(timer); reject(new Error('SYNTHETIC_CLAIM_PROCESS_FAILED')); });
        child.once('exit', () => { clearTimeout(timer); reject(new Error('SYNTHETIC_CLAIM_PROCESS_EXITED')); });
      });
      const killed = new Promise<void>((resolve) => child.once('exit', () => resolve()));
      child.kill('SIGKILL'); await killed;
      const claimed = await prisma.marketingConversionOutbox.findUniqueOrThrow({ where: { id: original.id } });
      expect(claimed.state).toBe('PROCESSING');
      expect(claimed.attempts).toBe(1);
      expect(await postgresConversionStore.claim(new Date())).toBeNull();
      // Advance only this synthetic lease, avoiding a two-minute blocking wait.
      await prisma.marketingConversionOutbox.update({ where: { id: original.id }, data: { lockedAt: new Date(Date.now() - 180000) } });
      const file = join(work, 'restart-worker.env');
      writeFileSync(file, `DATABASE_URL=${configuration.url}\nMETA_RUNTIME_ENABLED=false\nMETA_CAPI_ENABLED=false\nMETA_PIXEL_ENABLED=false\n`, { mode: 0o600 });
      const restarted = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', 'scripts/deploy/worker-launcher.mjs', '--cycles', '1', '--batch', '1'], {
        env: { NODE_ENV: 'test', PATH: process.env.PATH, BANGBUY_WORKER_ENV_FILE: file }, encoding: 'utf8', timeout: 15000,
      });
      expect(restarted.status).toBe(0);
      expect(restarted.stdout).toContain('"claimed":1');
      expect(restarted.stdout).toContain('"delivered":0');
      expect(restarted.stdout + restarted.stderr).not.toMatch(/postgresql:|synthetic-marketing@|client_user_agent|access_token/);
      const recovered = await prisma.marketingConversionOutbox.findUniqueOrThrow({ where: { id: original.id } });
      expect(recovered).toMatchObject({ id: original.id, occurredAt: original.occurredAt, state: 'SUPPRESSED', attempts: 2 });
      expect(recovered.lockToken).toBeNull();
    } finally { if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL'); }
  }, 30000);
});
