import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function FeedbackPanelPage() {
  const payload = await getWorkbenchPayload('feedback');
  return (
    <PanelView
      panelKey="feedback"
      payload={payload}
      description="用户反馈：转换工具页的定向反馈（自动带格式对/错误码）与全站悬浮入口的通用反馈。数据源为 Postgres 表 user_feedback，实时读取；飞书卡片是即时通知，本页是可检索、可聚合的观测底座。未配置 DATABASE_URL 时本页显示 unknown（而非 0）。"
    />
  );
}
