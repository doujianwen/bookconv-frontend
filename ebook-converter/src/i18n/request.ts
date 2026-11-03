import { getRequestConfig } from 'next-intl/server';
import { getLocale, getMessage } from './utils';

// 2026-11-03 M12-3 静态化：本文件原有一份与 utils.ts 重复的 getLocale
// （headers/cookies 驱动，把全站钉死在动态渲染）。改为直接复用 utils.ts 的
// rootParams 版本——locale 由 URL 路由参数驱动，渲染树无动态 API ⇒ 可静态化。
export { getLocale, getMessage };

export default getRequestConfig(async () => {
  const locale = await getLocale();
  return {
    locale,
    messages: await getMessage(locale),
  };
});
