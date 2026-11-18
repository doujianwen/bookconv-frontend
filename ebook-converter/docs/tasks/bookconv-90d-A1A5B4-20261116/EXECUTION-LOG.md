# 执行日志｜BC90D-A1A5B4-20261116

时间均为 GMT+8。退出码为实测真实值。run_id 锚点见 README.md。

## 前置核验阶段（23:02–23:04）

| 时点 | 动作 | 结果/退出码 | 证据 |
|---|---|---|---|
| 23:02:31 | 读 TASK-GOVERNANCE.md + 通用协议 §1–§10 | PASS（协议全文可读） | 工具读取记录 |
| 23:02:31 | `git status --short --branch` | main...origin/main；4 处未提交变更 | 见下「dirty 保护」 |
| 23:02:59 | 账户 Gate `AI执行账户Gate.ps1 -RequireHarness` | PASS exit 0；admin/Session1；harness_pass=true | `E:/一人公司/_governance/evidence/account-gate-20261116-230301.json` |
| 23:03 | `verify-hook-mount.mjs` | PASS exit 0 | 工具输出 |
| 23:02 | Notion fetch 计划文档 41addd47… | 全文可读（v1.0，11-16 22:59 更新） | Notion fetch 回执 |
| 23:04:55 | 建 run 目录、复制 13 份原始数据、生成 SHA256 清单 | exit 0；14 文件（含清单） | `raw/RAW_MANIFEST.sha256.txt` |

## 实时通道验证阶段（23:05–23:06）

| 时点 | 动作 | 结果/退出码 | 证据 |
|---|---|---|---|
| 23:05 | 出口 IP 观测 | 154.64.226.146（代理出口） | curl ipify |
| 23:05 | `fetch-gsc-webmaster.mjs --days 30 --dimension date` | **PASS exit 0**；rows=31 clicks=13 impr=211 | `evidence/GSC_API_date_LIVE_2026-11-14_d30.json` |
| 23:05 | `fetch-bing-webmaster.mjs` | **PARTIAL exit 1**；RankAndTraffic 200(rows=112)，Query 端点 ECONNRESET | `evidence/BingAPI_RankAndTraffic_LIVE_partial_2026_11_16.csv` |
| 23:05 | `fetch-ga4-daily.mjs 2026-11-15` | **PASS exit 0**；activeUsers=34 events=291 | `evidence/ga4-live-2026-11-15.json` |
| 23:06 | 重跑 GA4 落盘 evidence | exit 0 | `evidence/ga4-live-2026-11-15.json` |

## 诊断执行阶段（23:06–23:08）

| 时点 | 动作 | 结果/退出码 | 证据 |
|---|---|---|---|
| 23:06 | 写 `diagnose-a1a2a5.mjs`（A1/A2/A5 复算） | 文件创建 | `evidence/diagnose-a1a2a5.mjs` |
| 23:06 | 首跑复算 | exit 0，但发现 Bing 3 列 CSV 被 6 列解析错位 | 诊断输出 |
| 23:07 | 诊断 Bing CSV 粒度 → 发现 Query/Page 为周桶 | CONFIRMED：周桶不含 11-08 | 工具输出 |
| 23:07 | 修正脚本（3 列解析 + 周桶标注）并重跑 | **exit 0**；A1/A2/A5 结论自洽 | `evidence/diagnosis-a1a2a5.json`、`diagnosis.stderr.txt`（空） |
| 23:08 | `fetch-ga4-acquisition.mjs` T-1（11-15） | **PASS exit 0**；24 reports 全部 ok | `evidence/ga4-acq-T1-2026-11-15.json` |
| 23:08 | `fetch-ga4-acquisition.mjs` 7d（11-09~11-15） | **PASS exit 0**；24 reports 全部 ok | `evidence/ga4-acq-7d-2026-11-15.json` |
| 23:08 | 写 `analyze-a4.mjs` 并运行 | **exit 0**；终态 26/28=92.9% CI[77.4,98.0] | `evidence/analysis-a4.json`、`a4.stderr.txt`（空） |

## B4 外链阶段（23:09–23:14）

| 时点 | 动作 | 结果/退出码 | 证据 |
|---|---|---|---|
| 23:09 | 候选平台实时 HTTP 探测 | TTD 200 / SaaSHub 200 / PH 403 / AT 403 | 工具输出 |
| 23:09 | 抓 TTD 提交页并解析表单字段 | 34125 bytes；nonce/分类/定价枚举确认 | `evidence/ttd-submit-page.html` |
| 23:1x | 查官方邮箱 | hello@bookconv.com（站点多处公示） | Grep 结果 |
| 23:1x | 用户会话确认 | **授权真实提交** The Tool Directory 免费 listing | AskUserQuestion 回执 |
| 23:1x | 写 `submit-ttd.mjs`（同会话 nonce+cookie→POST） | 文件创建 | `evidence/submit-ttd.mjs` |
| 23:1x | 执行真实提交（Node fetch） | **FAILED exit 1**；ECONNRESET（TLS 未建立） | `evidence/submit-ttd.stderr.txt` |
| 23:1x | curl 同会话 GET 重试 | FAILED exit 35（schannel TLS 失败） | 工具输出 |
| 23:1x | 稳定性诊断：3 次 HEAD + bookconv 对照 | 全部 http=000；通道整体失效 | 工具输出 |
| 23:1x | 停止重试，B4 归档为 DRAFTED/Submitted=0 | 按"两次相同失败停止"纪律 | `B4-backlink-pipeline.md` |

## 交付阶段（23:15–23:18）

| 时点 | 动作 | 结果 | 证据 |
|---|---|---|---|
| 23:15 | 关闭门禁 `verify-closure-gates.mjs --no-live` | 见下「门禁」 | 工具输出 |
| 23:17 | 写 README / REPORT / EXECUTION-LOG | 完成 | 本目录 |
| 23:18 | 红队 L3 回执 | 修正→通过；提交部分 L3-UNAVAILABLE | REPORT.md |

## dirty worktree 保护（全程核验）

任务开始与结束均为以下 4 处变更，**未 git add / commit / push / 改生产**；本 run 目录为新增未跟踪文件，不覆盖任何既有变更：

```
 M ebook-converter/data/competitor-series.json
 M ebook-converter/data/keyword-series.json
?? ebook-converter/docs/tasks/BookConv-link-qualification-2026-11-16.json
?? ebook-converter/docs/工作日志/2026-11-16.md
```

## 门禁结果

- `verify-hook-mount.mjs`：PASS exit 0（钩子从入库目录生效，与仓库版本一致）。
- 账户 Gate：PASS exit 0（admin/Session1/harness_pass=true）。
- 复算/分析脚本：全部 exit 0，stderr 无异常。
- 关闭门禁 `verify-closure-gates.mjs --no-live`：**exit 0，无假关闭**（既有 4 关闭项：F19/R2 PASS，F15/F26 UNKNOWN 需人工核验，与本批无关）。注意：本 run 是诊断交付，不新开"待办关闭"，此门禁仅作仓库健康旁证。
