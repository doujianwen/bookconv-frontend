// src/instrumentation.ts
//
// Next.js server startup hook. `register()` runs once per server instance
// (including each Vercel Lambda cold start) at boot — the right place for
// one-time configuration sanity checks that would otherwise fail silently.
//
// 背景：FEISHU_WEBHOOK_URL 同时驱动「转换失败告警」与「用户反馈通知」
// （src/lib/alerts.ts）。当它为 empty 时，postFeishuCard() 静默返回 false、
// 路由把异常全吞掉，于是一次全站转换故障（2026-10-01）直到 T+1 才被 GA 日报
// 发现；反馈提交了飞书却收不到，也只能从 GA 反衬。这条启动告警把缺口直接
// 打到 Vercel Function Logs，让「通道没接」在部署后第一眼可见，而不是出事后才挖。
//
// 次要检查：URL 已配但既无 KEYWORD 也无 SECRET —— 飞书机器人若开启了
// 关键词/签名安全，卡片会被 code 19024/19021 拒收（历史上同样的静默假成功）。
// 这条提示防止该失败模式重演。

export async function register(): Promise<void> {
  const webhook = (process.env.FEISHU_WEBHOOK_URL || '').trim();

  if (!webhook) {
    // eslint-disable-next-line no-console
    console.error(
      '[boot-check] ⚠ FEISHU_WEBHOOK_URL 未配置。转换失败告警与用户反馈通知将' +
        '被静默跳过（postFeishuCard 返回 false，路由吞掉异常）。请在 Vercel 环境变量中设置' +
        ' FEISHU_WEBHOOK_URL 以启用告警通道。在此之前，任何转换故障都只能靠 GA 日报在 T+1 才发现。'
    );
    return;
  }

  const keyword = (process.env.FEISHU_WEBHOOK_KEYWORD || '').trim();
  const secret = (process.env.FEISHU_WEBHOOK_SECRET || '').trim();
  if (!keyword && !secret) {
    // eslint-disable-next-line no-console
    console.warn(
      '[boot-check] ℹ FEISHU_WEBHOOK_URL 已配置，但 FEISHU_WEBHOOK_KEYWORD 与' +
        ' FEISHU_WEBHOOK_SECRET 均未设置。若飞书机器人开启了「关键词」或「签名」安全设置，' +
        '卡片将被 code 19024/19021 拒收而不送达。请按机器人安全设置补充其中一项。'
    );
  } else {
    // eslint-disable-next-line no-console
    console.info('[boot-check] ✓ 飞书告警通道已配置（webhook 存在），启动自检通过。');
  }
}
