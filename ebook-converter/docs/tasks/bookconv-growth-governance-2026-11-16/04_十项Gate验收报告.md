# 04 十项 Gate 验收报告（阶段 4）

- 原则：**静态代码检查 ≠ 生产运行验收**。每项尽量给真实退出码；不能实测的标 UNKNOWN/BLOCKED 并说明。
- 所有退出码均为本机真实运行复测；管道测量用 `${PIPESTATUS[0]}` / 重定向后 `$?`，不取 `tail` 的退出码（已发现并纠正一次测量陷阱）。

## G01 数据可信度
- **标准**：质量校验+命中数断言+UNKNOWN 第三态+反向注入四要件齐备。
- **测试用例**：`fetch-competitor-serp.mjs --self-test`；`ga4-advanced-analysis.mjs --self-test`。
- **执行记录**：SERP self-test 输出"goto 包装解包 + topDomains 提取"，exit 0；GA4 self-test 24/24 PASS（含"缺一天点名""日期不可解析→UNKNOWN"），exit 0。
- **证据**：真实 exit 0/0（本轮）；`data/competitor-series.json` 13 快照。
- **结论**：**PASS**。残余：Bing AI 数据落后 17 天（既有 R2，非本 Gate 判据）。

## G02 增长机会资格
- **标准**：可复现矩阵判据；声明冲突→FAIL；不可判细分→UNKNOWN；机会不足输出空集合不伪造任务。
- **测试用例**：`growth-opportunity-gate.mjs --self-test`（7 判据+1 注入）；正式跑 50 条源数据。
- **执行记录**：self-test PASS exit 0；正式判定 50 条→资格 11、细分 UNKNOWN 11、声明冲突 0，exit 0。反向注入（构造 guide+targetSlug）验证 UNKNOWN 细分不误判 FAIL。
- **证据**：真实 exit 0/0；测试期曾发现判据缺陷（把 targetSlug 误当"已有承载"），经红队修正为 UNKNOWN 细分，非伪造通过。
- **结论**：**PASS**。残余：guide 类 P0/P1 细分需人工/经营阶段补"已有承载"判据字段。

## G03 任务生命周期和去重
- **标准**：board id 唯一；同日重复执行→FAIL；跨日合法；空集合法。
- **测试用例**：`growth-task-idempotency.mjs --self-test`（5 用例含注入）；board 正式校验；同日重复事件注入。
- **执行记录**：self-test 5/5 PASS exit 0；board 146 条唯一 id 146，exit 0；注入同日重复事件→FAIL exit 1（反向验证通过）。
- **证据**：真实 exit 0/0/1（注入预期 FAIL）；`tests/unit/board.test.ts:65-68` 拒重复 id。
- **结论**：**PASS**。残余：真实事件日志路径尚未接入生产调度（幂等维度在正式校验中标 NOT_CHECKED）；关闭门禁仍有 F26 UNKNOWN（人工核验项）。

## G04 权限及副作用安全
- **标准**：工程层（非 Prompt）拦截生产修改/push；hooks 挂载一致；反向注入可证伪。
- **测试用例**：`verify-hook-mount.mjs` + `--self-test`；`publish-gate.mjs`；`safe-push` 保护分支逻辑（静态）。
- **执行记录**：挂载自检 PASS exit 0（pre-commit/pre-push 从入库目录生效）；`--self-test` 6/6 PASS（注入配置不可读→UNKNOWN、恢复→PASS）exit 0；publish-gate 两层放行 exit 0。
- **证据**：真实 exit 0/0/0；`git config core.hooksPath`=入库目录。
- **结论**：**PASS（本轮范围）**。残余：付费/对外提交的工程层拦截 NOT_APPLICABLE（本轮无此类动作）；hooksPath 为本机 git 配置、不入库，换机需重装（既有已知）。

## G05 独立验收
- **标准**：独立于主执行的第二通道（mode=ro/独立脚本）；三态退出码；声称"已验证"须独立复核。
- **测试用例**：`WB-BC-20261115-01/verify_independent.py` 实跑；`verify-closure-gates.mjs --no-live`；`verify-hook-mount --self-test`。
- **执行记录**：verify_independent.py 24 检查 PASS19/FAIL5，**真实 exit 1**；closure exit 0 无假关闭（F26 UNKNOWN）；hook self-test 6/6 exit 0。
- **证据**：`verify_independent.py:8` SQLite mode=ro；:105 退出码语义 0/1/2 源码确认。5 项 FAIL 均为 11-15 静态基线（43 自动化/7d 计数）与 11-16 实时 DB 的对比漂移——证明脚本真查实时库，非机制失效。
- **结论**：**机制 PASS / 当前断言 FAIL（基线过期）**。这是本 Gate 的真实失败，如实登记为残余：需刷新 verify_independent.py 的静态基线快照（另一任务数据文件，本轮不改），刷新后复跑至 exit 0 方可关闭此项。

## G06 增长实验及效果归因
- **标准**：实验注册表含 baseline/hypothesis/metric/window/result/attribution。
- **测试用例**：无（本轮判定 NOT_APPLICABLE）。
- **执行记录**：现有为叙事文档 `docs/seo-geo-growth-experiment-2026-11-01.md`；无结构化 registry。
- **证据**：三路核查一致确认无结构化注册表代码/数据文件。
- **结论**：**NOT_APPLICABLE（范围冻结）**。理由：空壳 registry 无经营价值；真实实验尚未在受控运行阶段产生。残余：进入经营阶段首个实验后须补结构化字段，否则 G06 保持未验收。

## G07 唯一调度入口
- **标准**：单一 orchestrator；防重复运行锁；任务协调。
- **测试用例**：无（仓库代码层不存在）。
- **执行记录**：glob `*schedul*/*orchestrat*` 仅命中文档；`SCHEDULE.md:42` 自述"不是后台执行器"；无 singleton/pidfile。平台层外部自动化 `Automation_8f1991ff...` 在本账号不可见（UNKNOWN）。
- **证据**：`WB-BC-20261115-01/03_自动化治理报告.md:28-32` 双跑实锤。
- **结论**：**BLOCKED（唯一调度器）/ 部分缓解（幂等工具）**。用户明确禁止重复建设调度器，本轮不新建；幂等工具 G03 已覆盖"防重复运行"核心风险点。残余：真正单一入口需经营阶段由 CEO 指定现有平台自动化并落地防重入锁（解阻清单 #1）。

## G08 GEO/SERP 数据质量
- **标准**：SERP 假阴性修复+观测深度 UNKNOWN；GEO 同名不同义禁相减代码化。
- **测试用例**：SERP self-test；GEO 可比性 self-test（4 用例）；真实事故复现（9/27 引用URL vs 11/02 正文域名）；同义对照。
- **执行记录**：SERP self-test exit 0；GEO self-test 4/4 PASS exit 0；事故复现→UNKNOWN exit 2（正确禁相减）；同义→PASS exit 0。
- **证据**：真实 exit 0/0/2/0；`scripts/fetch-competitor-serp.mjs:49-97` 假阴性修复代码。
- **结论**：**PASS**。残余：GEO 本轮复采 PENDING（需人工登录 75 次，无人值守不可执行）→ 无新数据可比，守卫就绪但未被真实新一轮触发。

## G09 内容及外链质量
- **标准**：内容完整性/重复heading/发布Gate/seo-critic 全通过；外链资格评分/收录追踪真实。
- **测试用例**：`audit-content-integrity.mjs`、`find-duplicate-headings.mjs`、`publish-gate.mjs`、外链 `selftest.py`（16+注入）。
- **执行记录**：内容完整性 0 error/0 warning exit 0；重复 heading exit 0；发布 Gate 两层放行 exit 0；外链 selftest 16/16 + 注入 FAIL/恢复 PASS（第三路实测）。
- **证据**：真实 exit 0/0/0；`E:/一人公司/外链提交/seo-link-builder/scripts/selftest.py`。
- **结论**：**内容 PASS / 外链 PARTIAL**。残余：exact-match 比例控制无代码、DRAFTED 三段状态机仅文档——均属经营阶段外链增强，需授权后补。

## G10 日报、Notion、台账一致性
- **标准**：Notion 写入后回读；日报↔台账一致性校验；NOT_SYNCED 代码状态机。
- **测试用例**：无（代码层不存在 + Notion auth-required）。
- **执行记录**：全项目代码无 notion API 调用；`NOT_SYNCED` 仅 board 自由文本；静态证据 `notion-sync-manifest-2026-11-01.json` 无生成脚本。
- **证据**：三路核查一致确认 MISSING；Notion connector 状态 auth-required。
- **结论**：**BLOCKED（Notion 实测）/ MISSING（一致性脚本）**。本轮不实现（无法实测=形式主义）。残余：Notion 授权恢复后补写入-回读脚本 + 日报台账对账（解阻清单 #2）。

## 验收汇总

| Gate | 结论 | 真实退出码 |
|---|---|---|
| G01 数据可信度 | PASS | 0/0 |
| G02 机会资格 | PASS | 0/0 |
| G03 任务去重幂等 | PASS | 0/0/1(注入) |
| G04 权限副作用 | PASS(范围) | 0/0/0 |
| G05 独立验收 | 机制 PASS／断言 FAIL(基线过期) | 1 |
| G06 实验归因 | NOT_APPLICABLE | — |
| G07 唯一调度 | BLOCKED／部分缓解 | — |
| G08 GEO/SERP | PASS | 0/0/2/0 |
| G09 内容外链 | 内容 PASS／外链 PARTIAL | 0/0/0 |
| G10 日报Notion一致性 | BLOCKED/MISSING | — |

**P0 判定**：G01/G02/G03/G04/G08/G09(内容) 核心 Gate 通过；**G05 当前断言 FAIL（基线过期）为唯一实测失败项**，G06/G07/G10 为范围冻结/授权阻塞项。**P0 Gate 未全部通过 → 不放行自主生产执行**（遵守停止规则）。本轮无生产副作用。
