# P1-A GA4 自动化接线最小变更方案 / 非生产测试 / 回滚（2026-11-21 round2）

状态：**方案 DONE；实际接线 BLOCKED（改生产调度需授权，本轮未执行）**
既有职责矩阵 `bookconv-ceo-remediation-20261121/04_P1-GA4-entry-matrix.md` 完整保留，本文只追加接线方案。

## 1. 现状（实测，非手写流程图猜想）

- 标准七步入口 `scripts/run-ga4-daily-integrated.py`：CLI `--date --dry-run --send-summary`；七步 = fetch/write → redteam → advanced → redteam-analysis → inspection/--no-send → full-report/--send → closure/--requery。退出码 0=全过 / 3=PARTIAL(仅 closure exit3) / 2=BLOCKED。**无运行锁**。
- 自动化 `92ac81b1-94f1-4af1-b2c2-b8d577c3949c`「GA4 每日巡检（WorkBuddy 主导）」ACTIVE，`FREQ=DAILY;BYHOUR=9;BYMINUTE=0`，cwd=ebook-converter。其 prompt 是**手写 9 步内联流程**（fetch→parse→redteam→advanced→redteam-analysis→inspection→详报→present_files→收尾），**不调用标准七步入口、不含 full-report/closure、不读 full_workflow_complete**。
- 这就是"用手写流程冒充标准七步入口"的实际问题：验收口径分叉、closure 门禁缺失、无可复现统一产物。
- 非生产证据：`python scripts/run-ga4-daily-integrated.py --date 2026-11-21 --dry-run` → EXIT=0，只打印七步命令，未触 GA4 凭证/未写产物（原始输出 `evidence/P1A-7step-dryrun.json`）。

## 2. 最小变更方案（授权后执行，本轮未执行）

只替换自动化 prompt 的**执行体**，保留触发时段/cwd/名称/状态三要素不变：

- 保留：`rrule=FREQ=DAILY;BYHOUR=9;BYMINUTE=0`、`cwds=[ebook-converter]`、`status=ACTIVE`、automation_id 不变。
- 将手写 9 步内联命令段整体替换为：
```
1. 进入目录：cd 'E:/一人公司/电子书格式转换站/ebook-converter'
2. 运行前锁：用 growth-task-idempotency.mjs 的同日幂等键机制（或新建 ga4-daily@<date> 锁）判定今日是否已跑；已跑则 exit 3 SKIP，不重复采集。
3. 调用标准唯一入口：python scripts/run-ga4-daily-integrated.py --date $(date +%Y-%m-%d)
   - exit 0 = 七步全通过（gate=PIPELINE_CHECKS_PASSED），继续产出详报与 present_files
   - exit 3 = PARTIAL_ACCEPTED（closure exit3），不得标完整通过，输出 gate 与残余
   - exit 2 = BLOCKED，原样输出 artifact 的 steps 退出码，禁止报告完整完成
4. 读取 _wb_tmp/ga4-integrated-run-<date>.json，逐步骤列出 exit_code/stdout_tail/stderr_tail 作为证据链。
5. 写详报 _wb_tmp/GA4每日巡检详报_<date>.md，必须 present_files。
6. 收尾必检：full_workflow_complete 仅当 verify-ga4-workflow.py 判定；缺失/UNKNOWN 不得标 PASS。
```
- G07 六门禁入口 `growth-daily-entry.mjs` 保持独立，不由本自动化调用（职责边界不变）。
- 七步入口**补运行锁**是代码层最小追加（新脚本/参数），但会改变入口行为 → 授权后先非生产验证再上；本轮未改。

## 3. 非生产测试方案（接线前必须全部通过）

1. `--dry-run` 验证（已做，EXIT=0）：确认七步命令序列完整、无凭证触达。
2. GA4 凭证可用窗口内，用**历史日期**（如 2026-11-13，数据已落盘）跑完整七步，验证 7 步各有独立 exit_code 与产物、closure 回执与详报一致；**不写当日生产数据**。
3. 退出码判别：注入一步失败，确认整体 exit 2/3 且 `full_workflow_complete=false` 不标 PASS（接口层已有 `test-ga4-workflow-gate.py` 2 用例覆盖，先跑通）。
4. 锁验证：同日重复触发，第二次 exit 3 SKIP，无第二份采集团集。
5. 以上全部在非生产目录/历史日期完成；任一触到生产凭证边界按 R8 停止。

## 4. 回滚方案（一行恢复）

保存现 prompt 全文（已在 §1 摘录结构）；接线后如需回滚，用 `automation_update` 把 prompt 替换回原 9 步内联文本，`rrule/cwd/status` 不动。guard/七步脚本本身保留不影响回滚（未被调用即无行为）。

## 5. 未解决 / 残余
- 七步入口无运行锁（重复执行风险）——代码层未改，需授权。
- 自动化 prompt 仍走手写 9 步——BLOCKED，需授权改生产调度。
- closure exit3 在七步入口被标 PARTIAL_ACCEPTED（整体 exit 3，非 PASS），语义正确但与 closure 脚本"exit3=有残余"的命名需文档对齐（既有矩阵已记录）。

## 6. 红队回执
- L2：质疑"矩阵 DONE 是否等于接线 DONE"——否，本文明确区分；质疑 dry-run 是否触凭证——实测只打印命令，未触。
- L3 独立通道：dry-run 原始输出落盘 `evidence/P1A-7step-dryrun.json`；prompt 原文来自 automation view 而非记忆。
