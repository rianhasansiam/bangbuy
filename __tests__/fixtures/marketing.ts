import { createDeniedTrackingPolicy } from '@/lib/analytics/policy';
import type { ClaimedConversion, ConversionConsent } from '@/lib/analytics/conversion-contract';

// Synthetic approvals are test fixtures only, never deployment configuration.
export function marketingFixture(now = new Date()) {
  const context = {
    url: 'https://commerce.example.test/en/checkout', referrer: '',
    contentIds: ['synthetic-product'], classification: 'ordinary' as const,
    metadataFingerprint: 'a'.repeat(64),
  };
  const approval = { approved: true, reference: 'synthetic-test-only', expiresAt: new Date(now.getTime() + 7 * 86400000).toISOString() };
  const policy = {
    ...createDeniedTrackingPolicy(), environment: 'test' as const, runtimeEnabled: true,
    pixelEnabled: true, capiEnabled: true, pixelId: '222222', isolationReady: true,
    storefrontOrigin: 'https://public.example.test', commerceOrigin: 'https://commerce.example.test',
    business: approval, source: { ...approval, pixelId: '222222' },
    routes: [{ ...approval, pathname: '/en/checkout', channels: ['server' as const], events: ['Purchase' as const, 'InitiateCheckout' as const],
      classification: 'ordinary' as const, contentIds: context.contentIds, metadataFingerprint: context.metadataFingerprint }],
    contents: [{ ...approval, id: 'synthetic-product', classification: 'ordinary' as const }],
    eventApprovals: ['Purchase' as const, 'InitiateCheckout' as const].map((name) => ({ ...approval, name, channels: ['server' as const], fields: ['value' as const, 'currency' as const] })),
    matching: { ...approval, fields: ['fbp' as const, 'client_user_agent' as const] },
  };
  const consent: ConversionConsent = {
    id: 'a4c47c68-d641-4149-b605-b22a56768df5', state: 'granted', policyVersion: policy.policyVersion,
    occurredAt: new Date(now.getTime() - 10000), expiresAt: new Date(now.getTime() + 86400000),
    origin: policy.commerceOrigin, sourceUrl: context.url,
    matching: { fbp: 'fb.1.1794280000000.1234567', client_user_agent: 'SyntheticBrowser/1.0' }, context,
  };
  const record: ClaimedConversion = {
    id: '202d2405-83cb-4d72-b7d0-6d397f7541b0', eventName: 'Purchase',
    occurredAt: new Date(now.getTime() - 1000), payload: { value: 16.48, currency: 'USD', contentIds: context.contentIds },
    consentId: consent.id, policyVersion: policy.policyVersion, sourceUrl: context.url,
    matching: consent.matching, context, attempts: 1,
    expiresAt: new Date(now.getTime() + 86400000), lockToken: 'synthetic-lease',
  };
  return { record, consent, policy, context };
}
