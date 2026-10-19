/*
  Cookie consent. The choice lives in one first-party cookie, aqar_consent
  ("all" | "essential"), for twelve months. Analytics or other optional
  scripts should only load when getConsent() === "all"; listen for the
  "aqar:consent" event to react to a change without a reload.
*/
export type Consent = "all" | "essential";
const NAME = "aqar_consent";
const YEAR = 60 * 60 * 24 * 365;
const listeners = new Set<() => void>();

export function getConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)aqar_consent=(all|essential)/);
  return (m?.[1] as Consent) ?? null;
}

export function setConsent(value: Consent) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NAME}=${value}; Max-Age=${YEAR}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("aqar:consent", { detail: value }));
  listeners.forEach((fn) => fn());
}

/** Re-open the banner (footer "Cookie settings"). */
export function reopenConsent() {
  reopened = true;
  listeners.forEach((fn) => fn());
}
let reopened = false;
export const consentReopened = () => reopened;
export const clearReopened = () => {
  reopened = false;
};

export function subscribeConsent(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
