import { CURRENT_TRACKING_POLICY_VERSION, type MarketingConsentState } from "./consent";

// Necessary privacy preference only. It contains no marketing identifier and
// also keeps a failed server revocation denied in this browser until retried.
export const CONSENT_PREFERENCE_KEY = "bangbuy:privacy:marketing";
export const CONSENT_STOP_EVENT = "bangbuy:consent-stop";
export const CONSENT_CHANGE_EVENT = "bangbuy:consent-change";

export function browserConsentDenies(): boolean {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_PREFERENCE_KEY) ?? "null");
    return value && (value.policyVersion !== CURRENT_TRACKING_POLICY_VERSION || value.state === "denied" || value.state === "revoked");
  } catch { return true; }
}

export function rememberBrowserConsent(state: MarketingConsentState): void {
  try { localStorage.setItem(CONSENT_PREFERENCE_KEY, JSON.stringify({ state, policyVersion: CURRENT_TRACKING_POLICY_VERSION, changedAt: Date.now() })); } catch { /* Server preference still applies. */ }
}
