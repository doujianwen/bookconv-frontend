interface KeyTakeawaysSectionProps {
  keyTakeaways: string[];
}

export function KeyTakeawaysSection({ keyTakeaways }: KeyTakeawaysSectionProps) {
  if (!keyTakeaways || keyTakeaways.length === 0) return null;
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="mb-3 text-lg font-semibold text-emerald-900">Key takeaways</h2>
      <ul className="space-y-2 text-sm text-emerald-800">
        {keyTakeaways.map((kt, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-emerald-600">&#10003;</span>
            <span>{kt}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
