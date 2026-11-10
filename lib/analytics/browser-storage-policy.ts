/** Migration defense only: inspect key names, never private values or telemetry. */
export function hasLegacyPrivateBrowserState(): boolean {
  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (key && (/^enterfly:(?:cart|wishlist|saved-for-later|order|meta)[-:]/.test(key) || key.startsWith("bangbuy:locale-draft:"))) return true;
      }
    }
    return false;
  } catch { return true; }
}
