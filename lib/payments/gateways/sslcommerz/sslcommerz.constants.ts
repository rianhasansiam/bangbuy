/**
 * SSLCommerz gateway constants.
 *
 * Endpoint URLs, timeouts, and provider identification.
 * Credentials are never stored here — they come from environment variables.
 */

export const SANDBOX_SESSION_ENDPOINT =
  "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
export const LIVE_SESSION_ENDPOINT =
  "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

export const SANDBOX_VALIDATION_ENDPOINT =
  "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
export const LIVE_VALIDATION_ENDPOINT =
  "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

export const SANDBOX_TRANSACTION_QUERY_ENDPOINT =
  "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";
export const LIVE_TRANSACTION_QUERY_ENDPOINT =
  "https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";

export const REQUEST_TIMEOUT_MS = 30_000;
