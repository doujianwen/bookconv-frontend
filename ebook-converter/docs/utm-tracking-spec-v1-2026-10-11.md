# UTM 跟踪规范 v1.0（2026-10-11）

> 依据：GA4 进阶分析 v2 手册模块 6/8。目的：把 GEO/AI 引用流量从 `direct/none` 黑暗流量中剥离，使渠道 ROI 可测。
> **验收线：UTM 规范生效 2 周后，GA4 中 `(direct)/(none)` 会话占比应 < 40%**（2026-09-14~10-10 基线：60%，177/294 会话）。

## 1. 强制规则

所有**主动外发**到 bookconv.com 的链接（含 GEO 发布、社媒、外链、客户交付物、邮件签名）必须带齐 3 个参数：

```
?utm_source={来源} & utm_medium={媒介} & utm_campaign={活动}
```

缺任一参数 = 不合格，发布前门禁应拦截（待办：publish-gate 增查项）。

## 2. 命名规范（全小写 + 连字符，禁中文/空格/下划线）

### utm_source（谁推荐了你）
| 场景 | 值 |
|---|---|
| ChatGPT 回答/发布 | `chatgpt` |
| Perplexity | `perplexity` |
| Gemini | `gemini` |
| Copilot | `copilot` |
| Claude | `claude` |
| 豆包 | `doubao` |
| 微信公众号 | `weixin-mp` |
| 小红书 | `xhs` |
| TikTok | `tiktok` |
| 邮件 | `email` |

### utm_medium（营销媒介，沿用 GA4 渠道组语义）
| 场景 | 值 |
|---|---|
| GEO/AI 可见性渠道 | `geo`（AI 平台统一用此值，便于直接拉「geo 渠道」报表） |
| 社媒内容 | `social` |
| 邮件 | `email` |
| 外链/客座文章 | `referral` |
| 付费（如启用） | `cpc` |

### utm_campaign（活动批次，格式 `日期-项目-批次`）
| 示例 | 含义 |
|---|---|
| `20261011-geo-batch14` | 10-11 GEO Batch 14 发布 |
| `20261011-talaquan-guest` | 它来团客座外链 |
| `2026-q4-mp-cta` | 公众号 CTA 导流 |

## 3. GA4 内已识别但**无法** UTM 的流量（诚实边界）

- AI 回答中**自然提及** bookconv.com → 用户手输 URL 的流量落入 direct，属黑暗流量，UTM 无法覆盖。
- 该部分 ROI 必须用三角印证：GA4 geo 渠道增量 + R_pre/R_post（Kelriva）+ Bing Web 验证引用数。三者一致才下结论（v2 手册模块 8 红队 R2 修正）。
- `chatgpt.com / ai-assistant` 渠道组已被 GA4 原生识别（28 天 4 会话），可作为无 UTM 时的兜底信号。

## 4. 验证与复核

1. 每批外发后 48h，用 Data API 查 `sessionSourceMedium` 确认 utm 落地（source=utm_source 值出现）。
2. 每周一巡检：`(direct)/(none)` 占比写入 ga-inspection 简报（待接入 fetch-ga4-daily）。
3. 占比 <40% 达成后，本规范升级为 v1.1 并把验收线收紧到 30%。

---
*维护：BookConv 运营；变更记录：v1.0 2026-10-11 初版（对应 P1-5）。*
