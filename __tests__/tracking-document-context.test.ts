import { webcrypto } from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { collectBrowserTrackingContext } from '@/lib/analytics/browser-context';
import { approvedTestPolicy, grantedConsent, trackingTestEvent, TRACKING_TEST_TIME } from './fixtures/tracking-policy';
import { evaluateTrackingPolicy } from '@/lib/analytics/policy';

vi.mock('@/components/i18n/translate', () => ({ useInterfaceTranslations: () => (value: string) => value }));
vi.mock('@/lib/i18n/navigation', () => ({ default: ({ children, ...props }: Record<string, unknown>) => React.createElement('a', props, children as React.ReactNode) }));
import CarouselBanner, { type CarouselSlide } from '@/app/(shop)/components/CarouselBanner';
import TopBannerClient, { type TopBannerSlide } from '@/components/layout/TopBannerClient';

let pending: boolean;
let mutable: boolean;
let portalPrivateInput: boolean;
let visibleText: string;
let metadata: string;
let productIds: string[];

beforeEach(() => {
  pending = false; mutable = false; portalPrivateInput = false;
  visibleText = 'Synthetic ordinary catalog'; metadata = '<meta name="description" content="Synthetic public product">';
  productIds = ['SKU-EXAMPLE'];
  vi.stubGlobal('crypto', webcrypto);
  const wrapper = {
    get innerText() { return visibleText; },
    querySelectorAll(selector: string) {
      if (selector === '[data-tracking-content-id]') return productIds.map((id) => ({ getAttribute: () => id }));
      return [];
    },
  };
  vi.stubGlobal('window', { location: { href: 'https://public.example.test/en/products/example' } });
  vi.stubGlobal('document', {
    title: 'Synthetic ordinary product', referrer: '',
    querySelector(selector: string) {
      if (selector === '[data-tracking-content]') return wrapper;
      if (selector.includes('data-tracking-pending') || selector.includes('data-tracking-mutable')) return pending || mutable ? {} : null;
      // Represents a sensitive Radix portal outside the catalog wrapper.
      if (selector.includes('input') || selector.includes('textarea') || selector.includes('contenteditable')) return portalPrivateInput ? {} : null;
      return null;
    },
    querySelectorAll(selector: string) { return selector === '[data-tracking-public-snapshot]' ? [] : [{ outerHTML: metadata }]; },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('actual document context gate', () => {
  it('binds the actual rendered text and metadata rather than copying a manifest fingerprint', async () => {
    const policy = approvedTestPolicy();
    const original = await collectBrowserTrackingContext(policy);
    expect(original).toMatchObject({ url: window.location.href, contentIds: ['SKU-EXAMPLE'] });
    expect(original?.metadataFingerprint).not.toBe(policy.routes[0].metadataFingerprint);
    visibleText = 'A newly displayed unapproved catalog item';
    expect((await collectBrowserTrackingContext(policy))?.metadataFingerprint).not.toBe(original?.metadataFingerprint);
    metadata = '<meta name="description" content="Changed actual metadata">';
    expect((await collectBrowserTrackingContext(policy))?.metadataFingerprint).not.toBe(original?.metadataFingerprint);
  });
  it.each(['pending', 'mutable', 'portal'] as const)('denies SDK context when %s exists anywhere in the document', async (condition) => {
    if (condition === 'pending') pending = true;
    if (condition === 'mutable') mutable = true;
    if (condition === 'portal') portalPrivateInput = true;
    expect(await collectBrowserTrackingContext(approvedTestPolicy())).toBeNull();
  });
  it('does not normalize a private query or fragment into an approved safe URL', async () => {
    const policy = approvedTestPolicy();
    const initial = await collectBrowserTrackingContext(policy);
    policy.routes[0].metadataFingerprint = initial!.metadataFingerprint;
    window.location.href += '?email=private#receipt';
    const context = await collectBrowserTrackingContext(policy);
    expect(context?.url).toContain('?email=private#receipt');
    expect(evaluateTrackingPolicy({ policy, channel: 'browser', event: trackingTestEvent(), consent: grantedConsent(), context: context!, now: TRACKING_TEST_TIME })).toEqual({ allowed: false, reason: 'unapproved_url' });
  });
  it('returns no browser context for a direct private checkout URL', async () => {
    window.location.href = 'https://commerce.example.test/en/checkout';
    expect(await collectBrowserTrackingContext(approvedTestPolicy())).toBeNull();
  });
  it('requires a fresh review when newly displayed product IDs change the manifest', async () => {
    const policy = approvedTestPolicy();
    const initial = await collectBrowserTrackingContext(policy);
    policy.routes[0].metadataFingerprint = initial!.metadataFingerprint;
    productIds.push('UNAPPROVED-PRODUCT');
    const context = await collectBrowserTrackingContext(policy);
    expect(evaluateTrackingPolicy({ policy, channel: 'browser', event: trackingTestEvent(), consent: grantedConsent(), context: context!, now: TRACKING_TEST_TIME }).allowed).toBe(false);
  });
});

describe('rotating catalog content carries a persistent eligibility veto', () => {
  const carousel: CarouselSlide = { id: 'synthetic', image: '/synthetic.png', title: 'Synthetic title', subtitle: 'Synthetic subtitle', description: 'Synthetic description', badge: 'Synthetic', bgType: 'solid', bgFrom: null, bgVia: null, bgTo: null, bgColor: '#000000', link: '/products' };
  const banner: TopBannerSlide = { id: 'synthetic', icon: 'Tag', badge: 'Synthetic', discount: '10%', description: 'Synthetic description', tag: 'Synthetic', tagIcon: 'Tag', link: '/products' };
  it('marks multi-slide carousels and top banners before any timer can rotate them', () => {
    expect(renderToStaticMarkup(React.createElement(CarouselBanner, { slides: [carousel, { ...carousel, id: 'second' }] }))).toContain('data-tracking-mutable="rotating-carousel"');
    expect(renderToStaticMarkup(React.createElement(TopBannerClient, { slides: [banner, { ...banner, id: 'second' }] }))).toContain('data-tracking-mutable="rotating-top-banner"');
  });
  it('allows a static single-slide document to undergo the ordinary approval checks', () => {
    expect(renderToStaticMarkup(React.createElement(CarouselBanner, { slides: [carousel] }))).not.toContain('data-tracking-mutable=');
    expect(renderToStaticMarkup(React.createElement(TopBannerClient, { slides: [banner] }))).not.toContain('data-tracking-mutable=');
  });
});
