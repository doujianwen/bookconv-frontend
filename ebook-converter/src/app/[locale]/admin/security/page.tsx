import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function SecurityPanelPage() {
  const payload = await getWorkbenchPayload('security');
  return (
    <PanelView
      panelKey="security"
      payload={payload}
      description="备份、错误监控与安全基线。未经恢复演练的备份不构成备份。"
    />
  );
}
