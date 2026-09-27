import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function DeployPanelPage() {
  const payload = await getWorkbenchPayload('deploy');
  return (
    <PanelView
      panelKey="deploy"
      payload={payload}
      description="分支状态、提交记录与质量门禁。部署状态禁止以文档记录为准，必须实时校验 git 与 CI。"
    />
  );
}
