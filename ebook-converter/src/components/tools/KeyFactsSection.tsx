import { chrome } from "@/lib/ui-chrome"

interface KeyFactsData {
  label: string;
  value: string;
}

interface KeyFactsSectionProps {
  keyFacts: KeyFactsData[];
  /** M5-6：西语页 chrome 本地化开关 */
  isEs?: boolean;
}

export function KeyFactsSection({ keyFacts, isEs = false }: KeyFactsSectionProps) {
  if (!keyFacts || keyFacts.length === 0) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{chrome('formatFacts', isEs)}</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {keyFacts.map((f) => (
          <div key={f.label} className="flex gap-2 text-sm">
            <span className="shrink-0 font-medium text-slate-600">{f.label}:</span>
            <span className="text-slate-800">{f.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
