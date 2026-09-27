import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function AnalyticsPanelPage() {
  const payload = await getWorkbenchPayload('analytics');
  return (
    <PanelView
      panelKey="analytics"
      payload={payload}
      description="Google 与 Bing/AI 双渠道分别度量。SEO 与 GEO 数据必须分开记录，禁止合成单一 GEO 总分；引用量不得对外表述为流量承诺。"
    />
  );
}
