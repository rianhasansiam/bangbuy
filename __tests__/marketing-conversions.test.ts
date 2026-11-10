import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/db/prisma', () => ({ prisma: {} }));
import { buildCapiProjection } from '@/lib/analytics/conversion-contract';
import { assessConversion } from '@/lib/analytics/conversion-policy';
import { deliverCapiProjection } from '@/lib/analytics/capi-adapter';
import { runMarketingOutboxBatch, type ConversionStore } from '@/lib/analytics/conversion-worker';
import { withMarketingSavepoint } from '@/lib/analytics/conversion-outbox';
import { marketingFixture } from './fixtures/marketing';
import type { Prisma } from '@/app/generated/prisma/client';

const now = new Date('2026-11-10T06:00:00.000Z');
const configuration = () => ({ pixelId: '222222', accessToken: 'synthetic-secret', graphVersion: 'v25.0', testEventCode: 'TEST123', environment: 'staging' as const });

describe('strict CAPI conversion projection', () => {
  it('projects immutable major units and original event identity without internal references', () => {
    const { record } = marketingFixture(now);
    const result = buildCapiProjection({ record, approvedMatchingFields: ['fbp', 'client_user_agent'], now });
    expect(result.allowed).toBe(true);
    if (!result.allowed) throw new Error(result.reason);
    expect(result.event.custom_data).toEqual({ value: 16.48, currency: 'USD' });
    expect(result.event.event_time).toBe(Math.floor(record.occurredAt.getTime() / 1000));
    expect(result.event.event_id).toBe(record.id);
    expect(JSON.stringify(result.event)).not.toMatch(/synthetic-product|orderId|consentId|email|phone|address|client_ip_address/);
  });
  it.each(['fbp', 'client_user_agent'])('blocks unapproved matching field %s', (field) => {
    const { record } = marketingFixture(now);
    expect(buildCapiProjection({ record, approvedMatchingFields: ['fbp', 'client_user_agent'].filter((entry) => entry !== field), now })).toMatchObject({ allowed: false });
  });
  it('blocks absent UA or matching instead of inventing required website data', () => {
    const { record } = marketingFixture(now);
    for (const matching of [{}, { fbp: 'fb.1.1794280000000.1' }, { client_user_agent: 'SyntheticBrowser' }, { email: 'person@example.test' }]) {
      expect(buildCapiProjection({ record: { ...record, matching }, approvedMatchingFields: ['fbp', 'client_user_agent'], now }).allowed).toBe(false);
    }
  });
  it.each(['?email=secret', '#private', '?orderId=secret'])('rejects unsafe actual source context %s', (suffix) => {
    const { record } = marketingFixture(now);
    expect(buildCapiProjection({ record: { ...record, sourceUrl: record.sourceUrl + suffix }, approvedMatchingFields: ['fbp', 'client_user_agent'], now }).allowed).toBe(false);
  });
  it('rejects extra monetary fields, invalid precision, COD OrderPlaced and expired events', () => {
    const { record } = marketingFixture(now);
    for (const changed of [
      { payload: { value: 10, currency: 'USD', contentIds: [], address: 'private' } },
      { payload: { value: 10.001, currency: 'USD', contentIds: [] } },
      { eventName: 'OrderPlaced' }, { occurredAt: new Date(now.getTime() - 7 * 86400000) },
    ]) expect(buildCapiProjection({ record: { ...record, ...changed }, approvedMatchingFields: ['fbp', 'client_user_agent'], now }).allowed).toBe(false);
  });
  it('requires the actual approved product manifest and consent context', () => {
    const { record, consent, policy } = marketingFixture(now);
    expect(assessConversion({ record, consent, policy, now }).allowed).toBe(true);
    expect(assessConversion({ record: { ...record, payload: { value: 16.48, currency: 'USD', contentIds: ['unapproved-product'] } }, consent, policy, now }).allowed).toBe(false);
    expect(assessConversion({ record, consent: { ...consent, occurredAt: new Date(now.getTime() + 1) }, policy, now }).allowed).toBe(false);
    expect(assessConversion({ record, consent, policy: { ...policy, runtimeEnabled: false }, now }).allowed).toBe(false);
  });
});

describe('CAPI controlled HTTP boundary', () => {
  it('uses a fixed provider URL, bearer-only secret and strict body', async () => {
    const { record } = marketingFixture(now);
    const projection = buildCapiProjection({ record, approvedMatchingFields: ['fbp', 'client_user_agent'], now });
    if (!projection.allowed) throw new Error(projection.reason);
    const send = vi.fn().mockResolvedValue(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));
    expect(await deliverCapiProjection(projection.event, configuration(), send)).toEqual({ delivered: true });
    const [url, options] = send.mock.calls[0];
    expect(url).toBe('https://graph.facebook.com/v25.0/222222/events');
    expect(url).not.toContain('synthetic-secret');
    expect(options.headers.authorization).toBe('Bearer synthetic-secret');
    expect(JSON.parse(options.body)).toEqual({ data: [projection.event], test_event_code: 'TEST123' });
    expect(options).toMatchObject({ credentials: 'omit', redirect: 'error' });
  });
  it('classifies throttling, permission errors and malformed 200 responses without raw diagnostics', async () => {
    const { record } = marketingFixture(now);
    const projection = buildCapiProjection({ record, approvedMatchingFields: ['fbp', 'client_user_agent'], now });
    if (!projection.allowed) throw new Error(projection.reason);
    for (const [status, retry] of [[429, true], [503, true], [400, false], [401, false]] as const) {
      const send = vi.fn().mockResolvedValue(new Response('private provider details', { status }));
      expect(await deliverCapiProjection(projection.event, configuration(), send)).toEqual({ delivered: false, retry, code: `HTTP_${status}` });
    }
    expect(await deliverCapiProjection(projection.event, configuration(), vi.fn().mockResolvedValue(new Response('{}')))).toMatchObject({ delivered: false, retry: true });
  });
  it('prevents a staging worker from sending without a test event code', async () => {
    const { record } = marketingFixture(now);
    const projection = buildCapiProjection({ record, approvedMatchingFields: ['fbp', 'client_user_agent'], now });
    if (!projection.allowed) throw new Error(projection.reason);
    const send = vi.fn();
    expect(await deliverCapiProjection(projection.event, { ...configuration(), testEventCode: undefined }, send)).toMatchObject({ delivered: false, retry: false });
    expect(send).not.toHaveBeenCalled();
  });
});

describe('leased marketing worker policy and retry behavior', () => {
  function harness() {
    const fixture = marketingFixture(now);
    let claimed = false;
    const store: ConversionStore = {
      claim: vi.fn(async () => { if (claimed) return null; claimed = true; return fixture.record; }),
      consent: vi.fn(async () => fixture.consent), businessEligible: vi.fn(async () => true),
      ownsLease: vi.fn(async () => true), finish: vi.fn(async () => true),
    };
    const deliver = vi.fn().mockResolvedValue({ delivered: true });
    return { ...fixture, store, deliver, dependencies: { store, deliver, runtime: () => fixture.policy, configuration, now: () => now } };
  }
  beforeEach(() => vi.clearAllMocks());
  it('concurrent workers claim one logical event once', async () => {
    const h = harness();
    await Promise.all([runMarketingOutboxBatch(10, h.dependencies), runMarketingOutboxBatch(10, h.dependencies)]);
    expect(h.deliver).toHaveBeenCalledTimes(1);
    expect(h.store.finish).toHaveBeenCalledWith(h.record, 'DELIVERED', null, now);
  });
  it('suppresses revoked consent before any provider request', async () => {
    const h = harness(); h.consent.state = 'revoked';
    expect(await runMarketingOutboxBatch(1, h.dependencies)).toMatchObject({ suppressed: 1 });
    expect(h.deliver).not.toHaveBeenCalled();
  });
  it('rechecks the runtime kill switch immediately before dispatch', async () => {
    const h = harness();
    const runtime = vi.fn().mockReturnValueOnce(h.policy).mockReturnValue({ ...h.policy, runtimeEnabled: false });
    expect(await runMarketingOutboxBatch(1, { ...h.dependencies, runtime })).toMatchObject({ suppressed: 1 });
    expect(h.deliver).not.toHaveBeenCalled();
  });
  it('rechecks consent after business validation and suppresses a withdrawal race', async () => {
    const h = harness();
    h.store.consent = vi.fn().mockResolvedValueOnce(h.consent).mockResolvedValue({ ...h.consent, state: 'revoked' });
    await runMarketingOutboxBatch(1, h.dependencies);
    expect(h.deliver).not.toHaveBeenCalled();
  });
  it('preserves event identity and occurrence time for retry', async () => {
    const h = harness(); h.deliver.mockResolvedValue({ delivered: false, retry: true, code: 'HTTP_429' });
    expect(await runMarketingOutboxBatch(1, h.dependencies)).toMatchObject({ retry: 1 });
    expect(h.store.finish).toHaveBeenCalledWith(h.record, 'RETRY', 'HTTP_429', now, new Date(now.getTime() + 30000));
    expect(h.deliver.mock.calls[0][0]).toMatchObject({ event_id: h.record.id, event_time: Math.floor(h.record.occurredAt.getTime() / 1000) });
  });
  it('expires stale conversions and dead letters permanent errors or exhausted retries', async () => {
    const expired = harness(); expired.record.expiresAt = now;
    expect(await runMarketingOutboxBatch(1, expired.dependencies)).toMatchObject({ expired: 1 });
    expect(expired.deliver).not.toHaveBeenCalled();
    const exhausted = harness(); exhausted.record.attempts = 6;
    exhausted.deliver.mockResolvedValue({ delivered: false, retry: true, code: 'HTTP_503' });
    expect(await runMarketingOutboxBatch(1, exhausted.dependencies)).toMatchObject({ deadLetter: 1 });
    expect(exhausted.store.finish).toHaveBeenCalledWith(exhausted.record, 'DEAD_LETTER', 'RETRY_EXHAUSTED', now);
  });
  it('does not send after lease loss, refund/cancellation or business-state review', async () => {
    for (const condition of ['lease', 'business']) {
      const h = harness();
      if (condition === 'lease') h.store.ownsLease = vi.fn(async () => false);
      else h.store.businessEligible = vi.fn(async () => false);
      await runMarketingOutboxBatch(1, h.dependencies);
      expect(h.deliver).not.toHaveBeenCalled();
    }
  });
  it('isolates a failed marketing SQL write using a rollback savepoint', async () => {
    const execute = vi.fn().mockResolvedValue(0);
    const tx = { marketingConversionOutbox: {}, $executeRawUnsafe: execute } as unknown as Prisma.TransactionClient;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await withMarketingSavepoint(tx, async () => { throw new Error('private database details'); })).toBeNull();
    expect(execute.mock.calls.map(([sql]) => sql)).toEqual([
      'SAVEPOINT marketing_conversion_write', 'ROLLBACK TO SAVEPOINT marketing_conversion_write', 'RELEASE SAVEPOINT marketing_conversion_write',
    ]);
    expect(warn).toHaveBeenCalledWith('[marketing.outbox]', { code: 'OPTIONAL_WRITE_UNAVAILABLE' });
  });
});
