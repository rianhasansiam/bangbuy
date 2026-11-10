import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { documentSecurityHeaders } from '@/lib/security/content-security-policy';

function directive(policy: string, name: string) {
  return policy.split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name} `))?.split(/\s+/).slice(1) ?? [];
}
function allows(values: string[], url: string) {
  const candidate = new URL(url);
  return values.some((value) => value === candidate.origin ||
    (value.startsWith('https://*.') && candidate.protocol === 'https:' && candidate.hostname.endsWith(value.slice('https://*'.length))));
}

describe('private CSP preserves the installed hosted-payment integration', () => {
  it('allows every installed SDK controller/payment host without allowing Meta or a generic HTTPS source', () => {
    const sdk = readFileSync('node_modules/@airwallex/components-sdk/lib/index.mjs', 'utf8');
    const hosts = [...new Set(sdk.match(/https:\/\/(?:static|checkout)[a-z.-]*\.airwallex\.com/g) ?? [])];
    expect(hosts).toContain('https://static.airwallex.com');
    expect(hosts).toContain('https://checkout.airwallex.com');
    const policy = documentSecurityHeaders('private')['Content-Security-Policy'];
    for (const host of hosts) expect(allows(directive(policy, 'script-src'), host)).toBe(true);
    for (const host of ['https://api.airwallex.com', 'https://api.sandbox.airwallex.com', 'https://o11y.airwallex.com', 'https://securepay.sslcommerz.com']) {
      expect(allows(directive(policy, 'connect-src'), host)).toBe(true);
    }
    for (const name of ['script-src', 'connect-src', 'img-src', 'frame-src']) {
      const values = directive(policy, name);
      expect(values).not.toContain('https:');
      expect(allows(values, 'https://connect.facebook.net/en_US/fbevents.js')).toBe(false);
      expect(allows(values, 'https://www.facebook.com/tr')).toBe(false);
    }
  });
  it('keeps hosted redirects rather than introducing embedded wallet components or broad issuer permissions', () => {
    const integration = readFileSync('lib/airwallex/components/AirwallexPayButton.tsx', 'utf8');
    expect(integration).toContain('payments.redirectToCheckout(');
    expect(integration).not.toContain("createElement('dropIn'");
    const policy = documentSecurityHeaders('private')['Content-Security-Policy'];
    expect(directive(policy, 'frame-src')).not.toContain('https:');
    expect(documentSecurityHeaders('private')['Referrer-Policy']).toBe('no-referrer');
  });
});
