// Lightweight GA4 event helper.
//
// The `gtag()` global is declared by the inline init script in app/layout.tsx
// (window.dataLayer + function gtag(){dataLayer.push(arguments)}). We guard for
// SSR and for the brief window before that script lazy-loads, so calling this
// during render or before GA is ready is a safe no-op rather than a crash.
//
// Event names used here must exist as events in the GA4 property
// (G-QJTM9CFPWZ). `file_upload` is a GA4 recommended event; `conversion_complete`
// and `conversion_failed` are custom events — create them in GA4 if missing.

type GAEventParams = Record<string, string | number | boolean | undefined>;

export function trackGAEvent(name: string, params?: GAEventParams): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, params ?? {});
}
