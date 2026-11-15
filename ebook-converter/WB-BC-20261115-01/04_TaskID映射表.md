# 04｜BookConv Task ID 映射表

映射契约：`owner_user_id + automation_id + canonical Task ID + run_id/session_id + artifact reference` 五元精确映射。**仅依据任务名称/提示词中自带的 Task 编号（M-x、A4.1-Tx、R1、WB-BC 等）建立映射；不按标题相似或时间接近猜测；无证据者标 UNMAPPED。**

## 1. 已映射（名称/提示词内嵌 Task ID，证据充分）

| automation_id | 账号 | 名称 | canonical Task ID | run_id 样例（thread_id:ts） | artifact |
|---|---|---|---|---|---|
| f112c8ff | A1 | Bing Topic Portfolio 月度快照 | **M11-6/8** | 见 run_history.json | 数据分析/Bing-Topic 快照产物 |
| 13300356 | A2 | bookconv 周一三合一分析 | **M9-7** | 同上 | 数据分析/三合一周报 |
| 2b3bead6 | A2 | M12-1 第14天GSC窗口核查 | **M12-1**（11-18 到期） | 无 run | 待产 |
| 3363d7e7 / b3750bb6 | A1 | A4.1-T3 / A4.1-T2 状态持续性采集 | **A4.1-T3 / A4.1-T2** | 各 1 run | 项目笔记 |
| ad880e02 / ae63bfcb | A1 | M5-6 西语本地化+M5-2 批次3 | **M5-6 + M5-2** | 各 1-2 runs | 译文产物 |
| 7ecd345e 等 R 系 | A1 | Run#5 7天窗口复测 | **R1**（Run#5） | 1 run | 复测报告 |
| （GA4 记忆中 R1 待办） | A1 | Windows 失败率 50.3% vs Android 26.9% | **R1 待办**（GA4 深度分析引用） | — | GA4 巡检记忆 |

## 2. 业务归属明确但无内嵌编号（UNMAPPED-by-design，建议在任务名中补编号）

| automation_id | 名称 | 建议编号 |
|---|---|---|
| 92ac81b1 | GA4 每日巡检 | 建议 GA4-DAILY |
| 7ecd345e | Bing 每日 URL 提交 | BING-SUBMIT |
| 8290a67f | GEO 日报草稿（现名 Bing 提交，名实不符） | GEO-DAILY-DRAFT |
| f4d73b34 | 每周双渠道分析 | WEEKLY-DUAL |
| 87033c10 | 周度关键词主表 | WEEKLY-MASTER |
| 67494c98 | 每周竞品 SERP | WEEKLY-SERP |
| feffb8a1 | GSC 周抓 | WEEKLY-GSC（拟 STOP） |
| 2e8c6c27 | 夜间同步 | NIGHT-SYNC |
| automation-1786630182041 | 日志归档 | WORKLOG-ARCHIVE |
| f1ca7eb8 | 审计整改逐日推进 | AUDIT-DRILL |
| bd34eb88 / 0795b7de | A2 记忆驱动 / GEO卡片门禁 | MEM-DRIVE / GEO-GATE |

## 3. 未归属（UNMAPPED，禁止伪造关联）

automation-4、automation-7、automation-11、automation（文章复盘）、automation-1777642530228，及第三方 291d8402 的 1 条运行。→ 待 Owner 归属裁决后补映射。

## 4. run_id ↔ conversation_id 桥接

`automation_runs.thread_id = {conversation_id}:{created_at_ms}`；`metadata_json.sessionId = conversationId`。据此可将任一 run 精确回溯到 WorkBuddy 会话与 `_wb_tmp/` 产物。全量见 `data/run_history.json`。
