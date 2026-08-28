/**
 * TrustBar — surfaces the four core privacy/quality promises above the fold
 * on every /convert/* page. The wording mirrors lib/seo/schema.ts
 * (SoftwareApplication.featureList) and lib/seo/securityFaq.ts so the visible
 * copy, the JSON-LD, and the FAQ stay consistent — a key E-E-A-T / AI-citation
 * signal. SERP audit P1: competitors lead with trust proofs at the top of the
 * page, so we move ours out of the bottom FAQ and into the first screen.
 */
const TRUST_ITEMS = [
  'No registration required',
  'No watermarks',
  'Files auto-deleted within 1 hour',
  'High-quality Calibre engine',
] as const

export function TrustBar() {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {TRUST_ITEMS.map((label) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white"
              aria-hidden="true"
            >
              ✓
            </span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
