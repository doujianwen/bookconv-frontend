# P1：GA4 七步入口与 G07 六门禁职责矩阵

完成时间：2026-11-21 11:38 CST。状态：**PARTIAL**（代码/文档层 DONE；自动化接线 BLOCKED，触及生产调度边界，R8 要求停止）。

## 1. 职责矩阵（谁调用谁、是否独立、如何防重复）

| 维度 | 七步数据巡检入口 `scripts/run-ga4-daily-integrated.py` | G07 六门禁经营入口 `scripts/growth-daily-entry.mjs` |
|---|---|---|
| 职责 | **数据采集与证据链**：fetch→redteam→advanced→redteam-analysis→inspection→full-report→closure | **经营门禁与双跑防护**：数据新鲜度→机会资格→台账唯一→实验注册表→GEO 可比性→内容完整性 |
| 产出 | 七步证据链产物（_wb_tmp 各 json + 详报 + closure 回执） | `_wb_tmp/growth-daily-run-<date>.json`（每步真实退出码）+ 终态 |
| 是否独立执行 | 是（可单独 `--date --dry-run` / 完整跑），但**无运行锁** | 是（可单独跑），**有任务级运行锁** |
| 调用关系 | 调 7 个子脚本（fetch/redteam/advanced/redteam-analysis/inspection/full-report/closure） | 调 5 个门禁脚本 + 幂等锁脚本，**不调七步入口** |
| 防重复机制 | ❌ 无锁——认证恢复后的补偿重放可导致同日多次采集 | ✅ 幂等键 `daily-ops@YYYY-MM-DD`，重复触发 exit 3（实测 9 用例） |
| 退出码 | 0=全通过 / 2=BLOCKED / 3=PARTIAL_ACCEPTED(仅 closure exit3) | 0=SUCCESS / 1=FAILED / 2=UNKNOWN / 3=SKIP |
| 谁调用谁 | 二者互不调用，是两条独立链 | 同左 |

**结论**：两者职责不同、不互相覆盖——七步是"采数据出证据"，G07 是"判经营结论+防双跑"。真正的问题是：①七步入口无运行锁（重复执行风险）；②每日自动化 prompt 内联了 9 步手写流程，**绕过了标准七步入口**，导致验收口径分叉。

## 2. 退出码/SKIP/UNKNOWN 标 PASS 防护（授权令明确要求）
- 七步入口：`run-ga4-daily-integrated.py` 仅当全部 7 步 exit 0 才返回 0（gate=PIPELINE_CHECKS_PASSED）；closure exit 3 → 整体 3（PARTIAL_ACCEPTED，非 0）；closure exit 2/其他 → 整体 2（BLOCKED，非 0）。**退出码 2/3 均不返回 0，符合"不标 PASS"**。
- 子脚本 SKIP/UNKNOWN：closure 脚本 `run-ga4-closure.py:16` 用 exit 2=issues / 3=residuals / 0=clean；residuals 被七步入口标为 PARTIAL_ACCEPTED(3)，不是 PASS。full-report 脚本有 `REPORT_SEMANTIC_GATE` 强制任务级成功率显式标注（UNKNOWN 可被接受但必须显式，不能伪装 VERIFIED）。
- `full_workflow_complete`：当前七步入口**未输出该字段**（输出 gate/steps/last_exit）。授权令要求"full_workflow_complete=false 时不得报告完整完成"——当前脚本用 `gate==PIPELINE_CHECKS_PASSED` 等价表达，但字段名不统一。登记为一致性债务（P2），不阻断。

## 3. 每日自动化现状（关键缺口）
`automation 92ac81b1`「GA4 每日巡检（WorkBuddy 主导）」ACTIVE，每日 09:00：
- prompt 是**手写的 9 步内联流程**（fetch --write → ga-parse-results → redteam → advanced → redteam-analysis → inspection → 详报 → present_files → 收尾）。
- **不调用** `run-ga4-daily-integrated.py`；**不含** closure 门禁；**不含** full_workflow_complete；**无运行锁**。
- 证据链七类齐备（fetch/redteam/advanced/redteam-analysis/inspection/full-report/closure 中前 6 类在 prompt 中，closure 缺失）。

## 4. 非生产验证（已完成）
| 验证 | 命令 | 结果 |
|---|---|---|
| 七步编排 dry-run | `python scripts/run-ga4-daily-integrated.py --date 2026-11-21 --dry-run` | EXIT=0，输出 7 步完整命令序列 |
| G07 入口 dry-run | `node scripts/growth-daily-entry.mjs --date 2026-11-21 --dry-run` | EXIT=1（keyword-series 新鲜度 109.7h>72h 真实 FAIL，非脚本 bug），未写状态文件 |
| G07 锁实测（既有文档） | 11-17 9 用例 | 重复触发 exit 3 被吸收 |

## 5. 阻塞项（BLOCKED，R8 停止）
要"将每日自动化统一到标准入口"，必须修改 `automation 92ac81b1` 的 prompt（生产自动化配置 + 生产调度边界）。授权令 R8 明确："任何测试触及生产数据、生产凭证、真实用户请求或部署边界时立即停止"；且本次"不得未经测试直接改变生产调度"。虽然授权范围含"自动化配置整改"，但：
- 七步入口完整跑通需 GA4 生产凭证（step1 fetch --write、step7 closure --requery），非生产环境无法完成"完整跑通"前置条件；
- 修改 prompt 会改变生产每日调度的实际行为（引入 closure 门禁、可能改变送达路径）。

因此**不擅自修改该自动化**。改前需 CEO 明确：是否允许在 GA4 生产凭证可用时统一 prompt，以及 closure 门禁乙的 PARTIAL_ACCEPTED 应如何呈现。

## 6. 已完成的代码/文档整改（本任务内 DONE）
- 职责矩阵本文档（谁调用谁/独立执行/防重复/退出码语义）——建立。
- 非生产 dry-run 验证——完成。
- 发现并登记三项一致性债务：①七步入口无运行锁（可复用 growth-task-idempotency.mjs 加键 `ga4-7step@date`）；②prompt 内联流程绕过标准入口；③full_workflow_complete 字段名不统一。三项均需授权生产变更后实施，列为 P1 残余。

## 7. Git 工作区保护
本任务未修改任何生产脚本、未改自动化配置、未提交/推送。自动化清单已通过只读 `automation_update(list)` 获取（42 条，非历史的 44 条）。

红队：L2 · 裁定 修正（识别 prompt 内联流程与标准入口不一致、七步入口无锁）· 回执 本文档 §1/§3/§5。
