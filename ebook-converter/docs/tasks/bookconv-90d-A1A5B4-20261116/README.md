# BookConv 90天增长计划｜首批 A1–A5 + B4 执行交付

## run_id（可追溯）

`BC90D-A1A5B4-20261116-230301`

- 锚点：账户 Gate 证据 `E:/一人公司/_governance/evidence/account-gate-20261116-230301.json`（status=PASS，identity=DESKTOP-IKRV41G\admin，session=1，harness_pass=true）。
- 启动时间：2026-11-16T23:02:31+08:00 ｜ 收尾：2026-11-16T23:17:57+08:00 ｜ 代码基线 HEAD=`cd0a9eb`。
- 执行主体：WorkBuddy（admin / Session 1）；本地长任务，符合计划 §8 "Owner 偏好 WorkBuddy 执行本地长任务"。
- 前置核验：治理协议（TASK-GOVERNANCE + 通用协议 §1–§10）已读；钩子门禁 `verify-hook-mount.mjs`=PASS；账户 Gate=PASS；dirty worktree 四处变更全程保留、未 git add、未 commit、未 push、未改生产。

## 交付物索引

| 文件 | 内容 |
|---|---|
| `REPORT.md` | 主分析报告：A1–A5 真实复算结论 + B4 管道结果 |
| `EXECUTION-LOG.md` | 执行日志：每个动作的证据、退出码、时点 |
| `B4-backlink-pipeline.md` | B4 外链管道报告 + 授权判定 + 提交回执状态 |
| `raw/` | 锁定的原始数据快照（13 份）+ SHA256 清单 |
| `evidence/` | 本轮实时拉取原始输出 + 复算脚本 + 提交脚本与回执 |

## 真实数据通道分层（诚实）

| 通道 | 本轮结果 | 数据来源 |
|---|---|---|
| GSC date | ✅ 实时成功（13 clicks/211 impr） | `evidence/GSC_API_date_LIVE_...json` |
| GA4 Data API | ✅ 实时成功（T-1 + 7d，24 reports） | `evidence/ga4-acq-*.json`、`ga4-live-*.json` |
| Bing Webmaster | ⚠️ 部分失败：RankAndTraffic 200；Query 端点 ECONNRESET（exit 1） | RankAndTraffic 实时落 `evidence/`，Query/Page 用 11-16 快照 |
| 外链提交 | ❌ 网络通道 TLS 失败，未提交（Submitted=0） | `B4-backlink-pipeline.md` §4 |

## 关键结论速览

1. **A1**：GSC "date 0 clicks vs page 1 click" 是**窗口错位**（唯一 1 click 在 11-05，落在 page 10 天窗内、不在 date recent7 窗内），非数据矛盾；query×page 精确归属标 UNKNOWN。
2. **A2**：410 观测词中 375 非品牌 / 35 品牌；96.6% 在 Top30 外；中位排名 67.3。410 是观测词集，非全量词库。
3. **A3**：高价值 URL 集中在首页与 convert 页但排名弱（首页 76 位/55 impr）；根因以"排名弱 + 意图/内容缺口"为主，索引/canonical 类未证实项标 UNKNOWN（本轮未做单 URL Inspection）。
4. **A4**：T-1（11-15）activeUsers 34 / sessions 38 / keyEvents 26；终态事件占比 26/(26+2)=92.9%（Wilson 95% CI 77.4–98.0），**是事件级终态占比，非任务级成功率（无 job_id）**。country=China 100% + (not set) 11 sessions 标污染嫌疑；7d 出现 DIRECT_UPLOAD_PUT_FAILED 等错误码，链路健康须带时点。
5. **A5**：Bing 11-08 单日 11 clicks 尖峰；recent7（含尖峰）31 vs prev7 31，剔除尖峰 20 → 不得称趋势增长；Query/Page 为周桶，单日具体归因标 UNKNOWN。
6. **B4**：TTD 免登录免费收录资格确认、表单核验完成、官方邮箱确认；真实提交因本机出口 TLS 通道整体失效未执行，Submitted=0，资料包齐备待网络恢复重放。

口径铁律：Visibility≠Traffic、Citation≠Referral、事件≠会话≠人、提交≠Live。所有 UNKNOWN/STALE/NOT_SENT 如实标注，无补零、无推测、无伪造回执。

红队：L3 · 裁定 修正（详见 REPORT.md §红队回执）· 回执 REPORT.md + 各 evidence。无独立提交回执通道 → 提交部分标 L3-UNAVAILABLE。
