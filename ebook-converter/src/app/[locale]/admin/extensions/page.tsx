import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function ExtensionsPanelPage() {
  const payload = await getWorkbenchPayload('extensions');
  return (
    <PanelView
      panelKey="extensions"
      payload={payload}
      description="插件、集成与主题版本。废弃模块只做清理，不做重新接线——队列死代码不得复活。"
    />
  );
}
