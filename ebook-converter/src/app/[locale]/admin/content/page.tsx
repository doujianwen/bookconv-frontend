import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function ContentPanelPage() {
  const payload = await getWorkbenchPayload('content');
  return (
    <PanelView
      panelKey="content"
      payload={payload}
      description="内容清单、草稿队列与发布闸门状态。所有编辑必须经过 publish-gate 与单元测试，绿灯只证明它检查过的项。"
    />
  );
}
