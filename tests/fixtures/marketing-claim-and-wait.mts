// Deliberately exits only when the process smoke test sends SIGKILL. This
// simulates a worker dying after a committed claim, before any HTTP request.
const target = new URL(process.env.MARKETING_TEST_DATABASE_URL ?? '');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.port === '15432' || target.pathname !== '/bangbuy_marketing_test') {
  throw new Error('DISPOSABLE_MARKETING_DATABASE_REQUIRED');
}
process.env.DATABASE_URL = target.toString();
process.env.DIRECT_URL = target.toString();
process.env.META_RUNTIME_ENABLED = 'false';
process.env.META_CAPI_ENABLED = 'false';
process.env.META_PIXEL_ENABLED = 'false';
const { postgresConversionStore } = await import('../../lib/analytics/conversion-worker');
const record = await postgresConversionStore.claim(new Date());
if (!record) throw new Error('SYNTHETIC_CLAIM_REQUIRED');
console.info('SYNTHETIC_CLAIM_READY');
setInterval(() => {}, 1000);
