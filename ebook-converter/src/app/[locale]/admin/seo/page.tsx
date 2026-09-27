import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function SeoPanelPage() {
  const payload = await getWorkbenchPayload('seo');
  return (
    <PanelView
      panelKey="seo"
      payload={payload}
      description="技术 SEO 基线、内容结构风险与固定关键词台账。关键词台账是持续推进表，不是每次重新研究。"
    />
  );
}
