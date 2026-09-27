// src/app/[locale]/admin/competitors/page.tsx
// Competitor keyword-ranking panel — table ③ (竞品关键词变化).
import { CompetitorPanel } from '@/components/keywords/CompetitorPanel';
import { loadCompetitorSeries } from '@/lib/keywords/loader';

export const dynamic = 'force-dynamic';

export default async function CompetitorsPage() {
  const data = loadCompetitorSeries();
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">竞品关键词排名</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          尚未生成 <code className="rounded bg-gray-100 px-1 dark:bg-white/10">data/competitor-series.json</code>。
          先抓 SERP 再合并：
        </p>
        <pre className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200">
{`export SERPAPI_KEY=xxx        # 或 BING_WEB_SEARCH_KEY=xxx
npm run fetch:competitor      # 抓一次
npm run build:competitor      # 合并成序列`}
        </pre>
      </div>
    );
  }
  return <CompetitorPanel data={data} />;
}
