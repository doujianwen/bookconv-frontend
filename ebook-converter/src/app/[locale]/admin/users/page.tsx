import { PanelView } from '@/components/workbench/PanelView';
import { getWorkbenchPayload } from '@/lib/workbench/provider';

export default async function UsersPanelPage() {
  const payload = await getWorkbenchPayload('users');
  return (
    <PanelView
      panelKey="users"
      payload={payload}
      description="账号、角色与权限边界。认证为手写 HS256 JWT + scrypt；未配置 DATABASE_URL 时用户存于内存，重启即失。"
    />
  );
}
