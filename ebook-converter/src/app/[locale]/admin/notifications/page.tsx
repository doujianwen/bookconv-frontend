import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function NotificationsPanelPage() {
  const payload = await getWorkbenchPayload('notifications');
  return (
    <PanelView
      panelKey="notifications"
      payload={payload}
      description="通知流与告警规则。规则已声明但尚未派发——需接入通知通道（邮件/Webhook）后生效。"
    />
  );
}
