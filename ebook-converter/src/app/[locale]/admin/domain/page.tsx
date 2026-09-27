import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function DomainPanelPage() {
  const payload = await getWorkbenchPayload('domain');
  return (
    <PanelView
      panelKey="domain"
      payload={payload}
      description="域名解析、SSL、托管与备用源站。接入 Cloudflare API 后本面板可切到实时数据。"
    />
  );
}
