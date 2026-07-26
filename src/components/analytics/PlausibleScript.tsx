// src/components/analytics/PlausibleScript.tsx — Server component that injects Plausible Analytics script.
// Usage: <PlausibleScript /> in root layout (already done).
// Self-hosted or plausible.io hosted, configured via NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL and NEXT_PUBLIC_PLAUSIBLE_DOMAIN env vars.

export function PlausibleScript() {
  const scriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js';
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  if (!domain) return null; // Not configured — don't inject placeholder

  return (
    <script
      defer
      data-domain={domain}
      src={scriptUrl}
    />
  );
}
